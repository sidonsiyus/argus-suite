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
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    if (url.pathname === "/flights")    return handleFlights(url);
    if (url.pathname === "/metar")      return handleMetar(url);
    if (url.pathname === "/atc")        return handleAtc(url, request, env);
    if (url.pathname === "/atc/feeds")  return handleAtcFeeds(url, env);
    if (url.pathname === "/atc/health") return handleAtcHealth(env);

    return new Response(
      "AEROSCOPE proxy OK — /flights  /metar  /atc?m=<mount>  /atc/feeds?icao=<ICAO>",
      { headers: { ...CORS, "Content-Type": "text/plain" } }
    );
  },
};

/* ============================================================
   LIVE ATC
   ------------------------------------------------------------
   Three things the browser cannot do for itself:

   1. RETRY THE REDIRECT.  d.liveatc.net 302s to one of many edge
      servers and some of them are dead. A browser gets one roll of
      the dice and hangs. We just ask again — that alone is most of
      the "it only works sometimes".

   2. TEST THE MOUNTS UPSTREAM.  There is no public index and the
      LiveATC website is behind a Cloudflare bot challenge, so it
      CANNOT be scraped. What the worker can do is try each candidate
      mount itself and cache which ones really served audio — the
      browser then makes 1 request instead of 15, and isn't throttled.

   3. ADD CORS.  Without it the spectrum meter is illegal, and a
      crossOrigin audio element against LiveATC doesn't error — it
      hangs forever. That was the "channel is down" bug.

   Cache: KV if the ATC_CACHE binding exists, else the per-edge
   Cache API. Deliberately degrades instead of throwing, so a
   missing/misnamed binding can never take /flights down with it.
   ============================================================ */

const ATC_UPSTREAM  = "https://d.liveatc.net/";
const ATC_TRIES     = 3;         // re-roll the load balancer this many times
const FEEDS_TTL     = 1800;      // 30 min — mount names change slowly
const HEALTH_TTL    = 900;       // 15 min — on-air status changes fast

/* --- cache shim: KV when bound, Cache API when not --- */
function kv(env){ return (env && env.ATC_CACHE && env.ATC_CACHE.get) ? env.ATC_CACHE : null; }

async function cacheGet(env, key) {
  const store = kv(env);
  if (store) {
    try { const v = await store.get(key); return v ? JSON.parse(v) : null; } catch (_) { return null; }
  }
  try {
    const r = await caches.default.match(new Request("https://atc.cache/" + key));
    return r ? await r.json() : null;
  } catch (_) { return null; }
}
async function cachePut(env, key, value, ttl) {
  const store = kv(env);
  if (store) {
    try { await store.put(key, JSON.stringify(value), { expirationTtl: ttl }); } catch (_) {}
    return;
  }
  try {
    await caches.default.put(
      new Request("https://atc.cache/" + key),
      new Response(JSON.stringify(value), {
        headers: { "Content-Type": "application/json", "Cache-Control": "max-age=" + ttl }
      })
    );
  } catch (_) {}
}

/* --- fetch a mount, re-rolling the load balancer on a dead edge --- */
async function atcFetch(mount, range) {
  let last = null;
  for (let i = 0; i < ATC_TRIES; i++) {
    const r = await fetch(ATC_UPSTREAM + mount + "?nc=" + Date.now() + "-" + i, {
      headers: {
        ...UA,
        "Referer": "https://www.liveatc.net/",
        ...(range ? { Range: range } : {})
      },
      redirect: "follow",
      cf: { cacheTtl: 0, cacheEverything: false }
    });
    const ct = r.headers.get("content-type") || "";
    if (r.ok && /audio|ogg|mpeg/i.test(ct)) return r;      // a real stream
    last = r;
    try { r.body && r.body.cancel(); } catch (_) {}
    // a 404 is definitive — the mount does not exist, don't burn retries
    if (r.status === 404) break;
  }
  return last;
}

