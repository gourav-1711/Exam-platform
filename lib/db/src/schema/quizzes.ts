import { pgTable, serial, text, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { subjects } from "./subjects";

export const quizzesTable = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  durationMins: integer("duration_mins").notNull().default(10),
  questionCount: integer("question_count").notNull().default(0),
  negativeMarking: real("negative_marking").notNull().default(0.25),
  status: text("status").notNull().default("ongoing"),
  instructions: text("instructions").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertQuizSchema = createInsertSchema(quizzesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertQuiz = typeof quizzesTable.$inferInsert;
export type Quiz = typeof quizzesTable.$inferSelect;

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id"),
  subjectId: integer("subject_id").references(() => subjects.id, { onDelete: "set null" }),
  pyqSubjectId: integer("pyq_subject_id"),
  classNum: integer("class_num"),
  subject: text("subject"),
  medium: text("medium"),
  type: text("type").notNull().default("quiz"),
  questionType: text("question_type").default("single"),
  text: text("text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctIndex: integer("correct_index").notNull(),
  explanation: text("explanation"),
  examLabel: text("exam_label"),
  difficulty: text("difficulty").default("medium"),
  chapter: text("chapter"),
  tags: text("tags"),
  marks: real("marks").default(1),
  negativeMarking: real("negative_marks").default(0),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const questionsRelations = relations(questionsTable, ({ one }) => ({
  subject: one(subjects, {
    fields: [questionsTable.subjectId],
    references: [subjects.id],
  }),
}));

export const insertQuestionSchema = createInsertSchema(questionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertQuestion = typeof questionsTable.$inferInsert;
export type Question = typeof questionsTable.$inferSelect;
