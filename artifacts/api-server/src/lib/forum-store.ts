import { randomUUID, createHash } from "node:crypto";
import { readJson, writeJsonUnsafe, withFileLock } from "./json-store";

export type ForumRole = "member" | "admin";
export type ForumPostStatus = "visible" | "quarantined" | "removed";
export type ForumCategory = "general" | "idea" | "facility" | "report";

export interface ForumUser {
  fingerprint: string;
  alias: string;
  role: ForumRole;
  createdAt: string;
  lastSeenAt: string;
  postCount: number;
  mutedUntil?: string | null;
}

export interface ForumPost {
  id: string;
  title: string;
  body: string;
  category: ForumCategory;
  district?: string | null;
  sport?: string | null;
  authorFingerprint: string;
  authorAlias: string;
  status: ForumPostStatus;
  spamScore: number;
  moderationReasons: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ModerationEvent {
  id: string;
  type: "post_created" | "post_quarantined" | "role_changed" | "post_removed";
  actorFingerprint: string;
  targetId?: string;
  message: string;
  createdAt: string;
}

interface ForumStore {
  users: ForumUser[];
  posts: ForumPost[];
  moderationEvents: ModerationEvent[];
}

const FILE = "forum-db.json";
const ALLOWED_CATEGORIES: ForumCategory[] = ["general", "idea", "facility", "report"];
const SPAM_WINDOW_MS = 10 * 60 * 1000;
const SPAM_WINDOW_LIMIT = 5;
const DUPLICATE_WINDOW_MS = 30 * 60 * 1000;

const BLOCKED_TERMS = [
  "casino",
  "crypto",
  "viagra",
  "free money",
  "telegram.me",
  "bit.ly",
  "tinyurl",
];

function nowIso() {
  return new Date().toISOString();
}

function hashFingerprint(raw: string): string {
  return createHash("sha256").update(raw || "anon").digest("hex").slice(0, 32);
}

function coerceFingerprint(raw: string): string {
  return /^[a-f0-9]{32}$/i.test(raw) ? raw.toLowerCase() : hashFingerprint(raw);
}

function fallbackAlias(fingerprint: string) {
  return `Narys-${fingerprint.slice(0, 6)}`;
}

async function load(): Promise<ForumStore> {
  return readJson<ForumStore>(FILE, { users: [], posts: [], moderationEvents: [] });
}

async function save(store: ForumStore): Promise<void> {
  await writeJsonUnsafe(FILE, store);
}

async function transaction<R>(fn: (store: ForumStore) => Promise<R> | R): Promise<R> {
  return withFileLock(FILE, async () => {
    const store = await load();
    return fn(store);
  });
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreSpam(input: {
  title: string;
  body: string;
  honeypot?: string;
  authorFingerprint: string;
}, posts: ForumPost[]) {
  const reasons: string[] = [];
  let score = 0;
  const title = normalizeText(input.title);
  const body = normalizeText(input.body);
  const combined = `${title} ${body}`;

  if (input.honeypot?.trim()) {
    score += 100;
    reasons.push("hidden field was filled");
  }

  if (input.title.trim().length < 6 || input.body.trim().length < 20) {
    score += 20;
    reasons.push("message is too short");
  }

  const urls = combined.match(/https?:\/\//g)?.length ?? 0;
  if (urls >= 2) {
    score += 35;
    reasons.push("too many links");
  }

  const blocked = BLOCKED_TERMS.find((term) => combined.includes(term));
  if (blocked) {
    score += 45;
    reasons.push(`blocked term: ${blocked}`);
  }

  if (/(.)\1{7,}/.test(combined)) {
    score += 20;
    reasons.push("repeated characters");
  }

  const now = Date.now();
  const recentByAuthor = posts.filter(
    (post) =>
      post.authorFingerprint === input.authorFingerprint &&
      now - new Date(post.createdAt).getTime() < SPAM_WINDOW_MS,
  );
  if (recentByAuthor.length >= SPAM_WINDOW_LIMIT) {
    score += 55;
    reasons.push("posting too quickly");
  }

  const duplicate = posts.some(
    (post) =>
      post.authorFingerprint === input.authorFingerprint &&
      normalizeText(post.title) === title &&
      normalizeText(post.body) === body &&
      now - new Date(post.createdAt).getTime() < DUPLICATE_WINDOW_MS,
  );
  if (duplicate) {
    score += 50;
    reasons.push("duplicate message");
  }

  return { score: Math.min(100, score), reasons };
}

function ensureUser(store: ForumStore, fingerprint: string, alias?: string | null): ForumUser {
  const fp = hashFingerprint(fingerprint);
  const existing = store.users.find((user) => user.fingerprint === fp);
  if (existing) {
    existing.lastSeenAt = nowIso();
    if (alias?.trim()) existing.alias = alias.trim().slice(0, 60);
    return existing;
  }

  const user: ForumUser = {
    fingerprint: fp,
    alias: alias?.trim().slice(0, 60) || fallbackAlias(fp),
    role: store.users.length === 0 ? "admin" : "member",
    createdAt: nowIso(),
    lastSeenAt: nowIso(),
    postCount: 0,
    mutedUntil: null,
  };
  store.users.push(user);
  return user;
}

export function sanitizeFingerprint(raw: string): string {
  return coerceFingerprint(raw);
}

export async function getForumSummary(fingerprint = "anon") {
  return transaction(async (store) => {
    const me = ensureUser(store, fingerprint);
    await save(store);
    return {
      me,
      visiblePosts: store.posts.filter((post) => post.status === "visible").length,
      quarantinedPosts: store.posts.filter((post) => post.status === "quarantined").length,
      members: store.users.length,
      latestModeration: store.moderationEvents.slice(-5).reverse(),
      dbFile: ".data/forum-db.json",
      antispam: {
        cooldownWindowMinutes: SPAM_WINDOW_MS / 60000,
        maxPostsPerWindow: SPAM_WINDOW_LIMIT,
        quarantineScore: 60,
      },
    };
  });
}

export async function listForumPosts(options: { includeQuarantined?: boolean } = {}) {
  const store = await load();
  return store.posts
    .filter((post) => options.includeQuarantined || post.status === "visible")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createForumPost(input: {
  title: string;
  body: string;
  category: ForumCategory;
  district?: string | null;
  sport?: string | null;
  authorFingerprint: string;
  authorAlias?: string | null;
  honeypot?: string;
}) {
  return transaction(async (store) => {
    const user = ensureUser(store, input.authorFingerprint, input.authorAlias);
    const mutedUntil = user.mutedUntil ? new Date(user.mutedUntil).getTime() : 0;
    if (mutedUntil > Date.now()) {
      throw new Error("User is temporarily muted by moderation");
    }

    const category = ALLOWED_CATEGORIES.includes(input.category) ? input.category : "general";
    const spam = scoreSpam(
      {
        title: input.title,
        body: input.body,
        honeypot: input.honeypot,
        authorFingerprint: user.fingerprint,
      },
      store.posts,
    );
    const status: ForumPostStatus = spam.score >= 60 ? "quarantined" : "visible";
    const createdAt = nowIso();
    const post: ForumPost = {
      id: randomUUID(),
      title: input.title.trim().slice(0, 140),
      body: input.body.trim().slice(0, 2400),
      category,
      district: input.district?.trim().slice(0, 80) || null,
      sport: input.sport?.trim().slice(0, 80) || null,
      authorFingerprint: user.fingerprint,
      authorAlias: user.alias,
      status,
      spamScore: spam.score,
      moderationReasons: spam.reasons,
      createdAt,
      updatedAt: createdAt,
    };

    store.posts.push(post);
    user.postCount += 1;
    user.lastSeenAt = createdAt;
    store.moderationEvents.push({
      id: randomUUID(),
      type: status === "quarantined" ? "post_quarantined" : "post_created",
      actorFingerprint: user.fingerprint,
      targetId: post.id,
      message:
        status === "quarantined"
          ? `Post quarantined with spam score ${spam.score}: ${spam.reasons.join(", ")}`
          : "Post published",
      createdAt,
    });
    await save(store);
    return post;
  });
}

export async function listForumUsers() {
  const store = await load();
  return store.users
    .map((user) => ({ ...user, fingerprint: user.fingerprint }))
    .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
}

export async function setForumRole(actorFingerprint: string, targetFingerprint: string, role: ForumRole, forceAdmin = false) {
  return transaction(async (store) => {
    const actor = ensureUser(store, actorFingerprint);
    if (!forceAdmin && actor.role !== "admin") {
      throw new Error("Only admin can change roles");
    }
    const targetHash = coerceFingerprint(targetFingerprint);
    const target = store.users.find((user) => user.fingerprint === targetHash);
    if (!target) return null;
    target.role = role;
    target.lastSeenAt = nowIso();
    store.moderationEvents.push({
      id: randomUUID(),
      type: "role_changed",
      actorFingerprint: actor.fingerprint,
      targetId: target.fingerprint,
      message: `Role changed to ${role}`,
      createdAt: nowIso(),
    });
    await save(store);
    return target;
  });
}

export async function listModerationEvents() {
  const store = await load();
  return store.moderationEvents.slice().reverse();
}

export const ALLOWED_FORUM_CATEGORIES = ALLOWED_CATEGORIES;
