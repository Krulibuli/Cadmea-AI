import demandJson from "../data/demand-report.json" with { type: "json" };

export interface SportPopularity {
  rank: number;
  sport: string;
  demand_index_0_100: number;
  trend_index_0_100: number;
  shortage_index_0_100: number;
  why_popular: string[];
  priority_facility_types: string[];
  best_keywords: string[];
}

export interface ShortageEntry {
  shortage: string;
  shortage_index_0_100: number;
  affected_districts: string[];
  why: string[];
  action: string;
}

export interface DistrictRecommendation {
  rank: number;
  district: string;
  sport: string;
  action: string;
  priority_score_0_100: number;
  confidence: string;
  reasons: string[];
  data_needed_to_confirm?: string[];
}

export interface GrowingTrend {
  sport_or_need: string;
  growth_proxy_0_100: number;
  evidence_type: string;
  keywords: string[];
  recommendation: string;
}

export interface DemandReport {
  report_name: string;
  version: string;
  generated_at: string;
  geo: string;
  important_note: Record<string, string>;
  source_types_used: string[];
  scoring_explanation: Record<string, string>;
  sport_popularity_ranked: SportPopularity[];
  what_is_growing_fastest: GrowingTrend[];
  biggest_shortages: ShortageEntry[];
  top_district_recommendations: DistrictRecommendation[];
  keyword_clusters_to_import_or_scrape_legally?: unknown;
  district_keyword_matrix_sample?: unknown;
  app_integration?: unknown;
}

const report = demandJson as unknown as DemandReport;

export function getDemandReport(): DemandReport {
  return report;
}

export function getShortagesForDistrict(district: string): ShortageEntry[] {
  return report.biggest_shortages.filter((s) =>
    s.affected_districts.some((d) => d.toLowerCase() === district.toLowerCase()),
  );
}

export function getDistrictRecommendations(district?: string): DistrictRecommendation[] {
  if (!district) return report.top_district_recommendations;
  return report.top_district_recommendations.filter(
    (r) => r.district.toLowerCase() === district.toLowerCase(),
  );
}

export function summarizeDemand() {
  const totalShortageScore = report.biggest_shortages.reduce(
    (s, x) => s + x.shortage_index_0_100,
    0,
  );
  const topShortage = [...report.biggest_shortages].sort(
    (a, b) => b.shortage_index_0_100 - a.shortage_index_0_100,
  )[0];
  const topGrowing = [...report.what_is_growing_fastest].sort(
    (a, b) => b.growth_proxy_0_100 - a.growth_proxy_0_100,
  )[0];
  return {
    generatedAt: report.generated_at,
    sportsRanked: report.sport_popularity_ranked.length,
    shortagesTracked: report.biggest_shortages.length,
    districtRecommendations: report.top_district_recommendations.length,
    averageShortageIndex:
      report.biggest_shortages.length > 0
        ? Math.round(totalShortageScore / report.biggest_shortages.length)
        : 0,
    topShortage: topShortage?.shortage ?? null,
    topGrowingNeed: topGrowing?.sport_or_need ?? null,
  };
}
