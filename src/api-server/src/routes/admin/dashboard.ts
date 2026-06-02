import { Router } from "express";
import {
  db,
  questionsTable,
  quizzesTable,
  studentAttemptsTable,
  activityLogsTable,
  examsTable,
} from "@workspace/db";
import { sql, gte, desc } from "drizzle-orm";
import { cacheGet, cacheSet, CacheTTL } from "../../lib/cache";

const router = Router();

router.get("/dashboard", async (req, res) => {
  const cacheKey = "admin:dashboard:stats";
  const cached = cacheGet<object>(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const [questionCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questionsTable);
    const [examCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(examsTable);
    const [attemptCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(studentAttemptsTable);
    const [passedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(studentAttemptsTable)
      .where(sql`is_passed = true`);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = await db
      .select()
      .from(activityLogsTable)
      .where(gte(activityLogsTable.createdAt, sevenDaysAgo))
      .orderBy(desc(activityLogsTable.createdAt))
      .limit(10);

    const stats = {
      totalQuestions: Number(questionCount.count),
      totalExams: Number(examCount.count),
      totalAttempts: Number(attemptCount.count),
      passedAttempts: Number(passedCount.count),
      passPercentage:
        Number(attemptCount.count) > 0
          ? Math.round(
              (Number(passedCount.count) / Number(attemptCount.count)) * 100,
            )
          : 0,
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        userId: a.userId,
        createdAt: a.createdAt.toISOString(),
      })),
    };

    cacheSet(cacheKey, stats, CacheTTL.DASHBOARD);
    res.json(stats);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

export default router;
