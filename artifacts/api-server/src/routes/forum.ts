import { Router } from "express";
import {
  ALLOWED_FORUM_CATEGORIES,
  createForumPost,
  getForumSummary,
  listForumPosts,
  listForumUsers,
  listModerationEvents,
  setForumRole,
  type ForumCategory,
  type ForumRole,
} from "../lib/forum-store";

const router = Router();

function getFingerprint(req: import("express").Request): string {
  const fp = (req.headers["x-fingerprint"] || req.body?.fingerprint || "").toString().trim();
  return fp.slice(0, 256) || "anon";
}

function wantsAdmin(req: import("express").Request): boolean {
  const value = (req.headers["x-admin-token"] || "").toString();
  const expected = process.env["ADMIN_TOKEN"] || "local-admin";
  return value === expected;
}

router.get("/forum/summary", async (req, res) => {
  res.json(await getForumSummary(getFingerprint(req)));
});

router.get("/forum/posts", async (req, res) => {
  const includeQuarantined = req.query["include"] === "all" && wantsAdmin(req);
  const items = await listForumPosts({ includeQuarantined });
  res.json({ items });
});

router.post("/forum/posts", async (req, res) => {
  const { title, body, category, district, sport, alias, honeypot } = req.body ?? {};
  if (!title || !body) {
    res.status(400).json({ error: "title and body are required" });
    return;
  }
  if (category && !ALLOWED_FORUM_CATEGORIES.includes(category)) {
    res.status(400).json({ error: "invalid category" });
    return;
  }

  try {
    const post = await createForumPost({
      title: String(title),
      body: String(body),
      category: (category as ForumCategory | undefined) ?? "general",
      district: district ? String(district) : null,
      sport: sport ? String(sport) : null,
      authorAlias: alias ? String(alias) : null,
      authorFingerprint: getFingerprint(req),
      honeypot: honeypot ? String(honeypot) : "",
    });
    res.status(post.status === "quarantined" ? 202 : 201).json(post);
  } catch (err) {
    res.status(429).json({ error: err instanceof Error ? err.message : "moderation rejected request" });
  }
});

router.get("/forum/users", async (req, res) => {
  if (!wantsAdmin(req)) {
    res.status(403).json({ error: "admin token required" });
    return;
  }
  res.json({ items: await listForumUsers() });
});

router.patch("/forum/users/:fingerprint/role", async (req, res) => {
  if (!wantsAdmin(req)) {
    res.status(403).json({ error: "admin token required" });
    return;
  }
  const role = req.body?.role as ForumRole | undefined;
  if (role !== "member" && role !== "admin") {
    res.status(400).json({ error: "role must be member|admin" });
    return;
  }
  const actor = getFingerprint(req);
  const item = await setForumRole(actor, req.params.fingerprint, role, true);
  if (!item) {
    res.status(404).json({ error: "user not found" });
    return;
  }
  res.json(item);
});

router.get("/forum/moderation", async (req, res) => {
  if (!wantsAdmin(req)) {
    res.status(403).json({ error: "admin token required" });
    return;
  }
  res.json({ items: await listModerationEvents() });
});

export default router;
