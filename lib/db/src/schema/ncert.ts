import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ncertBooksTable = pgTable("ncert_books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  classNum: integer("class_num").notNull(),
  subject: text("subject").notNull(),
  medium: text("medium").notNull().default("English"),
  readUrl: text("read_url"),
  downloadUrl: text("download_url"),
});

export const insertNcertBookSchema = createInsertSchema(ncertBooksTable).omit({ id: true });
export type InsertNcertBook = z.infer<typeof insertNcertBookSchema>;
export type NcertBook = typeof ncertBooksTable.$inferSelect;
