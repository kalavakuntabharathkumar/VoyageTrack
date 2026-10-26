# VoyageTrack — Vessel Voyage and Laytime Dashboard

A runnable starter implementation for tracking vessel voyages, port calls, AIS positions, weather snapshots, and laytime events.

## Stack
- React + TypeScript + Vite
- Node.js + Express + TypeScript
- PostgreSQL
- Docker Compose
- GitHub Actions
- REST APIs

## Run locally
1. Copy `.env.example` to `.env`.
2. Run `docker compose up --build`.
3. Open the frontend at http://localhost:5173 and API health at http://localhost:4000/api/health.

The included AIS/weather adapters use deterministic demo data unless API keys and provider URLs are configured. This makes the project usable without external credentials. Do not represent demo data as live vessel data.

## Main API routes
- `GET /api/health`
- `GET /api/voyages`
- `GET /api/voyages/:id`
- `POST /api/voyages`
- `GET /api/port-calls`
- `POST /api/port-calls`
- `GET /api/vessels/:id/positions`
- `POST /api/integrations/refresh`

## Data model
Normalized tables: vessels, voyages, port_calls, ais_positions, weather_snapshots, laytime_events, users, organizations, terminals, ports, countries, cargoes, charter_parties, documents, audit_events, integration_runs, voyage_statuses, and vessel_types.

This is a portfolio starter, not a production deployment. Add authentication, migrations, secrets management, rate limits, and provider-specific AIS contracts before production use.
