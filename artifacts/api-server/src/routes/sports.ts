import { Router } from "express";
import {
  ALL_DISCIPLINES,
  ALL_FACILITY_TYPES,
  disciplineByDistrict,
  districtKpis,
  getAllFacilities,
  getFacility,
  getRecommendations,
  platformSummary,
  VILNIUS_DISTRICT_NAMES,
} from "../lib/sports-data";

const router = Router();

router.get("/sports/facilities", (req, res) => {
  const { district, type, discipline, source, status, q } = req.query as Record<string, string | undefined>;
  let list = getAllFacilities();
  if (district) list = list.filter((f) => f.district === district);
  if (type) list = list.filter((f) => f.type === type);
  if (discipline) list = list.filter((f) => f.disciplines.includes(discipline as never));
  if (source) list = list.filter((f) => f.source === source);
  if (status) list = list.filter((f) => f.status === status);
  if (q) {
    const needle = q.toLowerCase();
    list = list.filter((f) => f.name.toLowerCase().includes(needle) || f.address.toLowerCase().includes(needle) || f.district.toLowerCase().includes(needle));
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
    dataSources: [
      { name: "Vilnius Open Data Portal", url: "https://opendata.vilnius.lt/" },
      { name: "Vilnius GIS — Sports Infrastructure", url: "https://maps.vilnius.lt/" },
      { name: "OpenStreetMap (Overpass)", url: "https://overpass-turbo.eu/" },
      { name: "Lithuanian Open Data Portal", url: "https://data.gov.lt/" },
      { name: "City of Vilnius — Sports facilities", url: "https://vilnius.lt/lt/sportas/" },
    ],
  });
});

export default router;
