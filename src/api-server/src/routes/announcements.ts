import { Router } from "express";
import { db } from "../db";
import { announcementsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { cacheGet, cacheSet, cacheDel, CacheTTL } from "../lib/cache";
import { AppError } from "../middleware/errorHandler";

const router = Router();

router.get("/announcements", async (req, res, next) => {
  const cacheKey = "announcements:active";
  const cached = cacheGet<any[]>(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const announcements = await db
      .select()
      .from(announcementsTable)
      .where(eq(announcementsTable.isActive, true))
      .orderBy(announcementsTable.createdAt);

    const serialized = announcements.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    }));

    cacheSet(cacheKey, serialized, CacheTTL.SHORT);
    res.json(serialized);
  } catch (err) {
    return next(err);
  }
});

// Helper to clear cache (used by admin routes)
export function clearAnnouncementsCache() {
  cacheDel("announcements:active");
}

export default router;
