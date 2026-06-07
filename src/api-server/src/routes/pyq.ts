import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { subjects, questionsTable } from "@workspace/db";
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

router.get("/pyq/subjects", async (req, res, next) => {
  try {
    const list = await db.select().from(subjects);
    return res.json(list);
  } catch (err) {
    return next(err);
  }
});

router.get("/pyq/questions", async (req, res, next) => {
  try {
    const { subjectId, page: pageStr } = req.query as Record<string, string>;
    const page = parseInt(pageStr) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    let all = await db
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.type, "pyq"));

    if (subjectId) {
      const sid = parseInt(subjectId);
      if (Number.isNaN(sid)) {
        return next(new AppError(400, "Invalid subjectId"));
      }
      all = all.filter((q) => q.pyqSubjectId === sid);
    }

    const total = all.length;
    const data = all.slice(offset, offset + limit).map(mapQuestion);

    return res.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return next(err);
  }
});

export default router;