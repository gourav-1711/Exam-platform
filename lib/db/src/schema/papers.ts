import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const previousYearPapersTable = pgTable("previous_year_papers", {
  id: serial("id").primaryKey(),
  examName: text("exam_name").notNull(),
  shiftName: text("shift_name").notNull(),
  year: integer("year").notNull(),
  subject: text("subject"),
  subjectId: integer("subject_id"),
  questionPaperUrl: text("question_paper_url"),
  answerKeyUrl: text("answer_key_url"),
  answerKeyPdf: text("answer_key_pdf"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPreviousYearPaperSchema = createInsertSchema(previousYearPapersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPreviousYearPaper = typeof previousYearPapersTable.$inferInsert;
export type PreviousYearPaper = typeof previousYearPapersTable.$inferSelect;