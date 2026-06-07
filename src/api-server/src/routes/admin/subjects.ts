import { Router } from "express";
import { db } from "../../lib/db";
import { subjects, questionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logAdminActivity } from "../../middlewares/adminMiddleware";
import { routeParamInt } from "../../lib/routeParams";

const router = Router();

router.get("/subjects", async (req, res): Promise<any> => {
  try {
    const data = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        examCategory: subjects.examCategory,
        description: subjects.description,
        questionCount: sql<number>`count(${questionsTable.id})`,
      })
      .from(subjects)
      .leftJoin(
        questionsTable,
        eq(questionsTable.pyqSubjectId, subjects.id),
      )
      .groupBy(subjects.id)
      .orderBy(subjects.name);

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

router.post(
  "/subjects",
  logAdminActivity("create_subject", "subject"),
  async (req, res): Promise<any> => {
    try {
      const { name, examCategory, description } = req.body;
      if (!name) return res.status(400).json({ error: "name is required" });

      const [subject] = await db
        .insert(subjects)
        .values({
          name,
          examCategory: examCategory || "General",
          description: description || null,
        })
        .returning();
      return res.status(201).json(subject);
    } catch (err) {
      return res.status(500).json({ error: "Failed to create subject" });
    }
  },
);

router.patch(
  "/subjects/:id",
  logAdminActivity("update_subject", "subject"),
  async (req, res): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      const [updated] = await db
        .update(subjects)
        .set({ ...req.body })
        .where(eq(subjects.id, id))
        .returning();
      if (!updated) return res.status(404).json({ error: "Subject not found" });
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: "Failed to update subject" });
    }
  },
);

router.delete(
  "/subjects/:id",
  logAdminActivity("delete_subject", "subject"),
  async (req, res): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      await db.delete(subjects).where(eq(subjects.id, id));
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete subject" });
    }
  },
);

export default router;