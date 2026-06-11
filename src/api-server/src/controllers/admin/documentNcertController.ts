import type { Request, Response, NextFunction } from "express";
import { db } from "../../lib/db";
import { ncertPdfsTable } from "@workspace/db";
import { eq, like, and, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { routeParam } from "../../lib/routeParams";
import { AppError } from "../../middleware/errorHandler";
import { uploadToCloudinary } from "../../config/cloudinary";

const documentNcertSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1),
  classNumber: z.coerce.number().int().min(1).max(12),
  originalName: z.string(),
  cloudinaryUrl: z.string().min(1),
  cloudinaryPublicId: z.string(),
  fileSize: z.coerce.number().default(0),
});

export async function listAllDocumentNcert(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = "1", limit = "20", search, classNumber, subject } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (search) conditions.push(like(ncertPdfsTable.title, `%${search}%`));
    if (classNumber) conditions.push(eq(ncertPdfsTable.classNumber, parseInt(classNumber, 10)));
    if (subject) conditions.push(eq(ncertPdfsTable.subject, subject));

    const where = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ncertPdfsTable)
      .where(where);

    const data = await db
      .select()
      .from(ncertPdfsTable)
      .where(where)
      .orderBy(desc(ncertPdfsTable.uploadedAt))
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
    return next(err);
  }
}

export async function getDocumentNcertById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = routeParam(req.params.id);
    const [doc] = await db
      .select()
      .from(ncertPdfsTable)
      .where(eq(ncertPdfsTable.id, id));
    if (!doc) {
      return next(new AppError(404, "Document not found"));
    }
    res.json(doc);
  } catch (err) {
    return next(err);
  }
}

export async function createDocumentNcert(req: Request, res: Response, next: NextFunction) {
  try {
    let body = { ...req.body };

    // If a file was uploaded via multer, upload to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "ncert",
        req.file.originalname,
      );
      body = {
        ...body,
        originalName: req.file.originalname,
        cloudinaryUrl: result.secureUrl,
        cloudinaryPublicId: result.publicId,
        fileSize: req.file.size,
      };
    }

    const parsed = documentNcertSchema.safeParse(body);
    if (!parsed.success) {
      return next(new AppError(400, `Validation error: ${parsed.error.issues.map(i => i.message).join("; ")}`));
    }
    const [doc] = await db
      .insert(ncertPdfsTable)
      .values(parsed.data)
      .returning();
    res.status(201).json(doc);
  } catch (err) {
    return next(err);
  }
}

export async function updateDocumentNcert(req: Request, res: Response, next: NextFunction) {
  try {
    const id = routeParam(req.params.id);

    let body = { ...req.body };

    // If a file was uploaded, upload to Cloudinary and update the fields
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "ncert",
        req.file.originalname,
      );
      body = {
        ...body,
        originalName: req.file.originalname,
        cloudinaryUrl: result.secureUrl,
        cloudinaryPublicId: result.publicId,
        fileSize: req.file.size,
      };
    }

    const parsed = documentNcertSchema.partial().safeParse(body);
    if (!parsed.success) {
      return next(new AppError(400, `Validation error: ${parsed.error.issues.map(i => i.message).join("; ")}`));
    }
    const [updated] = await db
      .update(ncertPdfsTable)
      .set(parsed.data)
      .where(eq(ncertPdfsTable.id, id))
      .returning();
    if (!updated) {
      return next(new AppError(404, "Document not found"));
    }
    res.json(updated);
  } catch (err) {
    return next(err);
  }
}

export async function deleteDocumentNcert(req: Request, res: Response, next: NextFunction) {
  try {
    const id = routeParam(req.params.id);
    await db.delete(ncertPdfsTable).where(eq(ncertPdfsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    return next(err);
  }
}
