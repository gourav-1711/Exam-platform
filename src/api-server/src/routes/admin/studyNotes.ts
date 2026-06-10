import { Router } from "express";
import { db } from "../../lib/db";
import { studyNotesTable } from "@workspace/db";
import { eq, like, and, sql, desc, type SQL } from "drizzle-orm";
import { z } from "zod";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { routeParam } from "../../lib/routeParams";
import { cacheFlushPattern } from "../../lib/cache";
import { formatZodIssues } from "../../utils/validation";
import { uploadDoc } from "../../middleware/upload";
import { uploadToCloudinary } from "../../config/cloudinary";
import { AppError } from "../../middleware/errorHandler";

const studyNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  subject: z.string().min(1, "Subject is required"),
  medium: z.string().default("English"),
  url: z.string().optional().nullable(),
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

const router = Router();

// GET /api/admin/study-notes — list with pagination and search
router.get("/study-notes", async (req, res, next) => {
  try {
    const { page = "1", limit = "20", search, subject, medium } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    const conditions: SQL[] = [];
    if (search) conditions.push(like(studyNotesTable.title, `%${search}%`));
    if (subject) conditions.push(eq(studyNotesTable.subject, subject));
    if (medium) conditions.push(eq(studyNotesTable.medium, medium));

    const where = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(studyNotesTable)
      .where(where);

    const studyNotes = await db
      .select()
      .from(studyNotesTable)
      .where(where)
      .orderBy(desc(studyNotesTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    return res.json({
      data: studyNotes,
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

router.get("/study-notes/:id", async (req, res, next) => {
  try {
    const id = routeParam(req.params.id);
    const [note] = await db
      .select()
      .from(studyNotesTable)
      .where(eq(studyNotesTable.id, id));
    if (!note) return next(new AppError(404, "Study note not found"));
    return res.json(note);
  } catch (err) {
    return next(err);
  }
});

router.post(
  "/study-notes",
  uploadDoc.single("file"),
  logAdminActivity("create_study_note", "study_note"),
  async (req, res, next) => {
    try {
      const parsed = studyNoteSchema.safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed — ${formatZodIssues(parsed.error.issues)}`));
      }

      let finalUrl = parsed.data.url || null;

      if (req.file) {
        const upload = await uploadToCloudinary(
          req.file.buffer,
          "exam-platform/study-notes",
          req.file.originalname,
        );
        finalUrl = upload.secureUrl;
      }

      const [note] = await db
        .insert(studyNotesTable)
        .values({
          ...parsed.data,
          url: finalUrl,
        })
        .returning();

      cacheFlushPattern("study-notes:");
      return res.status(201).json(note);
    } catch (err) {
      return next(err);
    }
  },
);

router.patch(
  "/study-notes/:id",
  uploadDoc.single("file"),
  logAdminActivity("update_study_note", "study_note"),
  async (req, res, next) => {
    try {
      const id = routeParam(req.params.id);
      const parsed = studyNoteSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed — ${formatZodIssues(parsed.error.issues)}`));
      }

      let finalUrl = parsed.data.url || null;

      if (req.file) {
        const upload = await uploadToCloudinary(
          req.file.buffer,
          "exam-platform/study-notes",
          req.file.originalname,
        );
        finalUrl = upload.secureUrl;
      }

      const updateData: Record<string, unknown> = {
        ...parsed.data,
        ...(finalUrl ? { url: finalUrl } : {}),
        updatedAt: new Date(),
      };

      const [updated] = await db
        .update(studyNotesTable)
        .set(updateData)
        .where(eq(studyNotesTable.id, id))
        .returning();

      if (!updated)
        return next(new AppError(404, "Study note not found"));

      cacheFlushPattern("study-notes:");
      return res.json(updated);
    } catch (err) {
      return next(err);
    }
  },
);

router.delete(
  "/study-notes/:id",
  logAdminActivity("delete_study_note", "study_note"),
  async (req, res, next) => {
    try {
      const id = routeParam(req.params.id);
      await db.delete(studyNotesTable).where(eq(studyNotesTable.id, id));
      cacheFlushPattern("study-notes:");
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
