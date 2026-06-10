import { Router } from "express";
import { db } from "../lib/db";
import { dailyQuizzes, questionsTable } from "@workspace/db";
import { eq, and, inArray, gte } from "drizzle-orm";
import { cacheGet, cacheSet, CacheTTL } from "../lib/cache";
import { AppError } from "../middleware/errorHandler";

const router = Router();

function mapQuestion(q: {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctIndex: number;
  explanation: string | null;
}) {
  return {
    id: q.id,
    text: q.text,
    options: [q.optionA, q.optionB, q.optionC, q.optionD],
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  };
}

// GET /api/daily-quizzes — Public list of today's published daily quizzes
router.get("/daily-quizzes", async (req, res, next) => {
  try {
    const cacheKey = "daily-quizzes:today";
    const cached = cacheGet<unknown[]>(cacheKey);
    if (cached) { res.json(cached); return; }

    const today = new Date().toISOString().split("T")[0];

    const quizzes = await db
      .select()
      .from(dailyQuizzes)
      .where(
        and(
          eq(dailyQuizzes.isPublished, true),
          eq(dailyQuizzes.isActive, true),
          gte(dailyQuizzes.scheduledDate, today),
        ),
      );

    const result = quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      subject: "General",
      scheduledDate: q.scheduledDate,
      scheduledTime: q.scheduledTime,
      durationMins: q.durationMinutes,
      durationMinutes: q.durationMinutes,
      questionCount: q.totalQuestions,
      totalQuestions: q.totalQuestions,
      questionIds: q.questionIds,
      negativeMarking: 0,
      status: "ongoing",
      instructions: q.description || "Answer the following questions carefully.",
      createdAt: q.createdAt?.toISOString(),
      updatedAt: q.updatedAt?.toISOString(),
    }));

    cacheSet(cacheKey, result, CacheTTL.SHORT);
    res.json(result);
  } catch (err) {
    return next(err);
  }
});

// GET /api/daily-quizzes/:id — Public detail with questions
router.get("/daily-quizzes/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const cacheKey = `daily-quizzes:detail:${id}`;
    const cached = cacheGet<unknown>(cacheKey);
    if (cached) { res.json(cached); return; }

    const [quiz] = await db
      .select()
      .from(dailyQuizzes)
      .where(eq(dailyQuizzes.id, id));

    if (!quiz) {
      return next(new AppError(404, "Daily quiz not found"));
    }

    // Fetch questions by their IDs
    let questions: ReturnType<typeof mapQuestion>[] = [];
    if (quiz.questionIds && quiz.questionIds.length > 0) {
      const dbQuestions = await db
        .select()
        .from(questionsTable)
        .where(and(inArray(questionsTable.id, quiz.questionIds), eq(questionsTable.isActive, true)));
      questions = dbQuestions.map(mapQuestion);
    }

    const result = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      subject: "General",
      scheduledDate: quiz.scheduledDate,
      scheduledTime: quiz.scheduledTime,
      durationMins: quiz.durationMinutes,
      durationMinutes: quiz.durationMinutes,
      questionCount: quiz.totalQuestions,
      totalQuestions: quiz.totalQuestions,
      negativeMarking: 0,
      status: "ongoing",
      instructions: quiz.description || "Answer the following questions carefully.",
      questions,
      createdAt: quiz.createdAt?.toISOString(),
      updatedAt: quiz.updatedAt?.toISOString(),
    };

    cacheSet(cacheKey, result, CacheTTL.QUESTIONS);
    res.json(result);
  } catch (err) {
    return next(err);
  }
});

export default router;
