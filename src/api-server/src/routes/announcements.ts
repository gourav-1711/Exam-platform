import { Router } from "express";
import { db } from "../db";
import { announcementsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/announcements", async (req, res) => {
  try {
    const announcements = await db
      .select()
      .from(announcementsTable)
      .where(eq(announcementsTable.isActive, true))
      .orderBy(announcementsTable.createdAt);
    res.json(announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

export default router;
