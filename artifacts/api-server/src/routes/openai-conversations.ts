import { Router } from "express";
import { conversations, databaseConfigured, db, districtScoresTable, districtsTable, messages } from "@workspace/db";
import { openai, openaiConfigured, openaiModel } from "@workspace/integrations-openai-ai-server";
import { desc, eq } from "drizzle-orm";
import { answerUrbanQuestion, DATA_SOURCES, type UserMode } from "../lib/city-data";

const router = Router();

interface MemoryMessage {
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface MemoryConversation {
  id: number;
  title: string;
  createdAt: string;
  messages: MemoryMessage[];
}

const memoryConversations = new Map<number, MemoryConversation>();
let nextConversationId = 1;
let nextMessageId = 1;

function createMemoryConversation(title: string, forcedId?: number) {
  const id = forcedId ?? nextConversationId++;
  nextConversationId = Math.max(nextConversationId, id + 1);
  const conversation: MemoryConversation = {
    id,
    title,
    createdAt: new Date().toISOString(),
    messages: [],
  };
  memoryConversations.set(conversation.id, conversation);
  return conversation;
}

function getOrCreateMemoryConversation(id?: number) {
  if (id && memoryConversations.has(id)) return memoryConversations.get(id)!;
  return createMemoryConversation("Urban AI chat", id);
}

function addMemoryMessage(conversationId: number, role: "user" | "assistant", content: string) {
  const conversation = getOrCreateMemoryConversation(conversationId);
  const message: MemoryMessage = {
    id: nextMessageId++,
    conversationId: conversation.id,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
  conversation.messages.push(message);
  return message;
}

router.get("/openai/conversations", async (_req, res) => {
  if (!databaseConfigured) {
    res.json([...memoryConversations.values()].map(({ messages: _messages, ...conversation }) => conversation));
    return;
  }

  try {
    const convs = await db.select().from(conversations).orderBy(desc(conversations.createdAt));
    res.json(convs.map((c) => ({ id: c.id, title: c.title, createdAt: c.createdAt })));
  } catch {
    res.json([...memoryConversations.values()].map(({ messages: _messages, ...conversation }) => conversation));
  }
});

router.post("/openai/conversations", async (req, res) => {
  const { title } = req.body as { title?: string };
  if (!title) {
    res.status(400).json({ error: "title is required" });
    return;
  }

  if (!databaseConfigured) {
    const conversation = createMemoryConversation(title);
    res.status(201).json({ id: conversation.id, title: conversation.title, createdAt: conversation.createdAt });
    return;
  }

  try {
    const [conv] = await db.insert(conversations).values({ title }).returning();
    res.status(201).json({ id: conv.id, title: conv.title, createdAt: conv.createdAt });
  } catch {
    const conversation = createMemoryConversation(title);
    res.status(201).json({ id: conversation.id, title: conversation.title, createdAt: conversation.createdAt });
  }
});

router.get("/openai/conversations/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (!databaseConfigured) {
    const conversation = memoryConversations.get(id);
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json(conversation);
    return;
  }

  try {
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    if (!conv) {
      const fallback = memoryConversations.get(id);
      if (!fallback) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }
      res.json(fallback);
      return;
    }
    const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
    res.json({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt,
      messages: msgs.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    });
  } catch {
    const conversation = memoryConversations.get(id);
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json(conversation);
  }
});

router.delete("/openai/conversations/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  memoryConversations.delete(id);

  if (!databaseConfigured) {
    res.status(204).end();
    return;
  }

  try {
    await db.delete(messages).where(eq(messages.conversationId, id));
    await db.delete(conversations).where(eq(conversations.id, id));
    res.status(204).end();
  } catch {
    res.status(204).end();
  }
});

router.get("/openai/conversations/:id/messages", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (!databaseConfigured) {
    res.json(memoryConversations.get(id)?.messages ?? []);
    return;
  }

  try {
    const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
    res.json(msgs.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })));
  } catch {
    res.json(memoryConversations.get(id)?.messages ?? []);
  }
});

type ChatContext = {
  city?: string;
  districtId?: number;
  mode?: UserMode | string;
};

function normalizeChatMode(mode?: string): UserMode {
  const validModes = new Set<UserMode>(["resident", "tourist", "student", "investor", "family", "professional", "retiree", "expat"]);
  return validModes.has(mode as UserMode) ? (mode as UserMode) : "resident";
}

function normalizeChatCity(city?: string) {
  const clean = city?.trim();
  return clean && clean.length ? clean : "Vilnius";
}

