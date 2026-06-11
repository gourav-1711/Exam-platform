import type { Request, Response, NextFunction } from "express";
import { db } from "../../db";
import { studentAttemptsTable, userStreaksTable } from "@workspace/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { routeParam } from "../../lib/routeParams";
import { clerkClient } from "@clerk/express";

export async function listAllStudents(req: Request, res: Response, next: NextFunction) {
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

    // Use LEFT JOIN + GROUP BY instead of correlated subqueries
    // Correlated subqueries in Drizzle SQL templates can fail to correlate properly
    // due to parameter binding, causing all rows to show the same aggregate values.
    const users = await db
      .select({
        userId: userStreaksTable.userId,
        displayName: userStreaksTable.displayName,
        createdAt: userStreaksTable.createdAt,
        totalAttempts: sql<number>`coalesce(count(${studentAttemptsTable.id}), 0)`,
        avgScore: sql<number>`coalesce(avg(${studentAttemptsTable.score}), 0)`,
        totalScore: sql<number>`coalesce(sum(${studentAttemptsTable.score}), 0)`,
        passedCount: sql<number>`coalesce(sum(case when ${studentAttemptsTable.isPassed} then 1 else 0 end), 0)`,
        lastAttemptAt: sql<string | null>`max(${studentAttemptsTable.attemptedAt})`,
      })
      .from(userStreaksTable)
      .leftJoin(
        studentAttemptsTable,
        eq(userStreaksTable.userId, studentAttemptsTable.userId),
      )
      .where(whereClause)
      .groupBy(
        userStreaksTable.userId,
        userStreaksTable.displayName,
        userStreaksTable.createdAt,
      )
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
}

export async function getStudentAttempts(req: Request, res: Response, next: NextFunction) {
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
}
