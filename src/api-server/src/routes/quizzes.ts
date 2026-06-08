import { Router } from "express";
import { db } from "../db";
import { quizzesTable, questionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { cacheGet, cacheSet, cacheFlushPattern, CacheTTL } from "../lib/cache";
import { AppError } from "../middleware/errorHandler";

const router = Router();

function mapQuestion(q: {
  id: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctIndex: number;
  explanation: string | null;
  examLabel: string | null;
}) {
  return {
    id: q.id,
    text: q.text,
    options: [q.optionA, q.optionB, q.optionC, q.optionD],
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    examLabel: q.examLabel,
  };
}

router.get("/quizzes", async (req, res, next) => {
  try {
    const { status } = req.query as { status?: string };
    const cacheKey = `quizzes:list:${status || "all"}`;
    const cached = cacheGet<any[]>(cacheKey);
    if (cached) { res.json(cached); return; }

    let quizzes;
    if (status) {
      quizzes = await db
        .select()
        .from(quizzesTable)
        .where(eq(quizzesTable.status, status));
    } else {
      quizzes = await db.select().from(quizzesTable);
    }
    const result = quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      subject: q.subject,
      durationMins: q.durationMins,
      questionCount: q.questionCount,
      negativeMarking: q.negativeMarking,
      status: q.status,
      createdAt: q.createdAt.toISOString(),
    }));
    cacheSet(cacheKey, result, CacheTTL.QUESTIONS);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/quizzes/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const cacheKey = `quizzes:detail:${id}`;
    const cached = cacheGet<any>(cacheKey);
    if (cached) { res.json(cached); return; }

    const [quiz] = await db
      .select()
      .from(quizzesTable)
      .where(eq(quizzesTable.id, id));
    if (!quiz) {
      throw new AppError(404, "Quiz not found");
    }

    const questions = await db
      .select()
      .from(questionsTable)
      .where(
        and(eq(questionsTable.quizId, id), eq(questionsTable.type, "quiz")),
      );

    const result = {
      id: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      durationMins: quiz.durationMins,
      questionCount: quiz.questionCount,
      negativeMarking: quiz.negativeMarking,
      status: quiz.status,
      instructions: quiz.instructions,
      createdAt: quiz.createdAt.toISOString(),
      questions: questions.map(mapQuestion),
    };
    cacheSet(cacheKey, result, CacheTTL.QUESTIONS);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/quizzes/:id/questions", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const cacheKey = `quizzes:${id}:questions`;
    const cached = cacheGet<any[]>(cacheKey);
    if (cached) { res.json(cached); return; }

    const questions = await db
      .select()
      .from(questionsTable)
      .where(
        and(eq(questionsTable.quizId, id), eq(questionsTable.type, "quiz")),
      );
    const result = questions.map(mapQuestion);
    cacheSet(cacheKey, result, CacheTTL.QUESTIONS);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
