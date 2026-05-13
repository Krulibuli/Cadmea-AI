import { Router } from "express";
import { db, databaseConfigured, districtScoresTable, districtsTable, poisTable } from "@workspace/db";
import { platformSummary, rankDistricts } from "../lib/city-data";

const router = Router();

router.get("/stats/summary", async (_req, res) => {
  if (!databaseConfigured) {
    res.json(platformSummary());
    return;
  }

  try {
    const districts = await db.select().from(districtsTable);
    const scores = await db.select().from(districtScoresTable);
    const pois = await db.select().from(poisTable);

    if (districts.length === 0 || scores.length === 0) {
      res.json(platformSummary());
      return;
    }

    const cities = [...new Set(districts.map((d) => d.city))];
    const avgOverall = districts.reduce((sum, d) => sum + (d.overallScore ?? 0), 0) / (districts.length || 1);
    const topSafe = [...scores].sort((a, b) => b.safety - a.safety)[0];
    const topFamily = [...scores].sort((a, b) => b.family - a.family)[0];
    const topAffordable = [...scores].sort((a, b) => b.affordability - a.affordability)[0];
    const topEnv = [...scores].sort((a, b) => b.environment - a.environment)[0];
    const getDistrictName = (id: number) => districts.find((d) => d.id === id)?.name ?? "Unknown";

    res.json({
      totalDistricts: districts.length,
      totalCities: cities.length,
      totalPois: pois.length,
      avgOverallScore: Math.round(avgOverall * 10) / 10,
      topSafeDistrict: topSafe ? getDistrictName(topSafe.districtId) : "N/A",
      topFamilyDistrict: topFamily ? getDistrictName(topFamily.districtId) : "N/A",
      topAffordableDistrict: topAffordable ? getDistrictName(topAffordable.districtId) : "N/A",
      topEnvironmentDistrict: topEnv ? getDistrictName(topEnv.districtId) : "N/A",
      lastDataRefresh: new Date().toISOString(),
    });
  } catch {
    res.json(platformSummary());
  }
});

router.get("/stats/top-districts", async (req, res) => {
  const { scoreType = "overall", limit = "5" } = req.query as { scoreType?: string; limit?: string };
  const lim = Math.min(parseInt(limit, 10) || 5, 20);

  if (!databaseConfigured) {
    res.json(rankDistricts(scoreType, lim));
    return;
  }

  try {
    const districts = await db.select().from(districtsTable);
    const scores = await db.select().from(districtScoresTable);

    if (districts.length === 0 || scores.length === 0) {
      res.json(rankDistricts(scoreType, lim));
      return;
    }

    const ranked = scores
      .map((s) => {
        const d = districts.find((district) => district.id === s.districtId);
        const numericScores: Record<string, number> = {
          safety: s.safety,
          family: s.family,
          affordability: s.affordability,
          environment: s.environment,
          transport: s.transport,
          tourism: s.tourism,
          walkability: s.walkability,
          overall: s.overall,
        };
        const scoreValue = numericScores[scoreType] ?? s.overall;
        return { district: d, score: scoreValue };
      })
      .filter((r) => r.district)
      .sort((a, b) => b.score - a.score)
      .slice(0, lim);

    res.json(ranked.map((r, idx) => ({
      rank: idx + 1,
      district: {
        id: r.district!.id,
        name: r.district!.name,
        nameLt: r.district!.nameLt,
        city: r.district!.city,
        population: r.district!.population,
        areaKm2: r.district!.areaKm2,
        lat: r.district!.lat,
        lng: r.district!.lng,
        overallScore: r.district!.overallScore,
        description: r.district!.description,
        descriptionLt: r.district!.descriptionLt,
      },
      score: r.score,
      scoreType,
    })));
  } catch {
    res.json(rankDistricts(scoreType, lim));
  }
});

export default router;
