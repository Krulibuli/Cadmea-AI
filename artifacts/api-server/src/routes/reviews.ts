import { Router } from "express";
import { createReview, listReviews, reviewSummary } from "../lib/reviews-store";
import { getFacility } from "../lib/sports-data";
import { getGoogleReviewSummary } from "../lib/demand-ingest";

const router = Router();

router.get("/facilities/:id/google-review-summary", (req, res) => {
  res.json(getGoogleReviewSummary(req.params.id));
});

function getFingerprint(req: import("express").Request): string {
  const fp = (req.headers["x-fingerprint"] || req.body?.fingerprint || "").toString().trim();
  return fp.slice(0, 128) || "anon";
}

router.get("/facilities/:id/reviews", async (req, res) => {
  const items = await listReviews(req.params.id);
  const summary = await reviewSummary(req.params.id);
  res.json({ items, summary });
});

router.post("/facilities/:id/reviews", async (req, res) => {
  const facility = getFacility(req.params.id);
  if (!facility) {
    res.status(404).json({ error: "Facility not found" });
    return;
  }
  const { rating, comment, alias } = req.body ?? {};
  if (typeof rating !== "number" || !comment || !String(comment).trim()) {
    res.status(400).json({ error: "rating (1-5) and comment are required" });
    return;
  }
  const fingerprint = getFingerprint(req);
  const result = await createReview({
    facilityId: req.params.id,
    rating,
    comment: String(comment),
    alias: alias ? String(alias) : null,
    authorFingerprint: fingerprint,
  });
  if ("error" in result) {
    res.status(429).json(result);
    return;
  }
  res.status(201).json(result);
});

export default router;
