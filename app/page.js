"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MODULES, GROUPS } from "@/lib/modules";
import LiveBoard from "@/components/LiveBoard";
import FlightLog from "@/components/FlightLog";
import { useNews, shortDate } from "@/lib/useNews";
import { AIRPORTS, AIRPORT_BY_ICAO } from "@/lib/airports";

/* ── gate / flight metadata (airport metaphor) ── */
const GROUP_GATE = { live: "A", eng: "B", careers: "C", academy: "D", research: "E", dash: "F" };
const GROUP_BASE = { live: 100, eng: 200, careers: 300, academy: 400, research: 500, dash: 600 };
const GROUP_COLOR = { live: "#0e9c8f", eng: "#22d3ee", careers: "#ff9e64", academy: "#4a9eff", research: "#8b93ff", dash: "#b9791a" };
const GROUP_STATUS = {
  live: ["boarding", "Tracking"],
  eng: ["ontime", "Nominal"],
  careers: ["ontime", "Standby"],
  research: ["final", "Active"],
  dash: ["ontime", "Synced"],
};
function gateFor(m) {
  const inGroup = MODULES.filter((x) => x.group === m.group);
  const i = inGroup.findIndex((x) => x.id === m.id);
  return { gate: `${GROUP_GATE[m.group]}${i + 1}`, flight: `TRK ${GROUP_BASE[m.group] + (i + 1) * 3}` };
}

