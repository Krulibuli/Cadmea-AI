import { useQuery } from "@tanstack/react-query";

export type FacilityType =
  | "swimming_pool" | "stadium" | "arena" | "air_dome" | "sports_centre"
  | "athletics" | "rowing" | "palace_of_sports" | "park" | "playground"
  | "pitch" | "fitness_centre" | "ice_rink" | "tennis";

export type Discipline =
  | "swimming" | "basketball" | "football" | "athletics" | "rowing"
  | "tennis" | "fitness" | "ice_skating" | "general" | "play"
  | "running" | "cycling" | "outdoor";

export type AgeGroup = "kids" | "children" | "teens" | "adults" | "seniors";

export type Accessibility =
  | "wheelchair" | "sensory_friendly" | "beginner_friendly"
  | "adaptive_sports" | "stroller_access";

export type BookingProvider =
  | "active_vilnius" | "sporto_rumai" | "operator" | "google_calendar" | "none";

export type EntryType = "free" | "paid" | "membership" | "mixed";

export interface SportsFacility {
  id: string;
  name: string;
  type: FacilityType;
  source: "managed" | "managed_planned" | "osm" | "open_data";
  district: string;
  address: string;
  lat: number;
  lng: number;
  disciplines: Discipline[];
  ageGroups: AgeGroup[];
  accessibility: Accessibility[];
  bookingProvider: BookingProvider;
  bookingUrl?: string;
  entryType: EntryType;
  priceFromEur: number;
  utilization: number;
  currentOccupancy?: number;
  occupancyUpdatedAt?: string;
  maintenanceBacklog: number;
  energyIntensity: number;
  capacity: number;
  annualVisits: number;
  annualOpsCostEur: number;
  status: "operational" | "planned" | "construction" | "maintenance";
  automation: {
    energy: number; lighting: number; security: number;
    selfService: number; remoteManagement: number; overall: number;
  };
}

export interface DistrictKpi {
  district: string;
  population: number;
  facilitiesPer10k: number;
  avgUtilization: number;
  avgAutomation: number;
  totalAnnualOpsCostEur: number;
  totalAnnualVisits: number;
  costPerVisitEur: number;
  energyIntensityAvg: number;
  maintenanceBacklogAvg: number;
  disciplinesCovered: number;
  disciplinesMissing: Discipline[];
}

export interface DistrictDisciplineRow {
  district: string;
  population: number;
  disciplines: Record<Discipline, number>;
  totalFacilities: number;
  parks: number;
  playgrounds: number;
  managedFacilities: number;
}

export interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  category: "coverage" | "automation" | "maintenance" | "energy" | "staffing" | "investment";
  title: string;
  description: string;
  district?: string;
  facilityId?: string;
  estimatedSavingsEur?: number;
  estimatedImpact: string;
}

export interface SportsSummary {
  totalFacilities: number;
  parks: number;
  playgrounds: number;
  managedFacilities: number;
  plannedFacilities: number;
  districtsCovered: number;
  avgUtilization: number;
  avgAutomation: number;
  totalAnnualOpsCostEur: number;
  totalAnnualVisits: number;
  estimatedAnnualSavingsEur: number;
  districtKpis: DistrictKpi[];
}

export interface SportsMeta {
  districts: string[];
  disciplines: Discipline[];
  facilityTypes: FacilityType[];
  ageGroups?: AgeGroup[];
  accessibility?: Accessibility[];
  bookingProviders?: BookingProvider[];
  entryTypes?: EntryType[];
  dataSources: { name: string; url: string }[];
}

export interface OccupancyResponse {
  facilityId: string;
  facilityName: string;
  source: "modelled" | "live";
  generatedAt: string;
  current: number;
  today: number[];
  week: number[][];
  hour: number;
  notes?: string;
}

export interface SportsHeatmapCell {
  district: string;
  lat: number;
  lng: number;
  population: number;
  discipline: Discipline | "all";
  needScore: number;
  priority: "critical" | "high" | "medium" | "low";
  matchingFacilities: number;
  facilitiesPer10k: number;
  missingDisciplines: Discipline[];
  recommendedAction: string;
  explanation: string[];
}

export interface SportsHeatmapResponse {
  discipline: Discipline | "all";
  generatedAt: string;
  methodology: string;
  cells: SportsHeatmapCell[];
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export function useSportsFacilities(params: {
  district?: string; type?: string; discipline?: string;
  source?: string; status?: string; q?: string;
  ageGroup?: string; accessibility?: string;
  entryType?: string; bookingProvider?: string;
} = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v); });
  const qs = sp.toString();
  return useQuery({
    queryKey: ["sports/facilities", params],
    queryFn: () => get<SportsFacility[]>(`/api/sports/facilities${qs ? `?${qs}` : ""}`),
    refetchInterval: 60 * 60 * 1000,
  });
}

