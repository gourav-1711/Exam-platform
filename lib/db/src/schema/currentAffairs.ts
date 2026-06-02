import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const currentAffairsTable = pgTable("current_affairs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("General"),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
});

export const insertCurrentAffairSchema = createInsertSchema(currentAffairsTable).omit({ id: true });
export type InsertCurrentAffair = z.infer<typeof insertCurrentAffairSchema>;
export type CurrentAffair = typeof currentAffairsTable.$inferSelect;