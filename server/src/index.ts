import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./db";
import { getAisSnapshot, getWeatherSnapshot } from "./integrations";
const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", async (_req, res) => {
  try { await pool.query("SELECT 1"); res.json({ status: "ok", database: "connected" }); }
  catch { res.status(503).json({ status: "degraded", database: "unavailable" }); }
});
app.get("/api/voyages", async (_req, res) => {
  try {
    const result = await pool.query(`SELECT v.id, v.reference, s.name AS vessel, v.origin, v.destination, v.status, v.etd, v.eta
      FROM voyages v JOIN vessels s ON s.id=v.vessel_id ORDER BY v.id DESC`);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: "Could not load voyages" }); }
});
app.get("/api/voyages/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM voyages WHERE id=$1", [Number(req.params.id)]);
  if (!result.rowCount) return res.status(404).json({ error: "Voyage not found" });
  res.json(result.rows[0]);
});
app.post("/api/voyages", async (req, res) => {
  const { reference, vesselId, origin, destination, status = "Planned", etd = null, eta = null } = req.body;
  if (!reference || !vesselId || !origin || !destination) return res.status(400).json({ error: "reference, vesselId, origin and destination are required" });
  try {
    const result = await pool.query(`INSERT INTO voyages(reference,vessel_id,origin,destination,status,etd,eta)
      VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [reference, vesselId, origin, destination, status, etd, eta]);
    res.status(201).json(result.rows[0]);
  } catch { res.status(400).json({ error: "Could not create voyage; verify vessel ID and unique reference" }); }
});
app.get("/api/port-calls", async (_req, res) => {
  const result = await pool.query(`SELECT pc.*, v.reference AS voyage_reference FROM port_calls pc JOIN voyages v ON v.id=pc.voyage_id ORDER BY pc.id DESC`);
  res.json(result.rows);
});
app.post("/api/port-calls", async (req, res) => {
  const { voyageId, portName, arrivalAt = null, departureAt = null, status = "Expected" } = req.body;
  if (!voyageId || !portName) return res.status(400).json({ error: "voyageId and portName are required" });
  try {
    const result = await pool.query(`INSERT INTO port_calls(voyage_id,port_name,arrival_at,departure_at,status)
      VALUES($1,$2,$3,$4,$5) RETURNING *`, [voyageId, portName, arrivalAt, departureAt, status]);
    res.status(201).json(result.rows[0]);
  } catch { res.status(400).json({ error: "Could not create port call" }); }
});
app.get("/api/vessels/:id/positions", async (req, res) => {
  const result = await pool.query("SELECT * FROM ais_positions WHERE vessel_id=$1 ORDER BY observed_at DESC LIMIT 100", [Number(req.params.id)]);
  res.json(result.rows);
});
app.post("/api/integrations/refresh", async (_req, res) => {
  try {
    const results = await Promise.all([getAisSnapshot(), getWeatherSnapshot()]);
    await pool.query("INSERT INTO integration_runs(provider,status,message) VALUES($1,$2,$3),($4,$5,$6)",
      [results[0].provider, results[0].mode, "Snapshot fetched", results[1].provider, results[1].mode, "Snapshot fetched"]);
    res.json({ results });
  } catch (error) { res.status(502).json({ error: "Integration refresh failed", detail: String(error) }); }
});
const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`VoyageTrack API listening on ${port}`));
