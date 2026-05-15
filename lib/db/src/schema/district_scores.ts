import { pgTable, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { districtsTable } from "./districts";

export const districtScoresTable = pgTable("district_scores", {
  id: serial("id").primaryKey(),
  districtId: integer("district_id").notNull().references(() => districtsTable.id),
  safety: real("safety").notNull().default(5.0),
  family: real("family").notNull().default(5.0),
  affordability: real("affordability").notNull().default(5.0),
  environment: real("environment").notNull().default(5.0),
  transport: real("transport").notNull().default(5.0),
  tourism: real("tourism").notNull().default(5.0),
  walkability: real("walkability").notNull().default(5.0),
  overall: real("overall").notNull().default(5.0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDistrictScoresSchema = createInsertSchema(districtScoresTable).omit({ id: true, updatedAt: true });
export type InsertDistrictScores = z.infer<typeof insertDistrictScoresSchema>;
export type DistrictScores = typeof districtScoresTable.$inferSelect;
