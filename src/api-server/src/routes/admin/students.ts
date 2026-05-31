import { Router } from "express";
import { db, studentAttemptsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { routeParam } from "../../lib/routeParams";

const router = Router();

router.get("/students", async (req, res) => {
  try {
    const { page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const attempts = await db
      .select({
        userId: studentAttemptsTable.userId,
        totalAttempts: sql<number>`count(*)`,
        avgScore: sql<number>`avg(score)`,
        totalScore: sql<number>`sum(score)`,
        passedCount: sql<number>`sum(case when is_passed then 1 else 0 end)`,
        lastAttemptAt: sql<string>`max(attempted_at)`,
      })
      .from(studentAttemptsTable)
      .groupBy(studentAttemptsTable.userId)
      .orderBy(sql`sum(score) desc`)
      .limit(limitNum)
      .offset(offset);

    const [countRow] = await db
      .select({ count: sql<number>`count(distinct user_id)` })
      .from(studentAttemptsTable);

    res.json({
      data: attempts.map((a) => ({
        userId: a.userId,
        totalAttempts: Number(a.totalAttempts),
        avgScore: Math.round(Number(a.avgScore) * 100) / 100,
        totalScore: Number(a.totalScore),
        passedCount: Number(a.passedCount),
        lastAttemptAt: a.lastAttemptAt,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(countRow.count),
        totalPages: Math.ceil(Number(countRow.count) / limitNum),
      },
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

router.get("/students/:userId/attempts", async (req, res) => {
  try {
    const userId = routeParam(req.params.userId);
    const attempts = await db.select().from(studentAttemptsTable)
      .where(eq(studentAttemptsTable.userId, userId))
      .orderBy(desc(studentAttemptsTable.attemptedAt))
      .limit(50);
    res.json(attempts.map((a) => ({ ...a, attemptedAt: a.attemptedAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch student attempts" });
  }
});

export default router;
