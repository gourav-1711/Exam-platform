import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const supportMessagesTable = pgTable("support_messages", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  sender: text("sender").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSupportMessageSchema = createInsertSchema(supportMessagesTable).omit({ id: true, createdAt: true });
export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;
export type SupportMessage = typeof supportMessagesTable.$inferSelect;
