import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("Manish Ki Pathshala"),
  siteDescription: text("site_description").notNull().default("Premium exam preparation platform"),
  supportEmail: text("support_email").notNull().default("support@manishkipathshala.com"),
  supportPhone: text("support_phone").notNull().default("+919999999999"),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  leaderboardEnabled: boolean("leaderboard_enabled").notNull().default(true),
  quizEnabled: boolean("quiz_enabled").notNull().default(true),
  currentAffairsEnabled: boolean("current_affairs_enabled").notNull().default(true),
  registrationEnabled: boolean("registration_enabled").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settingsTable);
export type Settings = typeof settingsTable.$inferSelect;
export type InsertSettings = typeof settingsTable.$inferInsert;