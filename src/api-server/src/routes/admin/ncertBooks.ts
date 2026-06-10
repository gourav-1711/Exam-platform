import { Router } from "express";
import { db } from "../../lib/db";
import { ncertBooksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { formatZodIssues } from "../../utils/validation";
import { cacheFlushPattern } from "../../lib/cache";
import { AppError } from "../../middleware/errorHandler";

const ncertBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  classNum: z.coerce.number().int().min(1, "Class number is required"),
  subject: z.string().min(1, "Subject is required"),
  medium: z.string().default("English"),
  readUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
});

const router = Router();

router.get("/ncert-books", async (req, res, next) => {
  try {
    const books = await db.select().from(ncertBooksTable);
    res.json(books);
  } catch (err) {
    return next(err);
  }
});

router.get("/ncert-books/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const [book] = await db
      .select()
      .from(ncertBooksTable)
      .where(eq(ncertBooksTable.id, id));
    if (!book) return next(new AppError(404, "NCERT book not found"));
    return res.json(book);
  } catch (err) {
    return next(err);
  }
});

router.post(
  "/ncert-books",
  logAdminActivity("create_ncert_book", "ncert_book"),
  async (req, res, next) => {
    try {
      const parsed = ncertBookSchema.safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed — ${formatZodIssues(parsed.error.issues)}`));
      }

      const [book] = await db
        .insert(ncertBooksTable)
        .values(parsed.data)
        .returning();

      cacheFlushPattern("ncert-books:");
      cacheFlushPattern("ncert-mcq:");
      return res.status(201).json(book);
    } catch (err) {
      return next(err);
    }
  },
);

router.patch(
  "/ncert-books/:id",
  logAdminActivity("update_ncert_book", "ncert_book"),
  async (req, res, next) => {
    try {
      const id = String(req.params.id);
      const parsed = ncertBookSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed — ${formatZodIssues(parsed.error.issues)}`));
      }
      const [updated] = await db
        .update(ncertBooksTable)
        .set(parsed.data)
        .where(eq(ncertBooksTable.id, id))
        .returning();

      if (!updated)
        return next(new AppError(404, "NCERT book not found"));

      cacheFlushPattern("ncert-books:");
      cacheFlushPattern("ncert-mcq:");
      return res.json(updated);
    } catch (err) {
      return next(err);
    }
  },
);

router.delete(
  "/ncert-books/:id",
  logAdminActivity("delete_ncert_book", "ncert_book"),
  async (req, res, next) => {
    try {
      const id = String(req.params.id);
      await db.delete(ncertBooksTable).where(eq(ncertBooksTable.id, id));
      cacheFlushPattern("ncert-books:");
      cacheFlushPattern("ncert-mcq:");
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
