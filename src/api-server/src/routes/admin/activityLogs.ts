import { Router } from "express";
import { db } from "../../db";
import { activityLogsTable } from "@workspace/db";

import { eq, desc, like } from "drizzle-orm";

const router = Router();

router.get("/activity-logs", async (req, res) => {
  try {
    const {
      page = "1",
      limit = "50",
      userId,
      action,
    } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (userId) conditions.push(eq(activityLogsTable.userId, userId));
    if (action) conditions.push(like(activityLogsTable.action, `%${action}%`));

    const { and, sql } = await import("drizzle-orm");
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
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

export default router;
