import { Router } from "express";
import { db } from "../db";
import { ncertBooksTable, questionsTable } from "@workspace/db";

import { eq } from "drizzle-orm";

const router = Router();

function mapQuestion(q: {
  id: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctIndex: number;
  explanation: string | null;
  examLabel: string | null;
}) {
  return {
    id: q.id,
    text: q.text,
    options: [q.optionA, q.optionB, q.optionC, q.optionD],
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    examLabel: q.examLabel,
  };
}

router.get("/ncert-mcq/questions", async (req, res) => {
  try {
    const {
      classNum,
      subject,
      medium,
      page: pageStr,
    } = req.query as Record<string, string>;
    const page = parseInt(pageStr) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    let all = await db
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.type, "ncert"));
    if (classNum) all = all.filter((q) => q.classNum === parseInt(classNum));
    if (subject)
      all = all.filter(
        (q) => q.subject?.toLowerCase() === subject.toLowerCase(),
      );
    if (medium)
      all = all.filter((q) => q.medium?.toLowerCase() === medium.toLowerCase());

    const total = all.length;
    const data = all.slice(offset, offset + limit).map(mapQuestion);
    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch NCERT MCQs" });
  }
});

router.get("/ncert-books", async (req, res) => {
  try {
    const { classNum, subject, medium } = req.query as Record<string, string>;
    let all = await db.select().from(ncertBooksTable);
    if (classNum) all = all.filter((b) => b.classNum === parseInt(classNum));
    if (subject)
      all = all.filter(
        (b) => b.subject.toLowerCase() === subject.toLowerCase(),
      );
    if (medium)
      all = all.filter((b) => b.medium.toLowerCase() === medium.toLowerCase());
    res.json(all);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch NCERT books" });
  }
});

export default router;
