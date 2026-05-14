import { randomUUID } from "node:crypto";
import { readJson, writeJson, withFileLock } from "./json-store";

export type RequestKind = "issue" | "request" | "petition";
export type RequestStatus = "open" | "reviewing" | "planned" | "rejected" | "resolved";

export interface ResidentRequest {
  id: string;
  kind: RequestKind;
  title: string;
  description: string;
  district: string;
  facilityId?: string | null;
  discipline?: string | null;
  createdAt: string;
  updatedAt: string;
  authorFingerprint: string;
  authorAlias?: string | null;
  status: RequestStatus;
  supporters: string[];
  forwardedToCity: boolean;
}

interface Store {
  items: ResidentRequest[];
}

const FILE = "requests.json";
const PETITION_THRESHOLD = 100;

async function load(): Promise<Store> {
  return readJson<Store>(FILE, { items: [] });
}

async function save(store: Store): Promise<void> {
  await writeJson(FILE, store);
}

async function transaction<R>(fn: (store: Store) => Promise<R> | R): Promise<R> {
  return withFileLock(FILE, async () => {
    const store = await load();
    return fn(store);
  });
}

export async function listRequests(filter: {
  district?: string;
  kind?: RequestKind;
  status?: RequestStatus;
  facilityId?: string;
} = {}): Promise<ResidentRequest[]> {
  const { items } = await load();
  return items
    .filter((r) => !filter.district || r.district === filter.district)
    .filter((r) => !filter.kind || r.kind === filter.kind)
    .filter((r) => !filter.status || r.status === filter.status)
    .filter((r) => !filter.facilityId || r.facilityId === filter.facilityId)
    .sort((a, b) => b.supporters.length - a.supporters.length || b.createdAt.localeCompare(a.createdAt));
}

export async function getRequest(id: string): Promise<ResidentRequest | null> {
  const { items } = await load();
  return items.find((r) => r.id === id) ?? null;
}

export async function createRequest(input: {
  kind: RequestKind;
  title: string;
  description: string;
  district: string;
  facilityId?: string | null;
  discipline?: string | null;
  authorFingerprint: string;
  authorAlias?: string | null;
}): Promise<ResidentRequest> {
  return transaction(async (store) => {
    const now = new Date().toISOString();
    const item: ResidentRequest = {
      id: randomUUID(),
      kind: input.kind,
      title: input.title.slice(0, 160),
      description: input.description.slice(0, 2000),
      district: input.district,
      facilityId: input.facilityId ?? null,
      discipline: input.discipline ?? null,
      createdAt: now,
      updatedAt: now,
      authorFingerprint: input.authorFingerprint,
      authorAlias: input.authorAlias?.slice(0, 60) ?? null,
      status: "open",
      supporters: [input.authorFingerprint],
      forwardedToCity: false,
    };
    store.items.push(item);
    await save(store);
    return item;
  });
}

export async function supportRequest(id: string, fingerprint: string): Promise<ResidentRequest | null> {
  return transaction(async (store) => {
    const item = store.items.find((r) => r.id === id);
    if (!item) return null;
    if (!item.supporters.includes(fingerprint)) {
      item.supporters.push(fingerprint);
      item.updatedAt = new Date().toISOString();
      if (
        item.kind === "petition" &&
        !item.forwardedToCity &&
        item.supporters.length >= PETITION_THRESHOLD
      ) {
        item.forwardedToCity = true;
      }
      await save(store);
    }
    return item;
  });
}

export async function setRequestStatus(id: string, status: RequestStatus): Promise<ResidentRequest | null> {
  return transaction(async (store) => {
    const item = store.items.find((r) => r.id === id);
    if (!item) return null;
    item.status = status;
    item.updatedAt = new Date().toISOString();
    await save(store);
    return item;
  });
}

export const PETITION_THRESHOLD_VALUE = PETITION_THRESHOLD;
