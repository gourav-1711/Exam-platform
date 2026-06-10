import { Router } from "express";
import { db } from "../../lib/db";
import { currentAffairsTable } from "@workspace/db";
import { desc, sql, and, ilike, eq } from "drizzle-orm";
import { z } from "zod";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { routeParam } from "../../lib/routeParams";
import { cacheFlushPattern } from "../../lib/cache";
import { formatZodIssues } from "../../utils/validation";
import { AppError } from "../../middleware/errorHandler";

/** Generate a URL-friendly slug from a string */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

const currentAffairSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().default("General"),
});

const router = Router();

// GET /admin/current-affairs
router.get("/current-affairs", async (req, res, next) => {
  try {
    const {
      page = "1",
      limit = "20",
      search = "",
      filter = "all",
    } = req.query as Record<string, string>;

    const p = Math.max(1, Number(page));
    const l = Math.max(1, Number(limit));
    const offset = (p - 1) * l;

    const where = and(
      search ? ilike(currentAffairsTable.title, `%${search}%`) : undefined,
      filter !== "all" ? eq(currentAffairsTable.category, filter) : undefined,
    );

    const orderCol = currentAffairsTable.publishedAt;

    const [items, countRows] = await Promise.all([
      db
        .select()
        .from(currentAffairsTable)
        .where(where)
        .orderBy(desc(orderCol))
        .limit(l)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(currentAffairsTable)
        .where(where),
    ]);

    const total = Number(countRows?.[0]?.count ?? 0);

    res.json({
      items: items.map((a) => ({
        ...a,
        publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
        prevId: null,
        nextId: null,
      })),
      total,
      page: p,
      limit: l,
    });
  } catch (err) {
    return next(err);
  }
});

// GET /admin/current-affairs/:id
router.get("/current-affairs/:id", async (req, res, next) => {
  try {
    const id = routeParam(req.params.id);
    const [article] = await db
      .select()
      .from(currentAffairsTable)
      .where(eq(currentAffairsTable.id, id));

    if (!article) return next(new AppError(404, "Article not found"));

    return res.json({
      ...article,
      publishedAt: article.publishedAt
        ? article.publishedAt.toISOString()
        : null,
      prevId: null,
      nextId: null,
    });
  } catch (err) {
    return next(err);
  }
});

router.post(
  "/current-affairs",
  logAdminActivity("create_current_affair", "current_affair"),
  async (req, res, next) => {
    try {
      const parsed = currentAffairSchema.safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, formatZodIssues(parsed.error.issues)));
      }
      const { title, summary, content, category } = parsed.data;

      const slug = slugify(title);
      const insertData = {
        title,
        slug,
        summary,
        content,
        category: category || "General",
      };
      const [article] = await db
        .insert(currentAffairsTable)
        .values(insertData)
        .returning();

      cacheFlushPattern("current-affairs:");
      return res.status(201).json({
        ...article,
        publishedAt: article.publishedAt
          ? article.publishedAt.toISOString()
          : null,
        prevId: null,
        nextId: null,
      });
    } catch (err) {
      return next(err);
    }
  },
);

router.patch(
  "/current-affairs/:id",
  logAdminActivity("update_current_affair", "current_affair"),
  async (req, res, next) => {
    try {
      const id = routeParam(req.params.id);
      const parsed = currentAffairSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError(400, formatZodIssues(parsed.error.issues)));
      }
      const updateData: Record<string, unknown> = { ...parsed.data };
      if (updateData.title) {
        updateData.slug = slugify(updateData.title as string);
      }

      const [updated] = await db
        .update(currentAffairsTable)
        .set(updateData)
        .where(eq(currentAffairsTable.id, id))
        .returning();

      if (!updated) return next(new AppError(404, "Article not found"));

      cacheFlushPattern("current-affairs:");
      return res.json({
        ...updated,
        publishedAt: updated.publishedAt
          ? updated.publishedAt.toISOString()
          : null,
        prevId: null,
        nextId: null,
      });
    } catch (err) {
      return next(err);
    }
  },
);

router.delete(
  "/current-affairs/:id",
  logAdminActivity("delete_current_affair", "current_affair"),
  async (req, res, next) => {
    try {
      const id = routeParam(req.params.id);
      await db
        .delete(currentAffairsTable)
        .where(eq(currentAffairsTable.id, id));
      cacheFlushPattern("current-affairs:");
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
