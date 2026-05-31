import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, userStreaksTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

const POINTS: Record<string, number> = {
  quiz: 5,
  mock: 50,
  pyq: 3,
};

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function yesterdayStr(): string {
  return new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
}

// ── GET /streaks/me ──────────────────────────────────────────────────────────
router.get("/streaks/me", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  try {
    const [row] = await db.select().from(userStreaksTable).where(eq(userStreaksTable.userId, userId));
    if (!row) {
      res.json({ currentStreak: 0, longestStreak: 0, totalPoints: 0, quizCount: 0, mockCount: 0, pyqCount: 0, lastActivityDate: null });
      return;
    }
    res.json({
      currentStreak: row.currentStreak,
      longestStreak: row.longestStreak,
      totalPoints: row.totalPoints,
      quizCount: row.quizCount,
      mockCount: row.mockCount,
      pyqCount: row.pyqCount,
      lastActivityDate: row.lastActivityDate ?? null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch streak" });
  }
});

// ── POST /streaks/activity ───────────────────────────────────────────────────
router.post("/streaks/activity", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { activityType, displayName } = req.body as { activityType?: string; displayName?: string };

  if (!activityType || !["quiz", "mock", "pyq"].includes(activityType)) {
    res.status(400).json({ error: "activityType must be quiz | mock | pyq" });
    return;
  }

  const today = todayStr();
  const yesterday = yesterdayStr();
  const pointsEarned = POINTS[activityType] ?? 5;
  const safeDisplayName = (displayName ?? "Learner").trim() || "Learner";

  try {
    const [existing] = await db.select().from(userStreaksTable).where(eq(userStreaksTable.userId, userId));

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
      res.json({ currentStreak: 1, longestStreak: 1, totalPoints: pointsEarned, pointsEarned, streakIncremented: true });
      return;
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

    await db.update(userStreaksTable).set({
      displayName: safeDisplayName,
      totalPoints: newPoints,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivityDate: today,
      quizCount: activityType === "quiz" ? existing.quizCount + 1 : existing.quizCount,
      mockCount: activityType === "mock" ? existing.mockCount + 1 : existing.mockCount,
      pyqCount: activityType === "pyq" ? existing.pyqCount + 1 : existing.pyqCount,
      updatedAt: new Date(),
    }).where(eq(userStreaksTable.userId, userId));

    res.json({
      currentStreak: newStreak,
      longestStreak: newLongest,
      totalPoints: newPoints,
      pointsEarned,
      streakIncremented,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to record activity" });
  }
});

// ── GET /leaderboard ─────────────────────────────────────────────────────────
router.get("/leaderboard", async (req, res) => {
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

    res.json(entries);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
