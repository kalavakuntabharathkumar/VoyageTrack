import { useEffect, useState } from "react";
type Voyage = { id:number; reference:string; vessel:string; origin:string; destination:string; status:string; etd:string|null; eta:string|null };
const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
export default function App() {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    try { const r = await fetch(`${API}/voyages`); if (!r.ok) throw new Error("API request failed"); setVoyages(await r.json()); setError(""); }
    catch { setError("Could not connect to the API. Start the app with Docker Compose."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  return <main className="shell">
    <header><div><p className="eyebrow">MARITIME OPERATIONS</p><h1>VoyageTrack</h1><p className="muted">Voyage visibility · Port calls · Laytime monitoring</p></div><button onClick={() => void load()}>Refresh data</button></header>
    <section className="stats"><article><span>Tracked voyages</span><strong>{voyages.length}</strong></article><article><span>In transit</span><strong>{voyages.filter(v=>v.status==="In Transit").length}</strong></article><article><span>Port calls</span><strong>—</strong><small>Connect port-call records</small></article></section>
    <section className="panel"><div className="panel-heading"><div><h2>Voyage overview</h2><p className="muted">Current schedule and vessel status</p></div><span className="tag">LIVE API</span></div>
    {loading ? <p>Loading voyages…</p> : error ? <p className="error">{error}</p> : <div className="table-wrap"><table><thead><tr><th>Reference</th><th>Vessel</th><th>Route</th><th>Status</th><th>ETA</th></tr></thead><tbody>{voyages.map(v=><tr key={v.id}><td className="ref">{v.reference}</td><td>{v.vessel}</td><td>{v.origin} <span className="arrow">→</span> {v.destination}</td><td><span className={`status ${v.status==="In Transit"?"transit":""}`}>{v.status}</span></td><td>{v.eta ? new Date(v.eta).toLocaleDateString() : "—"}</td></tr>)}</tbody></table></div>}
    </section>
    <footer>Portfolio demo · Demo integrations are clearly labelled and do not claim live AIS data.</footer>
  </main>;
}
