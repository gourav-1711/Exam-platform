import type { Request, Response, NextFunction } from "express";
import { eq, inArray, and, sql } from "drizzle-orm";
import { db } from "../../db";
import { subjects, questionsTable, examSetsTable } from "@workspace/db";

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

export async function getPyqSubjects(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        slug: subjects.slug,
        examCategory: subjects.examCategory,
        description: subjects.description,
        isActive: subjects.isActive,
        createdAt: subjects.createdAt,
        updatedAt: subjects.updatedAt,
        questionCount: sql<number>`COALESCE(SUM(${examSetsTable.totalQuestions}), 0)`,
      })
      .from(subjects)
      .leftJoin(
        examSetsTable,
        and(
          eq(examSetsTable.subjectId, subjects.id),
          eq(examSetsTable.type, "pyq"),
          eq(examSetsTable.isActive, true),
        ),
      )
      .groupBy(subjects.id)
      .orderBy(subjects.name);

    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

export async function getPyqSets(req: Request, res: Response, next: NextFunction) {
  try {
    const { subjectId } = req.query as Record<string, string>;
    const conditions = [eq(examSetsTable.type, "pyq"), eq(examSetsTable.isActive, true)];
    if (subjectId) {
      conditions.push(eq(examSetsTable.subjectId, subjectId));
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
}

export async function getPyqQuestions(req: Request, res: Response, next: NextFunction) {
  try {
    const { subjectId, page: pageStr, setId, limit: limitStr } = req.query as Record<string, string>;
    const page = parseInt(pageStr) || 1;
    const limit = Math.min(100, parseInt(limitStr) || 10);
    const offset = (page - 1) * limit;

    const setConditions = [eq(examSetsTable.type, "pyq"), eq(examSetsTable.isActive, true)];
    if (subjectId) {
      const [subj] = await db
        .select({ id: subjects.id })
        .from(subjects)
        .where(eq(subjects.id, subjectId));
      if (subj) {
        setConditions.push(eq(examSetsTable.subjectId, subj.id));
      } else {
        const [subjBySlug] = await db
          .select({ id: subjects.id })
          .from(subjects)
          .where(eq(subjects.slug, subjectId));
        if (subjBySlug) {
          setConditions.push(eq(examSetsTable.subjectId, subjBySlug.id));
        }
      }
    }
    if (setId) {
      // Try matching by ID first, then by slug
      const [setById] = await db
        .select({ id: examSetsTable.id })
        .from(examSetsTable)
        .where(and(eq(examSetsTable.id, setId), eq(examSetsTable.type, "pyq")));
      if (setById) {
        setConditions.push(eq(examSetsTable.id, setById.id));
      } else {
        const [setBySlug] = await db
          .select({ id: examSetsTable.id })
          .from(examSetsTable)
          .where(and(eq(examSetsTable.slug, setId), eq(examSetsTable.type, "pyq")));
        if (setBySlug) {
          setConditions.push(eq(examSetsTable.id, setBySlug.id));
        }
      }
    }
    const examSets = await db
      .select()
      .from(examSetsTable)
      .where(and(...setConditions));

    const questionIds = examSets.reduce<string[]>((acc, set) => {
      if (set.questionIds && set.questionIds.length > 0) {
        acc.push(...set.questionIds);
      }
      return acc;
    }, []);

    if (questionIds.length === 0) {
      return res.json({ data: [], total: 0, page, totalPages: 0 });
    }

    const uniqueIds = [...new Set(questionIds)];

    let all = await db
      .select()
      .from(questionsTable)
      .where(and(inArray(questionsTable.id, uniqueIds), eq(questionsTable.isActive, true)));

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
}
