/**
 * OpenAQ v3 adapter — fetches real air quality sensor data for Lithuanian cities.
 * Source: https://api.openaq.io/v3
 * Covers: Vilnius, Kaunas, Klaipėda
 */

const OPENAQ_BASE = "https://api.openaq.io/v3";

const LITHUANIAN_CITIES = [
  { name: "vilnius", lat: 54.6872, lng: 25.2797 },
  { name: "kaunas", lat: 54.8985, lng: 23.9036 },
  { name: "klaipeda", lat: 55.7033, lng: 21.1443 },
];

export interface AqReading {
  locationId: number;
  locationName: string;
  city: string;
  lat: number;
  lng: number;
  parameter: string;
  value: number;
  unit: string;
  lastUpdated: string;
  sourceUrl: string;
}

export async function fetchLithuaniaAirQuality(): Promise<{
  readings: AqReading[];
  source: { name: string; url: string; retrievedAt: string };
}> {
  const retrievedAt = new Date().toISOString();
  const readings: AqReading[] = [];

  for (const city of LITHUANIAN_CITIES) {
    try {
      const url =
        `${OPENAQ_BASE}/locations?coordinates=${city.lat},${city.lng}&radius=50000&limit=20&page=1`;
      const resp = await fetch(url, {
        headers: { Accept: "application/json", "X-API-Key": process.env.OPENAQ_API_KEY ?? "" },
      });
      if (!resp.ok) continue;

      const data = (await resp.json()) as {
        results: Array<{
          id: number;
          name: string;
          coordinates?: { latitude: number; longitude: number };
          sensors?: Array<{
            parameter?: { name: string; units: string };
            summary?: { avg: number };
            lastValue?: number;
          }>;
          datetimeLast?: { utc: string };
        }>;
      };

      for (const loc of data.results ?? []) {
        const sensors = loc.sensors ?? [];
        for (const sensor of sensors) {
          const val = sensor.lastValue ?? sensor.summary?.avg;
          if (val == null) continue;
          readings.push({
            locationId: loc.id,
            locationName: loc.name,
            city: city.name,
            lat: loc.coordinates?.latitude ?? city.lat,
            lng: loc.coordinates?.longitude ?? city.lng,
            parameter: sensor.parameter?.name ?? "pm25",
            value: Math.round(val * 10) / 10,
            unit: sensor.parameter?.units ?? "µg/m³",
            lastUpdated: loc.datetimeLast?.utc ?? retrievedAt,
            sourceUrl: `${OPENAQ_BASE}/locations/${loc.id}`,
          });
        }
      }
    } catch {
      // skip city on network failure — partial data is still useful
    }
  }

  return {
    readings,
    source: {
      name: "OpenAQ v3",
      url: "https://api.openaq.io/v3",
      retrievedAt,
    },
  };
}
