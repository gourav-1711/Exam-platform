import { Router } from "express";
import { db } from "../lib/db";
import { examSetsTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { routeParamInt } from "../lib/routeParams";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// GET /api/exam-sets — Public list of active exam sets
router.get("/exam-sets", async (req, res, next) => {
  try {
    const {
      page = "1",
      limit = "20",
      type,
      subjectId,
      classNum,
      medium,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [eq(examSetsTable.isActive, true)];
    if (type && (type === "pyq" || type === "ncert")) {
      conditions.push(eq(examSetsTable.type, type));
    }
    if (subjectId) {
      conditions.push(eq(examSetsTable.subjectId, parseInt(subjectId)));
    }
    if (classNum) {
      conditions.push(eq(examSetsTable.classNum, parseInt(classNum)));
    }
    if (medium) {
      conditions.push(eq(examSetsTable.medium, medium));
    }

    const where = and(...conditions);

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(examSetsTable)
      .where(where);

    const data = await db
      .select()
      .from(examSetsTable)
      .where(where)
      .orderBy(desc(examSetsTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    const serialized = data.map((set) => ({
      ...set,
      createdAt: set.createdAt.toISOString(),
      updatedAt: set.updatedAt.toISOString(),
    }));

    res.json({
      data: serialized,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(countRow?.count ?? 0),
        totalPages: Math.ceil(Number(countRow?.count ?? 0) / limitNum),
      },
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/exam-sets/:slug — Public detail of an exam set (supports both slug and ID)
router.get("/exam-sets/:slug", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const id = parseInt(slug);
    const condition = Number.isFinite(id) && String(id) === slug
      ? eq(examSetsTable.id, id)
      : eq(examSetsTable.slug, slug);

    const [set] = await db
      .select()
      .from(examSetsTable)
      .where(and(condition, eq(examSetsTable.isActive, true)));

    if (!set) {
      return next(new AppError(404, "Exam set not found"));
    }

    res.json({
      ...set,
      createdAt: set.createdAt.toISOString(),
      updatedAt: set.updatedAt.toISOString(),
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
