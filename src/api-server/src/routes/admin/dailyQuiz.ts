// src/api-server/src/routes/admin/dailyQuiz.ts
import express from "express";
import authenticate from "../../middleware/auth.middleware";
import { logAdminActivity } from "../../middlewares/adminMiddleware";
import { db } from "../../lib/db";
import { dailyQuizzes } from "../../../lib/db/src/schema/dailyQuiz";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

const router = express.Router();

// GET /api/admin/daily-quiz
router.get("/", authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(dailyQuizzes);
    const total = Number(countRow?.count ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const quizzes = await db
      .select()
      .from(dailyQuizzes)
      .orderBy(desc(dailyQuizzes.scheduledDate))
      .limit(limit)
      .offset(offset);

    res.json({
      quizzes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/daily-quiz/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const quiz = await db
      .select()
      .from(dailyQuizzes)
      .where(eq(dailyQuizzes.id, parseInt(req.params.id)));

    if (!quiz.length) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/daily-quiz
router.post(
  "/",
  authenticate,
  logAdminActivity("create_daily_quiz", "daily_quiz"),
  async (req, res) => {
    try {
      const schema = z.object({
        title: z.string(),
        description: z.string().optional(),
        scheduledDate: z.string(),
        scheduledTime: z.string(),
        durationMinutes: z.number().default(30),
        totalQuestions: z.number(),
        questionIds: z.array(z.number()),
        isPublished: z.boolean().default(false),
      });

      const parseResult = schema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid payload",
          errors: parseResult.error.format(),
        });
      }

      const data = parseResult.data;
      const result = await db
        .insert(dailyQuizzes)
        .values({
          ...data,
          createdBy: (req as any).user.userId,
        })
        .returning();

      res.status(201).json(result[0]);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// PATCH /api/admin/daily-quiz/:id
router.patch(
  "/:id",
  authenticate,
  logAdminActivity("update_daily_quiz", "daily_quiz"),
  async (req, res) => {
    try {
      const schema = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        scheduledDate: z.string().optional(),
        scheduledTime: z.string().optional(),
        durationMinutes: z.number().optional(),
        totalQuestions: z.number().optional(),
        questionIds: z.array(z.number()).optional(),
        isPublished: z.boolean().optional(),
      });

      const parseResult = schema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid payload",
          errors: parseResult.error.format(),
        });
      }

      const data = parseResult.data;
      const result = await db
        .update(dailyQuizzes)
        .set(data)
        .where(eq(dailyQuizzes.id, parseInt(req.params.id)))
        .returning();

      res.json(result[0]);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// DELETE /api/admin/daily-quiz/:id
router.delete("/:id", authenticate, async (req, res) => {
  try {
    await db
      .delete(dailyQuizzes)
      .where(eq(dailyQuizzes.id, parseInt(req.params.id)));

    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