router.post("/openai/conversations/:id/messages", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid conversation id" });
    return;
  }

  const { content, language, context } = req.body as { content?: string; language?: string; context?: ChatContext };
  if (!content) {
    res.status(400).json({ error: "content is required" });
    return;
  }
  const chatLanguage = language === "lt" ? "lt" : inferChatLanguage(content);
  const chatCity = normalizeChatCity(context?.city);
  const chatMode = normalizeChatMode(context?.mode);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const writeChunk = (text: string) => res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
  const writeDone = () => {
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  };

  if (!databaseConfigured) {
    addMemoryMessage(id, "user", content);
    const fallback = answerUrbanQuestion(content, chatMode, chatCity, chatLanguage);
    const generated = `${fallback.answer}\n\n${fallback.reasoning}`;
    addMemoryMessage(id, "assistant", generated);
    streamText(generated, writeChunk);
    writeDone();
    return;
  }

  if (!openaiConfigured || !openai) {
    const fallback = answerUrbanQuestion(content, chatMode, chatCity, chatLanguage);
    const generated = `${fallback.answer}\n\n${fallback.reasoning}`;

    try {
      const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
      if (conv) {
        await db.insert(messages).values({ conversationId: id, role: "user", content });
        await db.insert(messages).values({ conversationId: id, role: "assistant", content: generated });
      } else {
        addMemoryMessage(id, "user", content);
        addMemoryMessage(id, "assistant", generated);
      }
    } catch {
      addMemoryMessage(id, "user", content);
      addMemoryMessage(id, "assistant", generated);
    }

    streamText(generated, writeChunk);
    writeDone();
    return;
  }

  try {
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    if (!conv) {
      getOrCreateMemoryConversation(id);
      addMemoryMessage(id, "user", content);
      const fallback = answerUrbanQuestion(content, chatMode, chatCity, chatLanguage);
      const generated = `${fallback.answer}\n\n${fallback.reasoning}`;
      addMemoryMessage(id, "assistant", generated);
      streamText(generated, writeChunk);
      writeDone();
      return;
    }

    await db.insert(messages).values({ conversationId: id, role: "user", content });
    const history = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
    const districts = await db.select().from(districtsTable);
    const scores = await db.select().from(districtScoresTable);
    const normalizedCity = chatCity.toLocaleLowerCase("lt-LT").normalize("NFD").replace(/\p{Diacritic}/gu, "");
    const contextDistricts = districts
      .filter((d) => normalizedCity === "any" || normalizedCity === "all" || d.city.toLocaleLowerCase("lt-LT").normalize("NFD").replace(/\p{Diacritic}/gu, "") === normalizedCity)
      .sort((a, b) => (a.id === context?.districtId ? -1 : b.id === context?.districtId ? 1 : (b.overallScore ?? 0) - (a.overallScore ?? 0)))
      .slice(0, 20);
    const districtContext = contextDistricts.map((d) => {
      const s = scores.find((sc) => sc.districtId === d.id);
      const safe = (value: unknown, fallback = d.overallScore ?? 5) => typeof value === "number" && Number.isFinite(value) ? value.toFixed(1) : fallback.toFixed(1);
      return `${d.name} (${d.city}): overall ${safe(d.overallScore)}, safety ${safe(s?.safety)}, environment ${safe(s?.environment)}, affordability ${safe(s?.affordability)}, transport ${safe(s?.transport)}`;
    }).join("; ");

    const chatMessages = [
      {
        role: "system" as const,
        content: chatLanguage === "lt"
          ? `Tu esi Cadmea, išmanus miesto žemėlapio asistentas. Atsakyk lietuviškai. Vartotojo kontekstas: miestas ${chatCity}, profilis ${chatMode}. Naudok žemiau pateiktą viešųjų duomenų kontekstą, rekomenduok konkrečius rajonus ir aiškiai paaiškink kompromisus.\n\nRajonų duomenys: ${districtContext}\n\nŠaltiniai: ${DATA_SOURCES.map((s) => s.name).join(", ")}.`
          : `You are Cadmea, an intelligent city map assistant. User context: city ${chatCity}, profile ${chatMode}. Use the public-data context below, recommend specific areas, and explain tradeoffs clearly.\n\nDistrict data: ${districtContext}\n\nSources: ${DATA_SOURCES.map((s) => s.name).join(", ")}.`,
      },
      ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content ?? "" })),
    ];

    let fullResponse = "";
    const stream = await openai.chat.completions.create({
      model: openaiModel,
      max_completion_tokens: 1024,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        fullResponse += text;
        writeChunk(text);
      }
    }

    if (!fullResponse.trim()) {
      const fallback = answerUrbanQuestion(content, chatMode, chatCity, chatLanguage);
      fullResponse = `${fallback.answer}\n\n${fallback.reasoning}`;
      streamText(fullResponse, writeChunk);
    }

    await db.insert(messages).values({ conversationId: id, role: "assistant", content: fullResponse });
    writeDone();
  } catch {
    addMemoryMessage(id, "user", content);
    const fallback = answerUrbanQuestion(content, chatMode, chatCity, chatLanguage);
    const generated = `${fallback.answer}\n\n${fallback.reasoning}`;
    addMemoryMessage(id, "assistant", generated);
    if (databaseConfigured) {
      await db.insert(messages).values({ conversationId: id, role: "assistant", content: generated }).catch(() => undefined);
    }
    streamText(generated, writeChunk);
    writeDone();
  }
});

function streamText(text: string, write: (text: string) => void) {
  const words = text.split(/(\s+)/);
  for (const word of words) write(word);
}

function inferChatLanguage(content: string): "en" | "lt" {
  return /[ąčęėįšųūž]|(kur|kok|raj|vaik|šeim|saug|viešbut|kavin|restoran|lankyt)/i.test(content) ? "lt" : "en";
}

export default router;
