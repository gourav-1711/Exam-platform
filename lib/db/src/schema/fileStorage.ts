import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const ncertPdfsTable = pgTable('ncert_pdfs', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  classNumber: integer('class_number').notNull(),
  originalName: text('original_name').notNull(),
  cloudinaryUrl: text('cloudinary_url').notNull(),
  cloudinaryPublicId: text('cloudinary_public_id').notNull(),
  fileSize: integer('file_size').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

export const pypPdfsTable = pgTable('pyp_pdfs', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  year: integer('year').notNull(),
  examType: text('exam_type').notNull(),
  originalName: text('original_name').notNull(),
  cloudinaryUrl: text('cloudinary_url').notNull(),
  cloudinaryPublicId: text('cloudinary_public_id').notNull(),
  fileSize: integer('file_size').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

export const insertNcertPdfSchema = createInsertSchema(ncertPdfsTable);
export const insertPypPdfSchema = createInsertSchema(pypPdfsTable);

export type NcertPdf = typeof ncertPdfsTable.$inferSelect;
export type PypPdf = typeof pypPdfsTable.$inferSelect;
export type InsertNcertPdf = typeof ncertPdfsTable.$inferInsert;
export type InsertPypPdf = typeof pypPdfsTable.$inferInsert;
