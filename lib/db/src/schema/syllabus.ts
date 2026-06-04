// lib/db/src/schema/syllabus.ts
import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const syllabus = pgTable("syllabus", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  topicName: text("topic_name").notNull(),
  subtopics: text("subtopics").array(),
  description: text("description"),
  examCategory: text("exam_category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Syllabus = typeof syllabus.$inferSelect;
export type InsertSyllabus = typeof syllabus.$inferInsert;
