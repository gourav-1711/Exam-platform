import { Router } from "express";
import { db } from "../db";
import {
  previousYearPapersTable,
  syllabusTable,
  mockTestsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { cacheGet, cacheSet, cacheFlushPattern, CacheTTL } from "../lib/cache";

const router = Router();

import { AppError } from "../middleware/errorHandler";

router.get("/pyp", async (req, res, next) => {
  try {
    const cacheKey = "pyp:list";
    const cached = cacheGet<any[]>(cacheKey);
    if (cached) { res.json(cached); return; }

    const { examName } = req.query as Record<string, string>;
    let all = await db.select().from(previousYearPapersTable);
    if (examName)
      all = all.filter((p) =>
        p.examName.toLowerCase().includes(examName.toLowerCase()),
      );

    cacheSet(cacheKey, all, CacheTTL.QUESTIONS);
    return res.json(all);
  } catch (err) {
    return next(err);
  }
});

router.get("/syllabus", async (req, res, next) => {
  try {
    const cacheKey = "syllabus:list";
    const cached = cacheGet<any[]>(cacheKey);
    if (cached) { res.json(cached); return; }

    const all = await db.select().from(syllabusTable);
    cacheSet(cacheKey, all, CacheTTL.QUESTIONS);
    return res.json(all);
  } catch (err) {
    return next(err);
  }
});

router.get("/mock-tests", async (req, res, next) => {
  try {
    const cacheKey = "mock-tests:list";
    const cached = cacheGet<any[]>(cacheKey);
    if (cached) { res.json(cached); return; }

    const all = await db.select().from(mockTestsTable);
    cacheSet(cacheKey, all, CacheTTL.QUESTIONS);
    return res.json(all);
  } catch (err) {
    return next(err);
  }
});

router.get("/mock-tests/:id", async (req, res, next) => {
  try {
    const cacheKey = `mock-tests:${req.params.id}`;
    const cached = cacheGet<any>(cacheKey);
    if (cached) { res.json(cached); return; }

    const id = parseInt(req.params.id);
    const [test] = await db
      .select()
      .from(mockTestsTable)
      .where(eq(mockTestsTable.id, id));

    if (!test) {
      return next(new AppError(404, "Not found"));
    }

    cacheSet(cacheKey, test, CacheTTL.QUESTIONS);
    return res.json(test);
  } catch (err) {
    return next(err);
  }
});


export default router;
