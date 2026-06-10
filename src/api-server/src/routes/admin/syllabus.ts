import { Router } from "express";
import { db } from "../../lib/db";
import { syllabusTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { uploadDoc } from "../../middleware/upload";
import { uploadToCloudinary } from "../../config/cloudinary";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { routeParam } from "../../lib/routeParams";
import { formatZodIssues } from "../../utils/validation";
import { cacheFlushPattern } from "../../lib/cache";
import { AppError } from "../../middleware/errorHandler";

const syllabusSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  subjectId: z.string().optional(),
  examCategory: z.string().optional(),
  readUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
});

const router = Router();

// GET /api/admin/syllabus — List all syllabus
router.get("/syllabus", async (req, res, next) => {
  try {
    const list = await db.select().from(syllabusTable);
    res.json(list);
  } catch (err) {
    return next(err);
  }
});

// POST /api/admin/syllabus — Create a new syllabus (supports file upload or URL)
router.post(
  "/syllabus",
  uploadDoc.single("file"),
  logAdminActivity("create_syllabus", "syllabus"),
  async (req, res, next) => {
    try {
      const parsed = syllabusSchema.safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed — ${formatZodIssues(parsed.error.issues)}`));
      }

      const { title, description, examCategory, subjectId } = parsed.data;
      let finalReadUrl = parsed.data.readUrl || null;
      let finalDownloadUrl = parsed.data.downloadUrl || null;

      if (req.file) {
        const upload = await uploadToCloudinary(
          req.file.buffer,
          "exam-platform/syllabus",
          req.file.originalname,
        );
        finalDownloadUrl = upload.secureUrl;
        finalReadUrl = upload.secureUrl;
      }

      const [inserted] = await db
        .insert(syllabusTable)
        .values({
          title,
          description: description || null,
          examCategory: examCategory || null,
          subjectId: subjectId || null,
          readUrl: finalReadUrl,
          downloadUrl: finalDownloadUrl,
        })
        .returning();

      cacheFlushPattern("syllabus:");
      return res.status(201).json(inserted);
    } catch (err) {
      return next(err);
    }
  },
);

// PATCH /api/admin/syllabus/:id — Update syllabus
router.patch(
  "/syllabus/:id",
  logAdminActivity("update_syllabus", "syllabus"),
  async (req, res, next) => {
    try {
      const id = routeParam(req.params.id);
      const parsed = syllabusSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed — ${formatZodIssues(parsed.error.issues)}`));
      }
      const [updated] = await db
        .update(syllabusTable)
        .set(parsed.data)
        .where(eq(syllabusTable.id, id))
        .returning();

      if (!updated) {
        return next(new AppError(404, "Syllabus not found"));
      }

      cacheFlushPattern("syllabus:");
      return res.json(updated);
    } catch (err) {
      return next(err);
    }
  },
);

// DELETE /api/admin/syllabus/:id — Delete syllabus
router.delete(
  "/syllabus/:id",
  logAdminActivity("delete_syllabus", "syllabus"),
  async (req, res, next) => {
    try {
      const id = routeParam(req.params.id);
      
      const [record] = await db
        .select()
        .from(syllabusTable)
        .where(eq(syllabusTable.id, id))
        .limit(1);

      if (!record) {
        return next(new AppError(404, "Syllabus not found"));
      }

      await db.delete(syllabusTable).where(eq(syllabusTable.id, id));
      
      cacheFlushPattern("syllabus:");
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
