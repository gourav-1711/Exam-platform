import { Router } from "express";
import { db } from "../../lib/db";
import { announcementsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { logAdminActivity } from "../../middlewares/adminMiddleware";
import { cacheDel } from "../../lib/cache";

const router = Router();

router.get("/announcements", async (req, res) => {
  try {
    const announcements = await db.select().from(announcementsTable).orderBy(desc(announcementsTable.createdAt));
    res.json(announcements.map(a => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

router.get("/announcements/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [ann] = await db.select().from(announcementsTable).where(eq(announcementsTable.id, id));
    if (!ann) return res.status(404).json({ error: "Announcement not found" });
    res.json({
      ...ann,
      createdAt: ann.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch announcement" });
  }
});

router.post("/announcements", logAdminActivity("create_announcement", "announcement"), async (req, res) => {
  try {
    const { title, body, type, isActive, linkText, linkUrl } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const [ann] = await db.insert(announcementsTable).values({
      title,
      body,
      type: type || "info",
      isActive: isActive !== undefined ? isActive : true,
      linkText,
      linkUrl,
    }).returning();

    cacheDel("announcements");
    res.status(201).json({
      ...ann,
      createdAt: ann.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

router.patch("/announcements/:id", logAdminActivity("update_announcement", "announcement"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(announcementsTable)
      .set({
        ...req.body,
      })
      .where(eq(announcementsTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Announcement not found" });

    cacheDel("announcements");
    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update announcement" });
  }
});

router.delete("/announcements/:id", logAdminActivity("delete_announcement", "announcement"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
    cacheDel("announcements");
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

export default router;