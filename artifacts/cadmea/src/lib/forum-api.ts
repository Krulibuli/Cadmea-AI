import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFingerprint } from "./fingerprint";

export type ForumRole = "member" | "admin";
export type ForumCategory = "general" | "idea" | "facility" | "report";
export type ForumPostStatus = "visible" | "quarantined" | "removed";

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

export interface ForumSummary {
  me: ForumUser;
  visiblePosts: number;
  quarantinedPosts: number;
  members: number;
  latestModeration: ModerationEvent[];
  dbFile: string;
  antispam: {
    cooldownWindowMinutes: number;
    maxPostsPerWindow: number;
    quarantineScore: number;
  };
}

function adminToken() {
  return window.localStorage.getItem("cadmea-admin-token") || "local-admin";
}

async function get<T>(url: string, admin = false): Promise<T> {
  const headers: Record<string, string> = { "X-Fingerprint": getFingerprint() };
  if (admin) headers["X-Admin-Token"] = adminToken();
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

async function send<T>(url: string, method: string, body: unknown, admin = false): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Fingerprint": getFingerprint(),
  };
  if (admin) headers["X-Admin-Token"] = adminToken();
  const res = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const json = await res.json();
      if (json?.error) message = json.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export function useForumSummary() {
  return useQuery({
    queryKey: ["forum/summary"],
    queryFn: () => get<ForumSummary>("/api/forum/summary"),
  });
}

export function useForumPosts(includeAll = false) {
  return useQuery({
    queryKey: ["forum/posts", includeAll],
    queryFn: () => get<{ items: ForumPost[] }>(`/api/forum/posts${includeAll ? "?include=all" : ""}`, includeAll),
  });
}

export function useCreateForumPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      title: string;
      body: string;
      category: ForumCategory;
      district?: string | null;
      sport?: string | null;
      alias?: string | null;
      honeypot?: string;
    }) => send<ForumPost>("/api/forum/posts", "POST", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["forum/posts"] });
      qc.invalidateQueries({ queryKey: ["forum/summary"] });
    },
  });
}

export function useForumUsers() {
  return useQuery({
    queryKey: ["forum/users"],
    queryFn: () => get<{ items: ForumUser[] }>("/api/forum/users", true),
  });
}

export function useUpdateForumRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fingerprint, role }: { fingerprint: string; role: ForumRole }) =>
      send<ForumUser>(`/api/forum/users/${encodeURIComponent(fingerprint)}/role`, "PATCH", { role }, true),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["forum/users"] });
      qc.invalidateQueries({ queryKey: ["forum/summary"] });
    },
  });
}

export function useModerationEvents() {
  return useQuery({
    queryKey: ["forum/moderation"],
    queryFn: () => get<{ items: ModerationEvent[] }>("/api/forum/moderation", true),
  });
}

export const FORUM_CATEGORY_LABEL: Record<ForumCategory, string> = {
  general: "Diskusija",
  idea: "Ideja",
  facility: "Objektas",
  report: "Problema",
};
