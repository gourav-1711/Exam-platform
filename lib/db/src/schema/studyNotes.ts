import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studyNotesTable = pgTable("study_notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  medium: text("medium").notNull().default("English"),
  downloadUrl: text("download_url"),
  readUrl: text("read_url"),
});

export const insertStudyNoteSchema = createInsertSchema(studyNotesTable).omit({ id: true });
export type InsertStudyNote = z.infer<typeof insertStudyNoteSchema>;
export type StudyNote = typeof studyNotesTable.$inferSelect;
