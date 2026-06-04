// lib/db/src/schema/dailyQuiz.ts
import { pgTable, serial, text, date, time, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const dailyQuizzes = pgTable('daily_quizzes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  scheduledDate: date('scheduled_date').notNull(),
  scheduledTime: time('scheduled_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(30),
  totalQuestions: integer('total_questions').notNull(),
  questionIds: integer('question_ids').array().notNull(),
  isPublished: boolean('is_published').default(false),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});