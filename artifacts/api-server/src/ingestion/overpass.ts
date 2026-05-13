/**
 * OpenStreetMap Overpass API adapter — fetches POIs and urban features for Lithuanian cities.
 * Source: https://overpass-api.de/api/interpreter
 * Returns amenities, green spaces, transport stops, schools, healthcare.
 */

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const CITY_BOUNDS: Record<string, { south: number; west: number; north: number; east: number }> = {
  vilnius: { south: 54.57, west: 25.01, north: 54.83, east: 25.47 },
  kaunas: { south: 54.82, west: 23.76, north: 54.99, east: 24.10 },
  klaipeda: { south: 55.63, west: 21.06, north: 55.78, east: 21.24 },
};

export interface OsmFeature {
  osmId: number;
  type: string;
  name?: string;
  lat: number;
  lng: number;
  tags: Record<string, string>;
}

const QUERIES: Array<{ label: string; filter: string }> = [
  { label: "school", filter: '["amenity"="school"]' },
  { label: "hospital", filter: '["amenity"~"hospital|clinic|pharmacy"]' },
  { label: "park", filter: '["leisure"~"park|garden|nature_reserve"]' },
  { label: "bus_stop", filter: '["highway"="bus_stop"]' },
  { label: "tram_stop", filter: '["railway"="tram_stop"]' },
  { label: "supermarket", filter: '["shop"="supermarket"]' },
  { label: "restaurant", filter: '["amenity"="restaurant"]' },
  { label: "bicycle_path", filter: '["highway"="cycleway"]' },
];

function buildQuery(city: string, filter: string, timeout = 25): string {
  const b = CITY_BOUNDS[city];
  if (!b) return "";
  const bbox = `${b.south},${b.west},${b.north},${b.east}`;
  return `[out:json][timeout:${timeout}];node${filter}(${bbox});out body;`;
}

export async function fetchOsmFeatures(city: string): Promise<{
  features: OsmFeature[];
  source: { name: string; url: string; retrievedAt: string };
}> {
  const retrievedAt = new Date().toISOString();
  const features: OsmFeature[] = [];

  for (const q of QUERIES) {
    try {
      const ql = buildQuery(city, q.filter);
      if (!ql) continue;
      const resp = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(ql)}`,
        signal: AbortSignal.timeout(30_000),
      });
      if (!resp.ok) continue;
      const data = (await resp.json()) as {
        elements: Array<{ type: string; id: number; lat?: number; lon?: number; tags?: Record<string, string> }>;
      };
      for (const el of data.elements ?? []) {
        if (el.lat == null || el.lon == null) continue;
        features.push({
          osmId: el.id,
          type: q.label,
          name: el.tags?.name,
          lat: el.lat,
          lng: el.lon,
          tags: el.tags ?? {},
        });
      }
    } catch {
      // skip query on timeout or network error
    }
  }

  return {
    features,
    source: {
      name: "OpenStreetMap via Overpass API",
      url: "https://overpass-api.de",
      retrievedAt,
    },
  };
}
