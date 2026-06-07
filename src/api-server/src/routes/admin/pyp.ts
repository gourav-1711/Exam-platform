import { Router } from "express";
import { db } from "../../lib/db";
import { previousYearPapersTable } from "@workspace/db";
import { eq, desc, like, and, sql } from "drizzle-orm";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { routeParamInt } from "../../lib/routeParams";

const router = Router();

// GET /api/admin/pyp
router.get("/pyp", async (req, res) => {
  try {
    const { search } = req.query as Record<string, string>;
    const conditions: any[] = [];

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
    res.status(500).json({ error: "Failed to fetch PYP papers" });
  }
});

// GET /api/admin/pyp/:id
router.get("/pyp/:id", async (req, res) => {
  try {
    const id = routeParamInt(req.params.id);
    const [paper] = await db
      .select()
      .from(previousYearPapersTable)
      .where(eq(previousYearPapersTable.id, id));

    if (!paper) {
      res.status(404).json({ error: "PYP paper not found" });
      return;
    }

    res.json({
      ...paper,
      createdAt: paper.createdAt.toISOString(),
      updatedAt: paper.updatedAt.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch PYP paper" });
  }
});

// POST /api/admin/pyp
router.post(
  "/pyp",
  logAdminActivity("create_pyp", "pyp"),
  async (req, res) => {
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
        res.status(400).json({ error: "examName and year are required" });
        return;
      }

      const [paper] = await db
        .insert(previousYearPapersTable)
        .values({
          examName,
          shiftName: shiftName || "Shift 1",
          year: parseInt(year),
          subject: subject || null,
          subjectId: subjectId ? parseInt(subjectId) : null,
          questionPaperUrl: questionPaperUrl || null,
          answerKeyUrl: answerKeyUrl || null,
          answerKeyPdf: answerKeyPdf || null,
        })
        .returning();

      res.status(201).json({
        ...paper,
        createdAt: paper.createdAt.toISOString(),
        updatedAt: paper.updatedAt.toISOString(),
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to create PYP paper" });
    }
  },
);

// PATCH /api/admin/pyp/:id
router.patch(
  "/pyp/:id",
  logAdminActivity("update_pyp", "pyp"),
  async (req, res) => {
    try {
      const id = routeParamInt(req.params.id);
      const updateData: Record<string, unknown> = { ...req.body };
      if (updateData.year) updateData.year = parseInt(updateData.year as string);
      if (updateData.subjectId) updateData.subjectId = parseInt(updateData.subjectId as string);

      const [updated] = await db
        .update(previousYearPapersTable)
        .set(updateData)
        .where(eq(previousYearPapersTable.id, id))
        .returning();

      if (!updated) {
        res.status(404).json({ error: "PYP paper not found" });
        return;
      }

      res.json({
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to update PYP paper" });
    }
  },
);

// DELETE /api/admin/pyp/:id
router.delete(
  "/pyp/:id",
  logAdminActivity("delete_pyp", "pyp"),
  async (req, res) => {
    try {
      const id = routeParamInt(req.params.id);
      await db.delete(previousYearPapersTable).where(eq(previousYearPapersTable.id, id));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete PYP paper" });
    }
  },
);

export default router;
