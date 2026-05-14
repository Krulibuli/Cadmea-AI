import { Router } from "express";
import {
  ALL_DISCIPLINES,
  ALL_FACILITY_TYPES,
  ALL_AGE_GROUPS,
  ALL_ACCESSIBILITY,
  disciplineByDistrict,
  districtKpis,
  getAllFacilities,
  getFacility,
  getOccupancy,
  getRecommendations,
  platformSummary,
  VILNIUS_DISTRICT_NAMES,
} from "../lib/sports-data";

const router = Router();

router.get("/sports/facilities", (req, res) => {
  const { district, type, discipline, source, status, q, ageGroup, accessibility, entryType, bookingProvider } =
    req.query as Record<string, string | undefined>;
  let list = getAllFacilities();
  if (district) list = list.filter((f) => f.district === district);
  if (type) list = list.filter((f) => f.type === type);
  if (discipline) list = list.filter((f) => f.disciplines.includes(discipline as never));
  if (source) list = list.filter((f) => f.source === source);
  if (status) list = list.filter((f) => f.status === status);
  if (ageGroup) list = list.filter((f) => f.ageGroups.includes(ageGroup as never));
  if (accessibility) list = list.filter((f) => f.accessibility.includes(accessibility as never));
  if (entryType) list = list.filter((f) => f.entryType === entryType);
  if (bookingProvider) list = list.filter((f) => f.bookingProvider === bookingProvider);
  if (q) {
    const needle = q.toLowerCase();
    list = list.filter(
      (f) =>
        f.name.toLowerCase().includes(needle) ||
        f.address.toLowerCase().includes(needle) ||
        f.district.toLowerCase().includes(needle),
    );
  }
  res.json(list);
});

router.get("/sports/facilities/:id", (req, res) => {
  const f = getFacility(req.params.id);
  if (!f) {
    res.status(404).json({ error: "Facility not found" });
    return;
  }
  res.json(f);
});

router.get("/sports/facilities/:id/occupancy", (req, res) => {
  const occ = getOccupancy(req.params.id);
  if (!occ) {
    res.status(404).json({ error: "Facility not found" });
    return;
  }
  res.json(occ);
});

router.get("/sports/disciplines-by-district", (_req, res) => {
  res.json(disciplineByDistrict());
});

router.get("/sports/district-kpis", (_req, res) => {
  res.json(districtKpis());
});

router.get("/sports/recommendations", (req, res) => {
  const { district, category, priority } = req.query as Record<string, string | undefined>;
  let list = getRecommendations();
  if (district) list = list.filter((r) => r.district === district);
  if (category) list = list.filter((r) => r.category === category);
  if (priority) list = list.filter((r) => r.priority === priority);
  res.json(list);
});

router.get("/sports/summary", (_req, res) => {
  res.json(platformSummary());
});

router.get("/sports/meta", (_req, res) => {
  res.json({
    districts: VILNIUS_DISTRICT_NAMES,
    disciplines: ALL_DISCIPLINES,
    facilityTypes: ALL_FACILITY_TYPES,
    ageGroups: ALL_AGE_GROUPS,
    accessibility: ALL_ACCESSIBILITY,
    bookingProviders: ["active_vilnius", "sporto_rumai", "operator", "google_calendar", "none"],
    entryTypes: ["free", "paid", "membership", "mixed"],
    dataSources: [
      { name: "Vilnius Open Data Portal", url: "https://opendata.vilnius.lt/" },
      { name: "Open Vilnius — Sports & leisure", url: "https://open.vilnius.lt/category/18" },
      { name: "Vilnius GIS — Sports Infrastructure", url: "https://maps.vilnius.lt/" },
      { name: "ActiveVilnius booking platform", url: "https://www.activevilnius.lt/" },
      { name: "Sporto Rūmai", url: "https://www.sportorumai.lt/" },
      { name: "OpenStreetMap (Overpass)", url: "https://overpass-turbo.eu/" },
    ],
  });
});

export default router;
