import { Router } from "express";
import { db } from "../../lib/db";
import { syllabusTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { uploadDoc } from "../../middleware/upload";
import { uploadToCloudinary, deleteFromCloudinary } from "../../config/cloudinary";
import { logAdminActivity } from "../../middlewares/adminMiddleware";
import { routeParamInt } from "../../lib/routeParams";

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
      const { examName, readUrl, downloadUrl } = req.body;
      if (!examName) {
        return res.status(400).json({ error: "examName is required" });
      }

      let finalReadUrl = readUrl || null;
      let finalDownloadUrl = downloadUrl || null;
      let cloudinaryPublicId = null;

      if (req.file) {
        const upload = await uploadToCloudinary(
          req.file.buffer,
          "exam-platform/syllabus",
          req.file.originalname,
        );
        finalDownloadUrl = upload.secureUrl;
        finalReadUrl = upload.secureUrl;
        cloudinaryPublicId = upload.publicId;
      }

      const [inserted] = await db
        .insert(syllabusTable)
        .values({
          examName,
          readUrl: finalReadUrl,
          downloadUrl: finalDownloadUrl,
        })
        .returning();

      // Store cloudinary public id in metadata/details of logs if needed, but since syllabusTable doesn't have public_id column, we just store urls.
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
      const [updated] = await db
        .update(syllabusTable)
        .set({
          ...req.body,
        })
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