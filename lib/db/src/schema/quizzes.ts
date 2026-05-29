import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quizzesTable = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  durationMins: integer("duration_mins").notNull().default(10),
  questionCount: integer("question_count").notNull().default(0),
  negativeMarking: real("negative_marking").notNull().default(0.25),
  status: text("status").notNull().default("ongoing"),
  instructions: text("instructions").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertQuizSchema = createInsertSchema(quizzesTable).omit({ id: true, createdAt: true });
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzesTable.$inferSelect;

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id"),
  pyqSubjectId: integer("pyq_subject_id"),
  classNum: integer("class_num"),
  subject: text("subject"),
  medium: text("medium"),
  type: text("type").notNull().default("quiz"),
  text: text("text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctIndex: integer("correct_index").notNull(),
  explanation: text("explanation"),
  examLabel: text("exam_label"),
});

export const insertQuestionSchema = createInsertSchema(questionsTable).omit({ id: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questionsTable.$inferSelect;
