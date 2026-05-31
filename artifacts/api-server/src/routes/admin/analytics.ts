import { Router } from "express";
import { db, questionsTable, examsTable, studentAttemptsTable, quizzesTable } from "@workspace/db";
import { sql, gte, desc } from "drizzle-orm";
import { cacheGet, cacheSet, CacheTTL } from "../../lib/cache";

const router = Router();

router.get("/analytics", async (req, res) => {
  const cacheKey = "admin:analytics:overview";
  const cached = cacheGet<object>(cacheKey);
  if (cached) { res.json(cached); return; }

  try {
    const [questionCount] = await db.select({ count: sql<number>`count(*)` }).from(questionsTable);
    const [examCount] = await db.select({ count: sql<number>`count(*)` }).from(examsTable);
    const [quizCount] = await db.select({ count: sql<number>`count(*)` }).from(quizzesTable);
    const [attemptCount] = await db.select({ count: sql<number>`count(*)` }).from(studentAttemptsTable);
    const [distinctUsers] = await db.select({ count: sql<number>`count(distinct user_id)` }).from(studentAttemptsTable);
    const [avgScoreRow] = await db.select({ avg: sql<number>`avg(score)` }).from(studentAttemptsTable);
    const [passRate] = await db.select({
      rate: sql<number>`round(100.0 * sum(case when is_passed then 1 else 0 end) / nullif(count(*), 0), 2)`,
    }).from(studentAttemptsTable);

    const subjectStats = await db
      .select({
        subject: questionsTable.subject,
        count: sql<number>`count(*)`,
      })
      .from(questionsTable)
      .groupBy(questionsTable.subject)
      .orderBy(sql`count(*) desc`)
      .limit(10);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyAttempts = await db
      .select({
        date: sql<string>`date(attempted_at)::text`,
        count: sql<number>`count(*)`,
        avgScore: sql<number>`round(avg(score)::numeric, 2)`,
      })
      .from(studentAttemptsTable)
      .where(gte(studentAttemptsTable.attemptedAt, thirtyDaysAgo))
      .groupBy(sql`date(attempted_at)`)
      .orderBy(sql`date(attempted_at)`);

    const topScorers = await db
      .select({
        userId: studentAttemptsTable.userId,
        totalScore: sql<number>`sum(score)`,
        attempts: sql<number>`count(*)`,
      })
      .from(studentAttemptsTable)
      .groupBy(studentAttemptsTable.userId)
      .orderBy(sql`sum(score) desc`)
      .limit(10);

    const data = {
      overview: {
        totalQuestions: Number(questionCount.count),
        totalExams: Number(examCount.count),
        totalQuizzes: Number(quizCount.count),
        totalAttempts: Number(attemptCount.count),
        activeStudents: Number(distinctUsers.count),
        avgScore: Math.round(Number(avgScoreRow.avg) * 100) / 100,
        passRate: Number(passRate.rate) || 0,
      },
      subjectStats: subjectStats.map((s) => ({ subject: s.subject ?? "Unknown", count: Number(s.count) })),
      dailyAttempts: dailyAttempts.map((d) => ({ date: d.date, count: Number(d.count), avgScore: Number(d.avgScore) })),
      topScorers: topScorers.map((s) => ({ userId: s.userId, totalScore: Number(s.totalScore), attempts: Number(s.attempts) })),
    };

    cacheSet(cacheKey, data, CacheTTL.ANALYTICS);
    res.json(data);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;
