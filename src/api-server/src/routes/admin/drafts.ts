import { Router } from "express";
import { db, questionDraftsTable, examDraftsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { getAuth } from "@clerk/express";

const router = Router();

router.get("/drafts/questions", async (req, res) => {
  try {
    const auth = getAuth(req);
    const drafts = await db.select().from(questionDraftsTable)
      .where(eq(questionDraftsTable.createdBy, auth.userId!))
      .orderBy(desc(questionDraftsTable.lastSavedAt));
    res.json(drafts);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch question drafts" });
  }
});

router.post("/drafts/questions", async (req, res) => {
  try {
    const auth = getAuth(req);
    const { content, questionId } = req.body as { content: object; questionId?: number };
    const now = new Date();

    const [existing] = questionId
      ? await db.select().from(questionDraftsTable)
          .where(and(eq(questionDraftsTable.createdBy, auth.userId!), eq(questionDraftsTable.questionId, questionId)))
      : await db.select().from(questionDraftsTable)
          .where(and(eq(questionDraftsTable.createdBy, auth.userId!), eq(questionDraftsTable.questionId, 0)));

    let draft;
    if (existing) {
      [draft] = await db.update(questionDraftsTable)
        .set({ content, lastSavedAt: now })
        .where(eq(questionDraftsTable.id, existing.id))
        .returning();
    } else {
      [draft] = await db.insert(questionDraftsTable)
        .values({ createdBy: auth.userId!, content, questionId: questionId ?? null })
        .returning();
    }
    res.json(draft);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to save question draft" });
  }
});

router.patch("/drafts/questions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const auth = getAuth(req);
    const { content } = req.body as { content: object };
    const [draft] = await db.update(questionDraftsTable)
      .set({ content, lastSavedAt: new Date() })
      .where(and(eq(questionDraftsTable.id, id), eq(questionDraftsTable.createdBy, auth.userId!)))
      .returning();
    if (!draft) { res.status(404).json({ error: "Draft not found" }); return; }
    res.json(draft);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update draft" });
  }
});

router.delete("/drafts/questions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const auth = getAuth(req);
    await db.delete(questionDraftsTable)
      .where(and(eq(questionDraftsTable.id, id), eq(questionDraftsTable.createdBy, auth.userId!)));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete draft" });
  }
});

router.get("/drafts/exams", async (req, res) => {
  try {
    const auth = getAuth(req);
    const drafts = await db.select().from(examDraftsTable)
      .where(eq(examDraftsTable.createdBy, auth.userId!))
      .orderBy(desc(examDraftsTable.lastSavedAt));
    res.json(drafts);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch exam drafts" });
  }
});

router.post("/drafts/exams", async (req, res) => {
  try {
    const auth = getAuth(req);
    const { content, examId } = req.body as { content: object; examId?: number };
    const now = new Date();

    let draft;
    if (examId) {
      const [existing] = await db.select().from(examDraftsTable)
        .where(and(eq(examDraftsTable.createdBy, auth.userId!), eq(examDraftsTable.examId, examId)));
      if (existing) {
        [draft] = await db.update(examDraftsTable)
          .set({ content, lastSavedAt: now })
          .where(eq(examDraftsTable.id, existing.id))
          .returning();
      } else {
        [draft] = await db.insert(examDraftsTable)
          .values({ createdBy: auth.userId!, content, examId })
          .returning();
      }
    } else {
      [draft] = await db.insert(examDraftsTable)
        .values({ createdBy: auth.userId!, content })
        .returning();
    }
    res.json(draft);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to save exam draft" });
  }
});

export default router;
