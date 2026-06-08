import { Router } from "express";
import { db } from "../../lib/db";
import { ncertPdfsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { uploadDoc } from "../../middleware/upload";
import { uploadToCloudinary, deleteFromCloudinary } from "../../config/cloudinary";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { cacheFlushPattern } from "../../lib/cache";
import { z } from "zod";
import { formatZodIssues } from "../../utils/validation";
import { AppError } from "../../middleware/errorHandler";

const router = Router();

const ncertPdfSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  classNumber: z.coerce.number().int().min(1, "Class number is required"),
  externalUrl: z.string().optional(),
});

// GET /api/admin/document-ncert — list all NCERT PDFs
router.get("/document-ncert", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const offset = (page - 1) * limit;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ncertPdfsTable);

    const data = await db
      .select()
      .from(ncertPdfsTable)
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

// GET /api/admin/document-ncert/:id — get single NCERT PDF
router.get("/document-ncert/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const [record] = await db
      .select()
      .from(ncertPdfsTable)
      .where(eq(ncertPdfsTable.id, id));

    if (!record) return next(new AppError(404, "NCERT PDF not found"));
    return res.json(record);
  } catch (err) {
    return next(err);
  }
});

// POST /api/admin/document-ncert/upload — upload a new NCERT PDF
router.post(
  "/document-ncert/upload",
  logAdminActivity("upload_ncert_pdf", "ncert_pdf"),
  uploadDoc.single("file"),
  async (req, res, next) => {
    try {
      const title = String(req.body.title ?? "");
      const subject = String(req.body.subject ?? "");
      const classNumber = String(req.body.classNumber ?? "");
      const externalUrl = String(req.body.externalUrl ?? "");
      if (!title || !subject || !classNumber) {
        return next(new AppError(400, "title, subject, classNumber are required"));
      }

      let secureUrl = "";
      let publicId = "external";
      let size = 0;
      let originalName = "External Link";

      if (req.file) {
        const file = req.file as Express.Multer.File;
        const upload = await uploadToCloudinary(
          file.buffer,
          "exam-platform/ncert",
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
        .insert(ncertPdfsTable)
        .values({
          title,
          subject,
          classNumber: Number(classNumber),
          originalName,
          cloudinaryUrl: secureUrl,
          cloudinaryPublicId: publicId,
          fileSize: size,
        })
        .returning();

      cacheFlushPattern("document-ncert:");
      return res.status(201).json(inserted);
    } catch (err) {
      return next(err);
    }
  },
);

// PATCH /api/admin/document-ncert/:id — update NCERT PDF metadata
router.patch(
  "/document-ncert/:id",
  logAdminActivity("update_ncert_pdf", "ncert_pdf"),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const parsed = ncertPdfSchema.partial().safeParse(req.body as Record<string, unknown>);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed — ${formatZodIssues(parsed.error.issues)}`));
      }

      const [updated] = await db
        .update(ncertPdfsTable)
        .set(parsed.data)
        .where(eq(ncertPdfsTable.id, id))
        .returning();

      if (!updated) return next(new AppError(404, "NCERT PDF not found"));
      cacheFlushPattern("document-ncert:");
      return res.json(updated);
    } catch (err) {
      return next(err);
    }
  },
);

// DELETE /api/admin/document-ncert/:id — delete NCERT PDF
router.delete(
  "/document-ncert/:id",
  logAdminActivity("delete_ncert_pdf", "ncert_pdf"),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
    if (isNaN(id)) return next(new AppError(400, "Invalid ID"));
    const [record] = await db
        .select()
        .from(ncertPdfsTable)
        .where(eq(ncertPdfsTable.id, id))
        .limit(1);
      if (!record) {
        return next(new AppError(404, "Not found"));
      }

      if (record.cloudinaryPublicId !== "external") {
        await deleteFromCloudinary(record.cloudinaryPublicId);
      }
      await db
        .delete(ncertPdfsTable)
        .where(eq(ncertPdfsTable.id, id));

      cacheFlushPattern("document-ncert:");
      res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
