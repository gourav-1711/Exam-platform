import {
  pgTable, serial, text, integer, real, boolean, timestamp, jsonb, index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const examsTable = pgTable("exams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  durationMins: integer("duration_mins").notNull().default(60),
  totalMarks: integer("total_marks").notNull().default(100),
  passingMarks: integer("passing_marks").notNull().default(40),
  negativeMarking: real("negative_marking").notNull().default(0),
  instructions: text("instructions"),
  status: text("status").notNull().default("draft"),
  category: text("category"),
  createdBy: text("created_by"),
  isArchived: boolean("is_archived").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("exams_status_idx").on(t.status), index("exams_subject_idx").on(t.subject)]);

export const examQuestionsTable = pgTable("exam_questions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").notNull(),
  questionId: integer("question_id").notNull(),
  orderNum: integer("order_num").notNull().default(0),
  marks: real("marks").notNull().default(1),
  negativeMarks: real("negative_marks").notNull().default(0),
}, (t) => [index("exam_questions_exam_idx").on(t.examId)]);

export const questionDraftsTable = pgTable("question_drafts", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id"),
  createdBy: text("created_by").notNull(),
  content: jsonb("content").notNull(),
  lastSavedAt: timestamp("last_saved_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("qdrafts_user_idx").on(t.createdBy)]);

export const examDraftsTable = pgTable("exam_drafts", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id"),
  createdBy: text("created_by").notNull(),
  content: jsonb("content").notNull(),
  lastSavedAt: timestamp("last_saved_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("edrafts_user_idx").on(t.createdBy)]);

export const studentAttemptsTable = pgTable("student_attempts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  examId: integer("exam_id"),
  quizId: integer("quiz_id"),
  score: real("score").notNull().default(0),
  totalMarks: real("total_marks").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
  wrongCount: integer("wrong_count").notNull().default(0),
  skippedCount: integer("skipped_count").notNull().default(0),
  timeTakenSecs: integer("time_taken_secs").notNull().default(0),
  isPassed: boolean("is_passed").notNull().default(false),
  attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
}, (t) => [index("attempts_user_idx").on(t.userId), index("attempts_exam_idx").on(t.examId)]);

export const activityLogsTable = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("activity_user_idx").on(t.userId), index("activity_action_idx").on(t.action)]);

export const adminNotificationsTable = pgTable("admin_notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  type: text("type").notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("admin_notif_user_idx").on(t.userId)]);

export const insertExamSchema = createInsertSchema(examsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuestionDraftSchema = createInsertSchema(questionDraftsTable).omit({ id: true, createdAt: true, lastSavedAt: true });
export const insertExamDraftSchema = createInsertSchema(examDraftsTable).omit({ id: true, createdAt: true, lastSavedAt: true });
export const insertActivityLogSchema = createInsertSchema(activityLogsTable).omit({ id: true, createdAt: true });

export type Exam = typeof examsTable.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;
export type QuestionDraft = typeof questionDraftsTable.$inferSelect;
export type ExamDraft = typeof examDraftsTable.$inferSelect;
export type StudentAttempt = typeof studentAttemptsTable.$inferSelect;
export type ActivityLog = typeof activityLogsTable.$inferSelect;
