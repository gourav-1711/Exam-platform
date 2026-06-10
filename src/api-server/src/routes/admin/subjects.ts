import { Router } from "express";
import { db } from "../../lib/db";
import { subjects, questionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { routeParam } from "../../lib/routeParams";
import { AppError } from "../../middleware/errorHandler";

/** Generate a URL-friendly slug from a string */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

const subjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  examCategory: z.string().default("General"),
  description: z.string().optional(),
});

const router = Router();

router.get("/subjects", async (req, res, next) => {
  try {
    const data = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        slug: subjects.slug,
        examCategory: subjects.examCategory,
        description: subjects.description,
        isActive: subjects.isActive,
        createdAt: subjects.createdAt,
        updatedAt: subjects.updatedAt,
        questionCount: sql<number>`CAST(COUNT(DISTINCT ${questionsTable.id}) AS INT)`,
      })
      .from(subjects)
      .leftJoin(
        questionsTable,
        eq(questionsTable.subjectId, subjects.id),
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
  async (req, res, next) => {
    try {
      const parsed = subjectSchema.safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed: ${parsed.error.issues.map(i => i.message).join("; ")}`));
      }

      const slug = slugify(parsed.data.name);

      // Check for duplicate slug
      const [existing] = await db
        .select({ id: subjects.id })
        .from(subjects)
        .where(eq(subjects.slug, slug));
      if (existing) {
        return next(new AppError(409, `A subject with the name "${parsed.data.name}" already exists`));
      }

      const insertData = { ...parsed.data, slug };
      const [subject] = await db
        .insert(subjects)
        .values(insertData)
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
  async (req, res, next) => {
    try {
      const id = routeParam(req.params.id);
      const parsed = subjectSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed: ${parsed.error.issues.map(i => i.message).join("; ")}`));
      }
      const updateData: Record<string, unknown> = { ...parsed.data };
      if (updateData.name) {
        updateData.slug = slugify(updateData.name as string);
      }
      const [updated] = await db
        .update(subjects)
        .set(updateData)
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
  async (req, res, next) => {
    try {
      const id = routeParam(req.params.id);
      const [existing] = await db
        .select({ id: subjects.id })
        .from(subjects)
        .where(eq(subjects.id, id));
      if (!existing) {
        return next(new AppError(404, "Subject not found"));
      }
      await db.delete(subjects).where(eq(subjects.id, id));
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
