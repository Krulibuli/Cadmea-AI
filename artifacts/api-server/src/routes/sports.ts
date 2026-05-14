import { Router } from "express";
import {
  ALL_DISCIPLINES,
  ALL_FACILITY_TYPES,
  ALL_AGE_GROUPS,
  ALL_ACCESSIBILITY,
  disciplineByDistrict,
  districtKpis,
  getAllFacilities,
  getDistrictMeta,
  getFacility,
  getOccupancy,
  getRecommendations,
  platformSummary,
  VILNIUS_DISTRICT_NAMES,
  type Discipline,
} from "../lib/sports-data";
import { getDistrictRecommendations, getDemandReport } from "../lib/demand-data";

const router = Router();

const DISCIPLINE_ALIASES: Record<string, Discipline> = {
  basketball: "basketball",
  krepsinis: "basketball",
  "krepšinis": "basketball",
  football: "football",
  futbolas: "football",
  swimming: "swimming",
  plaukimas: "swimming",
  tennis: "tennis",
  tenisas: "tennis",
  athletics: "athletics",
  lengvoji: "athletics",
  fitness: "fitness",
  treniruokliai: "fitness",
  outdoor: "outdoor",
  running: "running",
  begimas: "running",
  "bėgimas": "running",
  cycling: "cycling",
  dviraciai: "cycling",
  "dviračiai": "cycling",
  play: "play",
  vaikai: "play",
  ice: "ice_skating",
  skating: "ice_skating",
};

function normalizeSport(value: string | undefined): Discipline | undefined {
  if (!value) return undefined;
  const cleaned = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  if (ALL_DISCIPLINES.includes(cleaned as Discipline)) return cleaned as Discipline;
  for (const [key, discipline] of Object.entries(DISCIPLINE_ALIASES)) {
    const normalizedKey = key
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (cleaned.includes(normalizedKey)) return discipline;
  }
  return undefined;
}

function demandScoreForDiscipline(discipline?: Discipline): number {
  if (!discipline) return 65;
  const matching = getDemandReport().sport_popularity_ranked.filter(
    (entry) => normalizeSport(entry.sport) === discipline,
  );
  if (matching.length === 0) return 55;
  return Math.max(...matching.map((entry) => entry.shortage_index_0_100));
}

function buildNeedHeatmap(discipline?: Discipline) {
  const facilities = getAllFacilities();
  const kpis = districtKpis();
  const meta = getDistrictMeta();
  const baseDemandScore = demandScoreForDiscipline(discipline);
  const recs = getDistrictRecommendations();

  const cells = meta.map((district) => {
    const districtFacilities = facilities.filter((f) => f.district === district.name);
    const matchingFacilities = discipline
      ? districtFacilities.filter((f) => f.disciplines.includes(discipline))
      : districtFacilities;
    const kpi = kpis.find((item) => item.district === district.name);
    const districtRec = recs
      .filter((rec) => rec.district.toLowerCase() === district.name.toLowerCase())
      .filter((rec) => !discipline || normalizeSport(rec.sport) === discipline)
      .sort((a, b) => b.priority_score_0_100 - a.priority_score_0_100)[0];

    const coveragePenalty = discipline
      ? matchingFacilities.length === 0
        ? 42
        : Math.max(0, 26 - matchingFacilities.length * 8)
      : ((kpi?.disciplinesMissing.length ?? 0) / 7) * 42;
    const densityPenalty = Math.max(0, 22 - (kpi?.facilitiesPer10k ?? 0) * 6);
    const utilizationPenalty = (kpi?.avgUtilization ?? 0) > 75 ? 9 : 0;
    const recommendationBoost = districtRec ? districtRec.priority_score_0_100 * 0.22 : 0;
    const rawScore =
      baseDemandScore * 0.42 +
      coveragePenalty +
      densityPenalty +
      utilizationPenalty +
      recommendationBoost;
    const needScore = Math.max(0, Math.min(100, Math.round(rawScore)));
    const priority =
      needScore >= 78 ? "critical" : needScore >= 62 ? "high" : needScore >= 42 ? "medium" : "low";

    return {
      district: district.name,
      lat: district.lat,
      lng: district.lng,
      population: district.population,
      discipline: discipline ?? "all",
      needScore,
      priority,
      matchingFacilities: matchingFacilities.length,
      facilitiesPer10k: kpi?.facilitiesPer10k ?? 0,
      missingDisciplines: kpi?.disciplinesMissing ?? [],
      recommendedAction:
        districtRec?.action ??
        (discipline
          ? `Patikrinti ${discipline} poreiki ir suplanuoti lauko aikstele arba partneryste su mokykla.`
          : "Didinti daugiafunkciu lauko vietu pasiula pagal gyventoju poreiki."),
      explanation: [
        `Poreikio signalas: ${baseDemandScore}/100`,
        `Esami atitinkantys objektai: ${matchingFacilities.length}`,
        `Objektu tankis: ${kpi?.facilitiesPer10k ?? 0}/10k gyv.`,
        districtRec ? `Paklausos radaro rekomendacija: ${districtRec.priority_score_0_100}/100` : "Nera tiesiogines rajono rekomendacijos",
      ],
    };
  });

  return {
    discipline: discipline ?? "all",
    generatedAt: new Date().toISOString(),
    methodology:
      "Need score = demand shortage signal + coverage gap + facility density penalty + utilization/recommendation boost.",
    cells: cells.sort((a, b) => b.needScore - a.needScore),
  };
}

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
  res.json(
    list.map((f) => {
      const occupancy = getOccupancy(f.id);
      return {
        ...f,
        currentOccupancy: occupancy?.current ?? f.utilization,
        occupancyUpdatedAt: occupancy?.generatedAt ?? new Date().toISOString(),
      };
    }),
  );
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

router.get("/sports/heatmap", (req, res) => {
  const { discipline } = req.query as Record<string, string | undefined>;
  res.json(buildNeedHeatmap(normalizeSport(discipline)));
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
