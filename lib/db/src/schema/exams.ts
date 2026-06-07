import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { subjects } from "./subjects";

/**
 * Unified table for grouping questions into sets.
 * Used for both PYQ sets and NCERT MCQ sets.
 * type discriminator: 'pyq' | 'ncert'
 * For ncert type, classNum is required.
 */
export const examSetsTable = pgTable("exam_sets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull().default("pyq"),
  subjectId: integer("subject_id").references(() => subjects.id, { onDelete: "set null" }),
  classNum: integer("class_num"),
  medium: text("medium"),
  questionIds: integer("question_ids").array().notNull().default([]),
  totalQuestions: integer("total_questions").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const examSetsRelations = relations(examSetsTable, ({ one }) => ({
  subject: one(subjects, {
    fields: [examSetsTable.subjectId],
    references: [subjects.id],
  }),
}));

export const insertExamSetSchema = createInsertSchema(examSetsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertExamSet = typeof examSetsTable.$inferInsert;
export type ExamSet = typeof examSetsTable.$inferSelect;
