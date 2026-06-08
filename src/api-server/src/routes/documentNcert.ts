import { Router } from "express";
import { db } from "../lib/db";
import { ncertPdfsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { routeParam } from "../lib/routeParams";
import { cacheGet, cacheSet, CacheTTL } from "../lib/cache";

const router = Router();

// GET /api/document-ncert — list all with pagination and filters
router.get("/", async (req, res, next) => {
  const cacheKey = `document-ncert:${req.query.page || "1"}:${req.query.classNumber || "all"}:${req.query.subject || "all"}`;
  const cached = cacheGet<any>(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 12;
    const offset = (page - 1) * limit;

    const classNumberRaw = req.query.classNumber;
    const subjectRaw = req.query.subject;

    const classNumber =
      typeof classNumberRaw === "string"
        ? routeParam(classNumberRaw)
        : undefined;
    const subject =
      typeof subjectRaw === "string" ? routeParam(subjectRaw) : undefined;

    const conditions = [];
    if (classNumber) {
      conditions.push(eq(ncertPdfsTable.classNumber, Number(classNumber)));
    }
    if (subject) {
      conditions.push(eq(ncertPdfsTable.subject, subject));
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ncertPdfsTable)
      .where(where);

    const total = Number(countRow?.count ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const results = await db
      .select()
      .from(ncertPdfsTable)
      .where(where)
      .orderBy(ncertPdfsTable.uploadedAt)
      .limit(limit)
      .offset(offset);

    const result = {
      data: results,
      total,
      page,
      totalPages,
    };
    cacheSet(cacheKey, result, CacheTTL.QUESTIONS);
    res.json(result);
  } catch (err) {
    return next(err);
  }
});

export default router;
