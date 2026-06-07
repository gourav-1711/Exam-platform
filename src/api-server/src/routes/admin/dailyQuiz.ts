// src/api-server/src/routes/admin/dailyQuiz.ts
import express from "express";
import { getAuth } from "@clerk/express";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { db } from "../../lib/db";
import { dailyQuizzes } from "@workspace/db";
import { routeParamInt } from "../../lib/routeParams";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { logger } from "../../lib/logger";

const router = express.Router();

const dailyQuizPayloadSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  scheduledDate: z.string().min(1),
  scheduledTime: z.string().min(1),
  durationMinutes: z.coerce.number().int().min(1).default(30),
  totalQuestions: z.coerce.number().int().min(0).default(0),
  questionIds: z.array(z.coerce.number().int()).default([]),
  isPublished: z.boolean().default(false),
});

// GET /api/admin/daily-quizzes
router.get("/daily-quizzes", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
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

    return res.json({
      quizzes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    logger.error({ error }, "Error fetching daily quizzes list");
    return res.status(500).json({ message: "Server error", details: error?.message });
  }
});

// GET /api/admin/daily-quizzes/:id
router.get("/daily-quizzes/:id", async (req, res) => {
  try {
    const id = routeParamInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const quiz = await db
      .select()
      .from(dailyQuizzes)
      .where(eq(dailyQuizzes.id, id));

    if (!quiz.length) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    return res.json(quiz[0]);
  } catch (error: any) {
    logger.error({ error }, "Error fetching daily quiz details");
    return res.status(500).json({ message: "Server error", details: error?.message });
  }
});

// POST /api/admin/daily-quizzes
router.post(
  "/daily-quizzes",
  logAdminActivity("create_daily_quiz", "daily_quiz"),
  async (req, res) => {
    try {
      const auth = getAuth(req);
      const parseResult = dailyQuizPayloadSchema.safeParse(req.body);
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
          title: data.title,
          description: data.description || null,
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          durationMinutes: data.durationMinutes,
          totalQuestions: data.totalQuestions,
          questionIds: data.questionIds,
          isPublished: data.isPublished,
          createdBy: auth.userId || "system",
        })
        .returning();

      return res.status(201).json(result[0]);
    } catch (error: any) {
      logger.error({ error }, "Error creating daily quiz");
      return res.status(500).json({ message: "Server error", details: error?.message });
    }
  },
);

// PATCH /api/admin/daily-quizzes/:id
router.patch(
  "/daily-quizzes/:id",
  logAdminActivity("update_daily_quiz", "daily_quiz"),
  async (req, res) => {
    try {
    const id = routeParamInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const parseResult = dailyQuizPayloadSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid payload",
          errors: parseResult.error.format(),
        });
      }

      const data = parseResult.data;
      const result = await db
        .update(dailyQuizzes)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(dailyQuizzes.id, id))
        .returning();

      if (!result.length) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      return res.json(result[0]);
    } catch (error: any) {
      logger.error({ error }, "Error patching daily quiz");
      return res.status(500).json({ message: "Server error", details: error?.message });
    }
  },
);

// DELETE /api/admin/daily-quizzes/:id
router.delete("/daily-quizzes/:id", async (req, res) => {
  try {
    const id = routeParamInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    await db.delete(dailyQuizzes).where(eq(dailyQuizzes.id, id));

    return res.json({ message: "Quiz deleted successfully" });
  } catch (error: any) {
    logger.error({ error }, "Error deleting daily quiz");
    return res.status(500).json({ message: "Server error", details: error?.message });
  }
});

export default router;