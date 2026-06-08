import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { supportTicketsTable, supportMessagesTable } from "@workspace/db";
import { eq, desc, and, isNull, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { routeParamInt } from "../lib/routeParams";
import { sanitizeHtml } from "../utils/sanitize";
import { AppError } from "../middleware/errorHandler";

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

// ── List user's own tickets ──────────────────────────────────────────────────
router.get("/support/tickets", async (req, res, next) => {
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
    return next(err);
  }
});

// ── Get unread reply count for user ─────────────────────────────────────────
router.get("/support/unread-count", async (req, res, next) => {
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
    return next(err);
  }
});

// ── Get single ticket with messages ─────────────────────────────────────────
router.get("/support/tickets/:id", async (req, res, next) => {
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
      return next(new AppError(404, "Ticket not found"));
    }

    const messages = await db
      .select()
      .from(supportMessagesTable)
      .where(eq(supportMessagesTable.ticketId, ticketId))
      .orderBy(supportMessagesTable.createdAt);

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
    return next(err);
  }
});

// ── Create a new ticket ─────────────────────────────────────────────────────
router.post("/support/tickets", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const parsed = CreateTicketSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, `Validation failed: ${parsed.error.issues.map(i => i.message).join("; ")}`));
    }

    const { title, message } = parsed.data;
    const sanitizedTitle = sanitizeHtml(title);
    const sanitizedMessage = sanitizeHtml(message);
    const now = new Date();

    const [ticket] = await db
      .insert(supportTicketsTable)
      .values({
        userId,
        title: sanitizedTitle,
        status: "open",
        isReadByUser: true,
        isReadByAdmin: false,
        lastMessageAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await db.insert(supportMessagesTable).values({
      ticketId: ticket.id,
      message: sanitizedMessage,
      sender: "user",
    });

    res.status(201).json({
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      lastMessageAt: ticket.lastMessageAt ? ticket.lastMessageAt.toISOString() : null,
    });
  } catch (err) {
    return next(err);
  }
});

// ── Send a message in an existing ticket ────────────────────────────────────
router.post("/support/tickets/:id/messages", async (req, res, next) => {
  try {
    const userId = req.userId!;
    const ticketId = routeParamInt(req.params.id);

    const parsed = SendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, `Validation failed: ${parsed.error.issues.map(i => i.message).join("; ")}`));
    }

    const sanitizedMessage = sanitizeHtml(parsed.data.message);

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
      return next(new AppError(404, "Ticket not found"));
    }

    const now = new Date();
    const [msg] = await db
      .insert(supportMessagesTable)
      .values({
        ticketId,
        message: sanitizedMessage,
        sender: "user",
      })
      .returning();

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
    return next(err);
  }
});

// ── Soft-delete a ticket ───────────────────────────────────────────────────
router.delete("/support/tickets/:id", async (req, res, next) => {
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
      return next(new AppError(404, "Ticket not found"));
    }

    await db
      .update(supportTicketsTable)
      .set({ userDeletedAt: new Date() })
      .where(eq(supportTicketsTable.id, ticketId));

    res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
