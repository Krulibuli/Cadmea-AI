# Cadmea

Cadmea is an AI-powered city intelligence map for choosing where to live, invest, study, or stay while travelling.

## Run & Operate

- `pnpm run dev` - Replit run command: builds the React app, builds the API, starts Express on `PORT` or `8080`.
- `pnpm run dev:local` - local Windows/macOS/Linux alias for the same single-server app. Open `http://localhost:8080` after it prints `Server listening`.
- `pnpm run start` - alias for the same Replit-safe run path.
- `pnpm run typecheck` - full workspace typecheck.
- `pnpm --filter @workspace/db run push` - push Drizzle schema to the configured Postgres database.
- Optional env: `DATABASE_URL` - external Postgres connection string. When present, the API uses the database first.
- Optional env: `OPENAI_API_KEY` or `AI_INTEGRATIONS_OPENAI_API_KEY` - enables hosted OpenAI completions. `AI_INTEGRATIONS_OPENAI_BASE_URL` is optional for custom-compatible providers, and `OPENAI_MODEL` / `AI_INTEGRATIONS_OPENAI_MODEL` can override the default model. When absent, Cadmea uses deterministic city-scoring recommendations.
- Recommended env: `ADMIN_TOKEN` - enables protected ingestion/cache admin endpoints under `/api/admin/*`. Without it those endpoints intentionally return 503 instead of staying public.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19, Vite, Tailwind CSS, Leaflet, Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- API contract/client: OpenAPI + Orval generated React Query hooks

## Where Things Live

- `artifacts/cadmea` - main React city intelligence app.
- `artifacts/api-server` - Express API, fallback public-data model, AI query routes, ingestion/admin routes.
- `artifacts/api-server/src/lib/city-data.ts` - embedded public-data fallback used when external DB is missing, empty, or unavailable.
- `lib/db/src/schema` - source of truth for database tables.
- `lib/api-spec/openapi.yaml` - source of truth for generated API hooks and schemas.

## Architecture Decisions

- Replit Postgres remains the primary data source when `DATABASE_URL` is configured.
- The API falls back to an embedded public-data model so the product never boots into a blank or broken state.
- OpenAI is optional: configured integrations produce the final natural-language response, while deterministic scoring still powers recommendations without secrets.
- The deployed app is a single Replit service: Express serves `/api/*` plus the built React app from `artifacts/cadmea/dist/public` on `PORT` or `8080`, with `.replit` exposing local port `8080` to external port `80`.

## Product

- Interactive city map with housing, air, crime, noise, light, transport, green-space, healthcare, school, walkability, bike, and pharmacy overlays.
- Lithuania-only map experience with bounded panning/zooming, city scopes for Vilnius, Kaunas, Klaipėda, and all-Lithuania discovery.
- AI natural-language recommendations for families, residents, students, investors, and tourists.
- Ranked neighborhood matches with clear explanations, visible tradeoffs, and source transparency.
- District explorer, comparison workflow, tourist POI mode, and lifestyle matching wizard.

## Gotchas

- This workspace intentionally excludes non-Linux native optional packages in `pnpm-workspace.yaml` for Replit. Local Windows builds may fail unless those optional packages are installed separately, but Replit Linux builds should use the Linux-native packages.
- If the database is empty, routes intentionally return fallback city intelligence data until ingestion or seed data is available.
- Import the zip into Replit with files at the project root. `.replit` is included and points directly to `pnpm run dev`.

## Reliability Fixes in This Package

- Admin ingestion endpoints are token-protected and rate-limited.
- District detail/compare/best-match APIs always return usable score objects instead of `null`.
- Chat streaming now handles split SSE chunks, always exits loading state, and keeps DB fallback messages when OpenAI is unavailable.
- City filtering no longer leaks wrong-city POIs/overlay features.
- Map rendering limits large overlay/POI batches to protect mobile browsers.
- Leaflet marker images and fonts no longer depend on external CDN/font requests.
