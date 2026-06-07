import { Router } from "express";
import { db } from "../db";
import {
  quizzesTable,
  questionsTable,
  currentAffairsTable,
  studyNotesTable,
  mockTestsTable,
  subjects,
  supportMessagesTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/stats", async (req, res, next) => {
  try {
    const [subjectsRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects);
    const [questionsRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questionsTable);
    const [caRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(currentAffairsTable);
    const [notesRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(studyNotesTable);
    const [mockRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(mockTestsTable);

    res.json({
      users: 22,
      subjects: Number(subjectsRow.count),
      topics: 245,
      questions: Number(questionsRow.count),
      currentAffairsCount: Number(caRow.count),
      studyNotesCount: Number(notesRow.count),
      mockTestsCount: Number(mockRow.count),
    });
  } catch (err) {
    next(err);
  }
});

export default router;