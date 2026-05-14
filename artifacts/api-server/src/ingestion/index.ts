/**
 * Ingestion orchestrator — coordinates all public data source adapters.
 * Normalizes raw records, persists to DB (overlayDataTable, poisTable),
 * and upserts to data_source_cache for freshness tracking.
 */

import { db } from "@workspace/db";
import { overlayDataTable, poisTable, dataSourceCache } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { fetchLithuaniaAirQuality, type AqReading } from "./openaq";
import { fetchOsmFeatures, type OsmFeature } from "./overpass";
import { fetchVilniusOpenData } from "./vilnius-open-data";

export interface IngestionResult {
  source: string;
  city: string;
  recordsIngested: number;
  skipped: number;
  durationMs: number;
  citations: Array<{ name: string; url: string; retrievedAt: string }>;
  error?: string;
}

const CITIES = ["vilnius", "kaunas", "klaipeda"];

/** Upsert air quality readings into overlay_data */
async function ingestAirQuality(): Promise<IngestionResult> {
  const start = Date.now();
  const citations: IngestionResult["citations"] = [];
  let ingested = 0;
  let skipped = 0;

  try {
    const { readings, source } = await fetchLithuaniaAirQuality();
    citations.push(source);

    // Group by city and store aggregate
    const byCityParam = new Map<string, AqReading[]>();
    for (const r of readings) {
      const key = `${r.city}:${r.parameter}`;
      if (!byCityParam.has(key)) byCityParam.set(key, []);
      byCityParam.get(key)!.push(r);
    }

    for (const [key, group] of byCityParam) {
      const [city] = key.split(":");
      const avg = group.reduce((sum, r) => sum + r.value, 0) / group.length;
      try {
        await db.insert(overlayDataTable).values({
          overlayType: "air_quality",
          lat: group[0].lat,
          lng: group[0].lng,
          value: Math.round(avg * 10) / 10,
          label: `${group[0].parameter.toUpperCase()} ${avg.toFixed(1)} ${group[0].unit}`,
          category: group[0].parameter,
          city,
          source: source.name,
        });
        ingested++;
      } catch {
        skipped++;
      }
    }

    // Store raw payload in cache
    await upsertCache("openaq", "air_quality", "lithuania", readings, source.retrievedAt);
  } catch (err) {
    return { source: "openaq", city: "all", recordsIngested: 0, skipped: 0, durationMs: Date.now() - start, citations, error: String(err) };
  }

  return { source: "openaq", city: "all", recordsIngested: ingested, skipped, durationMs: Date.now() - start, citations };
}

/** Ingest OSM POIs for all Lithuanian cities */
async function ingestOsmPois(city: string): Promise<IngestionResult> {
  const start = Date.now();
  const citations: IngestionResult["citations"] = [];
  let ingested = 0;
  let skipped = 0;

  try {
    const { features, source } = await fetchOsmFeatures(city);
    citations.push(source);

    const CATEGORY_MAP: Record<string, string> = {
      school: "education",
      hospital: "healthcare",
      park: "green_space",
      bus_stop: "transport",
      tram_stop: "transport",
      supermarket: "shopping",
      restaurant: "dining",
      bicycle_path: "cycling",
    };

    for (const f of features.slice(0, 200)) {
      try {
        await db.insert(poisTable).values({
          name: f.name ?? `${f.type} (OSM ${f.osmId})`,
          category: CATEGORY_MAP[f.type] ?? f.type,
          lat: f.lat,
          lng: f.lng,
          city,
          description: f.tags.description ?? null,
        }).onConflictDoNothing();
        ingested++;
      } catch {
        skipped++;
      }
    }

    await upsertCache("overpass", "pois", city, features, source.retrievedAt);
  } catch (err) {
    return { source: "overpass", city, recordsIngested: 0, skipped: 0, durationMs: Date.now() - start, citations, error: String(err) };
  }

  return { source: "overpass", city, recordsIngested: ingested, skipped, durationMs: Date.now() - start, citations };
}

/** Ingest Vilnius Open Data datasets */
async function ingestVilniusData(): Promise<IngestionResult> {
  const start = Date.now();
  const citations: IngestionResult["citations"] = [];
  let ingested = 0;
  let skipped = 0;

  try {
    const { datasets, source } = await fetchVilniusOpenData();
    citations.push(source);

    for (const ds of datasets) {
      try {
        await upsertCache("vilnius_open_data", ds.datasetId, "vilnius", ds.records, ds.retrievedAt);
        ingested += ds.records.length;
      } catch {
        skipped++;
      }
    }
  } catch (err) {
    return { source: "vilnius_open_data", city: "vilnius", recordsIngested: 0, skipped: 0, durationMs: Date.now() - start, citations, error: String(err) };
  }

  return { source: "vilnius_open_data", city: "vilnius", recordsIngested: ingested, skipped, durationMs: Date.now() - start, citations };
}

/** Upsert a cache record for freshness tracking */
async function upsertCache(
  source: string,
  dataType: string,
  city: string,
  payload: unknown,
  fetchedAt?: string,
): Promise<void> {
  const expires = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6h TTL
  await db.execute(
    sql`INSERT INTO data_source_cache (source, data_type, city, payload, record_count, fetched_at, expires_at)
        VALUES (${source}, ${dataType}, ${city}, ${JSON.stringify(payload)}::jsonb, ${Array.isArray(payload) ? payload.length : 1}, ${fetchedAt ?? new Date().toISOString()}, ${expires.toISOString()})
        ON CONFLICT (source, data_type, city) DO UPDATE
        SET payload = EXCLUDED.payload,
            record_count = EXCLUDED.record_count,
            fetched_at = EXCLUDED.fetched_at,
            expires_at = EXCLUDED.expires_at`
  );
}

/** Check if a cached source is still fresh */
export async function isCacheFresh(source: string, dataType: string, city: string): Promise<boolean> {
  const [row] = await db
    .select()
    .from(dataSourceCache)
    .where(
      and(
        eq(dataSourceCache.source, source),
        eq(dataSourceCache.dataType, dataType),
        eq(dataSourceCache.city, city),
      )
    );
  if (!row?.expiresAt) return false;
  return row.expiresAt > new Date();
}

/** Full ingestion run — can be triggered via API or on startup */
export async function runFullIngestion(): Promise<{
  results: IngestionResult[];
  allCitations: Array<{ name: string; url: string; retrievedAt: string }>;
  totalIngested: number;
  durationMs: number;
}> {
  const globalStart = Date.now();
  const results: IngestionResult[] = [];

  // Air quality (all cities at once)
  const aqResult = await ingestAirQuality();
  results.push(aqResult);

  // OSM POIs per city
  for (const city of CITIES) {
    const osmResult = await ingestOsmPois(city);
    results.push(osmResult);
  }

  // Vilnius Open Data
  const vilResult = await ingestVilniusData();
  results.push(vilResult);

  const allCitations = results.flatMap((r) => r.citations);
  const totalIngested = results.reduce((sum, r) => sum + r.recordsIngested, 0);

  return {
    results,
    allCitations,
    totalIngested,
    durationMs: Date.now() - globalStart,
  };
}

export { ingestAirQuality, ingestOsmPois, ingestVilniusData };
