import OpenAI from "openai";

const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY;
const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined;

export const openaiConfigured = Boolean(apiKey);

export const openai = openaiConfigured
  ? new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    })
  : null;

export const openaiModel = process.env.OPENAI_MODEL ?? process.env.AI_INTEGRATIONS_OPENAI_MODEL ?? "gpt-4.1-mini";
