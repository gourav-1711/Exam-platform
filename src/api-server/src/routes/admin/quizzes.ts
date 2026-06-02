import { Router } from "express";
import { db } from "../../lib/db";
import { quizzesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { logAdminActivity } from "../../middlewares/adminMiddleware";
import { routeParamInt } from "../../lib/routeParams";

const router = Router();

router.get("/quizzes", async (req, res): Promise<any> => {
  try {
    const quizzes = await db.select().from(quizzesTable).orderBy(desc(quizzesTable.createdAt));
    return res.json(quizzes.map(q => ({
      ...q,
      createdAt: q.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

router.get("/quizzes/:id", async (req, res): Promise<any> => {
  try {
    const id = routeParamInt(req.params.id);
    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, id));
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    return res.json({
      ...quiz,
      createdAt: quiz.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

router.post("/quizzes", logAdminActivity("create_quiz", "quiz"), async (req, res): Promise<any> => {
  try {
    const { title, subject, durationMins, questionCount, negativeMarking, status, instructions } = req.body;
    if (!title || !subject) {
      return res.status(400).json({ error: "title and subject are required" });
    }

    const [quiz] = await db.insert(quizzesTable).values({
      title,
      subject,
      durationMins: durationMins !== undefined ? parseInt(durationMins) : 10,
      questionCount: questionCount !== undefined ? parseInt(questionCount) : 0,
      negativeMarking: negativeMarking !== undefined ? parseFloat(negativeMarking) : 0.25,
      status: status || "draft",
      instructions: instructions || "",
    }).returning();

    return res.status(201).json({
      ...quiz,
      createdAt: quiz.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to create quiz" });
  }
});

router.patch("/quizzes/:id", logAdminActivity("update_quiz", "quiz"), async (req, res): Promise<any> => {
  try {
    const id = routeParamInt(req.params.id);
    const [updated] = await db.update(quizzesTable)
      .set({
        ...req.body,
      })
      .where(eq(quizzesTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Quiz not found" });

    return res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to update quiz" });
  }
});

router.delete("/quizzes/:id", logAdminActivity("delete_quiz", "quiz"), async (req, res): Promise<any> => {
  try {
    const id = routeParamInt(req.params.id);
    await db.delete(quizzesTable).where(eq(quizzesTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to delete quiz" });
  }
});

export default router;