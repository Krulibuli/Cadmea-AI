import managedFacilitiesJson from "../data/managed-facilities.json" with { type: "json" };
import sportLocationsJson from "../data/sport-locations.json" with { type: "json" };

export type FacilityType =
  | "swimming_pool"
  | "stadium"
  | "arena"
  | "air_dome"
  | "sports_centre"
  | "athletics"
  | "rowing"
  | "palace_of_sports"
  | "park"
  | "playground"
  | "pitch"
  | "fitness_centre"
  | "ice_rink"
  | "tennis";

export type Discipline =
  | "swimming"
  | "basketball"
  | "football"
  | "athletics"
  | "rowing"
  | "tennis"
  | "fitness"
  | "ice_skating"
  | "general"
  | "play"
  | "running"
  | "cycling"
  | "outdoor";

export interface ManagedFacility {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface SportLocation {
  district: string;
  type: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  reviews: number;
}

export type AgeGroup = "kids" | "children" | "teens" | "adults" | "seniors";

export type Accessibility =
  | "wheelchair"
  | "sensory_friendly"
  | "beginner_friendly"
  | "adaptive_sports"
  | "stroller_access";

export type BookingProvider = "active_vilnius" | "sporto_rumai" | "operator" | "google_calendar" | "none";

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
  /** Target age bands the facility caters to */
  ageGroups: AgeGroup[];
  /** Accessibility features supported */
  accessibility: Accessibility[];
  /** Where bookings happen */
  bookingProvider: BookingProvider;
  /** Deep link to the booking page (provider-specific) */
  bookingUrl?: string;
  /** Entry pricing model */
  entryType: EntryType;
  /** Indicative single-visit price in EUR (0 = free) */
  priceFromEur: number;
  /** Estimated current weekly utilization 0-100 */
  utilization: number;
  /** 0-100 maintenance backlog severity (higher = worse) */
  maintenanceBacklog: number;
  /** kWh/m2/year estimated energy intensity */
  energyIntensity: number;
  /** estimated annual operating cost in EUR */
  annualOpsCostEur: number;
  /** estimated annual visits */
  annualVisits: number;
  /** automation readiness 0-100 (higher = more automated) */
  automation: {
    energy: number;
    lighting: number;
    security: number;
    selfService: number;
    remoteManagement: number;
    overall: number;
  };
  /** Areas within the city served by this facility */
  capacity: number;
  status: "operational" | "planned" | "construction" | "maintenance";
  yearOpened?: number;
  rating?: number | null;
  reviews?: number;
}

export const ALL_AGE_GROUPS: AgeGroup[] = ["kids", "children", "teens", "adults", "seniors"];
export const ALL_ACCESSIBILITY: Accessibility[] = [
  "wheelchair", "sensory_friendly", "beginner_friendly", "adaptive_sports", "stroller_access",
];

const VILNIUS_DISTRICTS = [
  { name: "Senamiestis", lat: 54.6816, lng: 25.2872, population: 21200 },
  { name: "Naujamiestis", lat: 54.6817, lng: 25.2607, population: 27800 },
  { name: "Antakalnis", lat: 54.7020, lng: 25.3210, population: 36500 },
  { name: "Žirmūnai", lat: 54.7135, lng: 25.3023, population: 43200 },
  { name: "Verkiai", lat: 54.7510, lng: 25.2950, population: 32100 },
  { name: "Šnipiškės", lat: 54.6985, lng: 25.2810, population: 17400 },
  { name: "Justiniškės", lat: 54.7180, lng: 25.2300, population: 30200 },
  { name: "Karoliniškės", lat: 54.6840, lng: 25.2230, population: 26000 },
  { name: "Lazdynai", lat: 54.6678, lng: 25.2078, population: 32800 },
  { name: "Pilaitė", lat: 54.7118, lng: 25.1818, population: 38600 },
  { name: "Fabijoniškės", lat: 54.7287, lng: 25.2458, population: 33700 },
  { name: "Šeškinė", lat: 54.7168, lng: 25.2495, population: 28400 },
  { name: "Pašilaičiai", lat: 54.7370, lng: 25.2370, population: 32400 },
  { name: "Vilkpėdė", lat: 54.6680, lng: 25.2560, population: 22300 },
  { name: "Naujininkai", lat: 54.6610, lng: 25.2780, population: 30200 },
  { name: "Rasos", lat: 54.6680, lng: 25.3050, population: 13900 },
  { name: "Naujoji Vilnia", lat: 54.6920, lng: 25.4140, population: 32700 },
  { name: "Paneriai", lat: 54.6310, lng: 25.1730, population: 7200 },
  { name: "Grigiškės", lat: 54.6760, lng: 25.0930, population: 11200 },
];

