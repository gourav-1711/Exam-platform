import { Router } from "express";
import { db } from "../../lib/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logAdminActivity } from "../../middlewares/adminMiddleware";

const router = Router();

router.get("/settings", async (req, res) => {
  try {
    let [settings] = await db.select().from(settingsTable).limit(1);
    if (!settings) {
      // Seed default settings if empty
      [settings] = await db
        .insert(settingsTable)
        .values({
          siteName: "Manish Ki Pathshala",
          siteDescription: "Premium exam preparation platform",
          supportEmail: "support@manishkipathshala.com",
          supportPhone: "+919999999999",
          maintenanceMode: false,
          leaderboardEnabled: true,
          quizEnabled: true,
          currentAffairsEnabled: true,
          registrationEnabled: true,
        })
        .returning();
    }
    res.json({
      ...settings,
      updatedAt: settings.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.patch(
  "/settings",
  logAdminActivity("update_settings", "settings"),
  async (req, res) => {
    try {
      let [settings] = await db.select().from(settingsTable).limit(1);
      if (!settings) {
        [settings] = await db.insert(settingsTable).values({}).returning();
      }
      const [updated] = await db
        .update(settingsTable)
        .set({
          ...req.body,
          updatedAt: new Date(),
        })
        .where(eq(settingsTable.id, settings.id))
        .returning();

      res.json({
        ...updated,
        updatedAt: updated.updatedAt.toISOString(),
      });
    } catch (err) {
      req.log.error(err);
      res.status(500).json({ error: "Failed to update settings" });
    }
  },
);

export default router;
