import { Router } from "express";
import { db, examsTable, examQuestionsTable, questionsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { examCreationLimiter } from "../../middlewares/rateLimitMiddleware";
import { logAdminActivity } from "../../middlewares/adminMiddleware";
import { cacheDel } from "../../lib/cache";
import { routeParamInt } from "../../lib/routeParams";

const router = Router();

const examBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  subject: z.string().min(1),
  durationMins: z.number().int().min(1).default(60),
  totalMarks: z.number().int().min(1).default(100),
  passingMarks: z.number().int().min(0).default(40),
  negativeMarking: z.number().min(0).default(0),
  instructions: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  category: z.string().optional(),
});

router.get("/exams", async (req, res) => {
  try {
    const { page = "1", limit = "20", status } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const where = status ? eq(examsTable.status, status) : undefined;
    const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(examsTable).where(where);
    const exams = await db.select().from(examsTable)
      .where(where).orderBy(desc(examsTable.createdAt)).limit(limitNum).offset(offset);

    res.json({
      data: exams.map((e) => ({ ...e, createdAt: e.createdAt.toISOString(), updatedAt: e.updatedAt.toISOString() })),
      pagination: { page: pageNum, limit: limitNum, total: Number(countRow.count), totalPages: Math.ceil(Number(countRow.count) / limitNum) },
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch exams" });
  }
});

router.get("/exams/:id", async (req, res) => {
  try {
    const id = routeParamInt(req.params.id);
    const [exam] = await db.select().from(examsTable).where(eq(examsTable.id, id));
    if (!exam) { res.status(404).json({ error: "Exam not found" }); return; }

    const examQs = await db.select({
      examQuestion: examQuestionsTable,
      question: questionsTable,
    }).from(examQuestionsTable)
      .leftJoin(questionsTable, eq(examQuestionsTable.questionId, questionsTable.id))
      .where(eq(examQuestionsTable.examId, id));

    res.json({
      ...exam,
      createdAt: exam.createdAt.toISOString(),
      updatedAt: exam.updatedAt.toISOString(),
      questions: examQs.map((r) => ({ ...r.examQuestion, question: r.question })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch exam" });
  }
});

router.post("/exams", examCreationLimiter, logAdminActivity("create_exam", "exam"), async (req, res) => {
  try {
    const parsed = examBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues }); return;
    }
    const { getAuth } = await import("@clerk/express");
    const auth = getAuth(req);
    const [exam] = await db.insert(examsTable).values({ ...parsed.data, createdBy: auth.userId ?? null }).returning();
    cacheDel("admin:dashboard:stats");
    res.status(201).json({ ...exam, createdAt: exam.createdAt.toISOString(), updatedAt: exam.updatedAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create exam" });
  }
});

router.patch("/exams/:id", logAdminActivity("update_exam", "exam"), async (req, res) => {
  try {
    const id = routeParamInt(req.params.id);
    const parsed = examBodySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues }); return;
    }
    const [exam] = await db.update(examsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(examsTable.id, id)).returning();
    if (!exam) { res.status(404).json({ error: "Exam not found" }); return; }
    res.json({ ...exam, createdAt: exam.createdAt.toISOString(), updatedAt: exam.updatedAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update exam" });
  }
});

router.delete("/exams/:id", logAdminActivity("delete_exam", "exam"), async (req, res) => {
  try {
    const id = routeParamInt(req.params.id);
    await db.delete(examQuestionsTable).where(eq(examQuestionsTable.examId, id));
    await db.delete(examsTable).where(eq(examsTable.id, id));
    cacheDel("admin:dashboard:stats");
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete exam" });
  }
});

router.post("/exams/:id/questions", async (req, res) => {
  try {
    const examId = routeParamInt(req.params.id);
    const { questionIds } = req.body as { questionIds: number[] };
    const values = questionIds.map((qid, i) => ({ examId, questionId: qid, orderNum: i, marks: 1, negativeMarks: 0 }));
    await db.insert(examQuestionsTable).values(values).onConflictDoNothing();
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to add questions to exam" });
  }
});

export default router;
