import { Router } from "express";
import { db } from "../../lib/db";
import { examSetsTable } from "@workspace/db";
import { eq, desc, like, and, sql } from "drizzle-orm";
import { z } from "zod";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { routeParamInt } from "../../lib/routeParams";

const router = Router();

const examSetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["pyq", "ncert"]).default("pyq"),
  subjectId: z.coerce.number().optional(),
  classNum: z.coerce.number().optional(),
  medium: z.string().optional(),
  questionIds: z.array(z.number()).default([]),
});

// GET /api/admin/exam-sets
router.get("/exam-sets", async (req, res) => {
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
    res.status(500).json({ error: "Failed to fetch exam sets" });
  }
});

// GET /api/admin/exam-sets/:id
router.get("/exam-sets/:id", async (req, res) => {
  try {
    const id = routeParamInt(req.params.id);
    const [set] = await db
      .select()
      .from(examSetsTable)
      .where(eq(examSetsTable.id, id));
    if (!set) {
      res.status(404).json({ error: "Exam set not found" });
      return;
    }
    res.json(set);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch exam set" });
  }
});

// POST /api/admin/exam-sets
router.post(
  "/exam-sets",
  logAdminActivity("create_exam_set", "exam_set"),
  async (req, res) => {
    try {
      const parsed = examSetSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
        return;
      }

      const { questionIds, ...rest } = parsed.data;

      const [set] = await db
        .insert(examSetsTable)
        .values({
          ...rest,
          questionIds,
          totalQuestions: questionIds.length,
        })
        .returning();

      res.status(201).json(set);
    } catch (err) {
      res.status(500).json({ error: "Failed to create exam set" });
    }
  },
);

// PATCH /api/admin/exam-sets/:id
router.patch(
  "/exam-sets/:id",
  logAdminActivity("update_exam_set", "exam_set"),
  async (req, res) => {
    try {
      const id = routeParamInt(req.params.id);
      const parsed = examSetSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
        return;
      }

      const { questionIds, ...rest } = parsed.data;
      const updateData: Record<string, unknown> = {
        ...rest,
        ...(questionIds !== undefined ? { questionIds, totalQuestions: questionIds.length } : {}),
      };

      const [updated] = await db
        .update(examSetsTable)
        .set(updateData)
        .where(eq(examSetsTable.id, id))
        .returning();

      if (!updated) {
        res.status(404).json({ error: "Exam set not found" });
        return;
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to update exam set" });
    }
  },
);

// DELETE /api/admin/exam-sets/:id
router.delete(
  "/exam-sets/:id",
  logAdminActivity("delete_exam_set", "exam_set"),
  async (req, res) => {
    try {
      const id = routeParamInt(req.params.id);
      await db.delete(examSetsTable).where(eq(examSetsTable.id, id));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete exam set" });
    }
  },
);

export default router;
