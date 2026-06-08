import { Router } from "express";
import { db } from "../../db";
import {
  questionsTable,
  studentAttemptsTable,
  activityLogsTable,
} from "@workspace/db";
import { sql, desc } from "drizzle-orm";
import { cacheGet, cacheSet, CacheTTL } from "../../lib/cache";

const router = Router();

router.get("/dashboard", async (req, res, next) => {
  const cacheKey = "admin:dashboard:stats";
  const cached = cacheGet<any>(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const [questionRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questionsTable);
    const [attemptRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(studentAttemptsTable);
    const [passedRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(studentAttemptsTable)
      .where(sql`is_passed = true`);

    const recentActivity = await db
      .select()
      .from(activityLogsTable)
      .orderBy(desc(activityLogsTable.createdAt))
      .limit(10);

    const data = {
      totalQuestions: Number(questionRow.count),
      totalAttempts: Number(attemptRow.count),
      passedAttempts: Number(passedRow.count),
      passPercentage:
        Number(attemptRow.count) > 0
          ? Math.round(
              (Number(passedRow.count) / Number(attemptRow.count)) * 100,
            )
          : 0,
      recentActivity: recentActivity.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      })),
    };

    cacheSet(cacheKey, data, CacheTTL.ANALYTICS);
    res.json(data);
  } catch (err) {
    return next(err);
  }
});

export default router;