/* /atc?m=<mount>  — the audio itself, with CORS so the meter works */
async function handleAtc(url, request, env) {
  const mount = (url.searchParams.get("m") || "").replace(/[^a-z0-9_-]/gi, "");
  if (!mount) return new Response("missing mount", { status: 400, headers: CORS });

  const r = await atcFetch(mount, request.headers.get("Range"));
  const ct = r ? (r.headers.get("content-type") || "") : "";

  if (!r || !r.ok || !/audio|ogg|mpeg/i.test(ct)) {
    await noteHealth(env, mount, false);
    return new Response("feed not on air", { status: 404, headers: CORS });
  }
  await noteHealth(env, mount, true);

  const h = new Headers(CORS);
  h.set("Content-Type", ct || "audio/mpeg");
  h.set("Cache-Control", "no-store");
  h.set("Accept-Ranges", "none");
  return new Response(r.body, { status: 200, headers: h });   // streamed, never buffered
}

/* remember which mounts actually served audio */
async function noteHealth(env, mount, ok) {
  const map = (await cacheGet(env, "health")) || {};
  map[mount] = { ok, t: Date.now() };
  await cachePut(env, "health", map, HEALTH_TTL);
}
async function handleAtcHealth(env) {
  const map = (await cacheGet(env, "health")) || {};
  return new Response(JSON.stringify(map), {
    headers: { ...CORS, "Content-Type": "application/json" }
  });
}

/* /atc/feeds?icao=XXXX — the real mount names.

   HONEST STATUS: the scraper is GONE. www.liveatc.net sits behind
   Cloudflare's bot challenge — a Worker fetch gets back
   "<title>Just a moment...</title>", never the page. No user-agent
   trick beats a JS challenge, so scraping real mount names is simply
   not possible from here. I'm not shipping code that pretends to work.

   What this endpoint does instead: it takes the app's candidate list
   and actually TESTS each one upstream (which the worker CAN do, and
   the browser cannot do reliably because LiveATC throttles it). The
   result is cached, so the browser makes ONE request instead of 15
   and gets back only the mounts that really served audio. */
async function handleAtcFeeds(url, env) {
  const icao = (url.searchParams.get("icao") || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^[A-Z]{4}$/.test(icao)) {
    return new Response(JSON.stringify({ error: "bad icao" }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" }
    });
  }
  const key = "feeds:" + icao;
  const hit = await cacheGet(env, key);
  if (hit) {
    return new Response(JSON.stringify({ ...hit, cached: true }), {
      headers: { ...CORS, "Content-Type": "application/json" }
    });
  }

  const i = icao.toLowerCase();
  const cands = [
    i+"_twr", i+"_gnd", i+"_app", i+"_dep", i+"_del", i+"_atis", i+"_ctr",
    i+"1", i+"2", i+"3", i+"4", i+"5", i+"6"
  ];

  // test them upstream, a few at a time — the worker's IP, not yours
  const feeds = [];
  for (let k = 0; k < cands.length; k += 4) {
    const batch = cands.slice(k, k + 4);
    const rs = await Promise.all(batch.map(async m => {
      try {
        const r = await atcFetch(m, "bytes=0-1");
        const ct = r ? (r.headers.get("content-type") || "") : "";
        const ok = !!(r && r.ok && /audio|ogg|mpeg/i.test(ct));
        try { r && r.body && r.body.cancel(); } catch (_) {}
        return ok ? { m, t: labelFor(m) } : null;
      } catch (_) { return null; }
    }));
    rs.forEach(x => { if (x) feeds.push(x); });
  }

  const out = { icao, feeds, verified: true, ts: Date.now() };
  await cachePut(env, key, out, FEEDS_TTL);
  return new Response(JSON.stringify(out), {
    headers: { ...CORS, "Content-Type": "application/json" }
  });
}

function labelFor(mount) {
  const m = mount.toLowerCase();
  if (/_twr|_tower/.test(m))      return "Tower";
  if (/_gnd|_ground/.test(m))     return "Ground";
  if (/_app|_arr/.test(m))        return "Approach";
  if (/_dep/.test(m))             return "Departure";
  if (/_del|_clnc/.test(m))       return "Clearance";
  if (/_atis/.test(m))            return "ATIS";
  if (/_ctr|_center|_centre/.test(m)) return "Centre";
  const n = m.match(/(\d+)$/);
  return n ? ("Feed " + n[1]) : "Feed";
}


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
