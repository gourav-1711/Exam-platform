import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const pyqSubjectsTable = pgTable("pyq_subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  questionCount: integer("question_count").notNull().default(0),
});

export const insertPyqSubjectSchema = createInsertSchema(pyqSubjectsTable).omit({ id: true });
export type InsertPyqSubject = typeof pyqSubjectsTable.$inferInsert;
export type PyqSubject = typeof pyqSubjectsTable.$inferSelect;