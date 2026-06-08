import { Router } from "express";
import { db } from "../../lib/db";
import { quizzesTable } from "@workspace/db";
import { eq, desc, like, and, sql } from "drizzle-orm";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { routeParamInt } from "../../lib/routeParams";
import { cacheFlushPattern } from "../../lib/cache";
import { AppError } from "../../middleware/errorHandler";

const router = Router();

// GET /api/admin/quizzes — list with pagination and search
router.get("/quizzes", async (req, res, next): Promise<any> => {
  try {
    const { page = "1", limit = "20", search, status } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (search) conditions.push(like(quizzesTable.title, `%${search}%`));
    if (status) conditions.push(eq(quizzesTable.status, status));

    const where = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizzesTable)
      .where(where);

    const quizzes = await db
      .select()
      .from(quizzesTable)
      .where(where)
      .orderBy(desc(quizzesTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    return res.json({
      data: quizzes.map((q) => ({
        ...q,
        createdAt: q.createdAt.toISOString(),
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(countRow?.count ?? 0),
        totalPages: Math.ceil(Number(countRow?.count ?? 0) / limitNum),
      },
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/quizzes/:id", async (req, res, next): Promise<any> => {
  try {
    const id = routeParamInt(req.params.id);
    const [quiz] = await db
      .select()
      .from(quizzesTable)
      .where(eq(quizzesTable.id, id));
    if (!quiz) return next(new AppError(404, "Quiz not found"));
    return res.json({
      ...quiz,
      createdAt: quiz.createdAt.toISOString(),
    });
  } catch (err) {
    return next(err);
  }
});

router.post(
  "/quizzes",
  logAdminActivity("create_quiz", "quiz"),
  async (req, res, next): Promise<any> => {
    try {
      const {
        title,
        subject,
        durationMins,
        questionCount,
        negativeMarking,
        status,
        instructions,
      } = req.body;
      if (!title || !subject) {
        return next(new AppError(400, "title and subject are required"));
      }

      const [quiz] = await db
        .insert(quizzesTable)
        .values({
          title,
          subject,
          durationMins:
            durationMins !== undefined ? parseInt(durationMins) : 10,
          questionCount:
            questionCount !== undefined ? parseInt(questionCount) : 0,
          negativeMarking:
            negativeMarking !== undefined ? parseFloat(negativeMarking) : 0.25,
          status: status || "draft",
          instructions: instructions || "",
        })
        .returning();

      cacheFlushPattern("quizzes:");
      return res.status(201).json({
        ...quiz,
        createdAt: quiz.createdAt.toISOString(),
      });
    } catch (err) {
      return next(err);
    }
  },
);

router.patch(
  "/quizzes/:id",
  logAdminActivity("update_quiz", "quiz"),
  async (req, res, next): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      const [updated] = await db
        .update(quizzesTable)
        .set({
          ...req.body,
        })
        .where(eq(quizzesTable.id, id))
        .returning();

      if (!updated) return next(new AppError(404, "Quiz not found"));

      cacheFlushPattern("quizzes:");
      return res.json({
        ...updated,
        createdAt: updated.createdAt.toISOString(),
      });
    } catch (err) {
      return next(err);
    }
  },
);

router.delete(
  "/quizzes/:id",
  logAdminActivity("delete_quiz", "quiz"),
  async (req, res, next): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      await db.delete(quizzesTable).where(eq(quizzesTable.id, id));
      cacheFlushPattern("quizzes:");
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
