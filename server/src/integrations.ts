export async function getAisSnapshot() {
  if (process.env.AIS_API_URL && process.env.AIS_API_KEY) {
    const response = await fetch(process.env.AIS_API_URL, { headers: { Authorization: `Bearer ${process.env.AIS_API_KEY}` } });
    if (!response.ok) throw new Error(`AIS provider returned ${response.status}`);
    return { provider: "AIS", mode: "live", payload: await response.json() };
  }
  return { provider: "AIS", mode: "demo", payload: [{ imo: "9321483", latitude: 1.264, longitude: 103.82, speedKnots: 12.4 }] };
}
export async function getWeatherSnapshot() {
  if (process.env.WEATHER_API_URL && process.env.WEATHER_API_KEY) {
    const response = await fetch(process.env.WEATHER_API_URL, { headers: { Authorization: `Bearer ${process.env.WEATHER_API_KEY}` } });
    if (!response.ok) throw new Error(`Weather provider returned ${response.status}`);
    return { provider: "Weather", mode: "live", payload: await response.json() };
  }
  return { provider: "Weather", mode: "demo", payload: [{ port: "Singapore", conditions: "Partly cloudy", windKnots: 9 }] };
}
