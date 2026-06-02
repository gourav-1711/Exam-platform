import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const studyNotesTable = pgTable("study_notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  medium: text("medium").notNull().default("English"),
  downloadUrl: text("download_url"),
  readUrl: text("read_url"),
});

export const insertStudyNoteSchema = createInsertSchema(studyNotesTable).omit({ id: true });
export type InsertStudyNote = typeof studyNotesTable.$inferInsert;
export type StudyNote = typeof studyNotesTable.$inferSelect;