import { Router } from "express";
import { aiQueryLog, databaseConfigured, db, districtScoresTable, districtsTable } from "@workspace/db";
import { openai, openaiConfigured, openaiModel } from "@workspace/integrations-openai-ai-server";
import {
  DATA_SOURCES,
  answerUrbanQuestion,
  bestMatch,
  type ScoreKey,
  type UserMode,
} from "../lib/city-data";

const router = Router();

type PublicScores = {
  districtId: number;
  safety: number;
  family: number;
  affordability: number;
  environment: number;
  transport: number;
  tourism: number;
  walkability: number;
  overall: number;
};

function publicScores(scores: typeof districtScoresTable.$inferSelect | undefined, district: typeof districtsTable.$inferSelect): PublicScores {
  const fallback = typeof district.overallScore === "number" && Number.isFinite(district.overallScore) ? district.overallScore : 5;
  const safe = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return {
    districtId: scores?.districtId ?? district.id,
    safety: safe(scores?.safety),
    family: safe(scores?.family),
    affordability: safe(scores?.affordability),
    environment: safe(scores?.environment),
    transport: safe(scores?.transport),
    tourism: safe(scores?.tourism),
    walkability: safe(scores?.walkability),
    overall: safe(scores?.overall),
  };
}


router.post("/ai/query", async (req, res) => {
  const start = Date.now();
  const { question, language = "en", city = "Vilnius", mode = "resident" } = req.body as {
    question?: string;
    language?: string;
    city?: string;
    mode?: UserMode;
  };

  if (!question) {
    res.status(400).json({ error: "question is required" });
    return;
  }

  const fallback = answerUrbanQuestion(question, mode, city, language === "lt" ? "lt" : "en");

  if (!databaseConfigured || !openaiConfigured || !openai) {
    res.json({ ...fallback, language, latencyMs: Date.now() - start });
    return;
  }

  try {
    const allDistricts = await db.select().from(districtsTable);
    const districts = filterDistrictsByCity(allDistricts, city);
    const scores = await db.select().from(districtScoresTable);

    if (districts.length === 0 || scores.length === 0) {
      res.json({ ...fallback, language, latencyMs: Date.now() - start });
      return;
    }

    const districtContext = districts.map((d) => {
      const s = scores.find((sc) => sc.districtId === d.id);
      return `${d.name} (${d.city}): overall ${d.overallScore?.toFixed(1)}, safety ${s?.safety?.toFixed(1)}, family ${s?.family?.toFixed(1)}, affordability ${s?.affordability?.toFixed(1)}, environment ${s?.environment?.toFixed(1)}, transport ${s?.transport?.toFixed(1)}, tourism ${s?.tourism?.toFixed(1)}, walkability ${s?.walkability?.toFixed(1)}. ${d.description ?? ""}`;
    }).join("\n");

    const systemPrompt = language === "lt"
      ? "You are Cadmea, a Lithuanian city intelligence assistant. Answer in Lithuanian. Use only the provided district data and be transparent about tradeoffs."
      : "You are Cadmea, a city intelligence assistant. Use only the provided public-data district context, give concrete area recommendations, and be transparent about tradeoffs.";

    const completion = await openai.chat.completions.create({
      model: openaiModel,
      max_completion_tokens: 900,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `User type: ${mode}. City: ${city}.\n\nPublic-data district context:\n${districtContext}\n\nSources:\n${DATA_SOURCES.map((s) => `${s.name}: ${s.url}`).join("\n")}\n\nQuestion: ${question}\n\nReturn a short answer with 2-3 recommended areas and clear reasons.`,
        },
      ],
    });

    const answer = completion.choices[0]?.message?.content ?? fallback.answer;
    const latencyMs = Date.now() - start;

    await db.insert(aiQueryLog).values({
      question,
      language,
      city,
      mode,
      answer,
      model: openaiModel,
      latencyMs,
      sources: DATA_SOURCES.map((source) => ({ ...source, retrievedAt: new Date().toISOString() })),
    }).catch(() => undefined);

    res.json({
      ...fallback,
      answer,
      reasoning: `${fallback.reasoning} OpenAI generated the final narrative from the configured database context.`,
      language,
      latencyMs,
    });
  } catch {
    res.json({ ...fallback, language, latencyMs: Date.now() - start });
  }
});

