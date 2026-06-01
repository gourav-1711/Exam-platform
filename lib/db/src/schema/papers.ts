import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const previousYearPapersTable = pgTable("previous_year_papers", {
  id: serial("id").primaryKey(),
  examName: text("exam_name").notNull(),
  shiftName: text("shift_name").notNull(),
  year: integer("year").notNull(),
  questionPaperUrl: text("question_paper_url"),
  answerKeyUrl: text("answer_key_url"),
});

export const insertPreviousYearPaperSchema = createInsertSchema(previousYearPapersTable).omit({ id: true });
export type InsertPreviousYearPaper = z.infer<typeof insertPreviousYearPaperSchema>;
export type PreviousYearPaper = typeof previousYearPapersTable.$inferSelect;

export const syllabusTable = pgTable("syllabus", {
  id: serial("id").primaryKey(),
  examName: text("exam_name").notNull(),
  readUrl: text("read_url"),
  downloadUrl: text("download_url"),
});

export const insertSyllabusSchema = createInsertSchema(syllabusTable).omit({ id: true });
export type InsertSyllabus = z.infer<typeof insertSyllabusSchema>;
export type Syllabus = typeof syllabusTable.$inferSelect;
