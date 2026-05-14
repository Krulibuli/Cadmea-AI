import { Router } from "express";
import { getAllFacilities, getFacility, getOccupancy } from "../lib/sports-data";

const router = Router();

/**
 * ActiveVilnius integration endpoints — outbound interoperability layer.
 * See docs/activevilnius-integration.md for the full specification.
 */

router.get("/integrations/active-vilnius/export.json", (_req, res) => {
  const facilities = getAllFacilities()
    .filter((f) => f.source === "managed" || f.source === "managed_planned")
    .map((f) => ({
      external_id: f.id,
      name: f.name,
      type: f.type,
      district: f.district,
      address: f.address,
      lat: f.lat,
      lng: f.lng,
      disciplines: f.disciplines,
      age_groups: f.ageGroups,
      accessibility: f.accessibility,
      capacity: f.capacity,
      status: f.status,
      booking_provider: f.bookingProvider,
      booking_url: f.bookingUrl ?? null,
      entry_type: f.entryType,
      price_from_eur: f.priceFromEur,
    }));
  res.json({
    schema: "vilnius-sports-hub/v1",
    generated_at: new Date().toISOString(),
    count: facilities.length,
    facilities,
  });
});

router.get("/integrations/active-vilnius/export.csv", (_req, res) => {
  const facilities = getAllFacilities().filter(
    (f) => f.source === "managed" || f.source === "managed_planned",
  );
  const header = [
    "external_id", "name", "type", "district", "address", "lat", "lng",
    "disciplines", "age_groups", "accessibility", "capacity", "status",
    "booking_provider", "booking_url", "entry_type", "price_from_eur",
  ];
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = facilities.map((f) =>
    [
      f.id, f.name, f.type, f.district, f.address, f.lat, f.lng,
      f.disciplines.join("|"), f.ageGroups.join("|"), f.accessibility.join("|"),
      f.capacity, f.status, f.bookingProvider, f.bookingUrl ?? "", f.entryType, f.priceFromEur,
    ].map(esc).join(","),
  );
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="vilnius-sports-hub-facilities.csv"');
  res.send([header.join(","), ...rows].join("\n"));
});

/**
 * Embeddable widget HTML — designed to be dropped into ActiveVilnius
 * facility pages via <iframe src="…/widget/facility/:id">.
 */
function escHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(u: string | undefined): string | null {
  if (!u) return null;
  try {
    const parsed = new URL(u);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
  } catch {
    // fall through
  }
  return null;
}

router.get("/integrations/active-vilnius/widget/facility/:id", (req, res) => {
  const f = getFacility(req.params.id);
  const occ = getOccupancy(req.params.id);
  if (!f || !occ) {
    res.status(404).send("<p>Facility not found</p>");
    return;
  }
  const safeBookingUrl = safeUrl(f.bookingUrl);
  const bar = (v: number) =>
    `<div style="height:8px;background:#eee;border-radius:4px;overflow:hidden">
       <div style="width:${v}%;height:100%;background:${v >= 80 ? "#C8102E" : v >= 50 ? "#F59E0B" : "#16A34A"}"></div>
     </div>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Frame-Options", "ALLOWALL");
  res.send(`<!doctype html><html lang="lt"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escHtml(f.name)} — Vilnius Sports Hub</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;margin:0;padding:14px;background:#fff;color:#0f172a}
  .badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;background:#fee;color:#C8102E;margin-right:6px}
  h1{font-size:16px;margin:6px 0 4px}
  p.sub{margin:0 0 10px;color:#64748b;font-size:12px}
  .row{display:flex;justify-content:space-between;font-size:12px;margin:6px 0}
  .grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-top:6px}
  .cell{height:14px;border-radius:2px}
  small{color:#64748b}
</style></head><body>
<span class="badge">Vilnius Sports Hub</span>
<h1>${escHtml(f.name)}</h1>
<p class="sub">${escHtml(f.district)} · ${escHtml(f.address)}</p>
<div class="row"><strong>Užimtumas dabar / Now</strong><span>${occ.current}%</span></div>
${bar(occ.current)}
<div class="row" style="margin-top:10px"><strong>Šios dienos kreivė / Today</strong></div>
<div style="display:flex;gap:1px;align-items:flex-end;height:36px">
${occ.today.map((v) => `<div title="${v}%" style="flex:1;background:#1F6F8B;opacity:${0.25 + (v / 100) * 0.75};height:${Math.max(2, v)}%"></div>`).join("")}
</div>
<div class="row" style="margin-top:8px"><small>0:00</small><small>12:00</small><small>23:00</small></div>
<p style="margin-top:10px;font-size:11px;color:#64748b">${escHtml(occ.notes ?? "")}</p>
${safeBookingUrl ? `<a href="${escHtml(safeBookingUrl)}" target="_blank" rel="noopener" style="display:block;text-align:center;margin-top:8px;padding:8px 12px;background:#C8102E;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;font-size:13px">Rezervuoti / Book</a>` : ""}
</body></html>`);
});

export default router;