export const VILNIUS_DISTRICT_NAMES = VILNIUS_DISTRICTS.map((d) => d.name);

export function getDistrictMeta() {
  return VILNIUS_DISTRICTS.map((d) => ({ ...d }));
}

export function nearestDistrict(lat: number, lng: number): string {
  let best = VILNIUS_DISTRICTS[0];
  let bestD = Number.POSITIVE_INFINITY;
  for (const d of VILNIUS_DISTRICTS) {
    const dx = (d.lat - lat) * 111;
    const dy = (d.lng - lng) * 65;
    const dist = dx * dx + dy * dy;
    if (dist < bestD) {
      bestD = dist;
      best = d;
    }
  }
  return best.name;
}

interface ManagedFile {
  currently_managed: ManagedFacility[];
  planned_to_be_managed: ManagedFacility[];
}

function loadManaged(): ManagedFile {
  return managedFacilitiesJson as ManagedFile;
}

function loadSportLocations(): SportLocation[] {
  return sportLocationsJson as SportLocation[];
}

const slug = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function classifyManaged(name: string): { type: FacilityType; disciplines: Discipline[] } {
  const n = name.toLowerCase();
  if (n.includes("swimming pool") || n.includes("pool")) return { type: "swimming_pool", disciplines: ["swimming", "fitness"] };
  if (n.includes("basketball")) return { type: "arena", disciplines: ["basketball"] };
  if (n.includes("active vilnius arena")) return { type: "arena", disciplines: ["basketball", "fitness", "general"] };
  if (n.includes("air dome") || n.includes("inflatable")) return { type: "air_dome", disciplines: ["football", "tennis", "athletics"] };
  if (n.includes("heated stadium") || n.includes("stadium")) return { type: "stadium", disciplines: ["football", "athletics"] };
  if (n.includes("athletics")) return { type: "athletics", disciplines: ["athletics", "running"] };
  if (n.includes("rowing")) return { type: "rowing", disciplines: ["rowing"] };
  if (n.includes("palace of culture")) return { type: "palace_of_sports", disciplines: ["basketball", "general", "fitness"] };
  return { type: "sports_centre", disciplines: ["general"] };
}

function classifySportLocation(type: string): { type: FacilityType; disciplines: Discipline[] } {
  switch (type.toLowerCase()) {
    case "gym":
      return { type: "fitness_centre", disciplines: ["fitness", "general"] };
    case "basketball court":
      return { type: "pitch", disciplines: ["basketball", "outdoor"] };
    case "football field":
      return { type: "pitch", disciplines: ["football", "outdoor"] };
    case "stadium":
      return { type: "stadium", disciplines: ["football", "athletics", "running"] };
    case "sports club":
      return { type: "sports_centre", disciplines: ["general", "fitness"] };
    case "tennis court":
      return { type: "tennis", disciplines: ["tennis", "outdoor"] };
    case "swimming pool":
      return { type: "swimming_pool", disciplines: ["swimming", "fitness"] };
    case "park":
      return { type: "park", disciplines: ["running", "cycling", "outdoor", "general"] };
    default:
      return { type: "sports_centre", disciplines: ["general"] };
  }
}

/** Heuristic age-group + accessibility tagging based on facility type & disciplines. */
function tagAgeAndAccess(type: FacilityType, disciplines: Discipline[]): {
  ageGroups: AgeGroup[];
  accessibility: Accessibility[];
} {
  const age = new Set<AgeGroup>();
  const acc = new Set<Accessibility>();
  if (type === "playground") {
    ["kids", "children"].forEach((a) => age.add(a as AgeGroup));
    acc.add("stroller_access");
    acc.add("beginner_friendly");
  } else if (type === "park") {
    ALL_AGE_GROUPS.forEach((a) => age.add(a));
    acc.add("stroller_access");
    acc.add("wheelchair");
  } else if (type === "swimming_pool") {
    ["children", "teens", "adults", "seniors"].forEach((a) => age.add(a as AgeGroup));
    acc.add("wheelchair");
    acc.add("beginner_friendly");
    if (disciplines.includes("swimming")) acc.add("adaptive_sports");
  } else if (type === "arena" || type === "stadium" || type === "palace_of_sports") {
    ["teens", "adults"].forEach((a) => age.add(a as AgeGroup));
    if (disciplines.includes("basketball") || disciplines.includes("general")) {
      age.add("children");
      age.add("seniors");
    }
    acc.add("wheelchair");
  } else if (type === "air_dome") {
    ["children", "teens", "adults"].forEach((a) => age.add(a as AgeGroup));
    acc.add("beginner_friendly");
  } else if (type === "athletics" || type === "rowing") {
    ["teens", "adults", "seniors"].forEach((a) => age.add(a as AgeGroup));
    acc.add("beginner_friendly");
  } else if (type === "fitness_centre" || type === "tennis" || type === "ice_rink") {
    ["teens", "adults", "seniors"].forEach((a) => age.add(a as AgeGroup));
  } else {
    ["children", "teens", "adults"].forEach((a) => age.add(a as AgeGroup));
  }
  return { ageGroups: ALL_AGE_GROUPS.filter((a) => age.has(a)), accessibility: Array.from(acc) };
}

