import { Router } from 'express';
import { db } from '../lib/db';
import { pypPdfsTable } from '@workspace/db';
import { eq } from 'drizzle-orm';
import { uploadDoc } from '../middleware/upload';
import { requireAdminPin } from '../middleware/adminPin';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';

const router = Router();

// GET /api/document-pyp — list all (optionally filter ?year=&examType=&subject=)
router.get('/', async (req, res) => {
  try {
    const { year, examType, subject } = req.query;
    const allResults = await db.select().from(pypPdfsTable);

    let filtered = allResults;
    if (year) {
      filtered = filtered.filter(p => p.year === Number(year));
    }
    if (examType) {
      filtered = filtered.filter(p => p.examType === examType);
    }
    if (subject) {
      filtered = filtered.filter(p => p.subject === subject);
    }

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch PYP PDFs' });
  }
});

// POST /api/document-pyp/upload — admin only
router.post('/upload', requireAdminPin, uploadDoc.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { title, subject, year, examType } = req.body;
    if (!title || !subject || !year || !examType)
      return res.status(400).json({ error: 'title, subject, year, examType are required' });

    const { secureUrl, publicId } = await uploadToCloudinary(
      req.file.buffer,
      'exam-platform/pyp',
      req.file.originalname,
    );

    const inserted = await db.insert(pypPdfsTable).values({
      title,
      subject,
      year: Number(year),
      examType,
      originalName: req.file.originalname,
      cloudinaryUrl: secureUrl,
      cloudinaryPublicId: publicId,
      fileSize: req.file.size,
    }).returning();

    res.status(201).json(inserted[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload PYP PDF';
    res.status(500).json({ error: message });
  }
});

// DELETE /api/document-pyp/:id — admin only
router.delete('/:id', requireAdminPin, async (req, res) => {
  try {
    const record = await db.select().from(pypPdfsTable).where(eq(pypPdfsTable.id, Number(req.params.id))).limit(1);
    if (!record.length) return res.status(404).json({ error: 'Not found' });

    await deleteFromCloudinary(record[0].cloudinaryPublicId);
    await db.delete(pypPdfsTable).where(eq(pypPdfsTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete PYP PDF' });
  }
});

export default router;
