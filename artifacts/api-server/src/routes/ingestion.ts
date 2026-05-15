import { Router, type Request, type Response, type NextFunction } from "express";
import { databaseConfigured, db } from "@workspace/db";
import { dataSourceCache } from "@workspace/db";
import { desc } from "drizzle-orm";
import { runFullIngestion, ingestAirQuality, isCacheFresh } from "../ingestion";
import { DATA_SOURCES, platformSummary } from "../lib/city-data";

const router = Router();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "";
const ADMIN_RATE_LIMIT_PER_MINUTE = Math.max(1, Number(process.env.ADMIN_RATE_LIMIT_PER_MINUTE ?? 20));
const adminRateBuckets = new Map<string, { count: number; resetAt: number }>();

function adminClientKey(req: Request) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function rateLimitAdmin(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = adminClientKey(req);
  const existing = adminRateBuckets.get(key);
  const bucket = existing && existing.resetAt > now ? existing : { count: 0, resetAt: now + 60_000 };
  bucket.count += 1;
  adminRateBuckets.set(key, bucket);

  if (bucket.count > ADMIN_RATE_LIMIT_PER_MINUTE) {
    res.status(429).json({ error: "Too many admin requests. Try again shortly." });
    return;
  }

  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!ADMIN_TOKEN) {
    res.status(503).json({
      error: "Admin API disabled",
      detail: "Set ADMIN_TOKEN in Replit Secrets, then call admin endpoints with x-admin-token or Authorization: Bearer <token>.",
    });
    return;
  }

  const headerToken = req.get("x-admin-token") ?? req.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (headerToken !== ADMIN_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}

router.use("/admin", rateLimitAdmin, requireAdmin);

/** POST /api/admin/ingest — trigger a full ingestion run */
router.post("/admin/ingest", async (_req, res) => {
  if (!databaseConfigured) {
    const summary = platformSummary();
    res.json({
      status: "fallback",
      totalIngested: summary.totalDistricts + summary.totalPois,
      durationMs: 0,
      sources: DATA_SOURCES.map((source) => ({ ...source, retrievedAt: new Date().toISOString() })),
      breakdown: [{ source: "embedded-public-data-model", city: "all", recordsIngested: summary.totalDistricts + summary.totalPois, skipped: 0, durationMs: 0, error: null }],
    });
    return;
  }

  try {
    const result = await runFullIngestion();
    res.json({
      status: "completed",
      totalIngested: result.totalIngested,
      durationMs: result.durationMs,
      sources: result.allCitations,
      breakdown: result.results.map((r) => ({
        source: r.source,
        city: r.city,
        recordsIngested: r.recordsIngested,
        skipped: r.skipped,
        durationMs: r.durationMs,
        error: r.error ?? null,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Ingestion failed", detail: String(err) });
  }
});

/** POST /api/admin/ingest/air-quality — ingest only air quality */
router.post("/admin/ingest/air-quality", async (_req, res) => {
  if (!databaseConfigured) {
    res.json({
      source: "embedded-air-quality-model",
      city: "all",
      recordsIngested: platformSummary().totalDistricts,
      skipped: 0,
      durationMs: 0,
      citations: DATA_SOURCES.filter((source) => /Environmental|OpenStreetMap/.test(source.name)).map((source) => ({ ...source, retrievedAt: new Date().toISOString() })),
    });
    return;
  }

  try {
    const result = await ingestAirQuality();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Air quality ingestion failed", detail: String(err) });
  }
});

/** GET /api/admin/cache — view data source cache freshness */
router.get("/admin/cache", async (_req, res) => {
  if (!databaseConfigured) {
    res.json(DATA_SOURCES.map((source) => ({
      source: source.name,
      dataType: "fallback",
      city: "all",
      recordCount: platformSummary().totalDistricts,
      fetchedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      fresh: true,
    })));
    return;
  }

  try {
    const entries = await db
      .select()
      .from(dataSourceCache)
      .orderBy(desc(dataSourceCache.fetchedAt));

    res.json(
      entries.map((e) => ({
        source: e.source,
        dataType: e.dataType,
        city: e.city,
        recordCount: e.recordCount,
        fetchedAt: e.fetchedAt,
        expiresAt: e.expiresAt,
        fresh: e.expiresAt ? e.expiresAt > new Date() : false,
      }))
    );
  } catch (_err) {
    res.status(500).json({ error: "Failed to fetch cache status" });
  }
});

/** GET /api/admin/cache/check?source=&type=&city= */
router.get("/admin/cache/check", async (req, res) => {
  if (!databaseConfigured) {
    res.json({ fresh: true });
    return;
  }

  try {
    const { source, type, city } = req.query as { source: string; type: string; city: string };
    if (!source || !type || !city) {
      res.status(400).json({ error: "source, type, and city are required" });
      return;
    }
    const fresh = await isCacheFresh(source, type, city);
    res.json({ fresh });
  } catch (_err) {
    res.status(500).json({ error: "Failed to check cache" });
  }
});

export default router;
