# ActiveVilnius ↔ Vilnius Sports Hub — Integration Spec

**Owner:** Vilnius Sports Hub
**Status:** Draft v1 — outbound endpoints implemented, inbound webhook + OAuth pending partner agreement.
**Last updated:** 2026-05

## Goals

Two-way interoperability between the **Vilnius Sports Hub** open-data platform and **ActiveVilnius**, the city's primary sports-facility booking provider.

1. **Outbound (Hub → ActiveVilnius)** — Hub publishes the canonical facility catalogue (with age groups, accessibility, occupancy model) so ActiveVilnius can enrich its listings without re-collecting the data.
2. **Inbound (ActiveVilnius → Hub)** — ActiveVilnius pushes live booking density so Hub can replace the modeled "Užimtumo rodymas" with real-time data and surface availability windows.
3. **Embed (drop-in widget)** — A signed iframe widget that ActiveVilnius can embed on any facility page to show live occupancy and a deep-link back to Hub for context.

Booking remains 100% on ActiveVilnius. Hub never collects payments — it deep-links out.

---

## Outbound endpoints (implemented today)

Base URL: `https://<api-server>/api`

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/integrations/active-vilnius/export.json` | Full city-managed catalogue, JSON (`schema: vilnius-sports-hub/v1`) |
| `GET` | `/integrations/active-vilnius/export.csv` | Same data as a CSV download for ops imports |
| `GET` | `/integrations/active-vilnius/widget/facility/:id` | Embeddable HTML widget with live occupancy + booking CTA |

### JSON record shape

```json
{
  "external_id": "mgd-lazdynu-swimming-pool",
  "name": "Lazdynų swimming pool",
  "type": "swimming_pool",
  "district": "Lazdynai",
  "address": "Architektų g. 5",
  "lat": 54.6692, "lng": 25.2105,
  "disciplines": ["swimming", "fitness"],
  "age_groups": ["children", "teens", "adults", "seniors"],
  "accessibility": ["wheelchair", "beginner_friendly", "adaptive_sports"],
  "capacity": 220,
  "status": "operational",
  "booking_provider": "active_vilnius",
  "booking_url": "https://www.activevilnius.lt/objektai/lazdynu-swimming-pool",
  "entry_type": "paid",
  "price_from_eur": 6
}
```

### CSV columns

`external_id, name, type, district, address, lat, lng, disciplines, age_groups, accessibility, capacity, status, booking_provider, booking_url, entry_type, price_from_eur`

Multi-value fields use the `|` (pipe) separator so they survive Excel without re-encoding.

### Widget embed

```html
<iframe
  src="https://<api-server>/api/integrations/active-vilnius/widget/facility/mgd-lazdynu-swimming-pool"
  width="320" height="280" frameborder="0"
  loading="lazy" title="Vilnius Sports Hub — live occupancy"></iframe>
```

The widget is responsive, self-styled, and serves `X-Frame-Options: ALLOWALL`. It currently shows:

- Facility name + district
- Modeled "Užimtumas dabar" (live occupancy %)
- Today's hourly curve (24 bars)
- Deep-link "Rezervuoti / Book" button to ActiveVilnius

When the inbound feed (below) is wired up, the widget switches transparently to live data.

---

## Inbound feed (pending — partner side)

To replace the modeled occupancy with real bookings, ActiveVilnius pushes one of two payloads to a Hub webhook every 5–15 minutes:

### Option A — Booking density snapshot (preferred)

```
POST /api/integrations/active-vilnius/occupancy
Authorization: Bearer <hmac-signed token>
Content-Type: application/json

{
  "external_id": "mgd-lazdynu-swimming-pool",
  "as_of": "2026-05-14T18:30:00+03:00",
  "current_occupancy_pct": 72,
  "next_24h": [ { "hour": 19, "occupancy_pct": 80 }, … ]
}
```

### Option B — Booking events stream

A Webhook fired on every booking create/cancel; Hub aggregates and rolls up into the same shape internally. This is preferred if ActiveVilnius can already emit booking events for other systems.

### Auth

HMAC-SHA256 signed tokens with a shared secret rotated quarterly. Sample header:

```
Authorization: Bearer av-<key-id>.<base64-payload>.<sig>
```

---

## Google Calendar availability (per-facility)

Facilities that publish a public Google Calendar of bookable slots (e.g. third-party operator tennis courts) can opt in by setting `bookingProvider = "google_calendar"` and `bookingUrl = "<calendar embed URL>"`.

Hub renders the embedded calendar inside the facility detail page. No private credentials are stored — only public-share URLs.

---

## Status & next steps

| Capability | Status |
| --- | --- |
| Outbound JSON export | ✅ Live |
| Outbound CSV export | ✅ Live |
| Embed widget | ✅ Live (modeled occupancy) |
| Deep-link out → ActiveVilnius | ✅ Live |
| Inbound occupancy webhook | ⏳ Pending partner kickoff |
| HMAC auth + key rotation | ⏳ Pending |
| Google Calendar embedding | ⏳ Pending data flag in CMS |

Contact: `partnerships@vilnius-sports-hub.lt` (placeholder).
