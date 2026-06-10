import { Router } from "express";
import { db } from "../../db";
import { activityLogsTable } from "@workspace/db";
import { eq, and, desc, like, sql } from "drizzle-orm";
import { AppError } from "../../middleware/errorHandler";

const router = Router();

router.get("/activity-logs", async (req, res, next) => {
  try {
    const {
      page = "1",
      limit = "50",
      userId,
      action,
    } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (userId) conditions.push(eq(activityLogsTable.userId, userId));
    if (action) conditions.push(like(activityLogsTable.action, `%${action}%`));

    const where = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(activityLogsTable)
      .where(where);
    const logs = await db
      .select()
      .from(activityLogsTable)
      .where(where)
      .orderBy(desc(activityLogsTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    res.json({
      data: logs.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(countRow.count),
        totalPages: Math.ceil(Number(countRow.count) / limitNum),
      },
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
