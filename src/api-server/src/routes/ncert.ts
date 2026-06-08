import { Router } from "express";
import { db } from "../db";
import { ncertBooksTable, questionsTable, examSetsTable } from "@workspace/db";
import { eq, inArray, and } from "drizzle-orm";
import { cacheGet, cacheSet, cacheFlushPattern, CacheTTL } from "../lib/cache";

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

// GET /ncert-mcq/questions — Questions from active NCERT exam sets
router.get("/ncert-mcq/questions", async (req, res, next) => {
  try {
    const {
      classNum,
      subject,
      medium,
      page: pageStr,
      setId,
    } = req.query as Record<string, string>;
    const page = parseInt(pageStr) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const cacheKey = `ncert-mcq:${classNum || "all"}:${subject || "all"}:${medium || "all"}:${page}`;
    const cached = cacheGet<any>(cacheKey);
    if (cached) { res.json(cached); return; }

    const setConditions = [eq(examSetsTable.type, "ncert"), eq(examSetsTable.isActive, true)];
    if (classNum) setConditions.push(eq(examSetsTable.classNum, parseInt(classNum)));
    if (subject) setConditions.push(eq(examSetsTable.title, subject));
    if (medium) setConditions.push(eq(examSetsTable.medium, medium));
    if (setId) setConditions.push(eq(examSetsTable.id, parseInt(setId)));

    const examSets = await db
      .select()
      .from(examSetsTable)
      .where(and(...setConditions));

    const questionIds = examSets.reduce<number[]>((acc, set) => {
      if (set.questionIds && set.questionIds.length > 0) {
        acc.push(...set.questionIds);
      }
      return acc;
    }, []);

    if (questionIds.length === 0) {
      const result = { data: [], total: 0, page, totalPages: 0 };
      cacheSet(cacheKey, result, CacheTTL.QUESTIONS);
      res.json(result);
      return;
    }

    const uniqueIds = [...new Set(questionIds)];

    let all = await db
      .select()
      .from(questionsTable)
      .where(inArray(questionsTable.id, uniqueIds));

    if (classNum) all = all.filter((q) => q.classNum === parseInt(classNum));
    if (subject) all = all.filter((q) => q.subject?.toLowerCase() === subject.toLowerCase());
    if (medium) all = all.filter((q) => q.medium?.toLowerCase() === medium.toLowerCase());

    const total = all.length;
    const data = all.slice(offset, offset + limit).map(mapQuestion);
    const result = { data, total, page, totalPages: Math.ceil(total / limit) };
    cacheSet(cacheKey, result, CacheTTL.QUESTIONS);
    res.json(result);
  } catch (err) {
    return next(err);
  }
});

// GET /ncert-mcq/sets — List active NCERT exam sets
router.get("/ncert-mcq/sets", async (req, res, next) => {
  try {
    const { classNum, medium } = req.query as Record<string, string>;
    const conditions = [eq(examSetsTable.type, "ncert"), eq(examSetsTable.isActive, true)];
    if (classNum) conditions.push(eq(examSetsTable.classNum, parseInt(classNum)));
    if (medium) conditions.push(eq(examSetsTable.medium, medium));

    const sets = await db
      .select()
      .from(examSetsTable)
      .where(and(...conditions))
      .orderBy(examSetsTable.createdAt);

    res.json(sets.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })));
  } catch (err) {
    return next(err);
  }
});

router.get("/ncert-books", async (req, res, next) => {
  try {
    const { classNum, subject, medium } = req.query as Record<string, string>;
    const cacheKey = `ncert-books:${classNum || "all"}:${subject || "all"}:${medium || "all"}`;
    const cached = cacheGet<any[]>(cacheKey);
    if (cached) { res.json(cached); return; }

    let all = await db.select().from(ncertBooksTable);
    if (classNum) all = all.filter((b) => b.classNum === parseInt(classNum));
    if (subject)
      all = all.filter(
        (b) => b.subject.toLowerCase() === subject.toLowerCase(),
      );
    if (medium)
      all = all.filter((b) => b.medium.toLowerCase() === medium.toLowerCase());
    cacheSet(cacheKey, all, CacheTTL.QUESTIONS);
    res.json(all);
  } catch (err) {
    return next(err);
  }
});

export default router;
