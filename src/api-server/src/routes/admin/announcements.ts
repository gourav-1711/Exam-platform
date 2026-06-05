import { Router } from "express";
import { db } from "../../lib/db";
import { announcementsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { logAdminActivity } from "../../middlewares/adminMiddleware";
import { cacheDel } from "../../lib/cache";
import { routeParamInt } from "../../lib/routeParams";

const router = Router();

router.get("/announcements", async (req, res): Promise<any> => {
  try {
    const announcements = await db
      .select()
      .from(announcementsTable)
      .orderBy(desc(announcementsTable.createdAt));
    return res.json(
      announcements.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

router.get("/announcements/:id", async (req, res): Promise<any> => {
  try {
    const id = routeParamInt(req.params.id);
    const [ann] = await db
      .select()
      .from(announcementsTable)
      .where(eq(announcementsTable.id, id));
    if (!ann) {
      return res.status(404).json({ error: "Announcement not found" });
    }
    return res.json({
      ...ann,
      createdAt: ann.createdAt.toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch announcement" });
  }
});

router.post(
  "/announcements",
  logAdminActivity("create_announcement", "announcement"),
  async (req, res): Promise<any> => {
    try {
      const { title, body, type, isActive, linkText, linkUrl } = req.body;
      if (!title) return res.status(400).json({ error: "Title is required" });

      const [ann] = await db
        .insert(announcementsTable)
        .values({
          title,
          body,
          type: type || "info",
          isActive: isActive !== undefined ? isActive : true,
          linkText,
          linkUrl,
        })
        .returning();

      cacheDel("announcements");
      return res.status(201).json({
        ...ann,
        createdAt: ann.createdAt.toISOString(),
      });
    } catch (err) {
      return res.status(500).json({ error: "Failed to create announcement" });
    }
  },
);

router.patch(
  "/announcements/:id",
  logAdminActivity("update_announcement", "announcement"),
  async (req, res): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      const [updated] = await db
        .update(announcementsTable)
        .set({
          ...req.body,
        })
        .where(eq(announcementsTable.id, id))
        .returning();

      if (!updated)
        return res.status(404).json({ error: "Announcement not found" });

      cacheDel("announcements");
      return res.json({
        ...updated,
        createdAt: updated.createdAt.toISOString(),
      });
    } catch (err) {
      return res.status(500).json({ error: "Failed to update announcement" });
    }
  },
);

router.delete(
  "/announcements/:id",
  logAdminActivity("delete_announcement", "announcement"),
  async (req, res): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
      cacheDel("announcements");
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete announcement" });
    }
  },
);

export default router;
