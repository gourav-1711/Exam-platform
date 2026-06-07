import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const studyNotesTable = pgTable("study_notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  medium: text("medium").notNull().default("English"),
  url: text("url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStudyNoteSchema = createInsertSchema(studyNotesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStudyNote = typeof studyNotesTable.$inferInsert;
export type StudyNote = typeof studyNotesTable.$inferSelect;