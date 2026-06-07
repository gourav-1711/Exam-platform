import { Router } from "express";
import { studyNotesTable } from "@workspace/db";
import { db } from "../db";
import { ilike, and, eq, sql } from "drizzle-orm";

const router = Router();

router.get("/study-notes", async (req, res) => {
  try {
    const {
      subject,
      medium,
      search,
      page: pageStr,
    } = req.query as Record<string, string>;
    const page = parseInt(pageStr) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (subject) conditions.push(eq(studyNotesTable.subject, subject));
    if (medium) conditions.push(eq(studyNotesTable.medium, medium));
    if (search) conditions.push(ilike(studyNotesTable.title, `%${search}%`));
    const where = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(studyNotesTable)
      .where(where);

    const data = await db
      .select()
      .from(studyNotesTable)
      .where(where)
      .limit(limit)
      .offset(offset);

    const total = Number(countRow?.count ?? 0);

    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (_) {
    res.status(500).json({ error: "Failed to fetch study notes" });
  }
});

export default router;
