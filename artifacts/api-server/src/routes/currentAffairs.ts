import { Router } from "express";
import { db, currentAffairsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/current-affairs", async (req, res) => {
  try {
    const page = parseInt((req.query as any).page as string) || 1;
    const limit = parseInt((req.query as any).limit as string) || 10;
    const offset = (page - 1) * limit;

    const all = await db.select().from(currentAffairsTable).orderBy(desc(currentAffairsTable.publishedAt));
    const total = all.length;
    const data = all.slice(offset, offset + limit).map(a => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      content: a.content,
      category: a.category,
      publishedAt: a.publishedAt.toISOString(),
      prevId: null,
      nextId: null,
    }));

    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch current affairs" });
  }
});

router.get("/current-affairs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const all = await db.select().from(currentAffairsTable).orderBy(desc(currentAffairsTable.publishedAt));
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    const article = all[idx];
    res.json({
      id: article.id,
      title: article.title,
      summary: article.summary,
      content: article.content,
      category: article.category,
      publishedAt: article.publishedAt.toISOString(),
      prevId: idx > 0 ? all[idx - 1].id : null,
      nextId: idx < all.length - 1 ? all[idx + 1].id : null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch article" });
  }
});

export default router;
