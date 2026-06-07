import {
  pgTable,
  serial,
  text,
  integer,
  real,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { subjects } from "./subjects";

export const mockTestsTable = pgTable("mock_tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  durationMins: integer("duration_mins").notNull().default(60),
  questionCount: integer("question_count").notNull().default(100),
  maxMarks: integer("max_marks").notNull().default(100),
  negativeMarking: real("negative_marking").notNull().default(0.25),
  questionIds: integer("question_ids").array().notNull().default([]),
  subjectId: integer("subject_id").references(() => subjects.id, { onDelete: "set null" }),
  difficulty: text("difficulty").default("medium"),
  class: integer("class"),
  medium: text("medium"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const mockTestsRelations = relations(mockTestsTable, ({ one }) => ({
  subject: one(subjects, {
    fields: [mockTestsTable.subjectId],
    references: [subjects.id],
  }),
}));

export const insertMockTestSchema = createInsertSchema(mockTestsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertMockTest = typeof mockTestsTable.$inferInsert;
export type MockTest = typeof mockTestsTable.$inferSelect;
