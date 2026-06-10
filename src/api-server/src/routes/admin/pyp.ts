import { Router } from "express";
import { db } from "../../lib/db";
import { previousYearPapersTable, subjects } from "@workspace/db";
import { eq, desc, like, and, sql, type SQL } from "drizzle-orm";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { routeParam } from "../../lib/routeParams";
import { cacheFlushPattern } from "../../lib/cache";
import { AppError } from "../../middleware/errorHandler";

const router = Router();

// GET /api/admin/pyp
router.get("/pyp", async (req, res, next) => {
  try {
    const { search } = req.query as Record<string, string>;
    const conditions: SQL[] = [];

    if (search) {
      conditions.push(
        like(previousYearPapersTable.examName, `%${search}%`),
      );
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(previousYearPapersTable)
      .where(where)
      .orderBy(desc(previousYearPapersTable.year));

    const serialized = data.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    res.json(serialized);
  } catch (err) {
    return next(err);
  }
});

// GET /api/admin/pyp/:id
router.get("/pyp/:id", async (req, res, next) => {
  try {
    const id = routeParam(req.params.id);
    const [paper] = await db
      .select()
      .from(previousYearPapersTable)
      .where(eq(previousYearPapersTable.id, id));

    if (!paper) {
      return next(new AppError(404, "PYP paper not found"));
    }

    res.json({
      ...paper,
      createdAt: paper.createdAt.toISOString(),
      updatedAt: paper.updatedAt.toISOString(),
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/admin/pyp
router.post(
  "/pyp",
  logAdminActivity("create_pyp", "pyp"),
  async (req, res, next) => {
    try {
      const {
        examName,
        shiftName,
        year,
        subject,
        subjectId,
        questionPaperUrl,
        answerKeyUrl,
        answerKeyPdf,
      } = req.body;

      if (!examName || !year) {
        return next(new AppError(400, "examName and year are required"));
      }

      // Resolve subjectId to subject name if provided
      let resolvedSubject = subject || null;
      if (subjectId && !resolvedSubject) {
        const [subj] = await db
          .select({ name: subjects.name })
          .from(subjects)
          .where(eq(subjects.id, subjectId));
        if (subj) resolvedSubject = subj.name;
      }

      const [paper] = await db
        .insert(previousYearPapersTable)
        .values({
          examName,
          shiftName: shiftName || "Shift 1",
          year: parseInt(year, 10),
          subject: resolvedSubject,
          subjectId: subjectId || null,
          questionPaperUrl: questionPaperUrl || null,
          answerKeyUrl: answerKeyUrl || null,
          answerKeyPdf: answerKeyPdf || null,
        })
        .returning();

      cacheFlushPattern("pyp:");
      res.status(201).json({
        ...paper,
        createdAt: paper.createdAt.toISOString(),
        updatedAt: paper.updatedAt.toISOString(),
      });
    } catch (err) {
      return next(err);
    }
  },
);

// PATCH /api/admin/pyp/:id
router.patch(
  "/pyp/:id",
  logAdminActivity("update_pyp", "pyp"),
  async (req, res, next) => {
    try {
      const id = routeParam(req.params.id);
      const updateData: Record<string, unknown> = { ...req.body };
      if (updateData.year) updateData.year = parseInt(updateData.year as string, 10);

      // If subjectId changed but subject name not provided, auto-resolve it
      if (updateData.subjectId && !updateData.subject) {
        const [subj] = await db
          .select({ name: subjects.name })
          .from(subjects)
          .where(eq(subjects.id, updateData.subjectId as string));
        if (subj) updateData.subject = subj.name;
      }

      const [updated] = await db
        .update(previousYearPapersTable)
        .set(updateData)
        .where(eq(previousYearPapersTable.id, id))
        .returning();

      if (!updated) {
        return next(new AppError(404, "PYP paper not found"));
      }

      cacheFlushPattern("pyp:");
      res.json({
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      });
    } catch (err) {
      return next(err);
    }
  },
);

// DELETE /api/admin/pyp/:id
router.delete(
  "/pyp/:id",
  logAdminActivity("delete_pyp", "pyp"),
  async (req, res, next) => {
    try {
      const id = routeParam(req.params.id);
      await db.delete(previousYearPapersTable).where(eq(previousYearPapersTable.id, id));
      cacheFlushPattern("pyp:");
      res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