/* ── animated sky: dots, radar sweep, and flight paths with moving planes ── */
function SkyField() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf, w, h, stars, arcs, sweep = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const COLORS = ["14,143,128", "185,121,26", "34,150,200"];

    function bez(p, t) {
      const u = 1 - t;
      return {
        x: u * u * p.a.x + 2 * u * t * p.c.x + t * t * p.b.x,
        y: u * u * p.a.y + 2 * u * t * p.c.y + t * t * p.b.y,
      };
    }
    function tangent(p, t) {
      const u = 1 - t;
      return {
        x: 2 * u * (p.c.x - p.a.x) + 2 * t * (p.b.x - p.c.x),
        y: 2 * u * (p.c.y - p.a.y) + 2 * t * (p.b.y - p.c.y),
      };
    }
    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * DPR; canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const count = Math.min(140, Math.floor((w * h) / 12000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.1 + 0.2,
        a: Math.random() * 0.45 + 0.1, tw: Math.random() * 0.018 + 0.004, p: Math.random() * Math.PI * 2,
      }));
      const N = w < 640 ? 3 : 5;
      arcs = Array.from({ length: N }, (_, i) => {
        const y0 = h * (0.12 + 0.16 * i) + (Math.random() - 0.5) * 60;
        const y1 = h * (0.1 + 0.17 * i) + (Math.random() - 0.5) * 120;
        const dir = Math.random() > 0.5 ? 1 : -1;
        const a = { x: dir > 0 ? -60 : w + 60, y: y0 };
        const b = { x: dir > 0 ? w + 60 : -60, y: y1 };
        const c = { x: w * (0.3 + Math.random() * 0.4), y: Math.min(y0, y1) - (80 + Math.random() * 140) };
        return { a, b, c, color: COLORS[i % COLORS.length], t: Math.random(), speed: 0.00028 + Math.random() * 0.0004 };
      });
    }
    resize();
    window.addEventListener("resize", resize);
    // Re-size when the canvas actually gets laid out (e.g. preview pane shown after being 0×0).
    const ro = new ResizeObserver(() => { if (canvas.clientWidth && canvas.clientWidth !== w) resize(); });
    ro.observe(canvas);

    function plane(x, y, ang, color) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      ctx.shadowColor = `rgba(${color},0.9)`; ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(10, 0); ctx.lineTo(-7, 6); ctx.lineTo(-3, 0); ctx.lineTo(-7, -6); ctx.closePath();
      ctx.fillStyle = `rgba(${color},1)`; ctx.fill();
      ctx.restore();
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      // dots
      for (const s of stars) {
        s.p += s.tw;
        const a = s.a + Math.sin(s.p) * 0.14;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(110,140,130,${Math.max(0, a)})`; ctx.fill();
      }
      // flight paths
      for (const p of arcs) {
        ctx.lineWidth = 1.2;
        ctx.setLineDash([2, 7]);
        ctx.strokeStyle = `rgba(${p.color},0.3)`;
        ctx.beginPath();
        for (let t = 0; t <= 1.0001; t += 0.04) {
          const q = bez(p, t);
          if (t === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        if (!reduce) p.t += p.speed; if (p.t > 1) p.t = 0;
        const pos = bez(p, p.t), tan = tangent(p, p.t);
        const ang = Math.atan2(tan.y, tan.x);
        // trail
        const trail = bez(p, Math.max(0, p.t - 0.08));
        const g = ctx.createLinearGradient(trail.x, trail.y, pos.x, pos.y);
        g.addColorStop(0, `rgba(${p.color},0)`); g.addColorStop(1, `rgba(${p.color},0.75)`);
        ctx.strokeStyle = g; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(trail.x, trail.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
        plane(pos.x, pos.y, ang, p.color);
      }
      // radar sweep
      const cx = w * 0.86, cy = h * 0.09, R = Math.max(w, h) * 0.9;
      sweep += reduce ? 0 : 0.0016;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      grad.addColorStop(0, "rgba(14,143,128,0.10)"); grad.addColorStop(1, "rgba(14,143,128,0)");
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(sweep);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, -0.26, 0.02); ctx.closePath();
      ctx.fillStyle = grad; ctx.fill(); ctx.restore();
      raf = requestAnimationFrame(frame);
    }
    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} className="bg-stars" aria-hidden="true" />;
}

/* ── night-ops theme toggle ── */
function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.getAttribute("data-theme") === "dark"); }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    const val = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", val);
    try { localStorage.setItem("argus-theme", val); } catch {}
  }
  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle night ops" title={dark ? "Day ops" : "Night ops"}>
      {dark ? (
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" /></svg>
      ) : (
        <svg viewBox="0 0 24 24"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z" /></svg>
      )}
    </button>
  );
}

/* ── live clocks ── */
function useNow() {
  const [now, setNow] = useState(null);
  useEffect(() => { const t = () => setNow(new Date()); t(); const id = setInterval(t, 1000); return () => clearInterval(id); }, []);
  return now;
}
function Clock() {
  const now = useNow();
  if (!now) return <div className="clock" suppressHydrationWarning />;
  return (
    <div className="clock mono" suppressHydrationWarning>
      <div><b>{now.toISOString().slice(11, 19)}</b> <span className="z">UTC</span></div>
      <div className="z">LOCAL {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
    </div>
  );
}

/* ── status strip (cockpit annunciator — cycles readouts in place, no marquee) ── */
const READOUTS = [
  "Winglets cut wingtip-vortex drag — airlines save millions in fuel.",
  "Cruise Mach ≈ 0.85 — roughly 900 km/h at FL350.",
  "The black box is actually bright orange, for visibility in wreckage.",
  "Runway 09 points about 090° magnetic — heading ÷ 10.",
  "Contrails are engine water vapour freezing into ice crystals.",
  "Argus radar · Oracle orbits · Pyrgos tower — three feeds streaming.",
];
function StatusStrip() {
  const now = useNow();
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((v) => (v + 1) % READOUTS.length), 4200); return () => clearInterval(id); }, []);
  const liveCount = MODULES.filter((m) => m.live).length;
  const z = now ? now.toISOString().slice(11, 19) : "--:--:--";
  return (
    <div className="strip" aria-hidden="true">
      <div className="strip-cell zulu"><span className="sc-l">Zulu</span><span className="sc-v mono" suppressHydrationWarning>{z}</span></div>
      <div className="strip-cell hide-md"><span className="sc-l">Sys</span><span className="sc-v">{MODULES.length} <em>online</em></span></div>
      <div className="strip-cell live"><span className="sc-dot" /><span className="sc-l">Live</span><span className="sc-v">{liveCount} <em>feeds</em></span></div>
      <div className="strip-cell hide-md"><span className="sc-l">Scope</span><span className="sc-v ok">nominal</span></div>
      <div className="strip-cell feed"><span className="sc-l">Log</span><span key={i} className="sc-feed">{READOUTS[i]}</span></div>
      <div className="strip-cell tail hide-lg"><span className="sc-blip" />All-seeing</div>
    </div>
  );
}

/* ── running news wire (live headlines) ── */
function NewsWire({ news }) {
  const list = news.status === "ok" ? news.items.slice(0, 12) : null;
  const seg = (k) =>
    list.map((a, i) => (
      <a className="wire-item" key={`${k}-${i}`} href={a.url || "#"} target="_blank" rel="noopener noreferrer">
        <span className="wire-dot" />
        <span className="wire-title">{a.title}</span>
        {a.source && <span className="wire-src">{a.source}</span>}
        <span className="wire-sep">◦</span>
      </a>
    ));
  return (
    <div className="wire">
      <div className="wire-label"><span className="wire-live" />Wire</div>
      <div className="wire-view">
        {list ? (
          <div className="wire-track">{seg("a")}{seg("b")}</div>
        ) : (
          <div className="wire-static mono">
            {news.status === "loading" ? "Tuning the wire — pulling live headlines…" : "Wire offline — headlines unavailable right now."}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── newsdesk section (article cards) ── */
function NewsDesk({ news }) {
  const items = news.items.slice(0, 6);
  return (
    <section className="group" id="newsdesk">
      <div className="group-head">
        <div className="group-eyebrow">
          <span>Newsdesk</span><span className="rule" />
          <span className="count">{news.aviationOnly ? "aviation · live" : "live wire"}</span>
        </div>
        <div className="group-title">Off the wire<span className="blurb">aviation headlines, refreshed every few minutes</span></div>
      </div>

      {news.status === "loading" && <div className="news-state mono">Pulling the latest headlines…</div>}
      {(news.status === "error" || news.status === "empty") && (
        <div className="news-state mono">Newsdesk offline — headlines unavailable right now.</div>
      )}

      {news.status === "ok" && (
        <div className="news-grid">
          {items.map((a, i) => (
            <a className="news-card" key={i} href={a.url || "#"} target="_blank" rel="noopener noreferrer">
              <div className="news-thumb" data-lead={i === 0 ? "1" : undefined}>
                {a.image ? (
                  <img src={a.image} alt="" loading="lazy" referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.style.display = "none"; }} />
                ) : null}
                <span className="news-glyph">✈</span>
              </div>
              <div className="news-body">
                <div className="news-meta mono">
                  <span className="news-src">{a.source || "Wire"}</span>
                  {a.published && <span className="news-date">{shortDate(a.published)}</span>}
                </div>
                <div className="news-title serif">{a.title}</div>
                <div className="news-go mono">Read →</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

/* ── live radar scope (real aircraft around a chosen airport) ── */
const SCOPE_RANGE_NM = 80;   // outer ring
const SCOPE_R = 46;          // outer ring radius in the 100x100 viewBox
function altColor(alt) {
  if (alt == null) return "var(--dim)";
  if (alt < 10000) return "#e0a83c";      // low — amber
  if (alt < 30000) return "var(--teal)";   // mid — teal
  return "#4a9eff";                        // high — blue
}
const CAT_TINT = { VFR: "#31c56a", MVFR: "#4a9eff", IFR: "#ff5a63", LIFR: "#b98cff" };
function fmtAlt(a) {
  if (a == null) return "—";
  return a >= 18000 ? "FL" + Math.round(a / 100) : Math.round(a).toLocaleString() + " ft";
}
function RadarScope() {
  const now = useNow();
  const [icao, setIcao] = useState("OMDB"); // busiest / most consistent ADS-B coverage
  const [state, setState] = useState({ status: "loading", planes: [], count: 0, stale: false });
  const [sel, setSel] = useState(null);      // clicked aircraft
  const [metar, setMetar] = useState(null);  // selected airport weather
  const ap = AIRPORT_BY_ICAO[icao];

  // aircraft feed
  useEffect(() => {
    let alive = true;
    setState({ status: "loading", planes: [], count: 0, stale: false }); // new airport → clear
    setSel(null);
    async function load() {
      try {
        const r = await fetch(`/api/flights?lat=${ap.lat}&lon=${ap.lon}&dist=${SCOPE_RANGE_NM}`, { cache: "no-store" });
        const d = await r.json();
        const ac = (d && (d.ac || d.aircraft)) || [];
        const R = 3440.065, toRad = (x) => (x * Math.PI) / 180;
        const planes = [];
        for (const a of ac) {
          if (a.lat == null || a.lon == null) continue;
          const dLat = toRad(a.lat - ap.lat), dLon = toRad(a.lon - ap.lon);
          const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(ap.lat)) * Math.cos(toRad(a.lat)) * Math.sin(dLon / 2) ** 2;
          const dist = R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
          if (dist > SCOPE_RANGE_NM) continue;
          const y = Math.sin(toRad(a.lon - ap.lon)) * Math.cos(toRad(a.lat));
          const x = Math.cos(toRad(ap.lat)) * Math.sin(toRad(a.lat)) - Math.sin(toRad(ap.lat)) * Math.cos(toRad(a.lat)) * Math.cos(toRad(a.lon - ap.lon));
          const brg = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
          const rr = (dist / SCOPE_RANGE_NM) * SCOPE_R;
          const hdg = a.track ?? a.heading ?? brg;
          planes.push({
            id: a.hex || a.flight || `${a.lat},${a.lon}`,
            label: (a.flight || "").trim() || (a.hex || "").toUpperCase(),
            cx: 50 + rr * Math.sin(toRad(brg)),
            cy: 50 - rr * Math.cos(toRad(brg)),
            hdg, alt: a.alt, gs: a.gs, dist: Math.round(dist), color: altColor(a.alt),
          });
        }
        if (!alive) return;
        if (planes.length) {
          setState({ status: "ok", planes: planes.slice(0, 60), count: planes.length, stale: false });
        } else {
          setState((s) => (s.planes.length ? { ...s, stale: true } : { status: "empty", planes: [], count: 0, stale: false }));
        }
      } catch {
        if (alive) setState((s) => (s.planes.length ? { ...s, stale: true } : { ...s, status: "error", stale: false }));
      }
    }
    load();
    const t = setInterval(load, 30000);
    return () => { alive = false; clearInterval(t); };
  }, [icao, ap.lat, ap.lon]);

  // weather for the selected airport
  useEffect(() => {
    let alive = true;
    setMetar(null);
    fetch(`/api/metar?ids=${icao}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (alive) setMetar((d.metar && d.metar[0]) || null); })
      .catch(() => {});
    const t = setInterval(() => {
      fetch(`/api/metar?ids=${icao}`, { cache: "no-store" }).then((r) => r.json())
        .then((d) => { if (alive) setMetar((d.metar && d.metar[0]) || null); }).catch(() => {});
    }, 300000);
    return () => { alive = false; clearInterval(t); };
  }, [icao]);

  const cat = metar?.fltCat;
  return (
    <div className="scope">
      <div className="scope-head mono">
        <span className="scope-sel-wrap">
          <span className="scope-live" />
          <select className="scope-sel" value={icao} onChange={(e) => setIcao(e.target.value)} aria-label="Radar airport">
            {AIRPORTS.map((a) => <option key={a.icao} value={a.icao}>{a.icao} · {a.city}</option>)}
          </select>
        </span>
        <span suppressHydrationWarning>{now ? now.toISOString().slice(11, 19) : "--:--:--"}Z</span>
      </div>

      {/* selected-airport weather */}
      <div className="scope-wx mono">
        {metar && metar.rawOb ? (
          <>
            <span className="scope-wx-cat" style={{ color: CAT_TINT[cat] || "var(--dim)" }}>● {cat || "—"}</span>
            <span>{metar.wdir != null ? `${String(metar.wdir).padStart(3, "0")}°/${metar.wspd || 0}kt` : ""}</span>
            <span>{metar.temp != null ? `${Math.round(metar.temp)}°C` : ""}</span>
            <span className="scope-wx-qnh">{metar.altim != null ? `Q${Math.round(metar.altim)}` : ""}</span>
          </>
        ) : <span className="scope-wx-dim">weather · {icao}</span>}
      </div>

      <div className="scope-face">
        <svg viewBox="0 0 100 100" className="scope-svg" onClick={(e) => { if (e.target.tagName === "svg") setSel(null); }}>
          <defs>
            <radialGradient id="rg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--teal)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[46, 34, 22, 10].map((r) => <circle key={r} cx="50" cy="50" r={r} className="scope-ring" />)}
          <line x1="4" y1="50" x2="96" y2="50" className="scope-cross" />
          <line x1="50" y1="4" x2="50" y2="96" className="scope-cross" />
          <g className="scope-sweep"><path d="M50 50 L50 4 A46 46 0 0 1 82 18 Z" fill="url(#rg)" /></g>
          <circle cx="50" cy="50" r="1.1" fill="var(--teal)" />
          {state.planes.map((p) => (
            <g key={p.id} transform={`translate(${p.cx.toFixed(2)} ${p.cy.toFixed(2)})`} className="scope-plane" onClick={() => setSel(p)}>
              <circle r="3" fill="transparent" />{/* larger hit target */}
              {sel && sel.id === p.id && <circle r="2.6" fill="none" stroke="var(--teal)" strokeWidth="0.5" className="scope-lock" />}
              <g transform={`rotate(${Math.round(p.hdg)})`}>
                <path d="M0 -2 L1.5 2 L0 1 L-1.5 2 Z" fill={p.color} className="scope-ac" />
              </g>
              {p.label && <text className="scope-tag" x="2.3" y="1">{p.label}</text>}
            </g>
          ))}
        </svg>

        {sel && (
          <div className="scope-pop mono">
            <button className="scope-pop-x" onClick={() => setSel(null)} aria-label="Close">✕</button>
            <div className="scope-pop-cs">{sel.label || "UNKNOWN"}</div>
            <div className="scope-pop-row"><span>ALT</span><b style={{ color: sel.color }}>{fmtAlt(sel.alt)}</b></div>
            <div className="scope-pop-row"><span>SPD</span><b>{sel.gs != null ? Math.round(sel.gs) + " kt" : "—"}</b></div>
            <div className="scope-pop-row"><span>HDG</span><b>{Math.round(sel.hdg)}°</b></div>
            <div className="scope-pop-row"><span>RNG</span><b>{sel.dist} nm</b></div>
          </div>
        )}
      </div>

      <div className="scope-legend mono">
        <span><i style={{ background: "#e0a83c" }} />&lt;10k</span>
        <span><i style={{ background: "var(--teal)" }} />10–30k</span>
        <span><i style={{ background: "#4a9eff" }} />&gt;30k ft</span>
      </div>

      <div className="scope-foot mono">
        <span>
          {state.status === "loading" && "scanning…"}
          {state.status === "error" && "feed offline"}
          {state.status === "empty" && "no returns"}
          {state.status === "ok" && `${state.count} contact${state.count === 1 ? "" : "s"} · ${SCOPE_RANGE_NM}nm`}
        </span>
        <span className={state.stale ? "scope-stale" : "scope-ok"}>
          {state.stale ? "holding" : state.status === "ok" ? "tracking" : state.status === "loading" ? "acquiring" : "—"}
        </span>
      </div>
    </div>
  );
}

