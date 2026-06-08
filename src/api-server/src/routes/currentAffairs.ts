import { Router } from "express";
import {
  getCurrentAffairs,
  getCurrentAffairById,
  createCurrentAffair,
  updateCurrentAffair,
  deleteCurrentAffair,
} from "../services/currentAffairsService";
import { cacheGet, cacheSet, cacheFlushPattern, CacheTTL } from "../lib/cache";

const router = Router();

// GET all current affairs with pagination matching OpenAPI spec
import { AppError } from "../middleware/errorHandler";

// GET all current affairs with pagination matching OpenAPI spec
router.get("/current-affairs", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    const cacheKey = `current-affairs:list:${page}`;
    const cached = cacheGet<any>(cacheKey);
    if (cached) { res.json(cached); return; }

    const currentAffairs = await getCurrentAffairs();
    const total = currentAffairs.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = currentAffairs.slice(offset, offset + limit).map((a) => ({
      ...a,
      publishedAt: a.publishedAt.toISOString(),
      prevId: null,
      nextId: null,
    }));

    const result = { data: paginated, total, page, totalPages };
    cacheSet(cacheKey, result, CacheTTL.QUESTIONS);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

// GET single current affair by ID
router.get("/current-affairs/:id", async (req, res, next) => {
  try {
    const idRaw = req.params.id;
    const id = Array.isArray(idRaw) ? idRaw[0] : idRaw;

    const cacheKey = `current-affairs:detail:${id}`;
    const cached = cacheGet<any>(cacheKey);
    if (cached) { res.json(cached); return; }

    const currentAffair = await getCurrentAffairById(id);
    if (!currentAffair) {
      return next(new AppError(404, "Current affair not found"));
    }

    const result = {
      ...currentAffair,
      publishedAt: currentAffair.publishedAt.toISOString(),
      prevId: null,
      nextId: null,
    };
    cacheSet(cacheKey, result, CacheTTL.QUESTIONS);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

// POST create new current affair
router.post("/current-affairs", async (req, res, next) => {
  try {
    const { title, content, date } = req.body;
    const newCurrentAffair = await createCurrentAffair({
      title,
      content,
      date,
    });

    return res.status(201).json({
      ...newCurrentAffair,
      publishedAt: newCurrentAffair.publishedAt.toISOString(),
      prevId: null,
      nextId: null,
    });
  } catch (err) {
    return next(err);
  }
});

// PUT update existing current affair
router.put("/current-affairs/:id", async (req, res, next) => {
  try {
    const idRaw = req.params.id;
    const id = Array.isArray(idRaw) ? idRaw[0] : idRaw;

    const { title, content, date } = req.body;
    const updatedCurrentAffair = await updateCurrentAffair(id, {
      title,
      content,
      date,
    });

    if (!updatedCurrentAffair) {
      return next(new AppError(404, "Current affair not found"));
    }

    return res.json({
      ...updatedCurrentAffair,
      publishedAt: updatedCurrentAffair.publishedAt.toISOString(),
      prevId: null,
      nextId: null,
    });
  } catch (err) {
    return next(err);
  }
});

// DELETE current affair
router.delete("/current-affairs/:id", async (req, res, next) => {
  try {
    const idRaw = req.params.id;
    const id = Array.isArray(idRaw) ? idRaw[0] : idRaw;

    const deletedCurrentAffair = await deleteCurrentAffair(id);
    if (!deletedCurrentAffair) {
      return next(new AppError(404, "Current affair not found"));
    }

    return res.json({ message: "Current affair deleted successfully" });
  } catch (err) {
    return next(err);
  }
});

export default router;
