import { Router } from "express";
import { db } from "../../lib/db";
import { draftsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { logAdminActivity } from "../../middlewares/adminMiddleware";

const router = Router();

router.get("/drafts", async (req, res) => {
  try {
    const auth = getAuth(req);
    const { resourceType } = req.query as Record<string, string>;

    const conditions = [eq(draftsTable.createdBy, auth.userId!)];
    if (resourceType) {
      conditions.push(eq(draftsTable.resourceType, resourceType));
    }

    const drafts = await db.select().from(draftsTable)
      .where(and(...conditions))
      .orderBy(desc(draftsTable.lastSavedAt));

    return res.json(drafts.map(d => ({
      ...d,
      lastSavedAt: d.lastSavedAt.toISOString(),
      createdAt: d.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch drafts" });
  }
});

router.get("/drafts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const auth = getAuth(req);
    const [draft] = await db.select().from(draftsTable)
      .where(and(eq(draftsTable.id, id), eq(draftsTable.createdBy, auth.userId!)));

    if (!draft) return res.status(404).json({ error: "Draft not found" });

    return res.json({
      ...draft,
      lastSavedAt: draft.lastSavedAt.toISOString(),
      createdAt: draft.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch draft" });
  }
});

router.post("/drafts", logAdminActivity("create_draft", "draft"), async (req, res) => {
  try {
    const auth = getAuth(req);
    const { resourceType, resourceId, content } = req.body;

    if (!resourceType || !content) {
      return res.status(400).json({ error: "resourceType and content are required" });
    }

    const [draft] = await db.insert(draftsTable).values({
      resourceType,
      resourceId: resourceId ? parseInt(resourceId) : null,
      content,
      createdBy: auth.userId!,
    }).returning();

    return res.status(201).json({
      ...draft,
      lastSavedAt: draft.lastSavedAt.toISOString(),
      createdAt: draft.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to save draft" });
  }
});

router.patch("/drafts/:id", logAdminActivity("update_draft", "draft"), async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const auth = getAuth(req);
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }

    const [draft] = await db.update(draftsTable)
      .set({
        content,
        lastSavedAt: new Date(),
      })
      .where(and(eq(draftsTable.id, id), eq(draftsTable.createdBy, auth.userId!)))
      .returning();

    if (!draft) return res.status(404).json({ error: "Draft not found" });

    return res.json({
      ...draft,
      lastSavedAt: draft.lastSavedAt.toISOString(),
      createdAt: draft.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to update draft" });
  }
});

router.delete("/drafts/:id", logAdminActivity("delete_draft", "draft"), async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const auth = getAuth(req);

    const deleted = await db.delete(draftsTable)
      .where(and(eq(draftsTable.id, id), eq(draftsTable.createdBy, auth.userId!)));

    return res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to delete draft" });
  }
});

export default router;