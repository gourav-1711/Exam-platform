"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete this record from the database.",
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="rounded-2xl border-border bg-white shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-900 font-bold text-lg">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-500 text-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onClose} className="rounded-xl">
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
            >
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
</dyad-chat-summary>Fixing duplicate closing tag in ConfirmDeleteDialog component</dyad-chat-summary>

Let me continue with the remaining tasks. I'll now implement the backend Admin Syllabus CRUD endpoints and the frontend `/admin/syllabus` page.
<tool_call>dyad-write path="src/api-server/src/routes/admin/syllabus.ts" description="Creating admin syllabus CRUD routes">
import { Router } from "express";
import { db } from "../../lib/db";
import { syllabusTable } from "@workspace/db";
import { eq, desc, ilike, and, sql } from "drizzle-orm";
import { logAdminActivity } from "../../middlewares/adminMiddleware";
import { routeParamInt } from "../../lib/routeParams";
import { z } from "zod";

const syllabusBodySchema = z.object({
  subjectId: z.number().int().positive(),
  topicName: z.string().min(1),
  subtopics: z.array(z.string()).optional().default([]),
  description: z.string().optional().nullable(),
  examCategory: z.string().optional().default("UPSC"),
});

const router = Router();

// GET /admin/syllabus
router.get("/", async (req, res) => {
  try {
    const { subjectId, search, examCategory } = req.query as Record<string, string>;
    const conditions = [];

    if (subjectId) conditions.push(eq(syllabusTable.subjectId, parseInt(subjectId)));
    if (search) conditions.push(ilike(syllabusTable.topicName, `%${search}%`));
    if (examCategory && examCategory !== "all") conditions.push(eq(syllabusTable.examCategory, examCategory));

    const where = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(syllabusTable)
      .where(where);

    const items = await db
      .select()
      .from(syllabusTable)
      .where(where)
      .orderBy(desc(syllabusTable.createdAt));

    res.json({
      data: items,
      total: Number(countRow.count),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch syllabus" });
  }
});

// GET /admin/syllabus/:id
router.get("/:id", async (req, res) => {
  try {
    const id = routeParamInt(req.params.id);
    const [item] = await db.select().from(syllabusTable).where(eq(syllabusTable.id, id));
    if (!item) return res.status(404).json({ error: "Syllabus not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch syllabus" });
  }
});

// POST /admin/syllabus
router.post(
  "/",
  logAdminActivity("create_syllabus", "syllabus"),
  async (req, res) => {
    try {
      const parsed = syllabusBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      }
      const { subjectId, topicName, subtopics, description, examCategory } = parsed.data;

      const [item] = await db.insert(syllabusTable).values({
        subjectId,
        topicName,
        subtopics: subtopics ?? [],
        description: description ?? null,
        examCategory: examCategory ?? "UPSC",
      }).returning();

      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ error: "Failed to create syllabus" });
    }
  },
);

// PATCH /admin/syllabus/:id
router.patch(
  "/:id",
  logAdminActivity("update_syllabus", "syllabus"),
  async (req, res) => {
    try {
      const id = routeParamInt(req.params.id);
      const parsed = syllabusBodySchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      }

      const { subjectId, topicName, subtopics, description, examCategory } = parsed.data;
      const [updated] = await db
        .update(syllabusTable)
        .set({
          subjectId,
          topicName,
          subtopics: subtopics ?? [],
          description: description ?? null,
          examCategory: examCategory ?? "UPSC",
          updatedAt: new Date(),
        })
        .where(eq(syllabusTable.id, id))
        .returning();

      if (!updated) return res.status(404).json({ error: "Syllabus not found" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to update syllabus" });
    }
  },
);

// DELETE /admin/syllabus/:id
router.delete(
  "/:id",
  logAdminActivity("delete_syllabus", "syllabus"),
  async (req, res) => {
    try {
      const id = routeParamInt(req.params.id);
      await db.delete(syllabusTable).where(eq(syllabusTable.id, id));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete syllabus" });
    }
  },
);

export default router;