/* ── module launcher (top of page, filterable by division) ── */
function Launcher() {
  const [filter, setFilter] = useState("all");
  const chips = [{ id: "all", label: "All systems", color: "var(--ink)" }, ...GROUPS.map((g) => ({ id: g.id, label: g.label, color: GROUP_COLOR[g.id] }))];
  const shown = filter === "all" ? MODULES : MODULES.filter((m) => m.group === filter);
  return (
    <section className="group" id="modules">
      <div className="launch-head">
        <div className="lh-title mono"><span className="lh-blip" /> Flight Deck <span className="lh-count">{String(shown.length).padStart(2, "0")} systems</span></div>
        <div className="chips">
          {chips.map((c) => (
            <button key={c.id} className={"chip" + (filter === c.id ? " on" : "")} style={{ "--c": c.color }} onClick={() => setFilter(c.id)}>{c.label}</button>
          ))}
        </div>
      </div>
      <div className="grid">
        {shown.map((m) => <Card key={m.id} m={m} />)}
      </div>
    </section>
  );
}

/* ── featured spotlight (rotating live modules) ── */
function Featured() {
  const live = useMemo(() => MODULES.filter((m) => m.live), []);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((v) => (v + 1) % live.length), 5000);
    return () => clearInterval(id);
  }, [paused, live.length]);
  const m = live[i];
  const { gate, flight } = gateFor(m);
  return (
    <section className="group" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="group-head">
        <div className="group-eyebrow">
          <span>On the scope</span><span className="rule" /><span className="count">tracking now</span>
        </div>
        <div className="group-title">Live contact<span className="blurb">real-time modules, streaming</span></div>
      </div>
      <a className="feature" href={m.file} style={{ "--c": m.color }}>
        <div className="feature-bg" />
        <div className="feature-ico" dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24">${m.svg}</svg>` }} />
        <div className="feature-body">
          <div className="feature-tag mono"><span className="badge live" style={{ "--c": m.color }}><i />Live</span> SEC {gate} · {flight}</div>
          <div className="feature-name serif">{m.name}</div>
          <div className="feature-desc">{m.desc}</div>
          <div className="feature-go mono">Open live feed →</div>
        </div>
        <div className="feature-dots">
          {live.map((x, k) => (
            <button
              key={x.id}
              className={"fdot" + (k === i ? " on" : "")}
              style={{ "--c": x.color }}
              aria-label={x.name}
              onClick={(e) => { e.preventDefault(); setI(k); }}
            />
          ))}
        </div>
      </a>
    </section>
  );
}

