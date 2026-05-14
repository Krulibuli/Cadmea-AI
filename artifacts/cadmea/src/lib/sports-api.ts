import { useQuery } from "@tanstack/react-query";

export type FacilityType =
  | "swimming_pool" | "stadium" | "arena" | "air_dome" | "sports_centre"
  | "athletics" | "rowing" | "palace_of_sports" | "park" | "playground"
  | "pitch" | "fitness_centre" | "ice_rink" | "tennis";

export type Discipline =
  | "swimming" | "basketball" | "football" | "athletics" | "rowing"
  | "tennis" | "fitness" | "ice_skating" | "general" | "play"
  | "running" | "cycling" | "outdoor";

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
  utilization: number;
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
  dataSources: { name: string; url: string }[];
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export function useSportsFacilities(params: {
  district?: string; type?: string; discipline?: string;
  source?: string; status?: string; q?: string;
} = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v); });
  const qs = sp.toString();
  return useQuery({
    queryKey: ["sports/facilities", params],
    queryFn: () => get<SportsFacility[]>(`/api/sports/facilities${qs ? `?${qs}` : ""}`),
  });
}

export function useSportsFacility(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ["sports/facility", id],
    queryFn: () => get<SportsFacility>(`/api/sports/facilities/${id}`),
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

export function useSportsMeta() {
  return useQuery({ queryKey: ["sports/meta"], queryFn: () => get<SportsMeta>("/api/sports/meta") });
}

export const FACILITY_TYPE_LABEL: Record<FacilityType, string> = {
  swimming_pool: "Swimming pool",
  stadium: "Stadium",
  arena: "Arena",
  air_dome: "Air dome",
  sports_centre: "Sports centre",
  athletics: "Athletics arena",
  rowing: "Rowing centre",
  palace_of_sports: "Palace of sports",
  park: "Park",
  playground: "Playground",
  pitch: "Pitch",
  fitness_centre: "Fitness centre",
  ice_rink: "Ice rink",
  tennis: "Tennis centre",
};

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  swimming: "Swimming",
  basketball: "Basketball",
  football: "Football",
  athletics: "Athletics",
  rowing: "Rowing",
  tennis: "Tennis",
  fitness: "Fitness",
  ice_skating: "Ice skating",
  general: "General",
  play: "Play",
  running: "Running",
  cycling: "Cycling",
  outdoor: "Outdoor",
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
