import { Router } from "express";
import { db } from "../../lib/db";
import { examSetsTable } from "@workspace/db";
import { eq, desc, like, and, sql } from "drizzle-orm";
import { z } from "zod";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { routeParamInt } from "../../lib/routeParams";
import { AppError } from "../../middleware/errorHandler";

const router = Router();

function formatZodIssues(issues: z.ZodIssue[]): string {
  return issues
    .map((i) => `${i.path.join(".")} — ${i.message}`)
    .join("; ");
}

const examSetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  type: z.enum(["pyq", "ncert"]).default("pyq"),
  subjectId: z.coerce.number().optional().nullable(),
  classNum: z.coerce.number().optional().nullable(),
  medium: z.string().optional().nullable(),
  questionIds: z.array(z.number()).default([]),
});

/** Generate a URL-friendly slug from a string */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}


// GET /api/admin/exam-sets
router.get("/exam-sets", async (req, res, next) => {
  try {
    const {
      page = "1",
      limit = "20",
      type,
      search,
    } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (type && (type === "pyq" || type === "ncert")) conditions.push(eq(examSetsTable.type, type));
    if (search) conditions.push(like(examSetsTable.title, `%${search}%`));

    const where = conditions.length ? and(...conditions) : undefined;

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

    res.json({
      data,
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

// GET /api/admin/exam-sets/:id
router.get("/exam-sets/:id", async (req, res, next) => {
  try {
    const id = routeParamInt(req.params.id);
    const [set] = await db
      .select()
      .from(examSetsTable)
      .where(eq(examSetsTable.id, id));
    if (!set) {
      return next(new AppError(404, "Exam set not found"));
    }
    res.json(set);
  } catch (err) {
    return next(err);
  }
});

// POST /api/admin/exam-sets
router.post(
  "/exam-sets",
  logAdminActivity("create_exam_set", "exam_set"),
  async (req, res, next) => {
    try {
      const parsed = examSetSchema.safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed — ${formatZodIssues(parsed.error.issues)}`));
      }

      const { questionIds, ...rest } = parsed.data;
      const slug = slugify(parsed.data.title);

      const [set] = await db
        .insert(examSetsTable)
        .values({
          ...rest,
          slug,
          questionIds,
          totalQuestions: questionIds.length,
        })
        .returning();

      res.status(201).json(set);
    } catch (err) {
      return next(err);
    }
  },
);

// PATCH /api/admin/exam-sets/:id
router.patch(
  "/exam-sets/:id",
  logAdminActivity("update_exam_set", "exam_set"),
  async (req, res, next) => {
    try {
      const id = routeParamInt(req.params.id);
      const parsed = examSetSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed — ${formatZodIssues(parsed.error.issues)}`));
      }

      const { questionIds, ...rest } = parsed.data;
      const updateData: Record<string, unknown> = {
        ...rest,
        ...(rest.title ? { slug: slugify(rest.title) } : {}),
        ...(questionIds !== undefined ? { questionIds, totalQuestions: questionIds.length } : {}),
      };

      const [updated] = await db
        .update(examSetsTable)
        .set(updateData)
        .where(eq(examSetsTable.id, id))
        .returning();

      if (!updated) {
        return next(new AppError(404, "Exam set not found"));
      }
      res.json(updated);
    } catch (err) {
      return next(err);
    }
  },
);

// DELETE /api/admin/exam-sets/:id
router.delete(
  "/exam-sets/:id",
  logAdminActivity("delete_exam_set", "exam_set"),
  async (req, res, next) => {
    try {
      const id = routeParamInt(req.params.id);
      await db.delete(examSetsTable).where(eq(examSetsTable.id, id));
      res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
