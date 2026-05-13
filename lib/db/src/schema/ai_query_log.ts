import { pgTable, serial, text, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aiQueryLog = pgTable("ai_query_log", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  language: text("language").notNull().default("en"),
  city: text("city"),
  mode: text("mode"),
  answer: text("answer"),
  model: text("model").notNull().default("gpt-4.1-mini"),
  latencyMs: integer("latency_ms"),
  sources: jsonb("sources").$type<Array<{ name: string; url: string; retrievedAt: string }>>(),
  conversationId: integer("conversation_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiQueryLogSchema = createInsertSchema(aiQueryLog).omit({ id: true, createdAt: true });
export type InsertAiQueryLog = z.infer<typeof insertAiQueryLogSchema>;
export type AiQueryLogEntry = typeof aiQueryLog.$inferSelect;
