import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const districtsTable = pgTable("districts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameLt: text("name_lt").notNull(),
  city: text("city").notNull().default("vilnius"),
  population: integer("population"),
  areaKm2: real("area_km2"),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  overallScore: real("overall_score").notNull().default(5.0),
  description: text("description"),
  descriptionLt: text("description_lt"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDistrictSchema = createInsertSchema(districtsTable).omit({ id: true, createdAt: true });
export type InsertDistrict = z.infer<typeof insertDistrictSchema>;
export type District = typeof districtsTable.$inferSelect;
