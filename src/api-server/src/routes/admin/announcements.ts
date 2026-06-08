import { Router } from "express";
import { db } from "../../lib/db";
import { announcementsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { cacheDel } from "../../lib/cache";
import { routeParamInt } from "../../lib/routeParams";
import { AppError } from "../../middleware/errorHandler";

const router = Router();

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().optional(),
  type: z.string().default("info"),
  isActive: z.boolean().optional(),
  linkText: z.string().optional(),
  linkUrl: z.string().optional(),
});

router.get("/announcements", async (req, res, next): Promise<any> => {
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
    return next(err);
  }
});

router.get("/announcements/:id", async (req, res, next): Promise<any> => {
  try {
    const id = routeParamInt(req.params.id);
    const [ann] = await db
      .select()
      .from(announcementsTable)
      .where(eq(announcementsTable.id, id));
    if (!ann) {
      return next(new AppError(404, "Announcement not found"));
    }
    return res.json({
      ...ann,
      createdAt: ann.createdAt.toISOString(),
    });
  } catch (err) {
    return next(err);
  }
});

router.post(
  "/announcements",
  logAdminActivity("create_announcement", "announcement"),
  async (req, res, next): Promise<any> => {
    try {
      const parsed = announcementSchema.safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed — ${parsed.error.issues.map(i => i.message).join("; ")}`));
      }
      const { title, body, type, isActive, linkText, linkUrl } = parsed.data;

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

      cacheDel("announcements:active");
      return res.status(201).json({
        ...ann,
        createdAt: ann.createdAt.toISOString(),
      });
    } catch (err) {
      return next(err);
    }
  },
);

router.patch(
  "/announcements/:id",
  logAdminActivity("update_announcement", "announcement"),
  async (req, res, next): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      const parsed = announcementSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, `Validation failed — ${parsed.error.issues.map(i => i.message).join("; ")}`));
      }
      const [updated] = await db
        .update(announcementsTable)
        .set(parsed.data)
        .where(eq(announcementsTable.id, id))
        .returning();

      if (!updated)
        return next(new AppError(404, "Announcement not found"));

      cacheDel("announcements:active");
      return res.json({
        ...updated,
        createdAt: updated.createdAt.toISOString(),
      });
    } catch (err) {
      return next(err);
    }
  },
);

router.delete(
  "/announcements/:id",
  logAdminActivity("delete_announcement", "announcement"),
  async (req, res, next): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
      cacheDel("announcements:active");
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
