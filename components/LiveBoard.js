"use client";

import { useEffect, useMemo, useState } from "react";
import { FLIGHT_PROXY, DEFAULT_ICAO, WINDY } from "@/lib/config";
import { useLocation } from "@/lib/useLocation";

/* ── helpers ── */
const toRad = (d) => (d * Math.PI) / 180;
function distNm(a, b, c, d) {
  const R = 3440.065;
  const dLat = toRad(c - a), dLon = toRad(d - b);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
function compass(a, b, c, d) {
  const y = Math.sin(toRad(d - b)) * Math.cos(toRad(c));
  const x = Math.cos(toRad(a)) * Math.sin(toRad(c)) - Math.sin(toRad(a)) * Math.cos(toRad(c)) * Math.cos(toRad(d - b));
  const br = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(br / 45) % 8];
}

/* ── 1. Skies overhead ── */
function SkiesCard({ loc }) {
  const [state, setState] = useState({ status: "loading", count: null, nearest: null });

  useEffect(() => {
    if (!loc.settled) return;
    let alive = true;
    async function load() {
      try {
        const r = await fetch(`/api/flights?lat=${loc.lat}&lon=${loc.lon}&dist=60`, { cache: "no-store" });
        const d = await r.json();
        const ac = (d && (d.ac || d.aircraft)) || [];
        const pos = ac.filter((a) => a.lat != null && a.lon != null);
        if (!alive) return;
        if (!pos.length) { setState({ status: "empty", count: 0, nearest: null }); return; }
        pos.forEach((a) => { a._d = distNm(loc.lat, loc.lon, a.lat, a.lon); });
        pos.sort((a, b) => a._d - b._d);
        const n = pos[0];
        const cs = String(n.flight || n.callsign || n.hex || "unknown").trim();
        const alt = n.alt != null ? (n.alt >= 18000 ? "FL" + Math.round(n.alt / 100) : Math.round(n.alt).toLocaleString() + " ft") : "—";
        const gs = n.gs != null ? Math.round(n.gs) + " kt" : "";
        setState({
          status: "ok", count: pos.length,
          nearest: { cs, type: n.t || "", alt, gs, dist: n._d.toFixed(0), dir: compass(loc.lat, loc.lon, n.lat, n.lon) },
        });
      } catch {
        if (alive) setState((s) => ({ ...s, status: "error" }));
      }
    }
    load();
    const id = setInterval(load, 45000);
    return () => { alive = false; clearInterval(id); };
  }, [loc.settled, loc.lat, loc.lon]);

  return (
    <div className="lw" style={{ "--c": "#2ec4b6" }}>
      <div className="lw-head">
        <span className="lw-dot" />
        <span className="lw-title">Skies overhead</span>
        <span className="lw-pill">radar</span>
      </div>
      <div className="lw-stat">
        <span className="lw-num mono">{state.count == null ? "—" : state.count}</span>
        <span className="lw-unit">aircraft within 60&nbsp;nm</span>
      </div>
      <div className="lw-sub">
        {state.status === "loading" && "Scanning the local sector…"}
        {state.status === "empty" && "No aircraft in the local sector right now."}
        {state.status === "error" && "Live radar feed unavailable right now."}
        {state.status === "ok" && state.nearest && (
          <>
            Nearest · <span className="lw-cs">{state.nearest.cs}</span>
            {state.nearest.type ? ` · ${state.nearest.type}` : ""}
            <br />
            <b>{state.nearest.alt}</b>
            {state.nearest.gs ? ` · ${state.nearest.gs}` : ""} · {state.nearest.dist} nm {state.nearest.dir}
          </>
        )}
      </div>
      <a className="lw-link" href="/argus.html">Open live radar →</a>
    </div>
  );
}

/* ── 2. METAR / TAF ── */
const CAT_COLOR = { VFR: "#31c56a", MVFR: "#4a9eff", IFR: "#ff5a63", LIFR: "#b98cff" };
const pad3 = (n) => String(n).padStart(3, "0");

