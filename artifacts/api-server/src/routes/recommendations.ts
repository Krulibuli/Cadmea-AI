import { Router } from "express";
import { buildRecommendations } from "../lib/recommendation-engine";

const router = Router();

async function handleRecommendations(_req: import("express").Request, res: import("express").Response) {
  const items = await buildRecommendations();
  res.json({
    items,
    methodology:
      "Transparent deterministic scoring (no LLM). Weights: shortage 45%, petitions 25%, open requests 10%, utilization 15%, reviews 5%.",
    generatedAt: new Date().toISOString(),
  });
}

router.get("/recommendations", handleRecommendations);
router.get("/recommendations/ai", handleRecommendations);

export default router;
