import { Router } from "express";
import { db } from "../../lib/db";
import { pypPdfsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { uploadDoc } from "../../middleware/upload";
import { uploadToCloudinary, deleteFromCloudinary } from "../../config/cloudinary";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { z } from "zod";
import { formatZodIssues } from "../../utils/validation";
import { AppError } from "../../middleware/errorHandler";

const router = Router();

const pypPdfSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  year: z.coerce.number().int().min(1900, "Year is required"),
  examType: z.string().min(1, "Exam type is required"),
  externalUrl: z.string().optional(),
});

// GET /api/admin/document-pyp — list all PYP PDFs
router.get("/document-pyp", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const offset = (page - 1) * limit;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(pypPdfsTable);

    const data = await db
      .select()
      .from(pypPdfsTable)
      .orderBy(sql`uploaded_at DESC`)
      .limit(limit)
      .offset(offset);

    return res.json({
      data,
      pagination: {
        page,
        limit,
        total: Number(countRow?.count ?? 0),
        totalPages: Math.ceil(Number(countRow?.count ?? 0) / limit),
      },
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/admin/document-pyp/:id — get single PYP PDF
router.get("/document-pyp/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const [record] = await db
      .select()
      .from(pypPdfsTable)
      .where(eq(pypPdfsTable.id, id));

    if (!record) return next(new AppError(404, "PYP PDF not found"));
    return res.json(record);
  } catch (err) {
    return next(err);
  }
});

// POST /api/admin/document-pyp/upload — upload a new PYP PDF
router.post(
  "/document-pyp/upload",
  logAdminActivity("upload_pyp_pdf", "pyp_pdf"),
  uploadDoc.single("file"),
  async (req, res, next) => {
    try {
      const title = String(req.body.title ?? "");
      const subject = String(req.body.subject ?? "");
      const year = String(req.body.year ?? "");
      const examType = String(req.body.examType ?? "");
      const externalUrl = String(req.body.externalUrl ?? "");
      if (!title || !subject || !year || !examType) {
        return next(new AppError(400, "title, subject, year, examType are required"));
      }

      let secureUrl = "";
      let publicId = "external";
      let size = 0;
      let originalName = "External Link";

      if (req.file) {
        const file = req.file as Express.Multer.File;
        const upload = await uploadToCloudinary(
          file.buffer,
          "exam-platform/pyp",
          file.originalname,
        );
        secureUrl = upload.secureUrl;
        publicId = upload.publicId;
        size = file.size;
        originalName = file.originalname;
      } else if (externalUrl) {
        secureUrl = externalUrl;
      } else {
        return next(new AppError(400, "Either select a file to upload or enter a URL"));
      }

      const [inserted] = await db
        .insert(pypPdfsTable)
        .values({
          title,
          subject,
          year: Number(year),
          examType,
          originalName,
          cloudinaryUrl: secureUrl,
          cloudinaryPublicId: publicId,
          fileSize: size,
        })
        .returning();

      return res.status(201).json(inserted);
    } catch (err) {
      return next(err);
    }
  },
);

// PATCH /api/admin/document-pyp/:id — update PYP PDF metadata
router.patch(
  "/document-pyp/:id",
  logAdminActivity("update_pyp_pdf", "pyp_pdf"),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const parsed = pypPdfSchema.partial().safeParse(req.body as Record<string, unknown>);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed — ${formatZodIssues(parsed.error.issues)}`));
      }

      const [updated] = await db
        .update(pypPdfsTable)
        .set(parsed.data)
        .where(eq(pypPdfsTable.id, id))
        .returning();

      if (!updated) return next(new AppError(404, "PYP PDF not found"));
      return res.json(updated);
    } catch (err) {
      return next(err);
    }
  },
);

// DELETE /api/admin/document-pyp/:id — delete PYP PDF
router.delete(
  "/document-pyp/:id",
  logAdminActivity("delete_pyp_pdf", "pyp_pdf"),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
    if (isNaN(id)) return next(new AppError(400, "Invalid ID"));
    const [record] = await db
        .select()
        .from(pypPdfsTable)
        .where(eq(pypPdfsTable.id, id))
        .limit(1);
      if (!record) {
        return next(new AppError(404, "Not found"));
      }

      if (record.cloudinaryPublicId !== "external") {
        await deleteFromCloudinary(record.cloudinaryPublicId);
      }
      await db
        .delete(pypPdfsTable)
        .where(eq(pypPdfsTable.id, id));
      res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
