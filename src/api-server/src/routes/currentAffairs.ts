import { Router } from "express";
import { db } from "../lib/db";
import { currentAffairsTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";
import {
  getCurrentAffairById,
  createCurrentAffair,
  updateCurrentAffair,
  deleteCurrentAffair,
} from "../services/currentAffairsService";
import { cacheGet, cacheSet, CacheTTL } from "../lib/cache";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// GET all current affairs with DB-level pagination
router.get("/current-affairs", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 12;
    const offset = (page - 1) * limit;

    const cacheKey = `current-affairs:list:${page}:${limit}`;
    const cached = cacheGet<unknown>(cacheKey);
    if (cached) { res.json(cached); return; }

    const [items, countRows] = await Promise.all([
      db
        .select()
        .from(currentAffairsTable)
        .orderBy(desc(currentAffairsTable.publishedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(currentAffairsTable),
    ]);

    const total = Number(countRows?.[0]?.count ?? 0);
    const totalPages = Math.ceil(total / limit);

    const result = {
      data: items.map((a) => ({
        ...a,
        publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
        prevId: null,
        nextId: null,
      })),
      total,
      page,
      totalPages,
    };
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
    const cached = cacheGet<unknown>(cacheKey);
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
