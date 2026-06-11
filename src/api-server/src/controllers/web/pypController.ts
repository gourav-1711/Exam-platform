import type { Request, Response, NextFunction } from "express";
import { db } from "../../db";
import {
  previousYearPapersTable,
  syllabusTable,
  mockTestsTable,
} from "@workspace/db";
import { eq, ilike, and, desc } from "drizzle-orm";
import { cacheGet, cacheSet, CacheTTL } from "../../lib/cache";
import { AppError } from "../../middleware/errorHandler";

export async function listPyp(req: Request, res: Response, next: NextFunction) {
  try {
    const { examName } = req.query as Record<string, string>;
    const cacheKey = `pyp:list:${examName || "all"}`;
    const cached = cacheGet<unknown[]>(cacheKey);
    if (cached) { res.json(cached); return; }

    const conditions = [eq(previousYearPapersTable.isActive, true)];
    if (examName) conditions.push(ilike(previousYearPapersTable.examName, `%${examName}%`));

    const all = await db
      .select()
      .from(previousYearPapersTable)
      .where(and(...conditions))
      .orderBy(desc(previousYearPapersTable.year));

    cacheSet(cacheKey, all, CacheTTL.QUESTIONS);
    return res.json(all);
  } catch (err) {
    return next(err);
  }
}

export async function listSyllabus(req: Request, res: Response, next: NextFunction) {
  try {
    const cacheKey = "syllabus:list";
    const cached = cacheGet<unknown[]>(cacheKey);
    if (cached) { res.json(cached); return; }

    const all = await db
      .select()
      .from(syllabusTable)
      .where(eq(syllabusTable.isActive, true));
    cacheSet(cacheKey, all, CacheTTL.QUESTIONS);
    return res.json(all);
  } catch (err) {
    return next(err);
  }
}
