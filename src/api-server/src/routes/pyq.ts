import { Router } from "express";
import { db, pyqSubjectsTable, questionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function mapQuestion(q: { id: number; text: string; optionA: string; optionB: string; optionC: string; optionD: string; correctIndex: number; explanation: string | null; examLabel: string | null }) {
  return {
    id: q.id,
    text: q.text,
    options: [q.optionA, q.optionB, q.optionC, q.optionD],
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    examLabel: q.examLabel,
  };
}

router.get("/pyq/subjects", async (req, res) => {
  try {
    const subjects = await db.select().from(pyqSubjectsTable);
    res.json(subjects);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

router.get("/pyq/questions", async (req, res) => {
  try {
    const { subjectId, page: pageStr } = req.query as Record<string, string>;
    const page = parseInt(pageStr) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    let all = await db.select().from(questionsTable).where(eq(questionsTable.type, "pyq"));
    if (subjectId) {
      const sid = parseInt(subjectId);
      all = all.filter(q => q.pyqSubjectId === sid);
    }

    const total = all.length;
    const data = all.slice(offset, offset + limit).map(mapQuestion);
    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch PYQ questions" });
  }
});

export default router;
