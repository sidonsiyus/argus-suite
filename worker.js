/* ============================================================
   AEROSCOPE flight-data proxy  (Cloudflare Worker — free tier)
   ------------------------------------------------------------
   Adds CORS + tiles the map viewport so the browser sees ALL
   aircraft in view, even when zoomed out.

   Endpoints
     /flights?bounds=S,W,N,E&z=Z   ← preferred (whole viewport)
     /flights?lat=..&lon=..&dist=.. ← legacy single point
     /                              ← health check

   Data source : api.airplanes.live  (open, no key, tolerates
                 parallel requests). Fallback: api.adsb.lol.

   Deploy: dash.cloudflare.com → Workers → your worker → Edit
           code → paste this → Deploy.
   ============================================================ */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

const UA = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
};

const MAX_TILES  = 14;    // hard cap on upstream calls per poll
const TILE_NM    = 250;   // radius per point query (API max)
const MAX_RETURN = 1500;  // cap aircraft returned to the browser

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    if (url.pathname === "/flights") return handleFlights(url);
    if (url.pathname === "/metar")   return handleMetar(url);

    return new Response(
      "AEROSCOPE proxy OK — try /flights?bounds=40,-75,42,-72&z=8  or  /metar?ids=VOMM",
      { headers: { ...CORS, "Content-Type": "text/plain" } }
    );
  },
};

async function handleMetar(url) {
  const ids = (url.searchParams.get("ids") || "").toUpperCase().replace(/[^A-Z0-9,]/g, "");
  if (!ids) return json({ error: "ids required" }, 400);
  try {
    const r = await fetch(
      "https://aviationweather.gov/api/data/metar?ids=" + ids + "&format=json",
      { headers: UA, cf: { cacheTtl: 60 } }
    );
    if (!r.ok) return json({ error: "upstream " + r.status, metar: [] }, 502);
    const data = await r.json();
    return json({ metar: data, now: Date.now() });
  } catch (e) {
    return json({ error: String(e), metar: [] }, 502);
  }
}

async function handleFlights(url) {
  const p = url.searchParams;

  // Build a list of point queries (lat, lon, radiusNm)
  let points;
  if (p.get("bounds")) {
    const [s, w, n, e] = p.get("bounds").split(",").map(Number);
    if ([s, w, n, e].some(v => Number.isNaN(v)))
      return json({ error: "bad bounds", ac: [] }, 400);
    points = tileBounds(s, w, n, e);
  } else if (p.get("lat") && p.get("lon")) {
    let dist = parseInt(p.get("dist") || "250", 10);
    if (Number.isNaN(dist) || dist < 1) dist = 250;
    points = [{ lat: +p.get("lat"), lon: +p.get("lon"), r: Math.min(250, dist) }];
  } else {
    return json({ error: "bounds or lat/lon required", ac: [] }, 400);
  }

  // Fetch all tiles in parallel from airplanes.live
  const results = await Promise.allSettled(
    points.map(pt => fetchPoint(pt.lat, pt.lon, pt.r))
  );

  const merged = new Map();     // hex -> aircraft (keep the closest sighting)
  let ok = 0, failed = 0;
  for (const r of results) {
    if (r.status === "fulfilled" && Array.isArray(r.value)) {
      ok++;
      for (const a of r.value) {
        const hex = (a.hex || a.icao || "").toString().toLowerCase();
        if (!hex || a.lat == null || a.lon == null) continue;
        const prev = merged.get(hex);
        if (!prev || (a.dst != null && prev.dst != null && a.dst < prev.dst))
          merged.set(hex, a);
      }
    } else failed++;
  }

  // If every airplanes.live tile failed, try adsb.lol once at the centre
  if (ok === 0 && points.length) {
    const c = centreOf(points);
    try {
      const alt = await fetchPointLol(c.lat, c.lon, 250);
      for (const a of alt) {
        const hex = (a.hex || "").toLowerCase();
        if (hex && a.lat != null && a.lon != null) merged.set(hex, a);
      }
      if (alt.length) ok = 1;
    } catch (_) {}
  }

  let ac = [...merged.values()];
  if (ac.length > MAX_RETURN) ac = ac.slice(0, MAX_RETURN);

  return json({
    ac,
    tiles: points.length,
    ok, failed,
    now: Date.now(),
  }, ok ? 200 : 502);
}

/* Cover a lat/lon bbox with overlapping 250 nm circles, capped at
   MAX_TILES. When the area is bigger than the cap allows to fully
   cover, the grid coarsens so tiles still spread across the whole
   view (representative worldwide traffic when zoomed far out). */
function tileBounds(s, w, n, e) {
  s = clamp(s, -85, 85); n = clamp(n, -85, 85);
  if (n < s) [s, n] = [n, s];
  // normalise longitude span (ignore antimeridian wrap → clamp world)
  if (e < w) { w = -180; e = 180; }
  w = clamp(w, -180, 180); e = clamp(e, -180, 180);

  const midLat = (s + n) / 2;
  const cosL = Math.max(0.15, Math.cos(midLat * Math.PI / 180));

  // a 250 nm circle safely covers ~5.8° of latitude (radius*√2)
  let stepLat = 5.6;
  let stepLon = 5.6 / cosL;

  let nLat = Math.max(1, Math.ceil((n - s) / stepLat));
  let nLon = Math.max(1, Math.ceil((e - w) / stepLon));

  // coarsen until under the tile cap
  while (nLat * nLon > MAX_TILES) {
    stepLat *= 1.3; stepLon *= 1.3;
    nLat = Math.max(1, Math.ceil((n - s) / stepLat));
    nLon = Math.max(1, Math.ceil((e - w) / stepLon));
  }

  const pts = [];
  const dLat = (n - s) / nLat, dLon = (e - w) / nLon;
  for (let i = 0; i < nLat; i++) {
    for (let j = 0; j < nLon; j++) {
      pts.push({
        lat: +(s + dLat * (i + 0.5)).toFixed(3),
        lon: +(w + dLon * (j + 0.5)).toFixed(3),
        r: TILE_NM,
      });
    }
  }
  return pts;
}

async function fetchPoint(lat, lon, r) {
  const api = `https://api.airplanes.live/v2/point/${lat}/${lon}/${Math.min(250, r)}`;
  const res = await fetch(api, { headers: UA, cf: { cacheTtl: 4, cacheEverything: true } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const d = await res.json();
  return d.ac || d.aircraft || [];
}

async function fetchPointLol(lat, lon, r) {
  const api = `https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${Math.min(250, r)}`;
  const res = await fetch(api, { headers: UA, cf: { cacheTtl: 4, cacheEverything: true } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const d = await res.json();
  return d.ac || d.aircraft || [];
}

function centreOf(points) {
  const lat = points.reduce((a, p) => a + p.lat, 0) / points.length;
  const lon = points.reduce((a, p) => a + p.lon, 0) / points.length;
  return { lat, lon };
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