export function useSportsFacility(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ["sports/facility", id],
    queryFn: () => get<SportsFacility>(`/api/sports/facilities/${id}`),
  });
}

export function useFacilityOccupancy(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ["sports/occupancy", id],
    queryFn: () => get<OccupancyResponse>(`/api/sports/facilities/${id}/occupancy`),
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useSportsSummary() {
  return useQuery({ queryKey: ["sports/summary"], queryFn: () => get<SportsSummary>("/api/sports/summary") });
}

export function useDisciplineByDistrict() {
  return useQuery({ queryKey: ["sports/disc-by-district"], queryFn: () => get<DistrictDisciplineRow[]>("/api/sports/disciplines-by-district") });
}

export function useDistrictKpis() {
  return useQuery({ queryKey: ["sports/district-kpis"], queryFn: () => get<DistrictKpi[]>("/api/sports/district-kpis") });
}

export function useRecommendations(params: { district?: string; category?: string; priority?: string } = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v); });
  const qs = sp.toString();
  return useQuery({
    queryKey: ["sports/recs", params],
    queryFn: () => get<Recommendation[]>(`/api/sports/recommendations${qs ? `?${qs}` : ""}`),
  });
}

export function useSportsHeatmap(discipline?: string) {
  const sp = new URLSearchParams();
  if (discipline && discipline !== "__all") sp.set("discipline", discipline);
  const qs = sp.toString();
  return useQuery({
    queryKey: ["sports/heatmap", discipline ?? "__all"],
    queryFn: () => get<SportsHeatmapResponse>(`/api/sports/heatmap${qs ? `?${qs}` : ""}`),
  });
}

export function useSportsMeta() {
  return useQuery({ queryKey: ["sports/meta"], queryFn: () => get<SportsMeta>("/api/sports/meta") });
}

export const FACILITY_TYPE_LABEL: Record<FacilityType, string> = {
  swimming_pool: "Baseinas",
  stadium: "Stadionas",
  arena: "Arena",
  air_dome: "Pripuciamas maniezas",
  sports_centre: "Sporto centras",
  athletics: "Lengvosios atletikos arena",
  rowing: "Irklavimo baze",
  palace_of_sports: "Sporto rumai",
  park: "Parkas",
  playground: "Zaidimu aikstele",
  pitch: "Aikste",
  fitness_centre: "Treniruokliu centras",
  ice_rink: "Ledo arena",
  tennis: "Teniso centras",
};

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  swimming: "Plaukimas",
  basketball: "Krepsinis",
  football: "Futbolas",
  athletics: "Lengvoji atletika",
  rowing: "Irklavimas",
  tennis: "Tenisas",
  fitness: "Treniruokliai",
  ice_skating: "Ciuozimas",
  general: "Bendras sportas",
  play: "Vaiku zaidimai",
  running: "Begimas",
  cycling: "Dviraciai",
  outdoor: "Lauko sportas",
};

export const AGE_GROUP_LABEL: Record<AgeGroup, { en: string; lt: string }> = {
  kids: { en: "Toddlers (0–5)", lt: "Mažyliai (0–5)" },
  children: { en: "Children (6–12)", lt: "Vaikai (6–12)" },
  teens: { en: "Teens (13–17)", lt: "Paaugliai (13–17)" },
  adults: { en: "Adults (18–64)", lt: "Suaugę (18–64)" },
  seniors: { en: "Seniors (65+)", lt: "Senjorai (65+)" },
};

export const ACCESSIBILITY_LABEL: Record<Accessibility, { en: string; lt: string }> = {
  wheelchair: { en: "Wheelchair access", lt: "Pritaikyta neįgaliųjų vežimėliams" },
  sensory_friendly: { en: "Sensory-friendly", lt: "Sensorinė ramybė" },
  beginner_friendly: { en: "Beginner-friendly", lt: "Pradedantiesiems" },
  adaptive_sports: { en: "Adaptive sports", lt: "Adaptyvusis sportas" },
  stroller_access: { en: "Stroller access", lt: "Patogu su vežimėliu" },
};

export const BOOKING_PROVIDER_LABEL: Record<BookingProvider, string> = {
  active_vilnius: "ActiveVilnius",
  sporto_rumai: "Sporto Rūmai",
  operator: "Operator",
  google_calendar: "Google Calendar",
  none: "Drop-in",
};

export function formatEur(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `€${(n / 1_000).toFixed(0)}k`;
  return `€${Math.round(n)}`;
}

export function formatInt(n: number): string {
  return new Intl.NumberFormat("en").format(Math.round(n));
}
