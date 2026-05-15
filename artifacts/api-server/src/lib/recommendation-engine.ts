import { getDemandReport } from "./demand-data";
import { listRequests } from "./requests-store";
import { listAllReviews } from "./reviews-store";
import { getAllFacilities } from "./sports-data";

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

const W_SHORTAGE = 0.45;
const W_PETITION = 0.25;
const W_REQUESTS = 0.1;
const W_UTIL = 0.15;
const W_REVIEWS = 0.05;

export async function buildRecommendations(): Promise<AiRecommendation[]> {
  const report = getDemandReport();
  const requests = await listRequests();
  const reviews = await listAllReviews();
  const facilities = getAllFacilities();

  const out: AiRecommendation[] = [];

  for (const rec of report.top_district_recommendations) {
    const district = rec.district;
    const districtRequests = requests.filter(
      (r) => r.district.toLowerCase() === district.toLowerCase(),
    );
    const districtPetitions = districtRequests.filter((r) => r.kind === "petition");
    const totalPetitionSupport = districtPetitions.reduce(
      (s, p) => s + p.supporters.length,
      0,
    );
    const openRequestCount = districtRequests.filter((r) => r.status === "open").length;

    const districtFacilities = facilities.filter(
      (f) => f.district.toLowerCase() === district.toLowerCase(),
    );
    const avgUtil =
      districtFacilities.length > 0
        ? districtFacilities.reduce((s, f) => s + f.utilization, 0) / districtFacilities.length
        : null;

    const districtReviews = reviews.filter((rv) =>
      districtFacilities.some((f) => f.id === rv.facilityId),
    );
    const avgRating =
      districtReviews.length > 0
        ? districtReviews.reduce((s, x) => s + x.rating, 0) / districtReviews.length
        : null;

    // Normalize each signal to 0-100
    const shortageScore = rec.priority_score_0_100;
    const petitionScore = Math.min(100, totalPetitionSupport * 1); // 100 supporters = 100
    const requestScore = Math.min(100, openRequestCount * 10);
    const utilScore = avgUtil != null ? Math.min(100, Math.max(0, avgUtil)) : 50;
    const reviewScore = avgRating != null ? (5 - avgRating) * 25 : 50; // lower rating ⇒ higher need

    const score =
      shortageScore * W_SHORTAGE +
      petitionScore * W_PETITION +
      requestScore * W_REQUESTS +
      utilScore * W_UTIL +
      reviewScore * W_REVIEWS;

    const evidence: AiRecommendation["evidence"] = [
      {
        label: "Demand shortage signal",
        weight: W_SHORTAGE,
        detail: `Demand Radar priority score ${shortageScore}/100 — ${rec.reasons[0] ?? ""}`,
      },
      {
        label: "Resident petitions",
        weight: W_PETITION,
        detail: `${districtPetitions.length} petition(s), ${totalPetitionSupport} total supporter(s)`,
      },
      {
        label: "Open resident requests",
        weight: W_REQUESTS,
        detail: `${openRequestCount} open request(s)`,
      },
      {
        label: "Existing facility utilization",
        weight: W_UTIL,
        detail:
          avgUtil != null
            ? `Average ${Math.round(avgUtil)}% utilization across ${districtFacilities.length} facility(ies)`
            : "No existing facilities to compare",
      },
      {
        label: "Resident reviews",
        weight: W_REVIEWS,
        detail:
          avgRating != null
            ? `Average ${avgRating.toFixed(1)}/5 across ${districtReviews.length} review(s)`
            : "No reviews yet",
      },
    ];

    out.push({
      id: `ai-${district.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${rec.rank}`,
      district,
      sport: rec.sport,
      action: rec.action,
      score: Math.round(score),
      confidence: rec.confidence as AiRecommendation["confidence"],
      evidence,
      signals: {
        demandShortageIndex: shortageScore,
        petitionSupporters: totalPetitionSupport,
        openRequests: openRequestCount,
        facilityCount: districtFacilities.length,
        avgUtilization: avgUtil != null ? Math.round(avgUtil) : null,
        avgRating: avgRating != null ? Math.round(avgRating * 10) / 10 : null,
      },
      scoringExplanation:
        "AI-assisted, deterministic weighted score: shortage 45% + petitions 25% + open requests 10% + utilization 15% + reviews 5%. No LLM is used; weights are transparent and auditable.",
    });
  }

  return out.sort((a, b) => b.score - a.score);
}
