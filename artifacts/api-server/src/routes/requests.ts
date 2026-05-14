import { Router } from "express";
import {
  createRequest,
  getRequest,
  listRequests,
  setRequestStatus,
  supportRequest,
  PETITION_THRESHOLD_VALUE,
  ALLOWED_REQUEST_TYPES,
  type RequestKind,
  type RequestStatus,
  type RequestType,
} from "../lib/requests-store";

const router = Router();

const ALLOWED_KINDS: RequestKind[] = ["issue", "request", "petition"];
const ALLOWED_STATUS: RequestStatus[] = ["open", "forwarded", "acknowledged", "planned", "rejected"];

function getFingerprint(req: import("express").Request): string {
  const fp = (req.headers["x-fingerprint"] || req.body?.fingerprint || "").toString().trim();
  return fp.slice(0, 128) || "anon";
}

router.get("/requests", async (req, res) => {
  const { district, kind, status, facilityId } = req.query as Record<string, string | undefined>;
  const items = await listRequests({
    district,
    kind: kind as RequestKind | undefined,
    status: status as RequestStatus | undefined,
    facilityId,
  });
  res.json({ items, petitionThreshold: PETITION_THRESHOLD_VALUE });
});

router.get("/requests/:id", async (req, res) => {
  const item = await getRequest(req.params.id);
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(item);
});

router.post("/requests", async (req, res) => {
  const { kind, title, description, district, sport, requestType, lat, lng, facilityId, discipline, alias } = req.body ?? {};
  if (!kind || !ALLOWED_KINDS.includes(kind)) {
    res.status(400).json({ error: "kind must be issue|request|petition" });
    return;
  }
  if (!title || !description || !district) {
    res.status(400).json({ error: "title, description and district are required" });
    return;
  }
  if (requestType && !ALLOWED_REQUEST_TYPES.includes(requestType)) {
    res.status(400).json({ error: "requestType must be build|upgrade|maintenance" });
    return;
  }
  const numLat = typeof lat === "number" ? lat : lat != null ? Number(lat) : null;
  const numLng = typeof lng === "number" ? lng : lng != null ? Number(lng) : null;
  const fingerprint = getFingerprint(req);
  const item = await createRequest({
    kind,
    title: String(title),
    description: String(description),
    district: String(district),
    sport: sport ? String(sport) : null,
    requestType: (requestType as RequestType | undefined) ?? null,
    lat: Number.isFinite(numLat) ? (numLat as number) : null,
    lng: Number.isFinite(numLng) ? (numLng as number) : null,
    facilityId: facilityId ? String(facilityId) : null,
    discipline: discipline ? String(discipline) : null,
    authorFingerprint: fingerprint,
    authorAlias: alias ? String(alias) : null,
  });
  res.status(201).json(item);
});

router.post("/requests/:id/support", async (req, res) => {
  const fingerprint = getFingerprint(req);
  const item = await supportRequest(req.params.id, fingerprint);
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(item);
});

router.patch("/requests/:id/status", async (req, res) => {
  const { status } = req.body ?? {};
  if (!ALLOWED_STATUS.includes(status)) {
    res.status(400).json({ error: "invalid status" });
    return;
  }
  const item = await setRequestStatus(req.params.id, status);
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(item);
});

export default router;
