import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "../db";
import { studentAttemptsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";
import { z } from "zod";

const router = Router();

const saveAttemptSchema = z.object({
  examId: z.string().optional(),
  quizId: z.string().optional(),
  score: z.number(),
  totalMarks: z.number(),
  correctCount: z.number(),
  wrongCount: z.number(),
  skippedCount: z.number(),
  timeTakenSecs: z.number(),
  isPassed: z.boolean(),
});

// POST /api/attempts — Save a quiz/mock test attempt
router.post("/attempts", async (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new AppError(401, "Unauthorized"));
  }

  try {
    const parsed = saveAttemptSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, "Invalid attempt data"));
    }

    const [attempt] = await db
      .insert(studentAttemptsTable)
      .values({
        userId,
        examId: parsed.data.examId || null,
        quizId: parsed.data.quizId || null,
        score: parsed.data.score,
        totalMarks: parsed.data.totalMarks,
        correctCount: parsed.data.correctCount,
        wrongCount: parsed.data.wrongCount,
        skippedCount: parsed.data.skippedCount,
        timeTakenSecs: parsed.data.timeTakenSecs,
        isPassed: parsed.data.isPassed,
      })
      .returning();

    return res.status(201).json(attempt);
  } catch (err) {
    return next(err);
  }
});

// GET /api/attempts/mine — Get current user's attempts
router.get("/attempts/mine", async (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new AppError(401, "Unauthorized"));
  }

  try {
    const attempts = await db
      .select()
      .from(studentAttemptsTable)
      .where(eq(studentAttemptsTable.userId, userId))
      .orderBy(desc(studentAttemptsTable.attemptedAt))
      .limit(50);

    return res.json(
      attempts.map((a) => ({
        ...a,
        attemptedAt: a.attemptedAt.toISOString(),
      }))
    );
  } catch (err) {
    return next(err);
  }
});

export default router;
