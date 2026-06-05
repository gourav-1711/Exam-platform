import { Router } from "express";
import { db } from "../../lib/db";
import { studyNotesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logAdminActivity } from "../../middlewares/adminMiddleware";
import { routeParamInt } from "../../lib/routeParams";

const router = Router();

router.get("/study-notes", async (req, res): Promise<any> => {
  try {
    const studyNotes = await db.select().from(studyNotesTable);
    return res.json(studyNotes);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch study notes" });
  }
});

router.get("/study-notes/:id", async (req, res): Promise<any> => {
  try {
    const id = routeParamInt(req.params.id);
    const [note] = await db
      .select()
      .from(studyNotesTable)
      .where(eq(studyNotesTable.id, id));
    if (!note) return res.status(404).json({ error: "Study note not found" });
    return res.json(note);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch study note" });
  }
});

router.post(
  "/study-notes",
  logAdminActivity("create_study_note", "study_note"),
  async (req, res): Promise<any> => {
    try {
      const { title, subject, medium, downloadUrl, readUrl } = req.body;
      if (!title || !subject) {
        return res
          .status(400)
          .json({ error: "title and subject are required" });
      }

      const [note] = await db
        .insert(studyNotesTable)
        .values({
          title,
          subject,
          medium: medium || "English",
          downloadUrl: downloadUrl || null,
          readUrl: readUrl || null,
        })
        .returning();

      return res.status(201).json(note);
    } catch (err) {
      return res.status(500).json({ error: "Failed to create study note" });
    }
  },
);

router.patch(
  "/study-notes/:id",
  logAdminActivity("update_study_note", "study_note"),
  async (req, res): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      const [updated] = await db
        .update(studyNotesTable)
        .set({
          ...req.body,
        })
        .where(eq(studyNotesTable.id, id))
        .returning();

      if (!updated)
        return res.status(404).json({ error: "Study note not found" });

      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: "Failed to update study note" });
    }
  },
);

router.delete(
  "/study-notes/:id",
  logAdminActivity("delete_study_note", "study_note"),
  async (req, res): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      await db.delete(studyNotesTable).where(eq(studyNotesTable.id, id));
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete study note" });
    }
  },
);

export default router;
