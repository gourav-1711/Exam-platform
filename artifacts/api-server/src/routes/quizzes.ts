import { Router } from "express";
import { db, quizzesTable, questionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function mapQuestion(q: { id: number; text: string; optionA: string; optionB: string; optionC: string; optionD: string; correctIndex: number; explanation: string | null; examLabel: string | null }) {
  return {
    id: q.id,
    text: q.text,
    options: [q.optionA, q.optionB, q.optionC, q.optionD],
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    examLabel: q.examLabel,
  };
}

router.get("/quizzes", async (req, res) => {
  try {
    const { status } = req.query as { status?: string };
    let quizzes;
    if (status) {
      quizzes = await db.select().from(quizzesTable).where(eq(quizzesTable.status, status));
    } else {
      quizzes = await db.select().from(quizzesTable);
    }
    res.json(quizzes.map(q => ({
      id: q.id,
      title: q.title,
      subject: q.subject,
      durationMins: q.durationMins,
      questionCount: q.questionCount,
      negativeMarking: q.negativeMarking,
      status: q.status,
      createdAt: q.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

router.get("/quizzes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, id));
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const questions = await db.select().from(questionsTable).where(
      and(eq(questionsTable.quizId, id), eq(questionsTable.type, "quiz"))
    );

    res.json({
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
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

router.get("/quizzes/:id/questions", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const questions = await db.select().from(questionsTable).where(
      and(eq(questionsTable.quizId, id), eq(questionsTable.type, "quiz"))
    );
    res.json(questions.map(mapQuestion));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

export default router;
