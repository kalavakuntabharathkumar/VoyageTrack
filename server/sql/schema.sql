CREATE TABLE IF NOT EXISTS vessels (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, imo VARCHAR(7) UNIQUE NOT NULL,
  vessel_type TEXT NOT NULL DEFAULT 'Bulk carrier', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS voyages (
  id SERIAL PRIMARY KEY, reference TEXT UNIQUE NOT NULL, vessel_id INT NOT NULL REFERENCES vessels(id),
  origin TEXT NOT NULL, destination TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Planned',
  etd TIMESTAMPTZ, eta TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ports (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, country TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS port_calls (
  id SERIAL PRIMARY KEY, voyage_id INT NOT NULL REFERENCES voyages(id) ON DELETE CASCADE,
  port_name TEXT NOT NULL, arrival_at TIMESTAMPTZ, departure_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Expected'
);
CREATE TABLE IF NOT EXISTS ais_positions (
  id BIGSERIAL PRIMARY KEY, vessel_id INT NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  latitude NUMERIC(8,5) NOT NULL CHECK(latitude BETWEEN -90 AND 90),
  longitude NUMERIC(8,5) NOT NULL CHECK(longitude BETWEEN -180 AND 180),
  speed_knots NUMERIC(5,2) NOT NULL DEFAULT 0, observed_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ais_vessel_time ON ais_positions(vessel_id, observed_at DESC);
CREATE TABLE IF NOT EXISTS weather_snapshots (
  id BIGSERIAL PRIMARY KEY, port_name TEXT NOT NULL, conditions TEXT NOT NULL,
  wind_knots NUMERIC(5,2) NOT NULL DEFAULT 0, observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS laytime_events (
  id SERIAL PRIMARY KEY, port_call_id INT NOT NULL REFERENCES port_calls(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, occurred_at TIMESTAMPTZ NOT NULL, notes TEXT
);
CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, display_name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS organizations (id SERIAL PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS terminals (id SERIAL PRIMARY KEY, port_id INT REFERENCES ports(id), name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS countries (id SERIAL PRIMARY KEY, code CHAR(2) UNIQUE NOT NULL, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS cargoes (id SERIAL PRIMARY KEY, name TEXT NOT NULL, quantity_tonnes NUMERIC(12,2));
CREATE TABLE IF NOT EXISTS charter_parties (id SERIAL PRIMARY KEY, name TEXT NOT NULL, party_type TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS documents (id SERIAL PRIMARY KEY, voyage_id INT REFERENCES voyages(id), title TEXT NOT NULL, uri TEXT);
CREATE TABLE IF NOT EXISTS audit_events (id BIGSERIAL PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS integration_runs (id SERIAL PRIMARY KEY, provider TEXT NOT NULL, status TEXT NOT NULL, message TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS voyage_statuses (id SERIAL PRIMARY KEY, code TEXT UNIQUE NOT NULL, label TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS vessel_types (id SERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL);
INSERT INTO vessels(name, imo, vessel_type) VALUES
('MV Ocean Pioneer','9321483','Bulk carrier'),
('MV Meridian Star','9418276','Container ship')
ON CONFLICT (imo) DO NOTHING;
INSERT INTO voyages(reference, vessel_id, origin, destination, status, etd, eta)
SELECT 'VYG-2026-001', id, 'Singapore', 'Rotterdam', 'In Transit', NOW() - INTERVAL '2 days', NOW() + INTERVAL '11 days'
FROM vessels WHERE imo='9321483'
ON CONFLICT (reference) DO NOTHING;
INSERT INTO voyages(reference, vessel_id, origin, destination, status, etd, eta)
SELECT 'VYG-2026-002', id, 'Mumbai', 'Jebel Ali', 'Planned', NOW() + INTERVAL '1 day', NOW() + INTERVAL '4 days'
FROM vessels WHERE imo='9418276'
ON CONFLICT (reference) DO NOTHING;
