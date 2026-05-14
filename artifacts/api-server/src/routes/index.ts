import { Router, type IRouter } from "express";
import healthRouter from "./health";
import districtsRouter from "./districts";
import overlaysRouter from "./overlays";
import poisRouter from "./pois";
import aiRouter from "./ai";
import statsRouter from "./stats";
import openaiConversationsRouter from "./openai-conversations";
import ingestionRouter from "./ingestion";
import sportsRouter from "./sports";
import activeVilniusRouter from "./active-vilnius";
import demandRouter from "./demand";
import requestsRouter from "./requests";
import reviewsRouter from "./reviews";
import recommendationsRouter from "./recommendations";
import forumRouter from "./forum";

const router: IRouter = Router();

router.use(healthRouter);
router.use(districtsRouter);
router.use(overlaysRouter);
router.use(poisRouter);
router.use(aiRouter);
router.use(statsRouter);
router.use(openaiConversationsRouter);
router.use(ingestionRouter);
router.use(sportsRouter);
router.use(activeVilniusRouter);
router.use(demandRouter);
router.use(requestsRouter);
router.use(reviewsRouter);
router.use(recommendationsRouter);
router.use(forumRouter);

export default router;
