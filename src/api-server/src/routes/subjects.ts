import { Router } from "express";
import { db } from "../lib/db";
import { subjects } from "@workspace/db";

const router = Router();

// GET /api/subjects — Public list of all active subjects
router.get("/subjects", async (req, res, next) => {
  try {
    const data = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        slug: subjects.slug,
        examCategory: subjects.examCategory,
        description: subjects.description,
        isActive: subjects.isActive,
        createdAt: subjects.createdAt,
        updatedAt: subjects.updatedAt,
      })
      .from(subjects)
      .orderBy(subjects.name);

    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

export default router;
