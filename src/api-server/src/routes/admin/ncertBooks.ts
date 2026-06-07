import { Router } from "express";
import { db } from "../../lib/db";
import { ncertBooksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { logAdminActivity } from "../../middleware/adminMiddleware";

const ncertBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  classNum: z.coerce.number().int().min(1, "Class number is required"),
  subject: z.string().min(1, "Subject is required"),
  medium: z.string().default("English"),
  readUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
});

const router = Router();

router.get("/ncert-books", async (req, res) => {
  try {
    const books = await db.select().from(ncertBooksTable);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch NCERT books" });
  }
});

router.get("/ncert-books/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const [book] = await db
      .select()
      .from(ncertBooksTable)
      .where(eq(ncertBooksTable.id, id));
    if (!book) return res.status(404).json({ error: "NCERT book not found" });
    return res.json(book);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch NCERT book" });
  }
});

router.post(
  "/ncert-books",
  logAdminActivity("create_ncert_book", "ncert_book"),
  async (req, res) => {
    try {
      const parsed = ncertBookSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      }

      const [book] = await db
        .insert(ncertBooksTable)
        .values(parsed.data)
        .returning();

      return res.status(201).json(book);
    } catch (err) {
      return res.status(500).json({ error: "Failed to create NCERT book" });
    }
  },
);

router.patch(
  "/ncert-books/:id",
  logAdminActivity("update_ncert_book", "ncert_book"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      const parsed = ncertBookSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      }
      const [updated] = await db
        .update(ncertBooksTable)
        .set(parsed.data)
        .where(eq(ncertBooksTable.id, id))
        .returning();

      if (!updated)
        return res.status(404).json({ error: "NCERT book not found" });

      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: "Failed to update NCERT book" });
    }
  },
);

router.delete(
  "/ncert-books/:id",
  logAdminActivity("delete_ncert_book", "ncert_book"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      await db.delete(ncertBooksTable).where(eq(ncertBooksTable.id, id));
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete NCERT book" });
    }
  },
);

export default router;
