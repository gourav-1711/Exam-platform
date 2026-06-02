import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const pyqSubjectsTable = pgTable("pyq_subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  questionCount: integer("question_count").notNull().default(0),
});

export const insertPyqSubjectSchema = createInsertSchema(pyqSubjectsTable).omit({ id: true });
export type InsertPyqSubject = z.infer<typeof insertPyqSubjectSchema>;
export type PyqSubject = typeof pyqSubjectsTable.$inferSelect;