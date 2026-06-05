import { Router } from 'express';
import { 
  getCurrentAffairs, 
  getCurrentAffairById, 
  createCurrentAffair, 
  updateCurrentAffair, 
  deleteCurrentAffair 
} from '../services/currentAffairsService';

const router = Router();

// GET all current affairs with pagination matching OpenAPI spec
router.get('/current-affairs', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    const currentAffairs = await getCurrentAffairs();
    const total = currentAffairs.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = currentAffairs.slice(offset, offset + limit).map((a) => ({
      ...a,
      publishedAt: a.publishedAt.toISOString(),
      prevId: null,
      nextId: null,
    }));

    res.json({
      data: paginated,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching current affairs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET single current affair by ID
router.get('/current-affairs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const currentAffair = await getCurrentAffairById(id);
    if (!currentAffair) {
      return res.status(404).json({ message: 'Current affair not found' });
    }
    res.json({
      ...currentAffair,
      publishedAt: currentAffair.publishedAt.toISOString(),
      prevId: null,
      nextId: null,
    });
  } catch (error) {
    console.error('Error fetching current affair:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST create new current affair
router.post('/current-affairs', async (req, res) => {
  try {
    const { title, content, date } = req.body;
    const newCurrentAffair = await createCurrentAffair({ title, content, date });
    res.status(201).json({
      ...newCurrentAffair,
      publishedAt: newCurrentAffair.publishedAt.toISOString(),
      prevId: null,
      nextId: null,
    });
  } catch (error) {
    console.error('Error creating current affair:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT update existing current affair
router.put('/current-affairs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, date } = req.body;
    const updatedCurrentAffair = await updateCurrentAffair(id, { title, content, date });
    if (!updatedCurrentAffair) {
      return res.status(404).json({ message: 'Current affair not found' });
    }
    res.json({
      ...updatedCurrentAffair,
      publishedAt: updatedCurrentAffair.publishedAt.toISOString(),
      prevId: null,
      nextId: null,
    });
  } catch (error) {
    console.error('Error updating current affair:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE current affair
router.delete('/current-affairs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCurrentAffair = await deleteCurrentAffair(id);
    if (!deletedCurrentAffair) {
      return res.status(404).json({ message: 'Current affair not found' });
    }
    res.json({ message: 'Current affair deleted successfully' });
  } catch (error) {
    console.error('Error deleting current affair:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;