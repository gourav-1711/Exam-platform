import { Router } from "express";
import { db, questionsTable } from "@workspace/db";
import { eq, like, and, sql, desc, asc } from "drizzle-orm";
import { z } from "zod";
import { questionCreationLimiter } from "../../middlewares/rateLimitMiddleware";
import { logAdminActivity } from "../../middlewares/adminMiddleware";
import { cacheDel } from "../../lib/cache";

const router = Router();

const questionBodySchema = z.object({
  text: z.string().min(1),
  type: z.enum(["quiz", "pyq", "ncert", "mock"]).default("quiz"),
  questionType: z.enum(["single", "multiple", "truefalse", "fillblank", "subjective"]).default("single"),
  optionA: z.string().default(""),
  optionB: z.string().default(""),
  optionC: z.string().default(""),
  optionD: z.string().default(""),
  correctIndex: z.number().int().min(0).max(3).default(0),
  explanation: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).nullable().optional(),
  chapter: z.string().nullable().optional(),
  tags: z.string().nullable().optional(),
  marks: z.number().optional().default(1),
  negativeMarking: z.number().optional().default(0),
  quizId: z.number().nullable().optional(),
  pyqSubjectId: z.number().nullable().optional(),
  classNum: z.number().nullable().optional(),
  examLabel: z.string().nullable().optional(),
  medium: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).default("published"),
});

router.get("/questions", async (req, res) => {
  try {
    const { page = "1", limit = "20", search, subject, difficulty, type } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (search) conditions.push(like(questionsTable.text, `%${search}%`));
    if (subject) conditions.push(eq(questionsTable.subject, subject));
    if (type) conditions.push(eq(questionsTable.type, type));

    const where = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(questionsTable).where(where);
    const questions = await db.select().from(questionsTable)
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
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

router.get("/questions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [question] = await db.select().from(questionsTable).where(eq(questionsTable.id, id));
    if (!question) { res.status(404).json({ error: "Question not found" }); return; }
    res.json(question);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch question" });
  }
});

router.post("/questions", questionCreationLimiter, logAdminActivity("create_question", "question"), async (req, res) => {
  try {
    const parsed = questionBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }
    const { questionType, difficulty, chapter, tags, marks, negativeMarking, imageUrl, status, ...rest } = parsed.data;
    const [created] = await db.insert(questionsTable).values(rest).returning();
    cacheDel("admin:dashboard:stats");
    res.status(201).json(created);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create question" });
  }
});

router.patch("/questions/:id", logAdminActivity("update_question", "question"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = questionBodySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }
    const { questionType, difficulty, chapter, tags, marks, negativeMarking, imageUrl, status, ...rest } = parsed.data;
    const [updated] = await db.update(questionsTable).set(rest).where(eq(questionsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Question not found" }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update question" });
  }
});

router.delete("/questions/:id", logAdminActivity("delete_question", "question"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(questionsTable).where(eq(questionsTable.id, id));
    cacheDel("admin:dashboard:stats");
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete question" });
  }
});

router.post("/questions/bulk-delete", logAdminActivity("bulk_delete_questions", "question"), async (req, res) => {
  try {
    const { ids } = req.body as { ids: number[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: "ids must be a non-empty array" }); return;
    }
    await db.delete(questionsTable).where(sql`id = ANY(ARRAY[${sql.join(ids.map(id => sql`${id}`), sql`, `)}]::int[])`);
    cacheDel("admin:dashboard:stats");
    res.json({ success: true, deletedCount: ids.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to bulk delete questions" });
  }
});

export default router;
