import { Router } from "express";
import { db } from "../../lib/db";
import { pyqSubjectsTable, questionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logAdminActivity } from "../../middlewares/adminMiddleware";
import { routeParamInt } from "../../lib/routeParams";

const router = Router();

router.get("/pyq-subjects", async (req, res): Promise<any> => {
  try {
    const subjects = await db
      .select({
        id: pyqSubjectsTable.id,
        name: pyqSubjectsTable.name,
        questionCount: sql<number>`count(${questionsTable.id})`,
      })
      .from(pyqSubjectsTable)
      .leftJoin(
        questionsTable,
        eq(questionsTable.pyqSubjectId, pyqSubjectsTable.id),
      )
      .groupBy(pyqSubjectsTable.id)
      .orderBy(pyqSubjectsTable.name);

    return res.json(subjects);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

router.post(
  "/pyq-subjects",
  logAdminActivity("create_pyq_subject", "pyq_subject"),
  async (req, res): Promise<any> => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: "name is required" });

      const [subject] = await db
        .insert(pyqSubjectsTable)
        .values({ name })
        .returning();
      return res.status(201).json(subject);
    } catch (err) {
      return res.status(500).json({ error: "Failed to create subject" });
    }
  },
);

router.patch(
  "/pyq-subjects/:id",
  logAdminActivity("update_pyq_subject", "pyq_subject"),
  async (req, res): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      const [updated] = await db
        .update(pyqSubjectsTable)
        .set({ ...req.body })
        .where(eq(pyqSubjectsTable.id, id))
        .returning();
      if (!updated) return res.status(404).json({ error: "Subject not found" });
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: "Failed to update subject" });
    }
  },
);

router.delete(
  "/pyq-subjects/:id",
  logAdminActivity("delete_pyq_subject", "pyq_subject"),
  async (req, res): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      await db.delete(pyqSubjectsTable).where(eq(pyqSubjectsTable.id, id));
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete subject" });
    }
  },
);

export default router;
