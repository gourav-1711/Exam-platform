import { Router } from "express";
import { db } from "../lib/db";
import { ncertPdfsTable } from "@workspace/db";
import { eq, and, gte, lte, like, sql } from "drizzle-orm";
import { uploadDoc } from "../middleware/upload";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary";
import { routeParam } from "../lib/routeParams";

const router = Router();

// GET /api/document-ncert — list all with pagination and filters
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 12;
    const offset = (page - 1) * limit;

    const classNumberRaw = req.query.classNumber;
    const subjectRaw = req.query.subject;

    const classNumber =
      typeof classNumberRaw === "string"
        ? routeParam(classNumberRaw)
        : undefined;
    const subject =
      typeof subjectRaw === "string" ? routeParam(subjectRaw) : undefined;

    // Build where conditions
    const conditions = [];
    if (classNumber) {
      conditions.push(eq(ncertPdfsTable.classNumber, Number(classNumber)));
    }
    if (subject) {
      conditions.push(eq(ncertPdfsTable.subject, subject));
    }

    const where = conditions.length ? and(...conditions) : undefined;

    // Get total count
    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ncertPdfsTable)
      .where(where);

    const total = Number(countRow?.count ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // Get paginated results
    const results = await db
      .select()
      .from(ncertPdfsTable)
      .where(where)
      .orderBy(ncertPdfsTable.uploadedAt)
      .limit(limit)
      .offset(offset);

    res.json({
      data: results,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch NCERT PDFs" });
  }
});

// POST /api/document-ncert/upload — admin only
router.post("/upload", uploadDoc.single("file"), async (req, res) => {
  try {
    const { title, subject, classNumber, externalUrl } = req.body;
    if (!title || !subject || !classNumber) {
      return res
        .status(400)
        .json({ error: "title, subject, classNumber are required" });
    }

    let secureUrl = "";
    let publicId = "external";
    let size = 0;
    let originalName = "External Link";

    if (req.file) {
      const upload = await uploadToCloudinary(
        req.file.buffer,
        "exam-platform/ncert",
        req.file.originalname,
      );
      secureUrl = upload.secureUrl;
      publicId = upload.publicId;
      size = req.file.size;
      originalName = req.file.originalname;
    } else if (externalUrl) {
      secureUrl = externalUrl;
    } else {
      return res.status(400).json({ error: "Either select a file to upload or enter a URL" });
    }

    const inserted = await db
      .insert(ncertPdfsTable)
      .values({
        title,
        subject,
        classNumber: Number(classNumber),
        originalName,
        cloudinaryUrl: secureUrl,
        cloudinaryPublicId: publicId,
        fileSize: size,
      })
      .returning();

    return res.status(201).json(inserted[0]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload NCERT PDF";
    return res.status(500).json({ error: message });
  }
});

// DELETE /api/document-ncert/:id — admin only
router.delete("/:id", async (req, res) => {
  try {
    const record = await db
      .select()
      .from(ncertPdfsTable)
      .where(eq(ncertPdfsTable.id, Number(req.params.id)))
      .limit(1);
    if (!record.length) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    if (record[0].cloudinaryPublicId !== "external") {
      await deleteFromCloudinary(record[0].cloudinaryPublicId);
    }
    await db
      .delete(ncertPdfsTable)
      .where(eq(ncertPdfsTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete NCERT PDF" });
  }
});

export default router;