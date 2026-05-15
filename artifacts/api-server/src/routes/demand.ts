import { Router } from "express";
import {
  getDemandReport,
  getDistrictRecommendations,
  getShortagesForDistrict,
  summarizeDemand,
} from "../lib/demand-data";

const router = Router();

router.get("/demand/report", (_req, res) => {
  res.json(getDemandReport());
});

router.get("/demand/summary", (_req, res) => {
  res.json(summarizeDemand());
});

router.get("/demand/district-recommendations", (req, res) => {
  const { district } = req.query as Record<string, string | undefined>;
  res.json(getDistrictRecommendations(district));
});

router.get("/demand/shortages", (req, res) => {
  const { district } = req.query as Record<string, string | undefined>;
  res.json(district ? getShortagesForDistrict(district) : getDemandReport().biggest_shortages);
});

export default router;
