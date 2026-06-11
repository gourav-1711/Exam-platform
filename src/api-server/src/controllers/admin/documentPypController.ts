import type { Request, Response, NextFunction } from "express";
import { db } from "../../lib/db";
import { pypPdfsTable } from "@workspace/db";
import { eq, like, and, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { routeParam } from "../../lib/routeParams";
import { AppError } from "../../middleware/errorHandler";
import { uploadToCloudinary } from "../../config/cloudinary";

const documentPypSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1),
  year: z.coerce.number().int().min(1900).max(2100),
  examType: z.string().min(1),
  originalName: z.string(),
  cloudinaryUrl: z.string().min(1),
  cloudinaryPublicId: z.string(),
  fileSize: z.coerce.number().default(0),
});

export async function listAllDocumentPyp(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = "1", limit = "20", search, year, examType, subject } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (search) conditions.push(like(pypPdfsTable.title, `%${search}%`));
    if (year) conditions.push(eq(pypPdfsTable.year, parseInt(year, 10)));
    if (examType) conditions.push(eq(pypPdfsTable.examType, examType));
    if (subject) conditions.push(eq(pypPdfsTable.subject, subject));

    const where = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(pypPdfsTable)
      .where(where);

    const data = await db
      .select()
      .from(pypPdfsTable)
      .where(where)
      .orderBy(desc(pypPdfsTable.uploadedAt))
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

export async function getDocumentPypById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = routeParam(req.params.id);
    const [doc] = await db
      .select()
      .from(pypPdfsTable)
      .where(eq(pypPdfsTable.id, id));
    if (!doc) {
      return next(new AppError(404, "Document not found"));
    }
    res.json(doc);
  } catch (err) {
    return next(err);
  }
}

export async function createDocumentPyp(req: Request, res: Response, next: NextFunction) {
  try {
    let body = { ...req.body };

    // If a file was uploaded via multer, upload to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "pyp",
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

    const parsed = documentPypSchema.safeParse(body);
    if (!parsed.success) {
      return next(new AppError(400, `Validation error: ${parsed.error.issues.map(i => i.message).join("; ")}`));
    }
    const [doc] = await db
      .insert(pypPdfsTable)
      .values(parsed.data)
      .returning();
    res.status(201).json(doc);
  } catch (err) {
    return next(err);
  }
}

export async function updateDocumentPyp(req: Request, res: Response, next: NextFunction) {
  try {
    const id = routeParam(req.params.id);

    let body = { ...req.body };

    // If a file was uploaded, upload to Cloudinary and update the fields
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "pyp",
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

    const parsed = documentPypSchema.partial().safeParse(body);
    if (!parsed.success) {
      return next(new AppError(400, `Validation error: ${parsed.error.issues.map(i => i.message).join("; ")}`));
    }
    const [updated] = await db
      .update(pypPdfsTable)
      .set(parsed.data)
      .where(eq(pypPdfsTable.id, id))
      .returning();
    if (!updated) {
      return next(new AppError(404, "Document not found"));
    }
    res.json(updated);
  } catch (err) {
    return next(err);
  }
}

export async function deleteDocumentPyp(req: Request, res: Response, next: NextFunction) {
  try {
    const id = routeParam(req.params.id);
    await db.delete(pypPdfsTable).where(eq(pypPdfsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    return next(err);
  }
}
