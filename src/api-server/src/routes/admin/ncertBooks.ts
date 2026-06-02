import { Router } from "express";
import { db } from "../../lib/db";
import { ncertBooksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logAdminActivity } from "../../middlewares/adminMiddleware";

const router = Router();

router.get("/ncert-books", async (req, res) => {
  try {
    const books = await db.select().from(ncertBooksTable);
    res.json(books);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch NCERT books" });
  }
});

router.get("/ncert-books/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [book] = await db.select().from(ncertBooksTable).where(eq(ncertBooksTable.id, id));
    if (!book) return res.status(404).json({ error: "NCERT book not found" });
    res.json(book);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch NCERT book" });
  }
});

router.post("/ncert-books", logAdminActivity("create_ncert_book", "ncert_book"), async (req, res) => {
  try {
    const { title, classNum, subject, medium, readUrl, downloadUrl } = req.body;
    if (!title || !subject || !classNum) {
      return res.status(400).json({ error: "title, subject, and classNum are required" });
    }

    const [book] = await db.insert(ncertBooksTable).values({
      title,
      classNum: parseInt(classNum),
      subject,
      medium: medium || "English",
      readUrl: readUrl || null,
      downloadUrl: downloadUrl || null,
    }).returning();

    res.status(201).json(book);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create NCERT book" });
  }
});

router.patch("/ncert-books/:id", logAdminActivity("update_ncert_book", "ncert_book"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(ncertBooksTable)
      .set({
        ...req.body,
      })
      .where(eq(ncertBooksTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "NCERT book not found" });

    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update NCERT book" });
  }
});

router.delete("/ncert-books/:id", logAdminActivity("delete_ncert_book", "ncert_book"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(ncertBooksTable).where(eq(ncertBooksTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete NCERT book" });
  }
});

export default router;