/** Booking provider + indicative price + entry type by facility type/source. */
function bookingFor(
  type: FacilityType,
  source: SportsFacility["source"],
  name: string,
): { bookingProvider: BookingProvider; bookingUrl?: string; entryType: EntryType; priceFromEur: number } {
  const slugged = slug(name);
  if (type === "park" || type === "playground") {
    return { bookingProvider: "none", entryType: "free", priceFromEur: 0 };
  }
  if (source === "managed" || source === "managed_planned") {
    return {
      bookingProvider: "active_vilnius",
      bookingUrl: `https://www.activevilnius.lt/objektai/${slugged}`,
      entryType: type === "swimming_pool" || type === "ice_rink" ? "paid" : "mixed",
      priceFromEur: type === "swimming_pool" ? 6 : type === "ice_rink" ? 7 : type === "arena" ? 12 : 5,
    };
  }
  return { bookingProvider: "operator", entryType: "mixed", priceFromEur: 5 };
}

/** Hourly typical-week occupancy multiplier (24 hours × 7 days). Used to model live & weekly heatmap. */
function typicalWeek(seed: string, type: FacilityType, baseUtilization: number): number[][] {
  const r = seedRand(seed + "-occ");
  const week: number[][] = [];
  // Profile per facility family
  const isOutdoor = type === "park" || type === "playground";
  const isFitness = type === "fitness_centre" || type === "swimming_pool";
  const isVenue = type === "arena" || type === "stadium" || type === "palace_of_sports" || type === "air_dome";
  for (let d = 0; d < 7; d++) {
    const isWeekend = d === 5 || d === 6;
    const day: number[] = [];
    for (let h = 0; h < 24; h++) {
      let mult = 0;
      if (h < 6 || h >= 23) mult = 0.05;
      else if (h >= 6 && h < 9) mult = isFitness ? 0.85 : isOutdoor ? 0.55 : 0.35; // morning peak
      else if (h >= 9 && h < 16) mult = isOutdoor ? 0.55 : 0.4;
      else if (h >= 16 && h < 21) mult = isVenue ? 0.95 : isFitness ? 0.9 : 0.8; // evening peak
      else mult = 0.45;
      if (isWeekend) {
        if (h >= 9 && h < 18) mult = Math.min(1, mult + 0.15);
        else mult = Math.max(0.05, mult - 0.1);
      }
      // small deterministic jitter
      mult = Math.max(0, Math.min(1, mult * (0.85 + r() * 0.3)));
      day.push(Math.round(mult * baseUtilization));
    }
    week.push(day);
  }
  return week;
}

export interface OccupancyResponse {
  facilityId: string;
  facilityName: string;
  source: "modelled" | "live";
  generatedAt: string;
  /** 0-100 right now */
  current: number;
  /** Today's hourly curve (24 slots, 0-100) */
  today: number[];
  /** 7×24 typical-week heatmap (0-100) */
  week: number[][];
  /** Local hour used for "current" */
  hour: number;
  notes?: string;
}

export function getOccupancy(id: string): OccupancyResponse | null {
  const f = getFacility(id);
  if (!f) return null;
  const isOperational = f.status === "operational";
  const week = isOperational
    ? typicalWeek(f.id, f.type, f.utilization)
    : Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
  // Use Vilnius local time (UTC+2/+3 — approximate via Europe/Vilnius)
  const now = new Date();
  const vilniusParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Vilnius",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hourPart = vilniusParts.find((part) => part.type === "hour")?.value ?? "0";
  const weekdayPart = vilniusParts.find((part) => part.type === "weekday")?.value ?? "Mon";
  const vilniusHour = Number(hourPart);
  const vilniusDay = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(weekdayPart);
  const today = week[vilniusDay] ?? week[0];
  return {
    facilityId: f.id,
    facilityName: f.name,
    source: "modelled",
    generatedAt: now.toISOString(),
    current: today[vilniusHour] ?? 0,
    today,
    week,
    hour: vilniusHour,
    notes: isOperational
      ? "Modelled from booking patterns and facility type. Replace with live feed when available."
      : "Facility is not yet operational — values are zero.",
  };
}

