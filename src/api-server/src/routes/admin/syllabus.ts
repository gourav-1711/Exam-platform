import { Router } from "express";
import { db } from "../../lib/db";
import { syllabusTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { uploadDoc } from "../../middleware/upload";
import { uploadToCloudinary, deleteFromCloudinary } from "../../config/cloudinary";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { routeParamInt } from "../../lib/routeParams";

const syllabusSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  subjectId: z.coerce.number().optional(),
  examCategory: z.string().optional(),
  readUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
});

const router = Router();

// GET /api/admin/syllabus — List all syllabus
router.get("/syllabus", async (req, res) => {
  try {
    const list = await db.select().from(syllabusTable);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch syllabus records" });
  }
});

// POST /api/admin/syllabus — Create a new syllabus (supports file upload or URL)
router.post(
  "/syllabus",
  uploadDoc.single("file"),
  logAdminActivity("create_syllabus", "syllabus"),
  async (req, res): Promise<any> => {
    try {
      const parsed = syllabusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      }

      const { title, description, examCategory } = parsed.data;
      let finalReadUrl = parsed.data.readUrl || null;
      let finalDownloadUrl = parsed.data.downloadUrl || null;

      if (req.file) {
        const upload = await uploadToCloudinary(
          req.file.buffer,
          "exam-platform/syllabus",
          req.file.originalname,
        );
        finalDownloadUrl = upload.secureUrl;
        finalReadUrl = upload.secureUrl;
      }

      const [inserted] = await db
        .insert(syllabusTable)
        .values({
          title,
          description: description || null,
          examCategory: examCategory || null,
          readUrl: finalReadUrl,
          downloadUrl: finalDownloadUrl,
        })
        .returning();

      return res.status(201).json(inserted);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to create syllabus" });
    }
  },
);

// PATCH /api/admin/syllabus/:id — Update syllabus
router.patch(
  "/syllabus/:id",
  logAdminActivity("update_syllabus", "syllabus"),
  async (req, res): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      const parsed = syllabusSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      }
      const [updated] = await db
        .update(syllabusTable)
        .set(parsed.data)
        .where(eq(syllabusTable.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Syllabus not found" });
      }

      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update syllabus" });
    }
  },
);

// DELETE /api/admin/syllabus/:id — Delete syllabus
router.delete(
  "/syllabus/:id",
  logAdminActivity("delete_syllabus", "syllabus"),
  async (req, res): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      
      // Select first to see if we have Cloudinary URL
      const [record] = await db
        .select()
        .from(syllabusTable)
        .where(eq(syllabusTable.id, id))
        .limit(1);

      if (!record) {
        return res.status(404).json({ error: "Syllabus not found" });
      }

      // If downloadUrl or readUrl is from Cloudinary and has public id, we can attempt to delete it.
      // Since syllabus table doesn't have public_id column, we delete from DB directly.
      await db.delete(syllabusTable).where(eq(syllabusTable.id, id));
      
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to delete syllabus" });
    }
  },
);

export default router;