import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { districtsTable } from "./districts";

export const overlayDataTable = pgTable("overlay_data", {
  id: serial("id").primaryKey(),
  overlayType: text("overlay_type").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  value: real("value"),
  label: text("label"),
  category: text("category"),
  city: text("city").notNull().default("vilnius"),
  districtId: integer("district_id").references(() => districtsTable.id),
  source: text("source").notNull().default("openstreetmap"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertOverlayDataSchema = createInsertSchema(overlayDataTable).omit({ id: true, lastUpdated: true });
export type InsertOverlayData = z.infer<typeof insertOverlayDataSchema>;
export type OverlayData = typeof overlayDataTable.$inferSelect;