// Deterministic pseudo-random for stable mock KPIs
function seedRand(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

function buildKpis(id: string, type: FacilityType, status: SportsFacility["status"]) {
  const r = seedRand(id);
  const base = type === "park" || type === "playground" ? 35 : 60;
  const utilization = status === "planned" ? 0 : Math.round(base + r() * 35);
  const maintenanceBacklog = Math.round(r() * (status === "planned" ? 5 : 70));
  const energyBase = type === "swimming_pool" ? 480 : type === "arena" || type === "stadium" ? 240 : type === "air_dome" ? 320 : type === "park" ? 5 : type === "playground" ? 8 : 180;
  const energyIntensity = Math.round(energyBase * (0.85 + r() * 0.4));
  const capacity = type === "park" ? Math.round(500 + r() * 4000)
    : type === "playground" ? Math.round(40 + r() * 200)
    : type === "swimming_pool" ? Math.round(120 + r() * 200)
    : type === "stadium" ? Math.round(800 + r() * 4000)
    : type === "arena" ? Math.round(1500 + r() * 4500)
    : type === "air_dome" ? Math.round(200 + r() * 600)
    : Math.round(150 + r() * 400);
  const annualVisits = status === "planned" ? 0 : Math.round((utilization / 100) * capacity * (type === "park" || type === "playground" ? 220 : 280));
  const annualOpsCostEur = type === "park" || type === "playground"
    ? Math.round(8000 + r() * 25000)
    : Math.round(60000 + r() * 480000);

  const automation = {
    energy: Math.round(20 + r() * 70),
    lighting: Math.round(30 + r() * 65),
    security: Math.round(25 + r() * 70),
    selfService: type === "park" || type === "playground" ? 0 : Math.round(15 + r() * 70),
    remoteManagement: Math.round(20 + r() * 70),
    overall: 0,
  };
  automation.overall = Math.round(
    (automation.energy + automation.lighting + automation.security + automation.selfService + automation.remoteManagement) / 5
  );

  return { utilization, maintenanceBacklog, energyIntensity, capacity, annualVisits, annualOpsCostEur, automation };
}

// Curated Vilnius parks (open data — names from Vilnius Open Data Portal / OSM)
type SeedFacility = Omit<SportsFacility,
  | "id" | "utilization" | "maintenanceBacklog" | "energyIntensity" | "capacity"
  | "annualVisits" | "annualOpsCostEur" | "automation"
  | "ageGroups" | "accessibility" | "bookingProvider" | "bookingUrl" | "entryType" | "priceFromEur"
>;

const PARKS: SeedFacility[] = [
  { name: "Vingio parkas", type: "park", source: "open_data", district: "Vilkpėdė", address: "M. K. Čiurlionio g.", lat: 54.6802, lng: 25.2438, disciplines: ["running", "cycling", "outdoor", "general"], status: "operational" },
  { name: "Bernardinų sodas", type: "park", source: "open_data", district: "Senamiestis", address: "B. Radvilaitės g.", lat: 54.6845, lng: 25.2954, disciplines: ["outdoor", "general"], status: "operational" },
  { name: "Sereikiškių parkas", type: "park", source: "open_data", district: "Senamiestis", address: "Maironio g.", lat: 54.6855, lng: 25.2950, disciplines: ["outdoor", "running"], status: "operational" },
  { name: "Kalnų parkas", type: "park", source: "open_data", district: "Senamiestis", address: "Olandų g.", lat: 54.6900, lng: 25.3030, disciplines: ["outdoor", "running"], status: "operational" },
  { name: "Lukiškių aikštė", type: "park", source: "open_data", district: "Naujamiestis", address: "Lukiškių aikštė", lat: 54.6890, lng: 25.2670, disciplines: ["outdoor"], status: "operational" },
  { name: "Vlado Putvinskio skveras", type: "park", source: "open_data", district: "Naujamiestis", address: "Pylimo g.", lat: 54.6796, lng: 25.2793, disciplines: ["outdoor"], status: "operational" },
  { name: "Sapiegų parkas", type: "park", source: "open_data", district: "Antakalnis", address: "L. Sapiegos g.", lat: 54.6927, lng: 25.3070, disciplines: ["outdoor", "running"], status: "operational" },
  { name: "Pavilnių regioninis parkas", type: "park", source: "open_data", district: "Naujoji Vilnia", address: "Belmonto g.", lat: 54.6850, lng: 25.3700, disciplines: ["outdoor", "cycling", "running"], status: "operational" },
  { name: "Verkių regioninis parkas", type: "park", source: "open_data", district: "Verkiai", address: "Verkių g.", lat: 54.7470, lng: 25.2960, disciplines: ["outdoor", "cycling", "running"], status: "operational" },
  { name: "Vingrių skveras", type: "park", source: "open_data", district: "Naujamiestis", address: "Vingrių g.", lat: 54.6791, lng: 25.2725, disciplines: ["outdoor"], status: "operational" },
  { name: "Tuskulėnų rimties parkas", type: "park", source: "open_data", district: "Žirmūnai", address: "Žirmūnų g. 1F", lat: 54.7027, lng: 25.2937, disciplines: ["outdoor", "running"], status: "operational" },
  { name: "Pilaitės parkas", type: "park", source: "open_data", district: "Pilaitė", address: "Pilaitės pr.", lat: 54.7150, lng: 25.1830, disciplines: ["outdoor", "running"], status: "operational" },
  { name: "Lazdynų parkas", type: "park", source: "open_data", district: "Lazdynai", address: "Architektų g.", lat: 54.6692, lng: 25.2105, disciplines: ["outdoor", "running"], status: "operational" },
  { name: "Karoliniškių kraštovaizdžio draustinis", type: "park", source: "open_data", district: "Karoliniškės", address: "Sausio 13-osios g.", lat: 54.6850, lng: 25.2200, disciplines: ["outdoor", "cycling"], status: "operational" },
];

// Curated Vilnius playgrounds (open data sample)
const PLAYGROUNDS: SeedFacility[] = [
  { name: "Bernardinų vaikų žaidimų aikštelė", type: "playground", source: "open_data", district: "Senamiestis", address: "Bernardinų sodas", lat: 54.6848, lng: 25.2962, disciplines: ["play"], status: "operational" },
  { name: "Šnipiškių žaidimų aikštelė", type: "playground", source: "open_data", district: "Šnipiškės", address: "Slucko g.", lat: 54.6995, lng: 25.2820, disciplines: ["play"], status: "operational" },
  { name: "Tuskulėnų žaidimų aikštelė", type: "playground", source: "open_data", district: "Žirmūnai", address: "Tuskulėnų g.", lat: 54.7034, lng: 25.2940, disciplines: ["play"], status: "operational" },
  { name: "Antakalnio žaidimų aikštelė", type: "playground", source: "open_data", district: "Antakalnis", address: "Antakalnio g.", lat: 54.7000, lng: 25.3160, disciplines: ["play"], status: "operational" },
  { name: "Karoliniškių vaikų aikštelė", type: "playground", source: "open_data", district: "Karoliniškės", address: "L. Asanavičiūtės g.", lat: 54.6815, lng: 25.2240, disciplines: ["play"], status: "operational" },
  { name: "Lazdynų žaidimų aikštelė", type: "playground", source: "open_data", district: "Lazdynai", address: "Architektų g.", lat: 54.6685, lng: 25.2080, disciplines: ["play"], status: "operational" },
  { name: "Fabijoniškių žaidimų aikštelė", type: "playground", source: "open_data", district: "Fabijoniškės", address: "Pavasario g.", lat: 54.7290, lng: 25.2440, disciplines: ["play"], status: "operational" },
  { name: "Pilaitės žaidimų aikštelė", type: "playground", source: "open_data", district: "Pilaitė", address: "Vydūno g.", lat: 54.7130, lng: 25.1840, disciplines: ["play"], status: "operational" },
  { name: "Justiniškių žaidimų aikštelė", type: "playground", source: "open_data", district: "Justiniškės", address: "Rygos g.", lat: 54.7185, lng: 25.2310, disciplines: ["play"], status: "operational" },
  { name: "Naujininkų žaidimų aikštelė", type: "playground", source: "open_data", district: "Naujininkai", address: "Dzūkų g.", lat: 54.6620, lng: 25.2790, disciplines: ["play"], status: "operational" },
  { name: "Šeškinės žaidimų aikštelė", type: "playground", source: "open_data", district: "Šeškinė", address: "Šeškinės g.", lat: 54.7170, lng: 25.2510, disciplines: ["play"], status: "operational" },
  { name: "Pašilaičių žaidimų aikštelė", type: "playground", source: "open_data", district: "Pašilaičiai", address: "Žemynos g.", lat: 54.7375, lng: 25.2390, disciplines: ["play"], status: "operational" },
  { name: "Verkių žaidimų aikštelė", type: "playground", source: "open_data", district: "Verkiai", address: "Kalvarijų g.", lat: 54.7020, lng: 25.2880, disciplines: ["play"], status: "operational" },
  { name: "Naujosios Vilnios vaikų aikštelė", type: "playground", source: "open_data", district: "Naujoji Vilnia", address: "Pergalės g.", lat: 54.6925, lng: 25.4150, disciplines: ["play"], status: "operational" },
  { name: "Vilkpėdės vaikų aikštelė", type: "playground", source: "open_data", district: "Vilkpėdė", address: "Vilkpėdės g.", lat: 54.6688, lng: 25.2570, disciplines: ["play"], status: "operational" },
];

function buildAll(): SportsFacility[] {
  const managed = loadManaged();
  const sportLocations = loadSportLocations();
  const out: SportsFacility[] = [];

  for (const m of managed.currently_managed) {
    const c = classifyManaged(m.name);
    const district = nearestDistrict(m.latitude, m.longitude);
    const id = `mgd-${slug(m.name)}`;
    const tags = tagAgeAndAccess(c.type, c.disciplines);
    const bk = bookingFor(c.type, "managed", m.name);
    out.push({
      id,
      name: titleCaseLt(m.name),
      type: c.type,
      source: "managed",
      district,
      address: m.address,
      lat: m.latitude,
      lng: m.longitude,
      disciplines: c.disciplines,
      ageGroups: tags.ageGroups,
      accessibility: tags.accessibility,
      bookingProvider: bk.bookingProvider,
      bookingUrl: bk.bookingUrl,
      entryType: bk.entryType,
      priceFromEur: bk.priceFromEur,
      status: "operational",
      ...buildKpis(id, c.type, "operational"),
    });
  }
  for (const m of managed.planned_to_be_managed) {
    const c = classifyManaged(m.name);
    const district = nearestDistrict(m.latitude, m.longitude);
    const id = `pln-${slug(m.name)}`;
    const status: SportsFacility["status"] = m.name.toLowerCase().includes("2028") ? "construction" : "planned";
    const tags = tagAgeAndAccess(c.type, c.disciplines);
    const bk = bookingFor(c.type, "managed_planned", m.name);
    out.push({
      id,
      name: titleCaseLt(m.name),
      type: c.type,
      source: "managed_planned",
      district,
      address: m.address,
      lat: m.latitude,
      lng: m.longitude,
      disciplines: c.disciplines,
      ageGroups: tags.ageGroups,
      accessibility: tags.accessibility,
      bookingProvider: status === "planned" ? "none" : bk.bookingProvider,
      bookingUrl: status === "planned" ? undefined : bk.bookingUrl,
      entryType: bk.entryType,
      priceFromEur: bk.priceFromEur,
      status,
      ...buildKpis(id, c.type, status),
    });
  }
  for (const p of [...PARKS, ...PLAYGROUNDS]) {
    const id = `od-${slug(p.name)}`;
    const tags = tagAgeAndAccess(p.type, p.disciplines);
    const bk = bookingFor(p.type, p.source, p.name);
    out.push({
      id,
      ...p,
      ageGroups: tags.ageGroups,
      accessibility: tags.accessibility,
      bookingProvider: bk.bookingProvider,
      bookingUrl: bk.bookingUrl,
      entryType: bk.entryType,
      priceFromEur: bk.priceFromEur,
      ...buildKpis(id, p.type, p.status),
    });
  }
  for (const location of sportLocations) {
    if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) continue;
    const c = classifySportLocation(location.type);
    const id = `gpl-${slug(`${location.type}-${location.name}-${location.address}`)}`;
    const tags = tagAgeAndAccess(c.type, c.disciplines);
    const bk = bookingFor(c.type, "open_data", location.name);
    out.push({
      id,
      name: titleCaseLt(location.name),
      type: c.type,
      source: "open_data",
      district: location.district || nearestDistrict(location.lat, location.lng),
      address: location.address,
      lat: location.lat,
      lng: location.lng,
      disciplines: c.disciplines,
      ageGroups: tags.ageGroups,
      accessibility: tags.accessibility,
      bookingProvider: bk.bookingProvider,
      bookingUrl: bk.bookingUrl,
      entryType: bk.entryType,
      priceFromEur: bk.priceFromEur,
      status: "operational",
      rating: location.rating,
      reviews: location.reviews,
      ...buildKpis(id, c.type, "operational"),
    });
  }
  return out;
}

