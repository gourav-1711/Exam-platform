import { Router } from "express";
import { db } from "../../lib/db";
import { currentAffairsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { logAdminActivity } from "../../middlewares/adminMiddleware";

const router = Router();

router.get("/current-affairs", async (req, res) => {
  try {
    const all = await db.select().from(currentAffairsTable).orderBy(desc(currentAffairsTable.publishedAt));
    res.json(all.map(a => ({
      ...a,
      publishedAt: a.publishedAt.toISOString(),
      prevId: null,
      nextId: null,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch current affairs" });
  }
});

router.get("/current-affairs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [article] = await db.select().from(currentAffairsTable).where(eq(currentAffairsTable.id, id));
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json({
      ...article,
      publishedAt: article.publishedAt.toISOString(),
      prevId: null,
      nextId: null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch current affairs article" });
  }
});

router.post("/current-affairs", logAdminActivity("create_current_affair", "current_affair"), async (req, res) => {
  try {
    const { title, summary, content, category } = req.body;
    if (!title || !summary || !content) {
      return res.status(400).json({ error: "title, summary, and content are required" });
    }

    const [article] = await db.insert(currentAffairsTable).values({
      title,
      summary,
      content,
      category: category || "General",
    }).returning();

    res.status(201).json({
      ...article,
      publishedAt: article.publishedAt.toISOString(),
      prevId: null,
      nextId: null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create current affair" });
  }
});

router.patch("/current-affairs/:id", logAdminActivity("update_current_affair", "current_affair"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(currentAffairsTable)
      .set({
        ...req.body,
      })
      .where(eq(currentAffairsTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Article not found" });

    res.json({
      ...updated,
      publishedAt: updated.publishedAt.toISOString(),
      prevId: null,
      nextId: null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update current affair" });
  }
});

router.delete("/current-affairs/:id", logAdminActivity("delete_current_affair", "current_affair"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(currentAffairsTable).where(eq(currentAffairsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete current affair" });
  }
});

export default router;