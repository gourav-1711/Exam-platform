import { Router } from "express";
import { db } from "../lib/db";
import { pypPdfsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { routeParam } from "../lib/routeParams";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// GET /api/document-pyp — list all (optionally filter ?year=&examType=&subject=)
router.get("/", async (req, res, next) => {
  try {
    const yearRaw = req.query.year;
    const examTypeRaw = req.query.examType;
    const subjectRaw = req.query.subject;

    const year = typeof yearRaw === "string" ? routeParam(yearRaw) : undefined;
    const examType =
      typeof examTypeRaw === "string" ? routeParam(examTypeRaw) : undefined;
    const subject =
      typeof subjectRaw === "string" ? routeParam(subjectRaw) : undefined;

    const allResults = await db.select().from(pypPdfsTable);

    let filtered = allResults;
    if (year) {
      filtered = filtered.filter((p) => p.year === Number(year));
    }
    if (examType) {
      filtered = filtered.filter((p) => p.examType === examType);
    }
    if (subject) {
      filtered = filtered.filter((p) => p.subject === subject);
    }

    res.json(filtered);
  } catch (err) {
    return next(err);
  }
});

export default router;
