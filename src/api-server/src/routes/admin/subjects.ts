import { Router } from "express";
import { db } from "../../lib/db";
import { subjects, questionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { routeParamInt } from "../../lib/routeParams";
import { AppError } from "../../middleware/errorHandler";

const subjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  examCategory: z.string().default("General"),
  description: z.string().optional(),
});

const router = Router();

router.get("/subjects", async (req, res, next): Promise<any> => {
  try {
    const data = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        examCategory: subjects.examCategory,
        description: subjects.description,
        questionCount: sql<number>`count(${questionsTable.id})`,
      })
      .from(subjects)
      .leftJoin(
        questionsTable,
        eq(questionsTable.pyqSubjectId, subjects.id),
      )
      .groupBy(subjects.id)
      .orderBy(subjects.name);

    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

router.post(
  "/subjects",
  logAdminActivity("create_subject", "subject"),
  async (req, res, next): Promise<any> => {
    try {
      const parsed = subjectSchema.safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed: ${parsed.error.issues.map(i => i.message).join("; ")}`));
      }

      const [subject] = await db
        .insert(subjects)
        .values(parsed.data)
        .returning();
      return res.status(201).json(subject);
    } catch (err) {
      return next(err);
    }
  },
);

router.patch(
  "/subjects/:id",
  logAdminActivity("update_subject", "subject"),
  async (req, res, next): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      const parsed = subjectSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed: ${parsed.error.issues.map(i => i.message).join("; ")}`));
      }
      const [updated] = await db
        .update(subjects)
        .set(parsed.data)
        .where(eq(subjects.id, id))
        .returning();
      if (!updated) return next(new AppError(404, "Subject not found"));
      return res.json(updated);
    } catch (err) {
      return next(err);
    }
  },
);

router.delete(
  "/subjects/:id",
  logAdminActivity("delete_subject", "subject"),
  async (req, res, next): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      await db.delete(subjects).where(eq(subjects.id, id));
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;