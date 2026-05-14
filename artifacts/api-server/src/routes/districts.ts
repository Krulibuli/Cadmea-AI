import { Router } from "express";
import { db, databaseConfigured } from "@workspace/db";
import { districtsTable, districtScoresTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import {
  compareDistricts as compareFallbackDistricts,
  getDistrict as getFallbackDistrict,
  listDistricts as listFallbackDistricts,
} from "../lib/city-data";

const router = Router();

type DbDistrict = typeof districtsTable.$inferSelect;
type DbScores = typeof districtScoresTable.$inferSelect;

type PublicScores = {
  districtId: number;
  safety: number;
  family: number;
  affordability: number;
  environment: number;
  transport: number;
  tourism: number;
  walkability: number;
  overall: number;
};

const DEFAULT_SCORE = 5;

function cleanNumber(value: unknown, fallback = DEFAULT_SCORE) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function fallbackScoresForDistrict(district: Pick<DbDistrict, "id" | "overallScore">): PublicScores {
  const overall = cleanNumber(district.overallScore, DEFAULT_SCORE);
  return {
    districtId: district.id,
    safety: overall,
    family: overall,
    affordability: overall,
    environment: overall,
    transport: overall,
    tourism: overall,
    walkability: overall,
    overall,
  };
}

function publicScores(scores: DbScores | undefined, district: Pick<DbDistrict, "id" | "overallScore">): PublicScores {
  if (!scores) return fallbackScoresForDistrict(district);
  return {
    districtId: scores.districtId ?? district.id,
    safety: cleanNumber(scores.safety, district.overallScore ?? DEFAULT_SCORE),
    family: cleanNumber(scores.family, district.overallScore ?? DEFAULT_SCORE),
    affordability: cleanNumber(scores.affordability, district.overallScore ?? DEFAULT_SCORE),
    environment: cleanNumber(scores.environment, district.overallScore ?? DEFAULT_SCORE),
    transport: cleanNumber(scores.transport, district.overallScore ?? DEFAULT_SCORE),
    tourism: cleanNumber(scores.tourism, district.overallScore ?? DEFAULT_SCORE),
    walkability: cleanNumber(scores.walkability, district.overallScore ?? DEFAULT_SCORE),
    overall: cleanNumber(scores.overall, district.overallScore ?? DEFAULT_SCORE),
  };
}

function publicDistrict(d: DbDistrict) {
  return {
    id: d.id,
    name: d.name,
    nameLt: d.nameLt,
    city: d.city,
    population: d.population,
    areaKm2: d.areaKm2,
    lat: d.lat,
    lng: d.lng,
    overallScore: d.overallScore,
    description: d.description,
    descriptionLt: d.descriptionLt,
  };
}

router.get("/districts", async (_req, res) => {
  if (!databaseConfigured) {
    res.json(listFallbackDistricts());
    return;
  }

  try {
    const districts = await db.select().from(districtsTable).orderBy(districtsTable.name);
    if (districts.length === 0) {
      res.json(listFallbackDistricts());
      return;
    }
    res.json(districts.map(publicDistrict));
  } catch (_err) {
    res.json(listFallbackDistricts());
  }
});

router.post("/districts/compare", async (req, res) => {
  try {
    const { districtIds } = req.body as { districtIds: number[] };
    if (!districtIds || !Array.isArray(districtIds) || districtIds.length < 2) {
      res.status(400).json({ error: "Provide 2-4 districtIds" });
      return;
    }
    const ids = districtIds.slice(0, 4);

    if (!databaseConfigured) {
      res.json(compareFallbackDistricts(ids));
      return;
    }

    const districts = await db.select().from(districtsTable).where(inArray(districtsTable.id, ids));
    const scores = await db.select().from(districtScoresTable).where(inArray(districtScoresTable.districtId, ids));

    if (districts.length === 0) {
      res.json(compareFallbackDistricts(ids));
      return;
    }

    const result = districts.map((d) => ({
      ...publicDistrict(d),
      scores: publicScores(scores.find((sc) => sc.districtId === d.id), d),
      highlights: d.description ? [d.description] : [],
      highlightsLt: d.descriptionLt ? [d.descriptionLt] : [],
    }));
    res.json(result);
  } catch (_err) {
    const { districtIds = [] } = req.body as { districtIds?: number[] };
    res.json(compareFallbackDistricts(Array.isArray(districtIds) ? districtIds : []));
  }
});

router.get("/districts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    if (!databaseConfigured) {
      const fallback = getFallbackDistrict(id);
      if (!fallback) {
        res.status(404).json({ error: "District not found" });
        return;
      }
      res.json(fallback);
      return;
    }

    const [district] = await db.select().from(districtsTable).where(eq(districtsTable.id, id));
    if (!district) {
      const fallback = getFallbackDistrict(id);
      if (!fallback) {
        res.status(404).json({ error: "District not found" });
        return;
      }
      res.json(fallback);
      return;
    }

    const [scores] = await db.select().from(districtScoresTable).where(eq(districtScoresTable.districtId, id));

    res.json({
      ...publicDistrict(district),
      scores: publicScores(scores, district),
      highlights: district.description ? [district.description] : [],
      highlightsLt: district.descriptionLt ? [district.descriptionLt] : [],
    });
  } catch (_err) {
    const id = parseInt(req.params.id, 10);
    const fallback = getFallbackDistrict(id);
    if (!fallback) {
      res.status(404).json({ error: "District not found" });
      return;
    }
    res.json(fallback);
  }
});

router.get("/districts/:id/scores", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    if (!databaseConfigured) {
      const fallback = getFallbackDistrict(id);
      if (!fallback) {
        res.status(404).json({ error: "Scores not found" });
        return;
      }
      res.json(fallback.scores);
      return;
    }

    const [district] = await db.select().from(districtsTable).where(eq(districtsTable.id, id));
    if (!district) {
      const fallback = getFallbackDistrict(id);
      if (!fallback) {
        res.status(404).json({ error: "Scores not found" });
        return;
      }
      res.json(fallback.scores);
      return;
    }

    const [scores] = await db.select().from(districtScoresTable).where(eq(districtScoresTable.districtId, id));
    res.json(publicScores(scores, district));
  } catch (_err) {
    const id = parseInt(req.params.id, 10);
    const fallback = getFallbackDistrict(id);
    if (!fallback) {
      res.status(404).json({ error: "Scores not found" });
      return;
    }
    res.json(fallback.scores);
  }
});

export default router;
