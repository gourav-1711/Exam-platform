import type { Request, Response, NextFunction } from "express";
import { db } from "../../lib/db";
import { subjects } from "@workspace/db";
import { eq, like, and, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { routeParam } from "../../lib/routeParams";
import { AppError } from "../../middleware/errorHandler";
import { slugify } from "../../utils/slugify";

const subjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  examCategory: z.string().default("UPSC"),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function listAllSubjects(req: Request, res: Response, next: NextFunction) {
  try {
    const { search } = req.query as Record<string, string>;
    const conditions = [];
    if (search) conditions.push(like(subjects.name, `%${search}%`));
    const where = conditions.length ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(subjects)
      .where(where)
      .orderBy(desc(subjects.createdAt));
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

export async function createSubject(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = subjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, `Validation error: ${parsed.error.issues.map(i => i.message).join("; ")}`));
    }
    const { name, examCategory, description, isActive } = parsed.data;

    // Check for duplicate slug
    const slug = slugify(name, "subject");
    const [existing] = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.slug, slug));
    if (existing) {
      return next(new AppError(409, "A subject with this name already exists"));
    }

    const [subject] = await db
      .insert(subjects)
      .values({ name, slug, examCategory, description, isActive })
      .returning();
    return res.status(201).json(subject);
  } catch (err) {
    return next(err);
  }
}

export async function updateSubject(req: Request, res: Response, next: NextFunction) {
  try {
    const id = routeParam(req.params.id);
    const parsed = subjectSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, `Validation error: ${parsed.error.issues.map(i => i.message).join("; ")}`));
    }
    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.name) {
      updateData.slug = slugify(updateData.name as string, "subject");
    }
    const [updated] = await db
      .update(subjects)
      .set(updateData)
      .where(eq(subjects.id, id))
      .returning();
    if (!updated) {
      return next(new AppError(404, "Subject not found"));
    }
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
}

export async function deleteSubject(req: Request, res: Response, next: NextFunction) {
  try {
    const id = routeParam(req.params.id);
    await db.delete(subjects).where(eq(subjects.id, id));
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
}
