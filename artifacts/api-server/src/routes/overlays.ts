import { Router } from "express";
import { db, databaseConfigured, districtsTable, overlayDataTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getOverlay, overlayMetadata } from "../lib/city-data";

const router = Router();

router.get("/overlays/:type", async (req, res) => {
  const { type } = req.params;
  if (!overlayMetadata[type]) {
    res.status(400).json({ error: `Unknown overlay type: ${type}` });
    return;
  }

  if (!databaseConfigured) {
    res.json(getOverlay(type));
    return;
  }

  try {
    const features = await db.select().from(overlayDataTable).where(eq(overlayDataTable.overlayType, type));
    const fallback = getOverlay(type);

    if (features.length === 0) {
      res.json(fallback);
      return;
    }

    const districts = await db.select().from(districtsTable);
    const cityByDistrictId = new Map(districts.map((district) => [district.id, district.city]));
    const meta = overlayMetadata[type];
    const lastUpdated = features[0]?.lastUpdated?.toISOString() ?? new Date().toISOString();

    res.json({
      type,
      features: features.map((f) => ({
        id: String(f.id),
        lat: f.lat,
        lng: f.lng,
        value: f.value,
        label: f.label,
        category: f.category,
        city: f.city || (typeof f.districtId === "number" ? cityByDistrictId.get(f.districtId) : undefined) || null,
        districtId: f.districtId,
      })),
      metadata: {
        label: meta.label,
        labelLt: meta.labelLt,
        unit: meta.unit ?? null,
        source: meta.source,
        lastUpdated,
      },
    });
  } catch {
    res.json(getOverlay(type));
  }
});

export default router;
