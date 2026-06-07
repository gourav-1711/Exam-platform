import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { questionsTable } from "./quizzes";

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  examCategory: text("exam_category").default("General"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subjectsRelations = relations(subjects, ({ many }) => ({
  questions: many(questionsTable),
}));

export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSubject = typeof subjects.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
