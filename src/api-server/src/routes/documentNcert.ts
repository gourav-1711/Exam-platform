import { Router } from 'express';
import { db } from '../lib/db';
import { ncertPdfsTable } from '@workspace/db';
import { eq } from 'drizzle-orm';
import { uploadDoc } from '../middleware/upload';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import { routeParam } from '../lib/routeParams';

const router = Router();

// GET /api/document-ncert — list all (optionally filter ?classNumber=&subject=)
router.get('/', async (req, res) => {
  try {
    const classNumber = req.query.classNumber ? routeParam(req.query.classNumber) : undefined;
    const subject = req.query.subject ? routeParam(req.query.subject) : undefined;
    
    let query = db.select().from(ncertPdfsTable);

    // Note: Drizzle doesn't support dynamic WHERE with AND, so we fetch all and filter in memory
    // For production, consider using raw SQL or better query patterns
    const allResults = await query;

    let filtered = allResults;
    if (classNumber) {
      filtered = filtered.filter(p => p.classNumber === Number(classNumber));
    }
    if (subject) {
      filtered = filtered.filter(p => p.subject === subject);
    }

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch NCERT PDFs' });
  }
});

// POST /api/document-ncert/upload — admin only
router.post('/upload', uploadDoc.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { title, subject, classNumber } = req.body;
    if (!title || !subject || !classNumber) {
      res.status(400).json({ error: 'title, subject, classNumber are required' });
      return;
    }

    const { secureUrl, publicId } = await uploadToCloudinary(
      req.file.buffer,
      'exam-platform/ncert',
      req.file.originalname,
    );

    const inserted = await db.insert(ncertPdfsTable).values({
      title,
      subject,
      classNumber: Number(classNumber),
      originalName: req.file.originalname,
      cloudinaryUrl: secureUrl,
      cloudinaryPublicId: publicId,
      fileSize: req.file.size,
    }).returning();

    res.status(201).json(inserted[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload NCERT PDF';
    res.status(500).json({ error: message });
  }
});

// DELETE /api/document-ncert/:id — admin only
router.delete('/:id', async (req, res) => {
  try {
    const record = await db.select().from(ncertPdfsTable).where(eq(ncertPdfsTable.id, Number(req.params.id))).limit(1);
    if (!record.length) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    await deleteFromCloudinary(record[0].cloudinaryPublicId);
    await db.delete(ncertPdfsTable).where(eq(ncertPdfsTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete NCERT PDF' });
  }
});

export default router;