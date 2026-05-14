import { Router } from "express";
import { db, databaseConfigured, poisTable } from "@workspace/db";
import { listPois } from "../lib/city-data";

const router = Router();

router.get("/pois", async (req, res) => {
  const { city = "Vilnius", category } = req.query as { city?: string; category?: string };

  if (!databaseConfigured) {
    res.json(listPois(city, category));
    return;
  }

  try {
    const normalizedCity = normalizeCity(city);
    const allPois = await db.select().from(poisTable);
    const pois = allPois.filter((poi) => {
      const cityMatches = !normalizedCity || normalizedCity === "any" || normalizedCity === "all" || normalizeCity(poi.city ?? "") === normalizedCity;
      const categoryMatches = !category || poi.category === category;
      return cityMatches && categoryMatches;
    });

    if (allPois.length === 0 || pois.length === 0) {
      res.json(listPois(city, category));
      return;
    }

    res.json(pois.map((p) => ({
      id: p.id,
      name: p.name,
      nameLt: p.nameLt,
      category: p.category,
      lat: p.lat,
      lng: p.lng,
      city: p.city,
      description: p.description,
      descriptionLt: p.descriptionLt,
      rating: p.rating,
      districtId: p.districtId,
    })));
  } catch {
    res.json(listPois(city, category));
  }
});

function normalizeCity(value = "") {
  return value
    .toLocaleLowerCase("lt-LT")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export default router;
