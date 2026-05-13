import { pgTable, serial, text, jsonb, timestamp, integer } from "drizzle-orm/pg-core";

export const dataSourceCache = pgTable("data_source_cache", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  dataType: text("data_type").notNull(),
  city: text("city").notNull(),
  payload: jsonb("payload").notNull(),
  recordCount: integer("record_count").notNull().default(0),
  fetchedAt: timestamp("fetched_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});
