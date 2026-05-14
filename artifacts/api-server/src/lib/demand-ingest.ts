import demandJson from "../data/demand-report.json" with { type: "json" };
import type { DemandReport } from "./demand-data";

/**
 * Boundary stub for ingesting external demand signals.
 *
 * Today this only re-exports the bundled Active Vilnius Demand Radar JSON.
 * Future implementations will plug in:
 *   - Google Keyword Planner CSV uploads (see report.important_note.how_to_upgrade)
 *   - Google Trends API
 *   - Google Places / Reviews summaries per facility
 *   - City open-data participation feeds
 *
 * Keeping the boundary here means routes/components import from a single
 * place even after the underlying source becomes pluggable.
 */
export function ingestDemandReport(): DemandReport {
  return demandJson as unknown as DemandReport;
}

export interface GoogleReviewSummary {
  facilityId: string;
  source: "placeholder" | "google_places";
  averageRating: number | null;
  totalReviews: number | null;
  highlights: string[];
  note: string;
  fetchedAt: string;
}

/**
 * Placeholder Google review summary for a facility.
 *
 * Returns a deterministic, clearly-labelled stub so the UI can render the
 * section without pretending to have real Google data. Wire to the Google
 * Places API once an API key is configured.
 */
export function getGoogleReviewSummary(facilityId: string): GoogleReviewSummary {
  return {
    facilityId,
    source: "placeholder",
    averageRating: null,
    totalReviews: null,
    highlights: [],
    note:
      "Google review summary not yet wired. This stub will be replaced once a Google Places API key is configured in the demand-ingest boundary.",
    fetchedAt: new Date().toISOString(),
  };
}