function MetarCard({ icao = DEFAULT_ICAO }) {
  const [metar, setMetar] = useState(null);
  const [taf, setTaf] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let alive = true;
    const pick = (d) => (Array.isArray(d) && d[0]) || (d && d.metar && d.metar[0]) || (d && d.rawOb ? d : null);
    const getJson = (u) => fetch(u, { cache: "no-store" }).then((r) => r.json());

    (async () => {
      let m = null;
      try { m = pick(await getJson(`https://aviationweather.gov/api/data/metar?ids=${icao}&format=json`)); } catch {}
      if (!m || !m.rawOb) {
        try { m = pick(await getJson(`${FLIGHT_PROXY}/metar?ids=${icao}`)); } catch {}
      }
      if (!alive) return;
      if (m && m.rawOb) { setMetar(m); setStatus("ok"); } else { setStatus("error"); }
    })();

    fetch(`https://aviationweather.gov/api/data/taf?ids=${icao}&format=json`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const t = (Array.isArray(d) && d[0]) || (d && d.taf && d.taf[0]) || null;
        const raw = t && (t.rawTAF || t.raw_text);
        if (alive && raw) setTaf(raw);
      })
      .catch(() => {});

    return () => { alive = false; };
  }, [icao]);

  const chips = useMemo(() => {
    if (!metar) return [];
    const c = [];
    const m = metar;
    if (m.wdir != null) c.push(["Wind", `${isNaN(+m.wdir) ? m.wdir : pad3(m.wdir)}° ${m.wspd || 0}kt${m.wgst ? "G" + m.wgst : ""}`]);
    if (m.visib != null) c.push(["Vis", `${m.visib} sm`]);
    if (m.temp != null) c.push(["Temp", `${Math.round(m.temp)}°C`]);
    if (m.dewp != null) c.push(["Dew", `${Math.round(m.dewp)}°C`]);
    if (m.altim != null) c.push(["QNH", m.altim > 100 ? `${Math.round(m.altim)} hPa` : `${Number(m.altim).toFixed(2)} inHg`]);
    if (m.fltCat) c.push(["Cat", m.fltCat]);
    if (m.wxString) c.push(["Wx", m.wxString]);
    return c;
  }, [metar]);

  const catColor = metar && CAT_COLOR[metar.fltCat];

  return (
    <div className="lw" style={{ "--c": catColor || "#4a9eff" }}>
      <div className="lw-head">
        <span className="lw-dot" style={catColor ? { background: catColor, boxShadow: `0 0 8px ${catColor}` } : undefined} />
        <span className="lw-title">Terminal METAR / TAF</span>
        <span className="lw-pill">{icao}</span>
      </div>
      <div className="lw-raw mono">
        {status === "loading" && "Fetching current observation…"}
        {status === "error" && `METAR unavailable for ${icao} right now.`}
        {status === "ok" && metar?.rawOb}
      </div>
      {chips.length > 0 && (
        <div className="lw-chips">
          {chips.map(([l, v]) => (
            <span className="lw-chip" key={l}>{l} <b>{v}</b></span>
          ))}
        </div>
      )}
      {taf && (
        <div className="lw-taf">
          <div className="lw-taf-label">TAF · forecast</div>
          <div className="lw-raw mono">{taf}</div>
        </div>
      )}
    </div>
  );
}

/* ── 3. India weather map (Windy) ── */
const OVERLAYS = [
  ["wind", "Wind"], ["rain", "Rain"], ["temp", "Temp"], ["clouds", "Clouds"],
];
function windyUrl(ov) {
  return `https://embed.windy.com/embed2.html?lat=${WINDY.lat}&lon=${WINDY.lon}&detailLat=${WINDY.lat}&detailLon=${WINDY.lon}&zoom=${WINDY.zoom}&level=surface&overlay=${ov}&menu=&message=&marker=&calendar=&pressure=&type=map&location=coordinates&detail=&metricWind=kt&metricTemp=%C2%B0C&radarRange=-1`;
}

function WeatherMap() {
  const [ov, setOv] = useState("wind");
  return (
    <div className="lw wide" style={{ "--c": "#4a9eff" }}>
      <div className="lw-head">
        <span className="lw-dot" style={{ background: "#4a9eff", boxShadow: "0 0 8px #4a9eff" }} />
        <span className="lw-title">Live wind &amp; weather · India</span>
        <div className="lw-tabs">
          {OVERLAYS.map(([id, label]) => (
            <button key={id} className={"lw-tab" + (ov === id ? " on" : "")} onClick={() => setOv(id)}>{label}</button>
          ))}
          <a className="lw-tab open" href={`https://www.windy.com/?${WINDY.lat},${WINDY.lon},${WINDY.zoom}`} target="_blank" rel="noopener noreferrer">Full map ↗</a>
        </div>
      </div>
      <div className="lw-map">
        <iframe key={ov} title="Wind and weather map of India" src={windyUrl(ov)} loading="lazy" referrerPolicy="no-referrer" />
      </div>
      <div className="lw-note">Live winds (in knots), rain, temperature and cloud cover across India. Data via Windy (ECMWF &amp; GFS models).</div>
    </div>
  );
}

export default function LiveBoard() {
  const loc = useLocation();
  return (
    <section className="group" id="live-board">
      <div className="group-head">
        <h2>Live Board</h2>
        <span className="blurb">
          {loc.settled ? (loc.precise ? "Your sector · real-time" : "Chennai sector · real-time") : "Locating…"}
        </span>
        <span className="rule" />
        <span className="count mono">◉</span>
      </div>
      <div className="lw-row">
        <SkiesCard loc={loc} />
        <MetarCard />
      </div>
      <WeatherMap />
    </section>
  );
}
