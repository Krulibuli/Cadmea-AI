import { randomUUID } from "node:crypto";
import { readJson, writeJsonUnsafe, withFileLock } from "./json-store";

export interface FacilityReview {
  id: string;
  facilityId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  alias?: string | null;
  authorFingerprint: string;
  createdAt: string;
}

interface Store {
  items: FacilityReview[];
}

const FILE = "reviews.json";

async function load(): Promise<Store> {
  return readJson<Store>(FILE, { items: [] });
}

async function save(store: Store): Promise<void> {
  await writeJsonUnsafe(FILE, store);
}

export async function listReviews(facilityId: string): Promise<FacilityReview[]> {
  const { items } = await load();
  return items
    .filter((r) => r.facilityId === facilityId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listAllReviews(): Promise<FacilityReview[]> {
  const { items } = await load();
  return items;
}

export async function createReview(input: {
  facilityId: string;
  rating: number;
  comment: string;
  alias?: string | null;
  authorFingerprint: string;
}): Promise<FacilityReview | { error: string }> {
  const r = Math.round(input.rating);
  if (r < 1 || r > 5) return { error: "rating must be 1-5" };
  return withFileLock(FILE, async () => {
    const store = await load();
    const recentByAuthor = store.items.filter(
      (x) =>
        x.facilityId === input.facilityId &&
        x.authorFingerprint === input.authorFingerprint &&
        Date.now() - new Date(x.createdAt).getTime() < 24 * 60 * 60 * 1000,
    );
    if (recentByAuthor.length > 0) {
      return { error: "You have already reviewed this facility in the last 24 hours." };
    }
    const review: FacilityReview = {
      id: randomUUID(),
      facilityId: input.facilityId,
      rating: r as FacilityReview["rating"],
      comment: input.comment.slice(0, 600),
      alias: input.alias?.slice(0, 60) ?? null,
      authorFingerprint: input.authorFingerprint,
      createdAt: new Date().toISOString(),
    };
    store.items.push(review);
    await save(store);
    return review;
  });
}

export async function reviewSummary(facilityId: string): Promise<{
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}> {
  const items = await listReviews(facilityId);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
  for (const it of items) distribution[it.rating]++;
  const average = items.length > 0 ? items.reduce((s, x) => s + x.rating, 0) / items.length : 0;
  return { count: items.length, average: Math.round(average * 10) / 10, distribution };
}
