import { Router } from "express";
import { getAuth } from "@clerk/express";
import { userStreaksTable } from "@workspace/db";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";

const router = Router();

const POINTS: Record<string, number> = {
  quiz: 5,
  mock: 50,
  pyq: 3,
  login: 0,    // login tracking — no points, just updates lastActivityDate
};

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function yesterdayStr(): string {
  return new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
}

// ── GET /streaks/me ──────────────────────────────────────────────────────────
router.get("/streaks/me", async (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new AppError(401, "Unauthorized"));
  }

  try {
    const [row] = await db
      .select()
      .from(userStreaksTable)
      .where(eq(userStreaksTable.userId, userId));

    if (!row) {
      return res.json({
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        quizCount: 0,
        mockCount: 0,
        pyqCount: 0,
        lastActivityDate: null,
      });
    }

    return res.json({
      currentStreak: row.currentStreak,
      longestStreak: row.longestStreak,
      totalPoints: row.totalPoints,
      quizCount: row.quizCount,
      mockCount: row.mockCount,
      pyqCount: row.pyqCount,
      lastActivityDate: row.lastActivityDate ?? null,
    });
  } catch (err) {
    return next(err);
  }
});

// ── POST /streaks/activity ───────────────────────────────────────────────────
router.post("/streaks/activity", async (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new AppError(401, "Unauthorized"));
  }

  const { activityType, displayName } = req.body as {
    activityType?: string;
    displayName?: string;
  };

  if (!activityType || !["quiz", "mock", "pyq", "login"].includes(activityType)) {
    return next(new AppError(400, "activityType must be quiz | mock | pyq | login"));
  }

  const today = todayStr();
  const yesterday = yesterdayStr();
  const pointsEarned = POINTS[activityType] ?? 5;
  const safeDisplayName = (displayName ?? "Learner").trim() || "Learner";

  try {
    const [existing] = await db
      .select()
      .from(userStreaksTable)
      .where(eq(userStreaksTable.userId, userId));

    if (!existing) {
      await db.insert(userStreaksTable).values({
        userId,
        displayName: safeDisplayName,
        currentStreak: 1,
        longestStreak: 1,
        totalPoints: pointsEarned,
        quizCount: activityType === "quiz" ? 1 : 0,
        mockCount: activityType === "mock" ? 1 : 0,
        pyqCount: activityType === "pyq" ? 1 : 0,
        lastActivityDate: today,
      });

      return res.json({
        currentStreak: 1,
        longestStreak: 1,
        totalPoints: pointsEarned,
        pointsEarned,
        streakIncremented: true,
      });
    }

    const alreadyToday = existing.lastActivityDate === today;
    let newStreak = existing.currentStreak;
    let streakIncremented = false;

    if (!alreadyToday) {
      if (existing.lastActivityDate === yesterday) {
        newStreak = existing.currentStreak + 1;
      } else {
        newStreak = 1;
      }
      streakIncremented = true;
    }

    const newLongest = Math.max(existing.longestStreak, newStreak);
    const newPoints = existing.totalPoints + pointsEarned;

    // For login activity, don't add points — just update the date
    const updateData: Record<string, unknown> = {
      displayName: safeDisplayName,
      ...(activityType === "login"
        ? {}
        : { totalPoints: newPoints }),
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivityDate: today,
      ...(activityType === "quiz" ? { quizCount: existing.quizCount + 1 } : {}),
      ...(activityType === "mock" ? { mockCount: existing.mockCount + 1 } : {}),
      ...(activityType === "pyq" ? { pyqCount: existing.pyqCount + 1 } : {}),
      updatedAt: new Date(),
    };

    await db
      .update(userStreaksTable)
      .set(updateData)
      .where(eq(userStreaksTable.userId, userId));

    return res.json({
      currentStreak: newStreak,
      longestStreak: newLongest,
      totalPoints: activityType === "login" ? existing.totalPoints : newPoints,
      pointsEarned,
      streakIncremented,
    });
  } catch (err) {
    return next(err);
  }
});

// ── GET /leaderboard ─────────────────────────────────────────────────────────
router.get("/leaderboard", async (req, res, next) => {
  const limit = Math.min(Number(req.query.limit ?? 20), 50);

  try {
    const rows = await db
      .select()
      .from(userStreaksTable)
      .orderBy(desc(userStreaksTable.totalPoints))
      .limit(limit);

    const entries = rows.map((row, idx) => ({
      rank: idx + 1,
      userId: row.userId,
      displayName: row.displayName,
      totalPoints: row.totalPoints,
      currentStreak: row.currentStreak,
      longestStreak: row.longestStreak,
      quizCount: row.quizCount,
      mockCount: row.mockCount,
      pyqCount: row.pyqCount,
    }));

    return res.json(entries);
  } catch (err) {
    return next(err);
  }
});

export default router;
