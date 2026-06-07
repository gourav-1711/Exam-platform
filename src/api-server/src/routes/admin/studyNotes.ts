import { Router } from "express";
import { db } from "../../lib/db";
import { studyNotesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { routeParamInt } from "../../lib/routeParams";

const studyNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  medium: z.string().default("English"),
  url: z.string().optional(),
});

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
      const parsed = studyNoteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      }

      const [note] = await db
        .insert(studyNotesTable)
        .values(parsed.data)
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
      const parsed = studyNoteSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      }
      const [updated] = await db
        .update(studyNotesTable)
        .set(parsed.data)
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
