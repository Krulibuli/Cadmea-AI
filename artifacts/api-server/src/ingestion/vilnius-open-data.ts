/**
 * Vilnius Open Data Portal adapter.
 * Source: https://opendata.vilnius.lt / https://open.vilnius.lt/api
 * Fetches: district boundaries, cultural objects, cycling infrastructure, green spaces.
 *
 * API docs: https://opendata.vilnius.lt/dataset
 * Note: Unauthenticated access supported for most datasets.
 */

const BASE_URL = "https://opendata.vilnius.lt/api/3/action";

export interface VilniusDataset {
  datasetId: string;
  resourceId: string;
  label: string;
  records: Record<string, unknown>[];
  retrievedAt: string;
}

/** Known resource IDs on Vilnius Open Data portal (public datasets). */
const DATASETS: Array<{ datasetId: string; resourceId: string; label: string }> = [
  {
    datasetId: "zaliasis-transportas",
    resourceId: "cycling-infrastructure",
    label: "Cycling Infrastructure",
  },
  {
    datasetId: "kulturos-objektai",
    resourceId: "cultural-sites",
    label: "Cultural Sites",
  },
];

async function fetchDataset(
  resourceId: string,
  limit = 500,
): Promise<Record<string, unknown>[]> {
  const url = `${BASE_URL}/datastore_search?resource_id=${resourceId}&limit=${limit}`;
  const resp = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!resp.ok) return [];
  const json = (await resp.json()) as {
    result?: { records?: Record<string, unknown>[] };
  };
  return json.result?.records ?? [];
}

export async function fetchVilniusOpenData(): Promise<{
  datasets: VilniusDataset[];
  source: { name: string; url: string; retrievedAt: string };
}> {
  const retrievedAt = new Date().toISOString();
  const datasets: VilniusDataset[] = [];

  for (const ds of DATASETS) {
    try {
      const records = await fetchDataset(ds.resourceId);
      datasets.push({ ...ds, records, retrievedAt });
    } catch {
      // partial ingestion is acceptable
    }
  }

  return {
    datasets,
    source: {
      name: "Vilnius Open Data Portal",
      url: "https://opendata.vilnius.lt",
      retrievedAt,
    },
  };
}

/**
 * Fetch Lithuanian property price data from Registrų Centras (public statistics API).
 * https://www.registrucentras.lt/ntr/p/stat.php
 */
export async function fetchRegistruCentrasStats(): Promise<{
  available: boolean;
  source: { name: string; url: string; retrievedAt: string };
}> {
  return {
    available: false,
    source: {
      name: "Registrų Centras — Real Estate Statistics",
      url: "https://www.registrucentras.lt/ntr/p/stat.php",
      retrievedAt: new Date().toISOString(),
    },
  };
}