function Card({ m }) {
  const { gate, flight } = gateFor(m);
  return (
    <a className="card" href={m.file} style={{ "--c": m.color }} aria-label={m.name}>
      <div className="card-top">
        <div className="card-ico" dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24">${m.svg}</svg>` }} />
        <div className="card-meta">
          {m.live && <span className="badge live" style={{ "--c": m.color }}><i />Live</span>}
          {m.locked && <span className="badge lock">🔒 Locked</span>}
          <span className="card-gate mono">SEC <b>{gate}</b> · {flight}</span>
        </div>
      </div>
      <div className="card-name">{m.name}</div>
      <div className="card-tag">{m.tag}</div>
      <div className="card-desc">{m.desc}</div>
      <div className="card-go">Open<span className="arrow">→</span></div>
    </a>
  );
}

function CommandPalette({ open, onClose }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return MODULES;
    return MODULES.filter((m) => m.name.toLowerCase().includes(s) || m.tag.toLowerCase().includes(s) || m.desc.toLowerCase().includes(s));
  }, [q]);
  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => inputRef.current?.focus(), 20); } }, [open]);
  const go = useCallback((m) => { if (m) window.location.href = m.file; }, []);
  function onKey(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); go(results[sel]); }
    else if (e.key === "Escape") { onClose(); }
  }
  if (!open) return null;
  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Jump to module">
        <div className="cmd-input">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Jump to a module…" aria-label="Search modules" />
        </div>
        <div className="cmd-list">
          {results.length === 0 && <div className="cmd-empty">No module matches “{q}”.</div>}
          {results.map((m, i) => (
            <div key={m.id} className={"cmd-item" + (i === sel ? " sel" : "")} style={{ "--c": m.color }} onMouseEnter={() => setSel(i)} onClick={() => go(m)}>
              <div className="ci-ico" dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24">${m.svg}</svg>` }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ci-name">{m.name} {m.locked && "🔒"}</div>
                <div className="ci-tag">{m.tag}</div>
              </div>
              {m.live && <span className="badge live" style={{ "--c": m.color }}><i />Live</span>}
            </div>
          ))}
        </div>
        <div className="cmd-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [cmdOpen, setCmdOpen] = useState(false);
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmdOpen((v) => !v); }
      else if (e.key === "/" && !/input|textarea/i.test(document.activeElement?.tagName || "")) { e.preventDefault(); setCmdOpen(true); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const liveCount = MODULES.filter((m) => m.live).length;
  const news = useNews();

  return (
    <>
      <div className="bg-grad" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />
      <SkyField />

      <header className="topbar" id="top">
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" opacity=".4" /><circle cx="12" cy="12" r="4.4" />
              <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" /><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div>
            <div className="brand-name">ARGUS</div>
            <div className="brand-sub">Aviation Terminal</div>
          </div>
        </div>
        <div className="topbar-spacer" />
        <ThemeToggle />
        <a className="topbar-notes" href="/ground-school" title="Ground School — course notes">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5" /></svg>
          <span className="label">Notes</span>
        </a>
        <a className="topbar-dash" href="/argus-dashboard.html" title="ARGUS attendance dashboard">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 14l3-4 3 3 4-6" /><circle cx="20" cy="7" r="1.6" fill="currentColor" stroke="none" /></svg>
          <span className="label">Dashboard</span>
        </a>
        <button className="kbtn" onClick={() => setCmdOpen(true)}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <span className="label">Search</span> <kbd>⌘K</kbd>
        </button>
        <Clock />
      </header>

      <StatusStrip />
      <NewsWire news={news} />

      <main className="shell">
        <section className="hero hero-split">
          <div className="hero-main">
            <div className="hero-eyebrow"><i />All-seeing · {MODULES.length} systems on the scope <span className="plane">◉</span></div>
            <h1>
              Every aircraft in the sky.<br />
              <span className="accent">Nothing off the scope.</span>
            </h1>
            <p>
              Live flight and satellite tracking, ATC and flight-operations simulators,
              engineering labs, a careers desk, research and cohort dashboards — one
              terminal for the business and craft of flight.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#modules">Browse systems ↓</a>
              <a className="btn btn-ghost" href="/ground-school">Course notes →</a>
              <a className="btn btn-ghost" href="/argus.html">Live radar ✈</a>
            </div>
            <div className="hero-stats">
              <div className="stat"><div className="n serif">{MODULES.length}</div><div className="l">Modules</div></div>
              <div className="stat"><div className="n serif">{liveCount}</div><div className="l">Live feeds</div></div>
              <div className="stat"><div className="n serif">{GROUPS.length}</div><div className="l">Divisions</div></div>
              <div className="stat"><div className="n serif">∞</div><div className="l">Runway</div></div>
            </div>
          </div>
          <RadarScope />
        </section>

        <Launcher />

        <Featured />

        <NewsDesk news={news} />

        <LiveBoard />

        <FlightLog />

        <section className="cta">
          <div className="cta-eyebrow mono">◉ The scope is live</div>
          <h2 className="serif">Everything that flies, on one scope.</h2>
          <p>Pick a system and go — from live global radar to a black-hole raytracer.</p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => setCmdOpen(true)}>Search modules ⌘K</button>
            <a className="btn btn-ghost" href="#top">Back to top ↑</a>
          </div>
        </section>

        <footer className="foot">
          <span className="foot-title">ARGUS · Aviation Terminal</span>
          <span>Press <kbd>⌘K</kbd> to jump anywhere · made by sid</span>
        </footer>
      </main>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}
