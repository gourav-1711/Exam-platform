import { Router } from "express";
import { db } from "../../lib/db";
import { mockTestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logAdminActivity } from "../../middlewares/adminMiddleware";
import { routeParamInt } from "../../lib/routeParams";

const router = Router();

router.get("/mock-tests", async (req, res): Promise<any> => {
  try {
    const mockTests = await db.select().from(mockTestsTable);
    return res.json(mockTests);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch mock tests" });
  }
});

router.get("/mock-tests/:id", async (req, res): Promise<any> => {
  try {
    const id = routeParamInt(req.params.id);
    const [test] = await db.select().from(mockTestsTable).where(eq(mockTestsTable.id, id));
    if (!test) return res.status(404).json({ error: "Mock test not found" });
    return res.json(test);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch mock test" });
  }
});

router.post("/mock-tests", logAdminActivity("create_mock_test", "mock_test"), async (req, res): Promise<any> => {
  try {
    const { title, description, durationMins, questionCount, maxMarks, negativeMarking, isFeatured } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "title and description are required" });
    }

    const [test] = await db.insert(mockTestsTable).values({
      title,
      description,
      durationMins: durationMins !== undefined ? parseInt(durationMins) : 60,
      questionCount: questionCount !== undefined ? parseInt(questionCount) : 100,
      maxMarks: maxMarks !== undefined ? parseInt(maxMarks) : 100,
      negativeMarking: negativeMarking !== undefined ? parseFloat(negativeMarking) : 0.25,
      isFeatured: isFeatured !== undefined ? !!isFeatured : false,
    }).returning();

    return res.status(201).json(test);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to create mock test" });
  }
});

router.patch("/mock-tests/:id", logAdminActivity("update_mock_test", "mock_test"), async (req, res): Promise<any> => {
  try {
    const id = routeParamInt(req.params.id);
    const [updated] = await db.update(mockTestsTable)
      .set({
        ...req.body,
      })
      .where(eq(mockTestsTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Mock test not found" });

    return res.json(updated);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to update mock test" });
  }
});

router.delete("/mock-tests/:id", logAdminActivity("delete_mock_test", "mock_test"), async (req, res): Promise<any> => {
  try {
    const id = routeParamInt(req.params.id);
    await db.delete(mockTestsTable).where(eq(mockTestsTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to delete mock test" });
  }
});

export default router;