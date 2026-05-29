import { Router } from "express";
import { db, studyNotesTable } from "@workspace/db";
import { ilike, and, eq } from "drizzle-orm";

const router = Router();

router.get("/study-notes", async (req, res) => {
  try {
    const { subject, medium, search, page: pageStr } = req.query as Record<string, string>;
    const page = parseInt(pageStr) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const all = await db.select().from(studyNotesTable);
    let filtered = all;
    if (subject) filtered = filtered.filter(n => n.subject.toLowerCase() === subject.toLowerCase());
    if (medium) filtered = filtered.filter(n => n.medium.toLowerCase() === medium.toLowerCase());
    if (search) filtered = filtered.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));

    const total = filtered.length;
    const data = filtered.slice(offset, offset + limit);

    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch study notes" });
  }
});

export default router;
