import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { districtsTable } from "./districts";

export const poisTable = pgTable("pois", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameLt: text("name_lt"),
  category: text("category").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  city: text("city").notNull().default("vilnius"),
  description: text("description"),
  descriptionLt: text("description_lt"),
  rating: real("rating"),
  districtId: integer("district_id").references(() => districtsTable.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPoiSchema = createInsertSchema(poisTable).omit({ id: true, createdAt: true });
export type InsertPoi = z.infer<typeof insertPoiSchema>;
export type Poi = typeof poisTable.$inferSelect;
