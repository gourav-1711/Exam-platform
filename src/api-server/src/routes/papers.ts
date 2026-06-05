import { Router } from "express";
import { db } from "../db";
import {
  previousYearPapersTable,
  syllabusTable,
  mockTestsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

import { AppError } from "../middleware/errorHandler";

router.get("/pyp", async (req, res, next) => {
  try {
    const { examName } = req.query as Record<string, string>;
    let all = await db.select().from(previousYearPapersTable);
    if (examName)
      all = all.filter((p) =>
        p.examName.toLowerCase().includes(examName.toLowerCase()),
      );

    return res.json(all);
  } catch (err) {
    return next(err);
  }
});

router.get("/syllabus", async (req, res, next) => {
  try {
    const all = await db.select().from(syllabusTable);
    return res.json(all);
  } catch (err) {
    return next(err);
  }
});

router.get("/mock-tests", async (req, res, next) => {
  try {
    const all = await db.select().from(mockTestsTable);
    return res.json(all);
  } catch (err) {
    return next(err);
  }
});

router.get("/mock-tests/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const [test] = await db
      .select()
      .from(mockTestsTable)
      .where(eq(mockTestsTable.id, id));

    if (!test) {
      return next(new AppError(404, "Not found"));
    }

    return res.json(test);
  } catch (err) {
    return next(err);
  }
});

export default router;
