import { Router } from "express";
import { eq, inArray, and } from "drizzle-orm";
import { db } from "../db";
import { subjects, questionsTable, examSetsTable } from "@workspace/db";
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

// GET /pyq/sets — List active PYQ exam sets
router.get("/pyq/sets", async (req, res, next) => {
  try {
    const { subjectId } = req.query as Record<string, string>;
    const conditions = [eq(examSetsTable.type, "pyq"), eq(examSetsTable.isActive, true)];
    if (subjectId) {
      conditions.push(eq(examSetsTable.subjectId, parseInt(subjectId)));
    }
    const sets = await db
      .select()
      .from(examSetsTable)
      .where(and(...conditions))
      .orderBy(examSetsTable.createdAt);

    return res.json(sets.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })));
  } catch (err) {
    return next(err);
  }
});

// GET /pyq/questions — Questions from active PYQ exam sets
router.get("/pyq/questions", async (req, res, next) => {
  try {
    const { subjectId, page: pageStr, setId } = req.query as Record<string, string>;
    const page = parseInt(pageStr) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    // First, get all active PYQ exam sets to find question IDs
    const setConditions = [eq(examSetsTable.type, "pyq"), eq(examSetsTable.isActive, true)];
    if (subjectId) {
      const sid = parseInt(subjectId);
      if (Number.isNaN(sid)) {
        return next(new AppError(400, "Invalid subjectId"));
      }
      setConditions.push(eq(examSetsTable.subjectId, sid));
    }
    if (setId) {
      setConditions.push(eq(examSetsTable.id, parseInt(setId)));
    }      const examSets = await db
      .select()
      .from(examSetsTable)
      .where(and(...setConditions));

    // Collect all question IDs from the sets
    const questionIds = examSets.reduce<number[]>((acc, set) => {
      if (set.questionIds && set.questionIds.length > 0) {
        acc.push(...set.questionIds);
      }
      return acc;
    }, []);

    if (questionIds.length === 0) {
      return res.json({ data: [], total: 0, page, totalPages: 0 });
    }

    // Deduplicate
    const uniqueIds = [...new Set(questionIds)];

    // Fetch questions that belong to these sets
    let all = await db
      .select()
      .from(questionsTable)
      .where(inArray(questionsTable.id, uniqueIds));

    // Additional subject filter if needed (for questions that also have pyqSubjectId)
    if (subjectId) {
      const sid = parseInt(subjectId);
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
