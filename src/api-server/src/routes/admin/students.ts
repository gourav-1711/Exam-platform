import { Router } from "express";
import { db } from "../../db";
import { studentAttemptsTable, userStreaksTable } from "@workspace/db";
import { eq, desc, sql, and, like } from "drizzle-orm";
import { routeParam } from "../../lib/routeParams";
import { clerkClient } from "@clerk/express";
import { AppError } from "../../middleware/errorHandler";

const router = Router();

router.get("/students", async (req, res, next) => {
  try {
    const { page = "1", limit = "20", search = "" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    const searchCondition = search
      ? sql`lower(${userStreaksTable.displayName}) like ${`%${search.toLowerCase()}%`}`
      : undefined;

    const whereClause = searchCondition ? and(searchCondition) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(userStreaksTable)
      .where(whereClause);

    const users = await db
      .select({
        userId: userStreaksTable.userId,
        displayName: userStreaksTable.displayName,
        createdAt: userStreaksTable.createdAt,
        totalAttempts: sql<number>`coalesce((
          select count(*) from ${studentAttemptsTable}
          where ${studentAttemptsTable.userId} = ${userStreaksTable.userId}
        ), 0)`,
        avgScore: sql<number>`coalesce((
          select avg(score) from ${studentAttemptsTable}
          where ${studentAttemptsTable.userId} = ${userStreaksTable.userId}
        ), 0)`,
        totalScore: sql<number>`coalesce((
          select coalesce(sum(score), 0) from ${studentAttemptsTable}
          where ${studentAttemptsTable.userId} = ${userStreaksTable.userId}
        ), 0)`,
        passedCount: sql<number>`coalesce((
          select count(*) from ${studentAttemptsTable}
          where ${studentAttemptsTable.userId} = ${userStreaksTable.userId} and is_passed = true
        ), 0)`,
        lastAttemptAt: sql<string | null>`(
          select max(attempted_at) from ${studentAttemptsTable}
          where ${studentAttemptsTable.userId} = ${userStreaksTable.userId}
        )`,
      })
      .from(userStreaksTable)
      .where(whereClause)
      .orderBy(desc(userStreaksTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    const enriched = await Promise.all(
      users.map(async (u) => {
        let name = u.displayName || "Learner";
        let email = "";
        try {
          const clerkUser = await clerkClient.users.getUser(u.userId);
          name =
            `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
            name;
          email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
        } catch {
          // Clerk might not be available or user not found
        }
        return {
          userId: u.userId,
          displayName: name,
          email,
          totalAttempts: Number(u.totalAttempts),
          avgScore: Math.round(Number(u.avgScore) * 100) / 100,
          totalScore: Number(u.totalScore),
          passedCount: Number(u.passedCount),
          lastAttemptAt: u.lastAttemptAt,
          joinedAt: u.createdAt.toISOString(),
        };
      }),
    );

    res.json({
      data: enriched,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(countRow?.count ?? 0),
        totalPages: Math.ceil(Number(countRow?.count ?? 0) / limitNum),
      },
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/students/:userId/attempts", async (req, res, next) => {
  try {
    const userId = routeParam(req.params.userId);
    const attempts = await db
      .select()
      .from(studentAttemptsTable)
      .where(eq(studentAttemptsTable.userId, userId))
      .orderBy(desc(studentAttemptsTable.attemptedAt))
      .limit(50);
    res.json(
      attempts.map((a) => ({ ...a, attemptedAt: a.attemptedAt.toISOString() })),
    );
  } catch (err) {
    return next(err);
  }
});

export default router;
