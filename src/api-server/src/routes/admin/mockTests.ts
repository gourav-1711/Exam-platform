import { Router } from "express";
import { db } from "../../lib/db";
import { mockTestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { logAdminActivity } from "../../middleware/adminMiddleware";
import { routeParamInt } from "../../lib/routeParams";

const mockTestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  durationMins: z.coerce.number().int().min(1).default(60),
  questionCount: z.coerce.number().int().min(0).default(100),
  maxMarks: z.coerce.number().int().min(1).default(100),
  negativeMarking: z.coerce.number().min(0).default(0.25),
  questionIds: z.array(z.number()).optional(),
  subjectId: z.coerce.number().optional(),
  difficulty: z.string().optional(),
  class: z.coerce.number().optional(),
  medium: z.string().optional(),
  isFeatured: z.coerce.boolean().default(false),
});

const router = Router();

router.get("/mock-tests", async (req, res): Promise<any> => {
  try {
    const mockTests = await db.select().from(mockTestsTable);
    return res.json(mockTests);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch mock tests" });
  }
});

router.get("/mock-tests/:id", async (req, res): Promise<any> => {
  try {
    const id = routeParamInt(req.params.id);
    const [test] = await db
      .select()
      .from(mockTestsTable)
      .where(eq(mockTestsTable.id, id));
    if (!test) return res.status(404).json({ error: "Mock test not found" });
    return res.json(test);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch mock test" });
  }
});

router.post(
  "/mock-tests",
  logAdminActivity("create_mock_test", "mock_test"),
  async (req, res): Promise<any> => {
    try {
      const parsed = mockTestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      }

      const [test] = await db
        .insert(mockTestsTable)
        .values(parsed.data)
        .returning();

      return res.status(201).json(test);
    } catch (err) {
      return res.status(500).json({ error: "Failed to create mock test" });
    }
  },
);

router.patch(
  "/mock-tests/:id",
  logAdminActivity("update_mock_test", "mock_test"),
  async (req, res): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      const parsed = mockTestSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      }
      const [updated] = await db
        .update(mockTestsTable)
        .set(parsed.data)
        .where(eq(mockTestsTable.id, id))
        .returning();

      if (!updated)
        return res.status(404).json({ error: "Mock test not found" });

      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ error: "Failed to update mock test" });
    }
  },
);

router.delete(
  "/mock-tests/:id",
  logAdminActivity("delete_mock_test", "mock_test"),
  async (req, res): Promise<any> => {
    try {
      const id = routeParamInt(req.params.id);
      await db.delete(mockTestsTable).where(eq(mockTestsTable.id, id));
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete mock test" });
    }
  },
);

export default router;
