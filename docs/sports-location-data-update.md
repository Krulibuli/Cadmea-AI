# Sports Location Data Update

Date: 2026-05-15

## Summary

The sports object list had dropped to roughly 50 objects because the application was only using the curated managed-facility, park, and playground sources. A newer full object list was provided as `sport_locations (1).csv` with 452 rows. That feed has now been imported into the API data layer and appended to the sports facilities returned by `/api/sports/facilities`.

After the update, the local API returns 496 sports facilities.

## Source Data

Input file:

```text
C:/Users/motie/Downloads/sport_locations (1).csv
```

CSV columns:

```text
district,type,name,address,lat,lng,rating,reviews
```

CSV row count: 452

Type breakdown:

```text
119 park
98 gym
79 basketball court
62 stadium
41 sports club
23 tennis court
18 swimming pool
12 football field
```

Tracked generated data file:

```text
artifacts/api-server/src/data/sport-locations.json
```

## Backend Changes

Updated:

```text
artifacts/api-server/src/lib/sports-data.ts
```

Changes:

- Imported the generated `sport-locations.json` dataset.
- Added a `SportLocation` interface matching the CSV fields.
- Added `rating` and `reviews` as optional fields on `SportsFacility`.
- Added `loadSportLocations()` to read the new JSON dataset.
- Added `classifySportLocation()` to map CSV object types into existing app facility types and disciplines.
- Appended valid CSV locations into `buildAll()` as operational `open_data` sports facilities.
- Generated deterministic app KPIs for the imported locations using the existing `buildKpis()` flow.

CSV type mapping:

```text
gym -> fitness_centre -> fitness, general
basketball court -> pitch -> basketball, outdoor
football field -> pitch -> football, outdoor
stadium -> stadium -> football, athletics, running
sports club -> sports_centre -> general, fitness
tennis court -> tennis -> tennis, outdoor
swimming pool -> swimming_pool -> swimming, fitness
park -> park -> running, cycling, outdoor, general
unknown -> sports_centre -> general
```

## Frontend Changes

Updated:

```text
artifacts/cadmea/src/lib/sports-api.ts
artifacts/cadmea/src/pages/sports-map.tsx
```

Changes:

- Added optional `rating` and `reviews` fields to the frontend `SportsFacility` type.
- Sports map popups now show review count and star rating when available from the imported CSV data.

## Verification

Local production builds completed successfully:

```text
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/cadmea run build
```

Localhost was restarted on port 8080.

Verified endpoint:

```text
http://localhost:8080/api/sports/facilities
```

Observed result:

```text
496 facilities
```

Opened updated map:

```text
http://localhost:8080/sports/map
```

## Current Git Status Notes

These latest sports-location changes are local and not yet committed or pushed.

Relevant changed/new files:

```text
artifacts/api-server/src/data/sport-locations.json
artifacts/api-server/src/lib/sports-data.ts
artifacts/cadmea/src/lib/sports-api.ts
artifacts/cadmea/src/pages/sports-map.tsx
docs/sports-location-data-update.md
```

Unrelated runtime data change observed after running localhost:

```text
.data/forum-db.json
```

That runtime data change should not be included in the sports-location commit unless intentionally desired.