function titleCaseLt(s: string) {
  return s
    .toLowerCase()
    .split(/(\s+|\/)/)
    .map((w) => (/^\s+$|^\/$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");
}

let cache: SportsFacility[] | null = null;
export function getAllFacilities(): SportsFacility[] {
  if (!cache) cache = buildAll();
  return cache;
}

export function getFacility(id: string): SportsFacility | null {
  return getAllFacilities().find((f) => f.id === id) ?? null;
}

export const ALL_DISCIPLINES: Discipline[] = [
  "swimming", "basketball", "football", "athletics", "rowing", "tennis", "fitness", "ice_skating", "general", "play", "running", "cycling", "outdoor",
];

export const ALL_FACILITY_TYPES: FacilityType[] = [
  "swimming_pool", "stadium", "arena", "air_dome", "sports_centre", "athletics", "rowing", "palace_of_sports", "park", "playground", "pitch", "fitness_centre", "ice_rink", "tennis",
];

export interface DistrictDisciplineRow {
  district: string;
  population: number;
  disciplines: Record<Discipline, number>;
  totalFacilities: number;
  parks: number;
  playgrounds: number;
  managedFacilities: number;
}

export function disciplineByDistrict(): DistrictDisciplineRow[] {
  const all = getAllFacilities();
  const meta = getDistrictMeta();
  return meta.map((d) => {
    const inD = all.filter((f) => f.district === d.name);
    const disciplines = ALL_DISCIPLINES.reduce((acc, k) => {
      acc[k] = inD.filter((f) => f.disciplines.includes(k)).length;
      return acc;
    }, {} as Record<Discipline, number>);
    return {
      district: d.name,
      population: d.population,
      disciplines,
      totalFacilities: inD.length,
      parks: inD.filter((f) => f.type === "park").length,
      playgrounds: inD.filter((f) => f.type === "playground").length,
      managedFacilities: inD.filter((f) => f.source === "managed" || f.source === "managed_planned").length,
    };
  });
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

export function districtKpis(): DistrictKpi[] {
  const all = getAllFacilities();
  const meta = getDistrictMeta();
  const focusDisciplines: Discipline[] = ["swimming", "basketball", "football", "athletics", "tennis", "fitness", "play"];
  return meta.map((d) => {
    const inD = all.filter((f) => f.district === d.name);
    const visits = inD.reduce((s, f) => s + f.annualVisits, 0);
    const cost = inD.reduce((s, f) => s + f.annualOpsCostEur, 0);
    const op = inD.filter((f) => f.status === "operational");
    const has = new Set(inD.flatMap((f) => f.disciplines));
    return {
      district: d.name,
      population: d.population,
      facilitiesPer10k: round((inD.length / d.population) * 10000, 2),
      avgUtilization: avg(op.map((f) => f.utilization)),
      avgAutomation: avg(op.map((f) => f.automation.overall)),
      totalAnnualOpsCostEur: cost,
      totalAnnualVisits: visits,
      costPerVisitEur: visits > 0 ? round(cost / visits, 2) : 0,
      energyIntensityAvg: avg(op.map((f) => f.energyIntensity)),
      maintenanceBacklogAvg: avg(op.map((f) => f.maintenanceBacklog)),
      disciplinesCovered: focusDisciplines.filter((d) => has.has(d)).length,
      disciplinesMissing: focusDisciplines.filter((d) => !has.has(d)),
    };
  });
}

function avg(arr: number[]) {
  if (arr.length === 0) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}
function round(n: number, p = 2) {
  const f = Math.pow(10, p);
  return Math.round(n * f) / f;
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

export function getRecommendations(): Recommendation[] {
  const out: Recommendation[] = [];
  const facilities = getAllFacilities();
  const kpis = districtKpis();

  // Coverage gaps
  for (const k of kpis) {
    if (k.disciplinesMissing.length >= 3 && k.population > 15000) {
      out.push({
        id: `cov-${slug(k.district)}`,
        priority: k.disciplinesMissing.length >= 5 ? "high" : "medium",
        category: "coverage",
        district: k.district,
        title: `Add missing disciplines in ${k.district}`,
        description: `${k.district} (${k.population.toLocaleString()} residents) lacks coverage for: ${k.disciplinesMissing.join(", ")}. Consider a multi-discipline indoor facility or partnership with schools.`,
        estimatedImpact: `${k.population.toLocaleString()} residents gain access to ${k.disciplinesMissing.length} new disciplines`,
      });
    }
  }

  // Energy / automation
  for (const f of facilities) {
    if (f.status !== "operational") continue;
    if (f.automation.energy < 40 && (f.type === "swimming_pool" || f.type === "arena" || f.type === "stadium" || f.type === "air_dome")) {
      const savings = Math.round(f.annualOpsCostEur * 0.12);
      out.push({
        id: `aut-energy-${f.id}`,
        priority: savings > 30000 ? "high" : "medium",
        category: "energy",
        facilityId: f.id,
        district: f.district,
        title: `Smart energy management at ${f.name}`,
        description: `Automation score is ${f.automation.energy}/100. Heat-pump scheduling, demand-based ventilation, and smart-meter tariff switching can cut energy bills by ~12%.`,
        estimatedSavingsEur: savings,
        estimatedImpact: `~${savings.toLocaleString()} EUR/yr saved`,
      });
    }
    if (f.automation.lighting < 50) {
      const savings = Math.round(f.annualOpsCostEur * 0.04);
      out.push({
        id: `aut-light-${f.id}`,
        priority: "low",
        category: "automation",
        facilityId: f.id,
        district: f.district,
        title: `LED + motion-based lighting at ${f.name}`,
        description: `Replace remaining fixtures with networked LEDs controlled by occupancy sensors and daylight harvesting.`,
        estimatedSavingsEur: savings,
        estimatedImpact: `~${savings.toLocaleString()} EUR/yr saved`,
      });
    }
    if (f.automation.selfService < 40 && f.type !== "park" && f.type !== "playground") {
      out.push({
        id: `aut-self-${f.id}`,
        priority: f.utilization > 70 ? "high" : "medium",
        category: "staffing",
        facilityId: f.id,
        district: f.district,
        title: `Self-service entry & payments at ${f.name}`,
        description: `Add QR-code booking, contactless turnstiles and mobile payments to reduce reception staffing by ~30% during off-peak hours.`,
        estimatedSavingsEur: Math.round(f.annualOpsCostEur * 0.08),
        estimatedImpact: `Reception staff hours -30% off-peak`,
      });
    }
    if (f.maintenanceBacklog > 55) {
      out.push({
        id: `mnt-${f.id}`,
        priority: f.maintenanceBacklog > 70 ? "high" : "medium",
        category: "maintenance",
        facilityId: f.id,
        district: f.district,
        title: `Predictive maintenance at ${f.name}`,
        description: `Maintenance backlog at ${f.maintenanceBacklog}/100. Install IoT sensors on HVAC, water systems and pumps to predict failures before they cause closures.`,
        estimatedImpact: `Unplanned downtime expected -40%`,
      });
    }
  }

  // Order: high first, then by estimated savings
  out.sort((a, b) => {
    const pri = { high: 0, medium: 1, low: 2 } as const;
    if (pri[a.priority] !== pri[b.priority]) return pri[a.priority] - pri[b.priority];
    return (b.estimatedSavingsEur ?? 0) - (a.estimatedSavingsEur ?? 0);
  });
  return out;
}

export function platformSummary() {
  const all = getAllFacilities();
  const kpis = districtKpis();
  const operational = all.filter((f) => f.status === "operational");
  return {
    totalFacilities: all.length,
    parks: all.filter((f) => f.type === "park").length,
    playgrounds: all.filter((f) => f.type === "playground").length,
    managedFacilities: all.filter((f) => f.source === "managed").length,
    plannedFacilities: all.filter((f) => f.status === "planned" || f.status === "construction").length,
    districtsCovered: new Set(all.map((f) => f.district)).size,
    avgUtilization: avg(operational.map((f) => f.utilization)),
    avgAutomation: avg(operational.map((f) => f.automation.overall)),
    totalAnnualOpsCostEur: operational.reduce((s, f) => s + f.annualOpsCostEur, 0),
    totalAnnualVisits: operational.reduce((s, f) => s + f.annualVisits, 0),
    estimatedAnnualSavingsEur: getRecommendations().reduce((s, r) => s + (r.estimatedSavingsEur ?? 0), 0),
    districtKpis: kpis,
  };
}
