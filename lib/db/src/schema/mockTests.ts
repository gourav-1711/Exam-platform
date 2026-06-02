import { pgTable, serial, text, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const mockTestsTable = pgTable("mock_tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  durationMins: integer("duration_mins").notNull().default(60),
  questionCount: integer("question_count").notNull().default(100),
  maxMarks: integer("max_marks").notNull().default(100),
  negativeMarking: real("negative_marking").notNull().default(0.25),
  isFeatured: boolean("is_featured").notNull().default(false),
});

export const insertMockTestSchema = createInsertSchema(mockTestsTable).omit({ id: true });
export type InsertMockTest = typeof mockTestsTable.$inferInsert;
export type MockTest = typeof mockTestsTable.$inferSelect;