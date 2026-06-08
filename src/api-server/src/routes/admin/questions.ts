import { Router } from "express";
import { db } from "../../db";
import { questionsTable } from "@workspace/db";
import { eq, like, and, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { questionCreationLimiter } from "../../middleware/rateLimitMiddleware";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { cacheDel, cacheFlushPattern } from "../../lib/cache";
import { routeParamInt } from "../../lib/routeParams";
import { formatZodIssues } from "../../utils/validation";
import { AppError } from "../../middleware/errorHandler";

const router = Router();

const questionBodySchema = z.object({
  text: z.string().min(1),
  type: z.enum(["quiz", "pyq", "ncert", "mock"]).default("quiz"),
  questionType: z
    .enum(["single", "multiple", "truefalse", "fillblank", "subjective"])
    .default("single"),
  optionA: z.string().default(""),
  optionB: z.string().default(""),
  optionC: z.string().default(""),
  optionD: z.string().default(""),
  correctIndex: z.coerce.number().int().min(0).max(3).default(0),
  explanation: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).nullable().optional(),
  chapter: z.string().nullable().optional(),
  tags: z.string().nullable().optional(),
  marks: z.coerce.number().optional().default(1),
  negativeMarking: z.coerce.number().optional().default(0),
  quizId: z.coerce.number().nullable().optional(),
  pyqSubjectId: z.coerce.number().nullable().optional(),
  classNum: z.coerce.number().nullable().optional(),
  examLabel: z.string().nullable().optional(),
  medium: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).default("published"),
});

router.get("/questions", async (req, res, next) => {
  try {
    const {
      page = "1",
      limit = "20",
      search,
      subject,
      difficulty,
      type,
    } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (search) conditions.push(like(questionsTable.text, `%${search}%`));
    if (subject) conditions.push(eq(questionsTable.subject, subject));
    if (type) conditions.push(eq(questionsTable.type, type));
    if (difficulty) conditions.push(eq(questionsTable.difficulty, difficulty));

    const where = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questionsTable)
      .where(where);
    const questions = await db
      .select()
      .from(questionsTable)
      .where(where)
      .orderBy(desc(questionsTable.id))
      .limit(limitNum)
      .offset(offset);

    res.json({
      data: questions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(countRow.count),
        totalPages: Math.ceil(Number(countRow.count) / limitNum),
      },
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/questions/:id", async (req, res, next) => {
  try {
    const id = routeParamInt(req.params.id);
    const [question] = await db
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.id, id));
    if (!question) {
      return next(new AppError(404, "Question not found"));
    }
    res.json(question);
  } catch (err) {
    return next(err);
  }
});

router.post(
  "/questions",
  questionCreationLimiter,
  logAdminActivity("create_question", "question"),
  async (req, res, next) => {
    try {
      const parsed = questionBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed: ${parsed.error.issues.map(i => i.message).join("; ")}`));
      }
      const {
        questionType: _qt,
        difficulty: _d,
        chapter: _ch,
        tags: _t,
        marks: _m,
        negativeMarking: _nm,
        imageUrl: _iu,
        status: _s,
        ...rest
      } = parsed.data;
      const [created] = await db
        .insert(questionsTable)
        .values(rest)
        .returning();
      cacheDel("admin:dashboard:stats");
      cacheFlushPattern("ncert-mcq:");
      res.status(201).json(created);
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  "/questions/bulk-upload",
  logAdminActivity("bulk_upload_questions", "question"),
  async (req, res, next): Promise<any> => {
    try {
      const { questions } = req.body;
      if (!Array.isArray(questions) || questions.length === 0) {
        return next(new AppError(400, "questions array is required and cannot be empty"));
      }

      const parsedList = [];
      for (const q of questions) {
        const parsed = questionBodySchema.safeParse(q);
        if (parsed.success) {
          const {
            questionType: _qt,
            difficulty: _d,
            chapter: _ch,
            tags: _t,
            marks: _m,
            negativeMarking: _nm,
            imageUrl: _iu,
            status: _s,
            ...rest
          } = parsed.data;
          parsedList.push(rest);
        }
      }

      if (parsedList.length === 0) {
        return next(new AppError(400, "No valid questions were supplied"));
      }

      const inserted = await db.insert(questionsTable).values(parsedList).returning();
      cacheDel("admin:dashboard:stats");
      cacheFlushPattern("ncert-mcq:");
      return res.status(201).json({ success: true, count: inserted.length });
    } catch (err: any) {
      return next(err);
    }
  },
);

router.patch(
  "/questions/:id",
  logAdminActivity("update_question", "question"),
  async (req, res, next) => {
    try {
      const id = routeParamInt(req.params.id);
      const parsed = questionBodySchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed: ${parsed.error.issues.map(i => i.message).join("; ")}`));
      }
      const {
        questionType: _qt,
        difficulty: _d,
        chapter: _ch,
        tags: _t,
        marks: _m,
        negativeMarking: _nm,
        imageUrl: _iu,
        status: _s,
        ...rest
      } = parsed.data;
      const [updated] = await db
        .update(questionsTable)
        .set(rest)
        .where(eq(questionsTable.id, id))
        .returning();
      if (!updated) {
        return next(new AppError(404, "Question not found"));
      }
      cacheFlushPattern("ncert-mcq:");
      res.json(updated);
    } catch (err) {
      return next(err);
    }
  },
);

router.delete(
  "/questions/:id",
  logAdminActivity("delete_question", "question"),
  async (req, res, next) => {
    try {
      const id = routeParamInt(req.params.id);
      await db.delete(questionsTable).where(eq(questionsTable.id, id));
      cacheDel("admin:dashboard:stats");
      cacheFlushPattern("ncert-mcq:");
      res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  "/questions/bulk-delete",
  logAdminActivity("bulk_delete_questions", "question"),
  async (req, res, next) => {
    try {
      const { ids } = req.body as { ids: number[] };
      if (!Array.isArray(ids) || ids.length === 0) {
        return next(new AppError(400, "ids must be a non-empty array"));
      }
      await db.delete(questionsTable).where(
        sql`id = ANY(ARRAY[${sql.join(
          ids.map((id) => sql`${id}`),
          sql`, `,
        )}]::int[])`,
      );
      cacheDel("admin:dashboard:stats");
      res.json({ success: true, deletedCount: ids.length });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
