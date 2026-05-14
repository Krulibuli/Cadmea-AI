import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFingerprint } from "./fingerprint";

export interface DemandReport {
  report_name: string;
  version: string;
  generated_at: string;
  scoring_explanation: Record<string, string>;
  sport_popularity_ranked: {
    rank: number;
    sport: string;
    demand_index_0_100: number;
    trend_index_0_100: number;
    shortage_index_0_100: number;
    why_popular: string[];
    priority_facility_types: string[];
    best_keywords: string[];
  }[];
  what_is_growing_fastest: {
    sport_or_need: string;
    growth_proxy_0_100: number;
    evidence_type: string;
    keywords: string[];
    recommendation: string;
  }[];
  biggest_shortages: {
    shortage: string;
    shortage_index_0_100: number;
    affected_districts: string[];
    why: string[];
    action: string;
  }[];
  top_district_recommendations: {
    rank: number;
    district: string;
    sport: string;
    action: string;
    priority_score_0_100: number;
    confidence: string;
    reasons: string[];
  }[];
  keyword_clusters_to_import_or_scrape_legally?: Record<string, string[]>;
  district_keyword_matrix_sample?: {
    district: string;
    top_sports: string[];
    must_test_keywords: string[];
  }[];
}

export interface DemandSummary {
  generatedAt: string;
  sportsRanked: number;
  shortagesTracked: number;
  districtRecommendations: number;
  averageShortageIndex: number;
  topShortage: string | null;
  topGrowingNeed: string | null;
}

export type RequestKind = "issue" | "request" | "petition";
export type RequestStatus = "open" | "forwarded" | "acknowledged" | "planned" | "rejected";
export type RequestType = "build" | "upgrade" | "maintenance";

export interface GoogleReviewSummary {
  facilityId: string;
  source: "placeholder" | "google_places";
  averageRating: number | null;
  totalReviews: number | null;
  highlights: string[];
  note: string;
  fetchedAt: string;
}

export interface ResidentRequest {
  id: string;
  kind: RequestKind;
  title: string;
  description: string;
  district: string;
  sport?: string | null;
  requestType?: RequestType | null;
  lat?: number | null;
  lng?: number | null;
  facilityId?: string | null;
  discipline?: string | null;
  createdAt: string;
  updatedAt: string;
  authorAlias?: string | null;
  status: RequestStatus;
  supporters: string[];
  forwardedToCity: boolean;
}

export interface FacilityReview {
  id: string;
  facilityId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  alias?: string | null;
  createdAt: string;
}

export interface AiRecommendation {
  id: string;
  district: string;
  sport: string;
  action: string;
  score: number;
  confidence: "Low" | "Medium" | "High";
  evidence: { label: string; weight: number; detail: string }[];
  signals: {
    demandShortageIndex: number;
    petitionSupporters: number;
    openRequests: number;
    facilityCount: number;
    avgUtilization: number | null;
    avgRating: number | null;
  };
  scoringExplanation: string;
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

async function send<T>(url: string, method: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", "X-Fingerprint": getFingerprint() },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export function useDemandReport() {
  return useQuery({ queryKey: ["demand/report"], queryFn: () => get<DemandReport>("/api/demand/report") });
}

export function useDemandSummary() {
  return useQuery({ queryKey: ["demand/summary"], queryFn: () => get<DemandSummary>("/api/demand/summary") });
}

export function useRequests(filter: { district?: string; kind?: RequestKind; status?: RequestStatus; facilityId?: string } = {}) {
  const sp = new URLSearchParams();
  Object.entries(filter).forEach(([k, v]) => { if (v) sp.set(k, v); });
  const qs = sp.toString();
  return useQuery({
    queryKey: ["requests", filter],
    queryFn: () => get<{ items: ResidentRequest[]; petitionThreshold: number }>(`/api/requests${qs ? `?${qs}` : ""}`),
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      kind: RequestKind;
      title: string;
      description: string;
      district: string;
      sport?: string | null;
      requestType?: RequestType | null;
      lat?: number | null;
      lng?: number | null;
      facilityId?: string | null;
      discipline?: string | null;
      alias?: string | null;
    }) => send<ResidentRequest>("/api/requests", "POST", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });
}

export function useSupportRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => send<ResidentRequest>(`/api/requests/${id}/support`, "POST", {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });
}

export function useSetRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      send<ResidentRequest>(`/api/requests/${id}/status`, "PATCH", { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });
}

export function useFacilityReviews(facilityId: string | undefined) {
  return useQuery({
    enabled: !!facilityId,
    queryKey: ["reviews", facilityId],
    queryFn: () => get<{ items: FacilityReview[]; summary: { count: number; average: number; distribution: Record<string, number> } }>(
      `/api/facilities/${facilityId}/reviews`,
    ),
  });
}

export function useCreateReview(facilityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { rating: number; comment: string; alias?: string | null }) =>
      send<FacilityReview>(`/api/facilities/${facilityId}/reviews`, "POST", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews", facilityId] }),
  });
}

export function useAiRecommendations() {
  return useQuery({
    queryKey: ["ai-recommendations"],
    queryFn: () => get<{ items: AiRecommendation[]; methodology: string; generatedAt: string }>("/api/recommendations"),
  });
}

export function useGoogleReviewSummary(facilityId: string | undefined) {
  return useQuery({
    enabled: !!facilityId,
    queryKey: ["google-review-summary", facilityId],
    queryFn: () => get<GoogleReviewSummary>(`/api/facilities/${facilityId}/google-review-summary`),
  });
}