router.post("/ai/best-match", async (req, res) => {
  const start = Date.now();
  const { priorities, language = "en", city = "Vilnius", userType = "resident" } = req.body as {
    priorities?: ScoreKey[];
    language?: string;
    city?: string;
    userType?: UserMode;
  };

  if (!priorities || !Array.isArray(priorities)) {
    res.status(400).json({ error: "priorities array is required" });
    return;
  }

  const fallback = bestMatch(priorities, userType, city, language === "lt" ? "lt" : "en");

  if (!databaseConfigured) {
    res.json({ ...fallback, language, latencyMs: Date.now() - start });
    return;
  }

  try {
    const allDistricts = await db.select().from(districtsTable);
    const districts = filterDistrictsByCity(allDistricts, city);
    const scores = await db.select().from(districtScoresTable);

    if (districts.length === 0 || scores.length === 0) {
      res.json({ ...fallback, language, latencyMs: Date.now() - start });
      return;
    }

    const scored = districts.map((d) => {
      const s = scores.find((sc) => sc.districtId === d.id);
      if (!s) return { district: d, score: d.overallScore ?? 0, scores: s };
      const numericFields: Record<string, number> = {
        safety: s.safety,
        family: s.family,
        affordability: s.affordability,
        environment: s.environment,
        transport: s.transport,
        tourism: s.tourism,
        walkability: s.walkability,
        overall: s.overall,
      };
      const selected = priorities.filter((p) => typeof numericFields[p] === "number");
      const score = selected.length
        ? selected.reduce((sum, p) => sum + numericFields[p], 0) / selected.length
        : d.overallScore ?? 0;
      return { district: d, score, scores: s };
    });

    const top = scored.sort((a, b) => b.score - a.score).slice(0, 3);
    const reasoning = language === "lt"
      ? `Cadmea suderino prioritetus (${priorities.join(", ")}) ${userType} profiliui naudodama sukonfigūruotą duomenų bazę. Viešųjų šaltinių skaidrumas išlieka prie kiekvieno rezultato.`
      : `Cadmea matched ${priorities.join(", ")} for a ${userType} profile using the configured database. Public source transparency remains available in every result.`;
    const latencyMs = Date.now() - start;

    await db.insert(aiQueryLog).values({
      question: `best-match: userType=${userType}, priorities=${priorities.join(",")}`,
      language,
      city,
      mode: userType,
      answer: reasoning,
      model: "rule-based-db",
      latencyMs,
      sources: DATA_SOURCES.map((source) => ({ ...source, retrievedAt: new Date().toISOString() })),
    }).catch(() => undefined);

    res.json({
      topDistricts: top.map(({ district, scores: s }) => ({
        id: district.id,
        name: district.name,
        nameLt: district.nameLt,
        city: district.city,
        population: district.population,
        areaKm2: district.areaKm2,
        lat: district.lat,
        lng: district.lng,
        overallScore: district.overallScore,
        description: district.description,
        descriptionLt: district.descriptionLt,
        scores: publicScores(s, district),
        highlights: district.description ? [district.description] : [],
        highlightsLt: district.descriptionLt ? [district.descriptionLt] : [],
      })),
      reasoning,
      language,
      citations: DATA_SOURCES.map((source) => ({ ...source, retrievedAt: new Date().toISOString() })),
      latencyMs,
    });
  } catch {
    res.json({ ...fallback, language, latencyMs: Date.now() - start });
  }
});

function filterDistrictsByCity<T extends { city: string | null }>(districts: T[], city?: string) {
  const normalizedCity = normalizeCity(city ?? "Vilnius");
  if (!normalizedCity || normalizedCity === "any" || normalizedCity === "all") return districts;
  return districts.filter((district) => normalizeCity(district.city ?? "") === normalizedCity);
}

function normalizeCity(value: string) {
  return value
    .toLocaleLowerCase("lt-LT")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export default router;
