// Server-side flight proxy: fetches the adsb.lol community ADS-B feed (which sends
// no CORS header, so the browser can't call it directly) and returns it same-origin.
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat"));
  const lon = parseFloat(searchParams.get("lon"));
  let dist = parseInt(searchParams.get("dist") || "80", 10);
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return Response.json({ error: "lat/lon required", ac: [] }, { status: 400 });
  }
  if (Number.isNaN(dist) || dist < 1) dist = 80;
  dist = Math.min(250, dist);

  try {
    const r = await fetch(`https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${dist}`, {
      headers: { "User-Agent": "argus-aviation-terminal", accept: "application/json" },
      cache: "no-store",
    });
    if (!r.ok) return Response.json({ error: `upstream ${r.status}`, ac: [] }, { status: 200 });
    const d = await r.json();
    const ac = (d.ac || [])
      .filter((a) => a.lat != null && a.lon != null)
      .map((a) => ({
        hex: a.hex,
        flight: (a.flight || "").trim(),
        lat: a.lat,
        lon: a.lon,
        alt: typeof a.alt_baro === "number" ? a.alt_baro : (typeof a.alt_geom === "number" ? a.alt_geom : null),
        gs: a.gs ?? null,
        track: a.track ?? a.true_heading ?? null,
      }));
    return Response.json({ ac, now: Date.now() }, {
      status: 200,
      headers: { "cache-control": "public, max-age=15, s-maxage=15" },
    });
  } catch {
    return Response.json({ error: "fetch failed", ac: [] }, { status: 200 });
  }
}
