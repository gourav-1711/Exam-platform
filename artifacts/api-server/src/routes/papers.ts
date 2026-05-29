import { Router } from "express";
import { db, previousYearPapersTable, syllabusTable, mockTestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/pyp", async (req, res) => {
  try {
    const { examName } = req.query as Record<string, string>;
    let all = await db.select().from(previousYearPapersTable);
    if (examName) all = all.filter(p => p.examName.toLowerCase().includes(examName.toLowerCase()));
    res.json(all);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

router.get("/syllabus", async (req, res) => {
  try {
    const all = await db.select().from(syllabusTable);
    res.json(all);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch syllabus" });
  }
});

router.get("/mock-tests", async (req, res) => {
  try {
    const all = await db.select().from(mockTestsTable);
    res.json(all);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch mock tests" });
  }
});

router.get("/mock-tests/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [test] = await db.select().from(mockTestsTable).where(eq(mockTestsTable.id, id));
    if (!test) return res.status(404).json({ error: "Not found" });
    res.json(test);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch mock test" });
  }
});

export default router;
