import { Router } from "express";
import { db } from "../../lib/db";
import { supportTicketsTable, supportMessagesTable } from "@workspace/db";
import { eq, like, and, sql, desc } from "drizzle-orm";
import { logAdminActivity } from "../../middlewares/adminMiddleware";
import { routeParam, routeParamInt } from "../../lib/routeParams";

const router = Router();

router.get("/support-tickets", async (req, res): Promise<any> => {
  try {
    const page = req.query.page ? routeParam(req.query.page as string | string[]) : "1";
    const limit = req.query.limit ? routeParam(req.query.limit as string | string[]) : "20";
    const status = req.query.status ? routeParam(req.query.status as string | string[]) : "all";
    const search = req.query.search ? routeParam(req.query.search as string | string[]) : "";

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (status !== "all") conditions.push(eq(supportTicketsTable.status, status as string));
    if (search) conditions.push(like(supportTicketsTable.title, `%${search}%`));

    const where = conditions.length ? and(...conditions) : undefined;
    const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(supportTicketsTable).where(where);
    const tickets = await db.select().from(supportTicketsTable)
      .where(where).orderBy(desc(supportTicketsTable.updatedAt)).limit(limitNum).offset(offset);

    return res.json({
      data: tickets.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      total: Number(countRow.count),
      page: pageNum,
      totalPages: Math.ceil(Number(countRow.count) / limitNum),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch support tickets" });
  }
});

router.get("/support-tickets/:id", async (req, res): Promise<any> => {
  try {
    const id = routeParamInt(req.params.id);
    const [ticket] = await db.select().from(supportTicketsTable).where(eq(supportTicketsTable.id, id));
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const messages = await db.select().from(supportMessagesTable)
      .where(eq(supportMessagesTable.ticketId, id)).orderBy(supportMessagesTable.createdAt);

    return res.json({
      ticket: {
        ...ticket,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
      },
      messages: messages.map(m => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch support ticket details" });
  }
});

router.post("/support-tickets/:id/replies", logAdminActivity("reply_support_ticket", "support_ticket"), async (req, res): Promise<any> => {
  try {
    const id = routeParamInt(req.params.id);
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const [ticket] = await db.select().from(supportTicketsTable).where(eq(supportTicketsTable.id, id));
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const [reply] = await db.insert(supportMessagesTable).values({
      ticketId: id,
      message,
      sender: "support",
    }).returning();

    await db.update(supportTicketsTable)
      .set({ status: "pending", updatedAt: new Date() })
      .where(eq(supportTicketsTable.id, id));

    return res.status(201).json({
      ...reply,
      createdAt: reply.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to reply to support ticket" });
  }
});

router.patch("/support-tickets/:id/status", logAdminActivity("update_support_ticket_status", "support_ticket"), async (req, res): Promise<any> => {
  try {
    const id = routeParamInt(req.params.id);
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status is required" });

    const [updated] = await db.update(supportTicketsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(supportTicketsTable.id, id))
      .returning();

    return res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to update ticket status" });
  }
});

router.patch("/support-tickets/:id/assign", logAdminActivity("assign_support_ticket", "support_ticket"), async (req, res): Promise<any> => {
  try {
    const id = routeParamInt(req.params.id);
    const { assignedTo } = req.body;

    const [updated] = await db.update(supportTicketsTable)
      .set({ assignedTo, updatedAt: new Date() })
      .where(eq(supportTicketsTable.id, id))
      .returning();

    return res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to assign ticket" });
  }
});

export default router;