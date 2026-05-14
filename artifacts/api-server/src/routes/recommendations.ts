import { Router } from "express";
import { buildRecommendations } from "../lib/recommendation-engine";

const router = Router();

router.get("/recommendations/ai", async (_req, res) => {
  const items = await buildRecommendations();
  res.json({
    items,
    methodology:
      "Transparent deterministic scoring (no LLM). Weights: shortage 45%, petitions 25%, open requests 10%, utilization 15%, reviews 5%.",
    generatedAt: new Date().toISOString(),
  });
});

export default router;
