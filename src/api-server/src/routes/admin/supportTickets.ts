import { Router } from "express";
import { db } from "../../lib/db";
import { supportTicketsTable, supportMessagesTable } from "@workspace/db";
import { eq, like, and, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { routeParam, routeParamInt } from "../../lib/routeParams";
import { sanitizeHtml } from "../../utils/sanitize";
import { formatZodIssues } from "../../utils/validation";
import { AppError } from "../../middleware/errorHandler";

const router = Router();

const ReplySchema = z.object({
  message: z.string().min(1, "Message is required").max(5000),
});

// GET /admin/support-tickets — List all tickets (including user-deleted)
router.get("/support-tickets", async (req, res, next) => {
  try {
    const _page = routeParam(req.query.page as string | string[]) || "1";
    const _limit = routeParam(req.query.limit as string | string[]) || "20";
    const _status = routeParam(req.query.status as string | string[]) || "all";
    const _search = routeParam(req.query.search as string | string[]) || "";

    const pageNum = Math.max(1, parseInt(_page));
    const limitNum = Math.min(100, parseInt(_limit));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (_status !== "all")
      conditions.push(eq(supportTicketsTable.status, _status));
    if (_search) conditions.push(like(supportTicketsTable.title, `%${_search}%`));

    const where = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(supportTicketsTable)
      .where(where);

    const tickets = await db
      .select({
        id: supportTicketsTable.id,
        userId: supportTicketsTable.userId,
        title: supportTicketsTable.title,
        status: supportTicketsTable.status,
        category: supportTicketsTable.category,
        assignedTo: supportTicketsTable.assignedTo,
        isActive: supportTicketsTable.isActive,
        isReadByUser: supportTicketsTable.isReadByUser,
        isReadByAdmin: supportTicketsTable.isReadByAdmin,
        userDeletedAt: supportTicketsTable.userDeletedAt,
        lastMessageAt: supportTicketsTable.lastMessageAt,
        createdAt: supportTicketsTable.createdAt,
        updatedAt: supportTicketsTable.updatedAt,
        messageCount: sql<number>`(
          SELECT count(*)::int FROM ${supportMessagesTable}
          WHERE ${supportMessagesTable.ticketId} = ${supportTicketsTable.id}
        )`,
      })
      .from(supportTicketsTable)
      .where(where)
      .orderBy(
        sql`CASE WHEN ${supportTicketsTable.isReadByAdmin} = false THEN 0 ELSE 1 END`,
        desc(supportTicketsTable.lastMessageAt ?? supportTicketsTable.createdAt),
      )
      .limit(limitNum)
      .offset(offset);

    if (tickets.length > 0) {
      const unreadIds = tickets.filter((t) => !t.isReadByAdmin).map((t) => t.id);
      if (unreadIds.length > 0) {
        await db
          .update(supportTicketsTable)
          .set({ isReadByAdmin: true })
          .where(sql`${supportTicketsTable.id} = ANY(${sql.join(unreadIds, sql`,`)})`);
      }
    }

    res.json({
      data: tickets.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        lastMessageAt: t.lastMessageAt ? t.lastMessageAt.toISOString() : null,
        userDeletedAt: t.userDeletedAt ? t.userDeletedAt.toISOString() : null,
      })),
      total: Number(countRow?.count ?? 0),
      page: pageNum,
      totalPages: Math.ceil(Number(countRow?.count ?? 0) / limitNum),
    });
  } catch (err) {
    return next(err);
  }
});

// GET /admin/support-tickets/unread-count
router.get("/support-tickets/unread-count", async (req, res, next) => {
  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(supportTicketsTable)
      .where(eq(supportTicketsTable.isReadByAdmin, false));

    res.json({ unreadCount: Number(result?.count ?? 0) });
  } catch (err) {
    return next(err);
  }
});

// GET /admin/support-tickets/:id
router.get("/support-tickets/:id", async (req, res, next) => {
  try {
    const id = routeParamInt(req.params.id);
    const [ticket] = await db
      .select()
      .from(supportTicketsTable)
      .where(eq(supportTicketsTable.id, id));

    if (!ticket) {
      return next(new AppError(404, "Ticket not found"));
    }

    const messages = await db
      .select()
      .from(supportMessagesTable)
      .where(eq(supportMessagesTable.ticketId, id))
      .orderBy(supportMessagesTable.createdAt);

    res.json({
      ticket: {
        ...ticket,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        lastMessageAt: ticket.lastMessageAt ? ticket.lastMessageAt.toISOString() : null,
        userDeletedAt: ticket.userDeletedAt ? ticket.userDeletedAt.toISOString() : null,
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

// POST /admin/support-tickets/:id/replies
router.post(
  "/support-tickets/:id/replies",
  logAdminActivity("reply_support_ticket", "support_ticket"),
  async (req, res, next) => {
    try {
      const id = routeParamInt(req.params.id);
      const parsed = ReplySchema.safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, formatZodIssues(parsed.error.issues)));
      }

      const [ticket] = await db
        .select()
        .from(supportTicketsTable)
        .where(eq(supportTicketsTable.id, id));

      if (!ticket) {
        return next(new AppError(404, "Ticket not found"));
      }

      const now = new Date();
      const sanitizedReply = sanitizeHtml(parsed.data.message);
      const [reply] = await db
        .insert(supportMessagesTable)
        .values({
          ticketId: id,
          message: sanitizedReply,
          sender: "support",
        })
        .returning();

      await db
        .update(supportTicketsTable)
        .set({
          isReadByUser: false,
          isReadByAdmin: true,
          lastMessageAt: now,
          status: sql`CASE WHEN status = 'closed' THEN 'pending' ELSE status END`,
          updatedAt: now,
        })
        .where(eq(supportTicketsTable.id, id));

      res.status(201).json({
        ...reply,
        createdAt: reply.createdAt.toISOString(),
      });
    } catch (err) {
      return next(err);
    }
  },
);

// PATCH /admin/support-tickets/:id/status
router.patch(
  "/support-tickets/:id/status",
  logAdminActivity("update_support_ticket_status", "support_ticket"),
  async (req, res, next) => {
    try {
      const id = routeParamInt(req.params.id);
      const { status } = req.body;
      if (!status) {
        return next(new AppError(400, "Status is required"));
      }

      const [updated] = await db
        .update(supportTicketsTable)
        .set({ status, updatedAt: new Date() })
        .where(eq(supportTicketsTable.id, id))
        .returning();

      res.json({
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        lastMessageAt: updated.lastMessageAt ? updated.lastMessageAt.toISOString() : null,
      });
    } catch (err) {
      return next(err);
    }
  },
);

// PATCH /admin/support-tickets/:id/assign
router.patch(
  "/support-tickets/:id/assign",
  logAdminActivity("assign_support_ticket", "support_ticket"),
  async (req, res, next) => {
    try {
      const id = routeParamInt(req.params.id);
      const { assignedTo } = req.body;

      const [updated] = await db
        .update(supportTicketsTable)
        .set({ assignedTo, updatedAt: new Date() })
        .where(eq(supportTicketsTable.id, id))
        .returning();

      res.json({
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
