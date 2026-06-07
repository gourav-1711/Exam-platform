import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { supportTicketsTable, supportMessagesTable } from "@workspace/db";
import { eq, desc, and, isNull, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { routeParamInt } from "../lib/routeParams";

const router = Router();

const CreateTicketSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  message: z.string().min(1, "Message is required").max(5000),
});

const SendMessageSchema = z.object({
  message: z.string().min(1).max(5000),
});

// All user support routes require auth
router.use(requireAuth);

// ── List user's own tickets (conversations) ──────────────────────────────────
router.get("/support/tickets", async (req, res) => {
  try {
    const userId = req.userId!;

    const tickets = await db
      .select({
        id: supportTicketsTable.id,
        title: supportTicketsTable.title,
        status: supportTicketsTable.status,
        isReadByUser: supportTicketsTable.isReadByUser,
        lastMessageAt: supportTicketsTable.lastMessageAt,
        createdAt: supportTicketsTable.createdAt,
        updatedAt: supportTicketsTable.updatedAt,
        messageCount: sql<number>`(
          SELECT count(*)::int FROM ${supportMessagesTable}
          WHERE ${supportMessagesTable.ticketId} = ${supportTicketsTable.id}
        )`,
      })
      .from(supportTicketsTable)
      .where(
        and(
          eq(supportTicketsTable.userId, userId),
          // Admin can see all; user sees only non-deleted
          isNull(supportTicketsTable.userDeletedAt),
        ),
      )
      .orderBy(desc(supportTicketsTable.lastMessageAt ?? supportTicketsTable.createdAt));

    const serialized = tickets.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      lastMessageAt: t.lastMessageAt ? t.lastMessageAt.toISOString() : null,
    }));

    res.json(serialized);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// ── Get unread reply count for user ─────────────────────────────────────────
router.get("/support/unread-count", async (req, res) => {
  try {
    const userId = req.userId!;

    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(supportTicketsTable)
      .where(
        and(
          eq(supportTicketsTable.userId, userId),
          eq(supportTicketsTable.isReadByUser, false),
          isNull(supportTicketsTable.userDeletedAt),
        ),
      );

    res.json({ unreadCount: Number(result?.count ?? 0) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

// ── Get single ticket with messages ─────────────────────────────────────────
router.get("/support/tickets/:id", async (req, res) => {
  try {
    const userId = req.userId!;
    const ticketId = routeParamInt(req.params.id);

    const [ticket] = await db
      .select()
      .from(supportTicketsTable)
      .where(
        and(
          eq(supportTicketsTable.id, ticketId),
          eq(supportTicketsTable.userId, userId),
          isNull(supportTicketsTable.userDeletedAt),
        ),
      );

    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    const messages = await db
      .select()
      .from(supportMessagesTable)
      .where(eq(supportMessagesTable.ticketId, ticketId))
      .orderBy(supportMessagesTable.createdAt);

    // Mark as read by user when they view it
    await db
      .update(supportTicketsTable)
      .set({ isReadByUser: true })
      .where(eq(supportTicketsTable.id, ticketId));

    res.json({
      ticket: {
        ...ticket,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        lastMessageAt: ticket.lastMessageAt ? ticket.lastMessageAt.toISOString() : null,
      },
      messages: messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
});

// ── Create a new ticket (conversation) ───────────────────────────────────────
router.post("/support/tickets", async (req, res) => {
  try {
    const userId = req.userId!;
    const parsed = CreateTicketSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const { title, message } = parsed.data;
    const now = new Date();

    const [ticket] = await db
      .insert(supportTicketsTable)
      .values({
        userId,
        title,
        status: "open",
        isReadByUser: true,
        isReadByAdmin: false, // Admin hasn't seen it yet
        lastMessageAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Add the initial message
    await db.insert(supportMessagesTable).values({
      ticketId: ticket.id,
      message,
      sender: "user",
    });

    res.status(201).json({
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      lastMessageAt: ticket.lastMessageAt ? ticket.lastMessageAt.toISOString() : null,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create ticket" });
  }
});

// ── Send a message in an existing ticket ────────────────────────────────────
router.post("/support/tickets/:id/messages", async (req, res) => {
  try {
    const userId = req.userId!;
    const ticketId = routeParamInt(req.params.id);

    const parsed = SendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    // Verify ownership
    const [ticket] = await db
      .select()
      .from(supportTicketsTable)
      .where(
        and(
          eq(supportTicketsTable.id, ticketId),
          eq(supportTicketsTable.userId, userId),
          isNull(supportTicketsTable.userDeletedAt),
        ),
      );

    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    const now = new Date();
    const [msg] = await db
      .insert(supportMessagesTable)
      .values({
        ticketId,
        message: parsed.data.message,
        sender: "user",
      })
      .returning();

    // Update ticket: new message, mark as unread by admin
    await db
      .update(supportTicketsTable)
      .set({
        isReadByAdmin: false,
        isReadByUser: true,
        lastMessageAt: now,
        status: sql`CASE WHEN status = 'resolved' THEN 'pending' ELSE status END`,
        updatedAt: now,
      })
      .where(eq(supportTicketsTable.id, ticketId));

    res.status(201).json({
      ...msg,
      createdAt: msg.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

// ── Soft-delete a ticket (user hides it, admin still sees) ──────────────────
router.delete("/support/tickets/:id", async (req, res) => {
  try {
    const userId = req.userId!;
    const ticketId = routeParamInt(req.params.id);

    const [ticket] = await db
      .select()
      .from(supportTicketsTable)
      .where(
        and(
          eq(supportTicketsTable.id, ticketId),
          eq(supportTicketsTable.userId, userId),
        ),
      );

    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    // Soft delete — admin still sees it
    await db
      .update(supportTicketsTable)
      .set({ userDeletedAt: new Date() })
      .where(eq(supportTicketsTable.id, ticketId));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete ticket" });
  }
});

export default router;
