import { Router } from "express";
import { db } from "../../lib/db";
import { currentAffairsTable } from "@workspace/db";
import { desc, sql, and, ilike, eq } from "drizzle-orm";
import { logAdminActivity } from "../../middlewares/adminMiddleware";
import { routeParamInt } from "../../lib/routeParams";

const router = Router();

// GET /admin/current-affairs
router.get("/current-affairs", async (req, res): Promise<any> => {
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

    // current_affairs schema might differ; prefer publishedAt for ordering.
    const orderCol: any = (currentAffairsTable as any).publishedAt;

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

    const total = Number((countRows?.[0] as any)?.count ?? 0);

    res.json({
      items: items.map((a: any) => ({
        ...a,
        publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
        prevId: null,
        nextId: null,
      })),
      total,
      page: p,
      limit: l,
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({
        error: (err as any)?.message ?? "Failed to fetch current affairs",
      });
  }
});

// GET /admin/current-affairs/:id
router.get("/current-affairs/:id", async (req, res) => {
  try {
    const id = routeParamInt(req.params.id);
    const [article] = await db
      .select()
      .from(currentAffairsTable)
      .where(eq(currentAffairsTable.id, id));

    if (!article) return res.status(404).json({ error: "Article not found" });

    return res.json({
      ...article,
      publishedAt: (article as any).publishedAt
        ? (article as any).publishedAt.toISOString()
        : null,
      prevId: null,
      nextId: null,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message ?? "Failed to fetch current affairs article",
    });
  }
});

router.post(
  "/current-affairs",
  logAdminActivity("create_current_affair", "current_affair"),
  async (req, res): Promise<any> => {
    try {
      const { title, summary, content, category } = req.body;
      if (!title || !summary || !content) {
        return res
          .status(400)
          .json({ error: "title, summary, and content are required" });
      }

      const [article] = await db
        .insert(currentAffairsTable)
        .values({
          title,
          summary,
          content,
          category: category || "General",
        })
        .returning();

      return res.status(201).json({
        ...article,
        publishedAt: (article as any).publishedAt
          ? (article as any).publishedAt.toISOString()
          : null,
        prevId: null,
        nextId: null,
      });
    } catch (err: any) {
      return res
        .status(500)
        .json({ error: err?.message ?? "Failed to create current affair" });
    }
  },
);

router.patch(
  "/current-affairs/:id",
  logAdminActivity("update_current_affair", "current_affair"),
  async (req, res): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      const [updated] = await db
        .update(currentAffairsTable)
        .set({
          ...req.body,
        })
        .where(eq(currentAffairsTable.id, id))
        .returning();

      if (!updated) return res.status(404).json({ error: "Article not found" });

      return res.json({
        ...updated,
        publishedAt: (updated as any).publishedAt
          ? (updated as any).publishedAt.toISOString()
          : null,
        prevId: null,
        nextId: null,
      });
    } catch (err: any) {
      return res
        .status(500)
        .json({ error: err?.message ?? "Failed to update current affair" });
    }
  },
);

router.delete(
  "/current-affairs/:id",
  logAdminActivity("delete_current_affair", "current_affair"),
  async (req, res): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      await db
        .delete(currentAffairsTable)
        .where(eq(currentAffairsTable.id, id));
      return res.json({ success: true });
    } catch (err: any) {
      return res
        .status(500)
        .json({ error: err?.message ?? "Failed to delete current affair" });
    }
  },
);

export default router;
