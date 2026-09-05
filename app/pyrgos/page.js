"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { LAYOUTS, LAYOUT_KEYS } from "@/lib/pyrgos/layouts";

/* ═══════════════════════ engine ═══════════════════════ */
const TURN_RATE = 3.2;
const SIM_SPEED = 3;
const G3 = 318;
const TYPES = ["A320", "B738", "A321", "B77W", "A20N", "B38M", "A359", "E190", "B788", "AT76"];
const AIRLINES = [
  ["UAL", "United"], ["DAL", "Delta"], ["AAL", "American"], ["BAW", "Speedbird"],
  ["UAE", "Emirates"], ["AIC", "Air India"], ["IGO", "IndiGo"], ["SIA", "Singapore"],
  ["QTR", "Qatari"], ["KLM", "KLM"], ["DLH", "Lufthansa"], ["THY", "Turkish"],
];
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[(Math.random() * a.length) | 0];
const norm360 = (d) => ((d % 360) + 360) % 360;
const angDiff = (a, b) => { let d = norm360(b - a); if (d > 180) d -= 360; return d; };
const zulu = () => new Date().toISOString().slice(11, 19);
const hdgOf = (ax, ay, bx, by) => norm360(Math.atan2(bx - ax, ay - by) * 180 / Math.PI);
const spoken = (a) => `${a.tele} ${a.cs.slice(3)}`;
const say = (S, from, text) => { S.comms.push({ id: S.commId++, t: zulu(), from, text }); if (S.comms.length > 60) S.comms.shift(); };

function buildField(key) {
  const L = LAYOUTS[key];
  const pts = [];
  const runways = L.runways.map((r) => {
    const len = Math.hypot(r.bx - r.ax, r.by - r.ay);
    pts.push([r.ax, r.ay], [r.bx, r.by]);
    const dirIsB = r.dir === r.nameB;
    // threshold = the end where the active designator is painted; aircraft travel toward the far end
    const thr = dirIsB ? { x: r.bx, y: r.by } : { x: r.ax, y: r.ay };
    const far = dirIsB ? { x: r.ax, y: r.ay } : { x: r.bx, y: r.by };
    const ux = (far.x - thr.x) / len, uy = (far.y - thr.y) / len;
    return { ...r, len, thr, far, ux, uy, hdg: hdgOf(thr.x, thr.y, far.x, far.y), name: r.dir };
  });
  Object.values(L.nodes).forEach((n) => pts.push([n.x, n.y]));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const longest = Math.max(...runways.map((r) => r.len));
  const pxPerNm = longest / 2.2;
  const arr = runways.filter((r) => r.role === "ARR" || r.role === "BOTH");
  const dep = runways.filter((r) => r.role === "DEP" || r.role === "BOTH");
  return { key, meta: L, runways, nodes: L.nodes, edges: L.edges, gates: L.gates, cx, cy, pxPerNm,
    arrRwys: arr.length ? arr : runways, depRwys: dep.length ? dep : runways,
    wind: { dir: Math.round(runways[0].hdg), spd: 6 } };
}
const HEAVY = ["B77W", "A359", "B788"], LIGHT = ["AT76"];
const wakeCat = (t) => HEAVY.includes(t) ? "H" : LIGHT.includes(t) ? "L" : "M";
// required wake separation (nm) behind a leader for a follower
function wakeSep(leadCat, folCat) {
  if (leadCat === "H") return folCat === "H" ? 4 : folCat === "M" ? 5 : 6;
  if (leadCat === "M") return folCat === "L" ? 4 : 3;
  return 3;
}

let UID = 1;
function spawnArrival(F, dOverride) {
  const r = pick(F.arrRwys);
  const dNm = dOverride ?? rnd(8, 15), px = dNm * F.pxPerNm, off = rnd(-0.6, 0.6) * F.pxPerNm;
  const [ic, tel] = pick(AIRLINES);
  const ty = pick(TYPES);
  const alt = Math.round(rnd(2800, 4200) / 100) * 100;
  return { id: UID++, cs: ic + (100 + (Math.random() * 899 | 0)), tele: tel, type: ty,
    kind: "ARR", state: "ARR", rwy: r, wake: wakeCat(ty),
    x: r.thr.x - r.ux * px + (-r.uy) * off, y: r.thr.y - r.uy * px + (r.ux) * off,
    hdg: r.hdg, alt, spd: 210, hdgCmd: r.hdg, altCmd: alt, spdCmd: 180,
    appr: true, cleared: {}, trail: [], sel: false, waited: 0 };
}
function spawnDeparture(F) {
  const r = pick(F.depRwys);
  const [ic, tel] = pick(AIRLINES);
  const ty = pick(TYPES);
  const gate = pick(F.gates || []);
  const g = gate && F.nodes[gate] ? F.nodes[gate] : r.thr;
  return { id: UID++, cs: ic + (100 + (Math.random() * 899 | 0)), tele: tel, type: ty, wake: wakeCat(ty),
    kind: "DEP", state: gate ? "PARKED" : "READY", rwy: r, homeGate: gate, x: g.x, y: g.y,
    hdg: r.hdg, alt: 0, spd: 0, hdgCmd: r.hdg, altCmd: 5000, spdCmd: 250,
    cleared: {}, trail: [], sel: false, waited: 0 };
}
function distNm(a, F) { return Math.hypot(a.x - F.cx, a.y - F.cy) / F.pxPerNm; }

/* ── taxi network (Dijkstra over nodes/edges) ── */
function nearestNode(F, x, y) { let best = null, bd = 1e12; for (const k in F.nodes) { const n = F.nodes[k]; const d = (n.x - x) ** 2 + (n.y - y) ** 2; if (d < bd) { bd = d; best = k; } } return best; }
function routeNodes(F, from, to) {
  if (!from || !to || !F.nodes[from] || !F.nodes[to]) return null;
  const adj = {}; for (const k in F.nodes) adj[k] = [];
  F.edges.forEach(([a, b]) => { if (F.nodes[a] && F.nodes[b]) { const w = Math.hypot(F.nodes[a].x - F.nodes[b].x, F.nodes[a].y - F.nodes[b].y); adj[a].push([b, w]); adj[b].push([a, w]); } });
  const dist = {}, prev = {}, Q = new Set(Object.keys(F.nodes));
  for (const k of Q) dist[k] = 1e12; dist[from] = 0;
  while (Q.size) { let u = null, ud = 1e13; for (const k of Q) if (dist[k] < ud) { ud = dist[k]; u = k; } if (u === null || u === to) break; Q.delete(u); for (const [v, w] of adj[u] || []) if (Q.has(v) && dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; } }
  const path = []; let c = to; while (c !== undefined) { path.unshift(c); if (c === from) break; c = prev[c]; }
  return path[0] === from ? path.map((n) => ({ x: F.nodes[n].x, y: F.nodes[n].y, node: n })) : null;
}
function followRoute(a, dt, spdPx) {
  if (!a.route || !a.route.length) return;
  const p = a.route[0], dx = p.x - a.x, dy = p.y - a.y, d = Math.hypot(dx, dy);
  a.hdg = norm360(Math.atan2(dx, -dy) * 180 / Math.PI);
  const step = spdPx * dt;
  if (d <= step) { a.x = p.x; a.y = p.y; a.route.shift(); }
  else { a.x += dx / d * step; a.y += dy / d * step; }
}
function windDrift(a, dt, F, KTS) {
  const wind = F.wind; if (!wind || !wind.spd || a.alt < 100) return;
  const wr = (wind.dir + 180) * Math.PI / 180; // wind blows toward (from-dir + 180)
  a.x += Math.sin(wr) * wind.spd * KTS * dt * 0.6;
  a.y += -Math.cos(wr) * wind.spd * KTS * dt * 0.6;
}

function stepAircraft(a, dt, F) {
  const KTS = F.pxPerNm / 3600;
  a.waited += dt;
  a._t = (a._t || 0) + dt;
  if (a._t > 1.1) { a._t = 0; a.trail.push([a.x, a.y]); if (a.trail.length > 8) a.trail.shift(); }
  const r = a.rwy;
  a.spd += Math.sign(a.spdCmd - a.spd) * Math.min(Math.abs(a.spdCmd - a.spd), 6 * dt);
  // altitude only changes while airborne; on the ground it stays at zero
  if (a.state === "ARR" || a.state === "DEP" || a.state === "GOAROUND" || a.state === "HOLD") a.alt += Math.sign(a.altCmd - a.alt) * Math.min(Math.abs(a.altCmd - a.alt), 32 * dt);
  else a.alt = 0;

  // ── ground states ──
  if (a.state === "PARKED") { a.spd = 0; if (a.kind === "ARR") { a.parkT -= dt; if (a.parkT <= 0) a.done = true; } return; }
  if (a.state === "TAXI_IN" || a.state === "TAXI_OUT") {
    a.spd = 24; followRoute(a, dt, 24 * KTS);
    if (!a.route || !a.route.length) {
      if (a.state === "TAXI_IN") { a.state = "PARKED"; a.parkT = 6; a.spd = 0; }
      else { a.state = "READY"; a.hdg = r.hdg; a.spd = 0; }
    }
    return;
  }
  if (a.state === "LINEUP") { a.spd = 30; followRoute(a, dt, 60 * KTS); if (!a.route || !a.route.length) { a.hdg = r.hdg; a.state = "TKOF"; a.spd = 20; } return; }

  if (a.state === "READY") { a.hdg = r.hdg; return; }
  if (a.state === "TKOF") {
    a.spd += 42 * dt; a.x += r.ux * a.spd * KTS * dt; a.y += r.uy * a.spd * KTS * dt; a.hdg = r.hdg;
    if (a.spd > 150) { a.state = "DEP"; a.altCmd = Math.max(a.altCmd, 5000); a.spdCmd = 250; }
    return;
  }
  if (a.state === "HOLD") { // standard right-hand racetrack orbit at present level
    a.spdCmd = Math.min(a.spdCmd, 230);
    a.hdg = norm360(a.hdg + TURN_RATE * dt);
    a.x += Math.sin(a.hdg * Math.PI / 180) * a.spd * KTS * dt; a.y += -Math.cos(a.hdg * Math.PI / 180) * a.spd * KTS * dt;
    windDrift(a, dt, F, KTS);
    return;
  }
  let targetHdg = a.hdgCmd;
  if (a.kind === "ARR" && a.appr && a.state === "ARR") {
    const relx = a.x - r.thr.x, rely = a.y - r.thr.y;
    const along = -(relx * r.ux + rely * r.uy);
    const cross = relx * (-r.uy) + rely * (r.ux);
    targetHdg = norm360(r.hdg + Math.max(-32, Math.min(32, -cross / (F.pxPerNm * 0.5) * 30)));
    const nm = Math.max(0, along) / F.pxPerNm;
    a.altCmd = Math.min(a.altCmd, Math.round(nm * G3 + 20));
    a.spdCmd = nm > 5 ? 190 : nm > 2 ? 160 : 140;
    if (along < 6 && Math.abs(cross) < r.w * 1.4) {
      if (a.cleared.land) { a.state = "LAND"; a.alt = 0; a.spd = Math.min(a.spd, 145); }
      else { a.state = "GOAROUND"; a.appr = false; a.altCmd = 3000; a.spdCmd = 200; a.hdgCmd = norm360(r.hdg + 20); a.ga = true; }
    }
  }
  const d = angDiff(a.hdg, targetHdg);
  a.hdg = norm360(a.hdg + Math.sign(d) * Math.min(Math.abs(d), TURN_RATE * dt));
  if (a.state === "LAND") {
    a.spd = Math.max(24, a.spd - 40 * dt);
    a.x += r.ux * a.spd * KTS * dt; a.y += r.uy * a.spd * KTS * dt; a.hdg = r.hdg;
    const rolled = (a.x - r.thr.x) * r.ux + (a.y - r.thr.y) * r.uy;
    if (rolled > r.len - 40 || a.spd <= 26) {
      a._landed = true;
      const rt = routeNodes(F, nearestNode(F, a.x, a.y), pick(F.gates || []));
      if (rt && rt.length > 1) { a.route = rt; a.state = "TAXI_IN"; a.waited = 0; }
      else { a.done = true; }
    }
    return;
  }
  a.x += Math.sin(a.hdg * Math.PI / 180) * a.spd * KTS * dt;
  a.y += -Math.cos(a.hdg * Math.PI / 180) * a.spd * KTS * dt;
  windDrift(a, dt, F, KTS);
  const dc = distNm(a, F);
  if ((a.kind === "DEP" && dc > 16 && a.alt > 4000) || dc > 30) { a.done = true; a._departed = a.kind === "DEP"; }
}

function bayOf(a, F) {
  const ground = ["PARKED", "TAXI_OUT", "TAXI_IN", "READY", "LINEUP"];
  if (a.state === "TAXI_IN" || (a.kind === "ARR" && a.state === "PARKED")) return "GROUND";
  if (a.kind === "DEP") return ground.includes(a.state) ? "GROUND" : "RUNWAY";
  if (a.state === "LAND" || (a.state === "ARR" && distNm(a, F) < 5)) return "RUNWAY";
  return "APPROACH";
}
// which ATC position currently owns the aircraft
function posOf(a) {
  if (a.kind === "DEP" && a.state === "PARKED" && !a.cleared.delivery) return "DELIVERY";
  if (a.kind === "DEP" && (a.state === "PARKED" || a.state === "TAXI_OUT")) return "GROUND";
  if (a.state === "TAXI_IN" || a.state === "PARKED") return "GROUND";
  return "TOWER";
}
const CTRL_POS = ["TWR", "GND", "DEL", "APP"]; // controller callsigns in comms
function selSnap(a, F) {
  return { id: a.id, cs: a.cs, tele: a.tele, type: a.type, kind: a.kind, state: a.state,
    alt: Math.round(a.alt / 100) * 100, spd: Math.round(a.spd), hdg: Math.round(a.hdg), rwy: a.rwy.name,
    land: !!a.cleared.land, deliv: !!a.cleared.delivery, sid: a.sid, sq: a.squawk, wake: a.wake, nm: +distNm(a, F).toFixed(1) };
}
// project a real ADS-B lat/lon onto the field pixel space (layouts are drawn true-north up, to scale)
function projectLive(F, a) {
  const R = 3440.065, toRad = (x) => x * Math.PI / 180, g = F.meta.geo;
  const dLat = toRad(a.lat - g.lat), dLon = toRad(a.lon - g.lon);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(g.lat)) * Math.cos(toRad(a.lat)) * Math.sin(dLon / 2) ** 2;
  const d = R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  const yy = Math.sin(toRad(a.lon - g.lon)) * Math.cos(toRad(a.lat));
  const xx = Math.cos(toRad(g.lat)) * Math.sin(toRad(a.lat)) - Math.sin(toRad(g.lat)) * Math.cos(toRad(a.lat)) * Math.cos(toRad(a.lon - g.lon));
  const brg = (Math.atan2(yy, xx) * 180 / Math.PI + 360) % 360, br = toRad(brg), px = d * F.pxPerNm;
  return { id: a.hex || a.flight || `${a.lat},${a.lon}`, cs: (a.flight || a.hex || "").trim().toUpperCase() || "UNKNOWN",
    x: F.cx + px * Math.sin(br), y: F.cy - px * Math.cos(br), alt: a.alt ?? null, spd: a.gs ?? null, hdg: a.track ?? brg, nm: +d.toFixed(1), sel: false };
}

/* ═══════════════════════ component ═══════════════════════ */
export default function Pyrgos() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const sim = useRef(null);
  const view = useRef({ radiusNm: 12, cx: 0, cy: 0 });
  const raf = useRef(0);
  const lastT = useRef(0);
  const drag = useRef(null);

  const [layoutKey, setLayoutKey] = useState("chennai");
  const [paused, setPaused] = useState(false);
  const [sel, setSel] = useState(null);
  const [counts, setCounts] = useState({ arr: 0, dep: 0 });
  const [clock, setClock] = useState("--:--:--");
  const [hdgInput, setHdgInput] = useState("");
  const [roster, setRoster] = useState({ APPROACH: [], RUNWAY: [], GROUND: [] });
  const [comms, setComms] = useState([]);
  const [atis, setAtis] = useState({ ltr: "A", wind: "—", qnh: 1013, rwy: "—" });
  const [rangeNm, setRangeNm] = useState(12);
  const [conf, setConf] = useState(0);
  const [position, setPosition] = useState("TOWER");
  const [chart, setChart] = useState(false);
  const [queues, setQueues] = useState({ DELIVERY: [], GROUND: [], TOWER: [] });
  const [mode, setMode] = useState("SIM"); // SIM | LIVE
  const [live, setLive] = useState({ status: "idle", count: 0, sel: null });
  const [score, setScore] = useState(0);
  const [events, setEvents] = useState([]);
  const [wx, setWx] = useState({ status: "idle", raw: "", favRwy: "" });
  const modeRef = useRef("SIM");

  useEffect(() => {
    const F = buildField(layoutKey);
    sim.current = { F, aircraft: [], spawnT: 2.5, comms: [], commId: 1, score: 0, events: [], busted: new Set() };
    view.current = { radiusNm: 12, cx: F.cx, cy: F.cy, chart: false };
    setRangeNm(12); setSel(null); setComms([]); setChart(false); setPosition("TOWER");
    [7, 11, 15].forEach((d) => sim.current.aircraft.push(spawnArrival(F, d)));
    const dep = spawnDeparture(F); sim.current.aircraft.push(dep);
    const r0 = F.runways[0];
    setAtis({ ltr: String.fromCharCode(65 + (Date.now() / 3.6e6 | 0) % 26), wind: `${String(Math.round(r0.hdg)).padStart(3, "0")}/${8 + (Math.random() * 8 | 0)}`, qnh: 1011 + (Math.random() * 6 | 0), rwy: F.arrRwys.map((r) => r.name).join(", ") });
    sim.current.aircraft.forEach((a) => checkIn(sim.current, a, F));
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      window.__PYR = { sim, view, step: (dt) => { const S = sim.current; S.aircraft.forEach((a) => stepAircraft(a, dt, S.F)); S.aircraft = S.aircraft.filter((a) => !a.done); } };
    }
  }, [layoutKey]);

  function checkIn(S, a, F) {
    if (a.kind === "ARR") say(S, a.cs, `Tower, ${spoken(a)}, ${Math.round(distNm(a, F))} mile final runway ${a.rwy.name}`);
    else if (a.state === "PARKED") say(S, a.cs, `Delivery, ${spoken(a)}, at the gate, request IFR clearance`);
    else say(S, a.cs, `${spoken(a)}, ready for departure runway ${a.rwy.name}`);
  }

  // main loop
  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let sweep = 0;
    function resize() {
      const w = wrapRef.current.clientWidth, h = wrapRef.current.clientHeight;
      canvas.width = w * DPR; canvas.height = h * DPR; canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrapRef.current);
    function frame(t) {
      const S = sim.current;
      const dt = Math.min(0.05, (t - lastT.current) / 1000) || 0; lastT.current = t;
      if (S && !paused && modeRef.current === "SIM") tick(S, dt * SIM_SPEED);
      if (S) render(ctx, canvas, S, view.current, DPR, (sweep += dt * 0.55), modeRef.current);
      raf.current = requestAnimationFrame(frame);
    }
    function tick(S, dt) {
      const F = S.F;
      S.spawnT -= dt;
      if (S.spawnT <= 0) {
        S.spawnT = rnd(9, 16);
        const arrN = S.aircraft.filter((a) => a.kind === "ARR" && !a.done).length;
        const a = Math.random() < (arrN < 4 ? 0.68 : 0.3) ? spawnArrival(F) : spawnDeparture(F);
        S.aircraft.push(a); checkIn(S, a, F);
      }
      S.aircraft.forEach((a) => {
        a.conf = false; a.wakeWarn = false;
        const prev = a.state; stepAircraft(a, dt, F);
        if (prev !== a.state) {
          if (a.state === "GOAROUND") { say(S, a.cs, `Going around, ${spoken(a)}!`); S.score -= 30; S.events.unshift({ t: zulu(), txt: `${a.cs} go-around`, d: -30 }); }
          if (a.state === "TKOF") say(S, a.cs, `Rolling, ${spoken(a)}`);
          if (a.state === "DEP" && prev === "TKOF") { S.score += 50; S.events.unshift({ t: zulu(), txt: `${a.cs} departed`, d: 50 }); }
          if (a.state === "LAND") { S.score += 100; S.events.unshift({ t: zulu(), txt: `${a.cs} landed rwy ${a.rwy.name}`, d: 100 }); }
          if (a.state === "TAXI_IN") say(S, a.cs, `Clear of the runway, ${spoken(a)}, taxi to the gate`);
        }
      });
      S.aircraft = S.aircraft.filter((a) => !a.done);
      if (S.events.length > 12) S.events.length = 12;
      // separation monitor (airborne pairs) + wake spacing on final
      S.conflicts = [];
      const air = S.aircraft.filter((a) => a.alt > 50 && a.state !== "LAND" && a.state !== "TKOF");
      for (let i = 0; i < air.length; i++) for (let j = i + 1; j < air.length; j++) {
        const a = air[i], b = air[j];
        const dNm = Math.hypot(a.x - b.x, a.y - b.y) / F.pxPerNm, dAlt = Math.abs(a.alt - b.alt);
        if (dNm < 2.6 && dAlt < 900) {
          a.conf = b.conf = true; S.conflicts.push([a, b]);
          const key = Math.min(a.id, b.id) + "-" + Math.max(a.id, b.id);
          if (!S.busted.has(key)) { S.busted.add(key); S.score -= 25; S.events.unshift({ t: zulu(), txt: `separation bust`, d: -25 }); }
        }
        // wake: same-runway sequential arrivals on final
        else if (a.kind === "ARR" && b.kind === "ARR" && a.rwy === b.rwy && a.appr && b.appr) {
          const lead = a.rwy ? ((a.x - a.rwy.thr.x) * a.rwy.ux + (a.y - a.rwy.thr.y) * a.rwy.uy) : 0;
          const req = wakeSep(a.alt > b.alt ? a.wake : b.wake, a.alt > b.alt ? b.wake : a.wake);
          if (dNm < req && dAlt < 1200) { a.wakeWarn = b.wakeWarn = true; }
        }
      }
    }
    frame(performance.now());
    return () => { cancelAnimationFrame(raf.current); ro.disconnect(); };
  }, [paused]);

  // snapshot roster + comms + clock into React
  useEffect(() => {
    const id = setInterval(() => {
      setClock(zulu()); const S = sim.current; if (!S) return; const F = S.F;
      const bays = { APPROACH: [], RUNWAY: [], GROUND: [] };
      const qs = { DELIVERY: [], GROUND: [], TOWER: [] };
      S.aircraft.forEach((a) => {
        const row = { id: a.id, cs: a.cs, type: a.type, rwy: a.rwy.name, kind: a.kind, state: a.state,
          alt: Math.round(a.alt / 100) * 100, spd: Math.round(a.spd), nm: +distNm(a, F).toFixed(1), land: !!a.cleared.land, deliv: !!a.cleared.delivery, sid: a.sid, sel: a.sel };
        bays[bayOf(a, F)].push(row); qs[posOf(a)].push(row);
      });
      bays.APPROACH.sort((x, y) => x.nm - y.nm); bays.RUNWAY.sort((x, y) => x.nm - y.nm);
      qs.TOWER.sort((x, y) => x.nm - y.nm);
      setRoster(bays); setQueues(qs);
      setCounts({ arr: S.aircraft.filter((a) => a.kind === "ARR").length, dep: S.aircraft.filter((a) => a.kind === "DEP").length });
      setConf(S.conflicts ? S.conflicts.length : 0);
      setScore(S.score); setEvents(S.events.slice(0, 6));
      setComms(S.comms.slice(-14).reverse());
      const s = S.aircraft.find((a) => a.sel);
      if (s) setSel(selSnap(s, F));
      else if (sel) setSel(null);
    }, 350);
    return () => clearInterval(id);
  }, [sel]);

  // live ADS-B feed (real traffic around the field)
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => {
    if (mode !== "LIVE" || !sim.current) return;
    const F = sim.current.F; let alive = true;
    async function load() {
      try {
        const r = await fetch(`/api/flights?lat=${F.meta.geo.lat}&lon=${F.meta.geo.lon}&dist=60`, { cache: "no-store" });
        const d = await r.json();
        const ac = (d.ac || []).filter((a) => a.lat != null && a.lon != null).map((a) => projectLive(F, a));
        if (!alive) return;
        if (ac.length) { sim.current.live = ac; setLive((L) => ({ status: "ok", count: ac.length, sel: L.sel })); }
        else setLive((L) => ({ status: sim.current.live?.length ? "ok" : "empty", count: sim.current.live?.length || 0, sel: L.sel }));
      } catch { if (alive) setLive((L) => ({ ...L, status: sim.current.live?.length ? "ok" : "error" })); }
    }
    setLive((L) => ({ ...L, status: "loading" })); load();
    const id = setInterval(load, 20000);
    return () => { alive = false; clearInterval(id); };
  }, [mode, layoutKey]);

  // real weather (METAR) — sets the wind that drifts aircraft + favoured runway
  useEffect(() => {
    if (!sim.current) return;
    const F = sim.current.F, icao = F.meta.icao; let alive = true;
    setWx({ status: "loading", raw: "", favRwy: "" });
    async function loadWx() {
      try {
        const r = await fetch(`/api/metar?ids=${icao}`, { cache: "no-store" });
        const d = await r.json();
        const m = (d.metar || d.data || [])[0];
        if (!m || !alive) { if (alive) setWx((w) => ({ ...w, status: "idle" })); return; }
        const wdir = m.wdir ?? m.wind_dir_degrees ?? null, wspd = m.wspd ?? m.wind_speed_kt ?? 0;
        const raw = (m.rawOb || m.raw_text || "").trim();
        if (typeof wdir === "number" && !isNaN(wdir)) {
          F.wind = { dir: wdir, spd: wspd || 0 };
          // favoured runway = best headwind (max cos of the angle between wind and runway heading)
          let best = null, bestHw = -2;
          F.runways.filter((rw) => rw.role !== "OFF").forEach((rw) => {
            const hw = Math.cos((wdir - rw.hdg) * Math.PI / 180);
            if (hw > bestHw) { bestHw = hw; best = rw; }
          });
          const favRwy = best ? best.name : "";
          setWx({ status: "ok", raw, favRwy });
          setAtis((a) => ({ ...a, wind: `${String(Math.round(wdir)).padStart(3, "0")}/${Math.round(wspd || 0)}`, qnh: m.altim ? Math.round(m.altim) : a.qnh }));
        } else {
          setWx({ status: "ok", raw, favRwy: "" });
        }
      } catch { if (alive) setWx((w) => ({ ...w, status: "error" })); }
    }
    loadWx();
    const id = setInterval(loadWx, 5 * 60 * 1000);
    return () => { alive = false; clearInterval(id); };
  }, [layoutKey]);

  const toggleMode = () => {
    const next = mode === "SIM" ? "LIVE" : "SIM"; setMode(next);
    const v = view.current, F = sim.current.F;
    v.chart = false; setChart(false); v.cx = F.cx; v.cy = F.cy;
    v.radiusNm = next === "LIVE" ? 34 : 12; setRangeNm(v.radiusNm);
    setSel(null); setLive((L) => ({ ...L, sel: null }));
    if (next === "SIM" && sim.current) sim.current.live = [];
  };

  /* ── input: select, drag-pan, wheel-zoom ── */
  const screenScale = () => { const S = sim.current, r = canvasRef.current.getBoundingClientRect(); return Math.min(r.width, r.height) / 2 / (view.current.radiusNm * S.F.pxPerNm); };
  const pickAircraft = (mx, my) => {
    const S = sim.current, r = canvasRef.current.getBoundingClientRect(), v = view.current, sc = screenScale();
    const list = modeRef.current === "LIVE" ? (S.live || []) : S.aircraft;
    let best = null, bd = 24;
    list.forEach((a) => { const sx = r.width / 2 + (a.x - v.cx) * sc, sy = r.height / 2 + (a.y - v.cy) * sc; const d = Math.hypot(sx - mx, sy - my); if (d < bd) { bd = d; best = a; } });
    return best;
  };
  const selectById = (id) => { const S = sim.current; S.aircraft.forEach((a) => (a.sel = a.id === id)); const a = S.aircraft.find((x) => x.id === id); if (a) setSel(selSnap(a, S.F)); };
  const onDown = (e) => { const r = canvasRef.current.getBoundingClientRect(); drag.current = { x: e.clientX, y: e.clientY, moved: 0, cx: view.current.cx, cy: view.current.cy, mx: e.clientX - r.left, my: e.clientY - r.top }; };
  const onMove = (e) => { const d = drag.current; if (!d) return; const dx = e.clientX - d.x, dy = e.clientY - d.y; d.moved += Math.abs(dx) + Math.abs(dy); const sc = screenScale(); view.current.cx = d.cx - dx / sc; view.current.cy = d.cy - dy / sc; };
  const onUp = (e) => {
    const d = drag.current; drag.current = null; if (!d) return; if (d.moved >= 6) return;
    const a = pickAircraft(d.mx, d.my), S = sim.current;
    if (modeRef.current === "LIVE") {
      (S.live || []).forEach((x) => (x.sel = false));
      if (a) { a.sel = true; setLive((L) => ({ ...L, sel: { cs: a.cs, alt: a.alt, spd: Math.round(a.spd || 0), hdg: Math.round(a.hdg), nm: a.nm } })); }
      else setLive((L) => ({ ...L, sel: null }));
    } else {
      S.aircraft.forEach((x) => (x.sel = false));
      if (a) { a.sel = true; selectById(a.id); } else setSel(null);
    }
  };
  const zoomBy = (factor) => { const v = view.current; v.radiusNm = Math.max(3, Math.min(40, v.radiusNm * factor)); setRangeNm(Math.round(v.radiusNm)); };
  const onWheel = (e) => { e.preventDefault(); zoomBy(e.deltaY > 0 ? 1.12 : 0.89); };
  const toggleChart = () => {
    const next = !chart; setChart(next);
    const v = view.current, F = sim.current.F;
    if (next) {
      const xs = [], ys = []; F.runways.forEach((r) => { xs.push(r.ax, r.bx); ys.push(r.ay, r.by); }); Object.values(F.nodes).forEach((n) => { xs.push(n.x); ys.push(n.y); });
      v.cx = (Math.min(...xs) + Math.max(...xs)) / 2; v.cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      v.radiusNm = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2 / F.pxPerNm * 1.3;
      v.chart = true;
    } else { v.cx = F.cx; v.cy = F.cy; v.radiusNm = 12; v.chart = false; }
    setRangeNm(Math.round(v.radiusNm));
  };

  /* ── commands (with comms readbacks) ── */
  const withSel = (fn) => { const S = sim.current; const a = S?.aircraft.find((x) => x.sel); if (a) fn(a, S); };
  const cmdHdg = (deg) => withSel((a, S) => { a.appr = false; a.hdgCmd = norm360(deg); say(S, "TWR", `${spoken(a)}, fly heading ${String(Math.round(deg)).padStart(3, "0")}`); say(S, a.cs, `Heading ${String(Math.round(deg)).padStart(3, "0")}, ${spoken(a)}`); });
  const cmdTurn = (delta) => withSel((a, S) => { a.appr = false; a.hdgCmd = norm360(a.hdgCmd + delta); say(S, "TWR", `${spoken(a)}, turn ${delta < 0 ? "left" : "right"} heading ${String(Math.round(a.hdgCmd)).padStart(3, "0")}`); });
  const cmdAlt = (ft) => withSel((a, S) => { const up = ft > a.alt; a.altCmd = ft; say(S, "TWR", `${spoken(a)}, ${up ? "climb" : "descend"} and maintain ${ft >= 1000 ? (ft / 1000) + " thousand" : ft}`); say(S, a.cs, `${up ? "Up" : "Down"} to ${ft >= 1000 ? (ft / 1000) : ft}, ${spoken(a)}`); });
  const cmdSpd = (kt) => withSel((a, S) => { a.spdCmd = kt; say(S, "TWR", `${spoken(a)}, ${kt} knots`); say(S, a.cs, `${kt} knots, ${spoken(a)}`); });
  const cmdApproach = () => withSel((a, S) => { if (a.kind === "ARR") { a.appr = true; a.state = "ARR"; say(S, "TWR", `${spoken(a)}, cleared ILS runway ${a.rwy.name}`); say(S, a.cs, `Cleared ILS ${a.rwy.name}, ${spoken(a)}`); } });
  const cmdLand = () => withSel((a, S) => { if (a.kind === "ARR") { a.cleared.land = true; a.appr = true; a.state = "ARR"; say(S, "TWR", `${spoken(a)}, runway ${a.rwy.name}, cleared to land`); say(S, a.cs, `Cleared to land ${a.rwy.name}, ${spoken(a)}`); } });
  const cmdDeliver = () => withSel((a, S) => {
    if (a.kind !== "DEP" || a.cleared.delivery) return;
    const F = S.F, sids = (F.meta.sids || []).filter((s) => s.rwys.includes(a.rwy.name));
    const sid = sids.length ? pick(sids) : null;
    a.sid = sid ? sid.name : "RADAR VECTORS"; a.squawk = String(1000 + (Math.random() * 6000 | 0));
    a.cleared.delivery = true; a.altCmd = sid ? (sid.alt || 5000) : 5000;
    say(S, "DEL", `${spoken(a)}, cleared to destination via the ${a.sid} departure, climb ${a.altCmd >= 1000 ? (a.altCmd / 1000) + " thousand" : a.altCmd}, squawk ${a.squawk}`);
    say(S, a.cs, `Via ${a.sid}, climb ${a.altCmd / 1000 | 0} thousand, squawk ${a.squawk}, ${spoken(a)}`);
  });
  const cmdTaxi = () => withSel((a, S) => {
    if (a.kind === "DEP" && a.state === "PARKED" && !a.cleared.delivery) { say(S, "GND", `${spoken(a)}, remain at the gate, contact delivery for your clearance`); return; }
    if (a.kind === "DEP" && (a.state === "PARKED" || a.state === "TAXI_OUT")) {
      const F = S.F, holdName = F.meta.holds && F.meta.holds[a.rwy.name];
      const rt = holdName ? routeNodes(F, a.homeGate || nearestNode(F, a.x, a.y), holdName) : null;
      if (rt && rt.length > 1) { a.route = rt; a.state = "TAXI_OUT"; say(S, "TWR", `${spoken(a)}, taxi to holding point runway ${a.rwy.name}`); say(S, a.cs, `Taxi to holding point runway ${a.rwy.name}, ${spoken(a)}`); }
      else { a.state = "READY"; a.x = a.rwy.thr.x; a.y = a.rwy.thr.y; }
    }
  });
  const cmdTakeoff = () => withSel((a, S) => {
    if (a.kind === "DEP" && a.state === "READY") {
      a.route = [{ x: a.rwy.thr.x, y: a.rwy.thr.y }]; a.state = "LINEUP";
      say(S, "TWR", `${spoken(a)}, runway ${a.rwy.name}, cleared for takeoff`); say(S, a.cs, `Cleared for takeoff ${a.rwy.name}, ${spoken(a)}`);
    }
  });
  const cmdGoAround = () => withSel((a, S) => { a.appr = false; a.cleared.land = false; a.altCmd = 3000; a.spdCmd = 210; a.hdgCmd = norm360(a.rwy.hdg + 25); say(S, "TWR", `${spoken(a)}, go around, fly runway heading, climb 3000`); });
  const cmdHold = () => withSel((a, S) => { if (a.kind === "ARR" && (a.state === "ARR" || a.state === "GOAROUND")) { a.state = "HOLD"; a.appr = false; a.cleared.land = false; say(S, "TWR", `${spoken(a)}, hold present position, right turns, maintain ${a.alt >= 1000 ? (a.alt / 1000 | 0) + " thousand" : a.alt}`); say(S, a.cs, `Holding present position, ${spoken(a)}`); } });
  const cmdResume = () => withSel((a, S) => { if (a.state === "HOLD") { a.state = "ARR"; a.appr = true; a.spdCmd = 190; say(S, "TWR", `${spoken(a)}, resume the approach, cleared ILS runway ${a.rwy.name}`); say(S, a.cs, `Resuming approach, ${spoken(a)}`); } });
  const applyHdg = () => { const d = parseInt(hdgInput, 10); if (!isNaN(d)) { cmdHdg(d); setHdgInput(""); } };
  const doSpawn = (kind) => { const S = sim.current, F = S.F; const a = kind === "ARR" ? spawnArrival(F) : spawnDeparture(F); S.aircraft.push(a); checkIn(S, a, F); };

  const F = sim.current?.F;
  return (
    <div className="pyr">
      <style>{CSS}</style>

      <header className="pyr-top">
        <Link href="/" className="pyr-brand"><span className="pyr-mark">◉</span> PYRGOS <b>TOWER</b></Link>
        <label className="pyr-apt">FIELD
          <select value={layoutKey} onChange={(e) => setLayoutKey(e.target.value)}>
            {LAYOUT_KEYS.map((k) => <option key={k} value={k}>{LAYOUTS[k].icao} · {LAYOUTS[k].label.split("·")[0].trim()}</option>)}
          </select>
        </label>
        <div className="pyr-atis"><b>ATIS {atis.ltr}</b><span>WIND {atis.wind}</span><span>QNH {atis.qnh}</span><span>RWY {atis.rwy}</span>{wx.status === "ok" && <span className="pyr-wxtag" title={wx.raw}>METAR{wx.favRwy ? " · FAV " + wx.favRwy : ""}</span>}</div>
        <div className="pyr-spacer" />
        {mode === "SIM" && <div className={"pyr-score" + (score < 0 ? " neg" : "")} title="Operations score — land +100, depart +50, go-around −30, separation bust −25">SCORE <b>{score}</b></div>}
        <div className="pyr-stat"><b>{counts.arr}</b> ARR · <b>{counts.dep}</b> DEP</div>
        <div className="pyr-clock">{clock}Z</div>
        <button className={"pyr-btn" + (mode === "LIVE" ? " live" : " ghost")} onClick={toggleMode} title="Live ADS-B traffic around this field">◉ {mode === "LIVE" ? "LIVE" : "Live"}</button>
        {mode === "SIM" && <button className="pyr-btn" onClick={() => setPaused((p) => !p)}>{paused ? "▶" : "⏸"}</button>}
        <a className="pyr-btn ghost" href="/pyrgos.html" title="Original simulator">Classic ↗</a>
      </header>

      <div className="pyr-postabs">
        {["BRIEFING", "ATIS", "DELIVERY", "GROUND", "TOWER"].map((p) => (
          <button key={p} className={"pyr-postab" + (position === p ? " on" : "")} onClick={() => setPosition(p)}>
            {p}{["DELIVERY", "GROUND", "TOWER"].includes(p) && queues[p].length > 0 && <span className="pyr-postab-n">{queues[p].length}</span>}
          </button>
        ))}
      </div>

      <div className="pyr-stage">
        {/* position panel */}
        <aside className="pyr-strips">
          {position === "BRIEFING" && F && (
            <div className="pyr-info">
              <div className="pyr-info-h">◉ Shift Briefing</div>
              <div className="pyr-info-row"><span>Field</span><b>{F.meta.icao} · {F.meta.label.split("·")[0].trim()}</b></div>
              <div className="pyr-info-row"><span>Runways in use</span><b>{F.arrRwys.map((r) => r.name).join(", ")}</b></div>
              <div className="pyr-info-row"><span>Wind</span><b>{atis.wind}</b></div>
              <div className="pyr-info-row"><span>QNH</span><b>{atis.qnh}</b></div>
              <div className="pyr-info-row"><span>ATIS</span><b>Information {atis.ltr}</b></div>
              <div className="pyr-info-row"><span>Traffic</span><b>{counts.arr} inbound · {counts.dep} outbound</b></div>
              <div className="pyr-info-row"><span>Favoured RWY</span><b>{wx.favRwy || F.arrRwys[0]?.name || "—"}</b></div>
              {wx.status === "ok" && <div className="pyr-metar">{wx.raw}</div>}
              {mode === "SIM" && <div className="pyr-info-row"><span>Ops score</span><b style={{ color: score < 0 ? "#ff9b9b" : "#8fffe0" }}>{score}</b></div>}
              <div className="pyr-info-p">Work the positions top to bottom: <b>Delivery</b> issues IFR clearances to parked departures, <b>Ground</b> taxis them to the runway, and <b>Tower</b> handles takeoffs, approaches and landings. Keep arrivals separated by 3&nbsp;nm / 1000&nbsp;ft — watch the separation banner.</div>
            </div>
          )}
          {position === "ATIS" && (
            <div className="pyr-info">
              <div className="pyr-info-h">◉ ATIS Broadcast</div>
              <div className="pyr-atis-big">{atis.ltr}</div>
              <div className="pyr-info-row"><span>Wind</span><b>{atis.wind}</b></div>
              <div className="pyr-info-row"><span>QNH</span><b>{atis.qnh}</b></div>
              <div className="pyr-info-row"><span>Runways</span><b>{atis.rwy}</b></div>
              <button className="pyr-info-btn" onClick={() => setAtis((a) => ({ ...a, ltr: String.fromCharCode(a.ltr === "Z" ? 65 : a.ltr.charCodeAt(0) + 1), wind: `${String(Math.round((F?.runways[0].hdg || 0) + rnd(-15, 15))).padStart(3, "0").slice(0, 3)}/${8 + (Math.random() * 8 | 0)}` }))}>↻ Issue new ATIS</button>
              <div className="pyr-info-p">Aircraft acknowledge the current information letter on first contact.</div>
            </div>
          )}
          {["DELIVERY", "GROUND", "TOWER"].includes(position) && (
            <div className="pyr-bay">
              <div className="pyr-bay-h">{position === "DELIVERY" ? "▸ Clearance Delivery" : position === "GROUND" ? "▸ Ground Movement" : "▣ Tower / Runway"}<span>{queues[position].length}</span></div>
              <div className="pyr-bay-l">
                {queues[position].map((s) => (
                  <button key={s.id} className={"pyr-strip " + (s.kind === "ARR" ? "arr" : "dep") + (s.sel ? " sel" : "")} onClick={() => selectById(s.id)}>
                    <div className="pyr-strip-cs">{s.cs}{s.land && <span className="pyr-strip-clr">★</span>}{s.deliv && position === "GROUND" && <span className="pyr-strip-clr" style={{ color: "#8fbdff" }}>CLR</span>}</div>
                    <div className="pyr-strip-meta">{s.type} · {s.rwy} · {s.state}{s.sid ? " · " + s.sid : ""}</div>
                    <div className="pyr-strip-nums">{s.alt < 1000 ? "GND" : "FL" + (s.alt / 100 | 0)} · {s.spd}kt{s.kind === "ARR" && s.nm ? " · " + s.nm + "nm" : ""}</div>
                  </button>
                ))}
                {queues[position].length === 0 && <div className="pyr-bay-empty">no traffic for {position.toLowerCase()}</div>}
              </div>
            </div>
          )}
        </aside>

        {/* scope */}
        <div className="pyr-scopewrap" ref={wrapRef}>
          <canvas ref={canvasRef} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} onWheel={onWheel} />
          {conf > 0 && <div className="pyr-conflict">⚠ SEPARATION · {conf} conflict{conf > 1 ? "s" : ""} — vector to restore spacing</div>}
          <div className="pyr-viewtoggle">
            <button className={!chart ? "on" : ""} onClick={() => chart && toggleChart()}>RADAR</button>
            <button className={chart ? "on" : ""} onClick={() => !chart && toggleChart()}>GROUND</button>
          </div>
          <div className="pyr-zoom">
            <button onClick={() => zoomBy(0.8)}>+</button>
            <span>{rangeNm}nm</span>
            <button onClick={() => zoomBy(1.25)}>−</button>
          </div>
          <div className="pyr-legend">
            <span><i style={{ background: "#37e0c8" }} />Arrival</span>
            <span><i style={{ background: "#ffb454" }} />Departure</span>
            <span><i style={{ background: "#ff6b6b" }} />Selected</span>
            <span className="pyr-legend-hint">click a target · drag to pan · scroll to zoom</span>
          </div>
          <div className="pyr-spawn">
            <button onClick={() => doSpawn("ARR")}>+ Arrival</button>
            <button onClick={() => doSpawn("DEP")}>+ Departure</button>
          </div>
          {mode === "SIM" && events.length > 0 && (
            <div className="pyr-events">
              {events.slice(0, 4).map((e, i) => (
                <div key={e.t + i} className={"pyr-event " + (e.d > 0 ? "pos" : "neg")}>
                  <span className="pyr-event-d">{e.d > 0 ? "+" : ""}{e.d}</span>
                  <span className="pyr-event-x">{e.txt}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* control + comms */}
        <aside className="pyr-side">
          {mode === "LIVE" ? (
            <div className="pyr-ctl">
              <div className="pyr-live-h">◉ LIVE ADS-B<span className={"pyr-live-dot " + live.status}></span></div>
              <div className="pyr-live-stat">
                {live.status === "loading" && "acquiring feed…"}
                {live.status === "error" && "feed unavailable"}
                {live.status === "empty" && "no traffic in range"}
                {live.status === "ok" && `${live.count} aircraft within 60nm of ${F?.meta.icao}`}
                {live.status === "idle" && "starting…"}
              </div>
              {live.sel ? (
                <>
                  <div className="pyr-selhead"><div className="pyr-selcs">{live.sel.cs}</div><div className="pyr-seltag" style={{ background: "#3fd3ff" }}>LIVE</div></div>
                  <div className="pyr-selgrid">
                    <div><span>ALT</span><b>{live.sel.alt == null ? "—" : live.sel.alt < 1000 ? live.sel.alt + "ft" : "FL" + Math.round(live.sel.alt / 100)}</b></div>
                    <div><span>GS</span><b>{live.sel.spd}kt</b></div>
                    <div><span>TRK</span><b>{String(live.sel.hdg).padStart(3, "0")}°</b></div>
                    <div><span>RANGE</span><b>{live.sel.nm}nm</b></div>
                  </div>
                </>
              ) : <div className="pyr-empty" style={{ padding: 0, border: 0 }}><p>Real aircraft transponding around {F?.meta.label.split("·")[0].trim()}, projected onto the chart. Click a target for its readout. <b>Information only — not controllable.</b></p></div>}
              <div className="pyr-clr-note" style={{ color: "#7fb8ac", marginTop: 10 }}>Source: adsb.lol · refreshes every 20s · switch to SIM to control traffic.</div>
            </div>
          ) : sel ? (
            <div className="pyr-ctl">
              <div className="pyr-selhead">
                <div className="pyr-selcs">{sel.cs}</div>
                <div className={"pyr-seltag " + (sel.kind === "ARR" ? "arr" : "dep")}>{sel.kind} · {sel.type}</div>
              </div>
              <div className="pyr-selgrid">
                <div><span>ALT</span><b>{sel.alt < 1000 ? sel.alt + "ft" : "FL" + Math.round(sel.alt / 100)}</b></div>
                <div><span>SPD</span><b>{sel.spd}kt</b></div>
                <div><span>HDG</span><b>{String(sel.hdg).padStart(3, "0")}°</b></div>
                <div><span>RWY</span><b>{sel.rwy}</b></div>
                <div><span>DIST</span><b>{sel.nm}nm</b></div>
                <div><span>CLR</span><b>{sel.land ? "LAND" : "—"}</b></div>
              </div>
              <div className="pyr-cmd">
                <div className="pyr-cmd-lbl">Vector</div>
                <div className="pyr-row">
                  <button onClick={() => cmdTurn(-20)}>↺ L20</button>
                  <input value={hdgInput} onChange={(e) => setHdgInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && applyHdg()} placeholder="HDG" inputMode="numeric" />
                  <button onClick={applyHdg}>SET</button>
                  <button onClick={() => cmdTurn(20)}>R20 ↻</button>
                </div>
                <div className="pyr-cmd-lbl">Altitude</div>
                <div className="pyr-row wrap">{[2000, 3000, 5000, 8000, 12000].map((f) => <button key={f} onClick={() => cmdAlt(f)}>{f / 1000}k</button>)}</div>
                <div className="pyr-cmd-lbl">Speed</div>
                <div className="pyr-row wrap">{[140, 160, 180, 210, 250].map((s) => <button key={s} onClick={() => cmdSpd(s)}>{s}</button>)}</div>
                <div className="pyr-cmd-lbl">Clearance</div>
                <div className="pyr-row wrap">
                  {sel.kind === "ARR" ? <>
                    <button className="go" onClick={cmdApproach}>Cleared ILS</button>
                    <button className="go" onClick={cmdLand}>Cleared to land</button>
                    {sel.state === "HOLD" ? <button className="go" onClick={cmdResume}>Resume approach</button> : <button onClick={cmdHold}>Hold</button>}
                    <button className="warn" onClick={cmdGoAround}>Go around</button>
                  </> : <>
                    {sel.state === "PARKED" && !sel.deliv && <button className="go" onClick={cmdDeliver}>Deliver IFR clearance</button>}
                    {sel.state === "PARKED" && sel.deliv && <button className="go" onClick={cmdTaxi}>Pushback / taxi</button>}
                    {sel.state === "TAXI_OUT" && <button className="go" onClick={cmdTaxi}>Re-route taxi</button>}
                    {(sel.state === "READY" || sel.state === "LINEUP") && <button className="go" onClick={cmdTakeoff}>Cleared for takeoff</button>}
                    {(sel.state === "TKOF" || sel.state === "DEP") && <span className="pyr-airborne">✈ airborne / climbing out</span>}
                  </>}
                  {sel.kind === "DEP" && sel.deliv && sel.sid && <div className="pyr-clr-note">Cleared via {sel.sid} · squawk {sel.sq}</div>}
                </div>
              </div>
            </div>
          ) : (
            <div className="pyr-empty"><div className="pyr-empty-t">No target selected</div><p>Click a target on the scope or a flight strip to vector it and issue clearances.</p></div>
          )}

          <div className="pyr-comms">
            <div className="pyr-comms-h">◉ TWR 118.1 · frequency</div>
            <div className="pyr-comms-l">
              {comms.map((c) => (
                <div key={c.id} className={"pyr-msg " + (CTRL_POS.includes(c.from) ? "twr" : "pilot")}>
                  <span className="pyr-msg-f">{c.from}</span>
                  <span className="pyr-msg-t">{c.text}</span>
                </div>
              ))}
              {comms.length === 0 && <div className="pyr-bay-empty">frequency quiet…</div>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ═══════════════════════ render ═══════════════════════ */
function render(ctx, canvas, S, v, DPR, sweep, mode) {
  const F = S.F;
  const w = canvas.width / DPR, h = canvas.height / DPR;
  const scale = Math.min(w, h) / 2 / (v.radiusNm * F.pxPerNm);
  const toX = (fx) => w / 2 + (fx - v.cx) * scale, toY = (fy) => h / 2 + (fy - v.cy) * scale;
  const zoomedIn = v.radiusNm < 11;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#04100e"; ctx.fillRect(0, 0, w, h);
  // subtle scan grid
  ctx.strokeStyle = "rgba(55,224,200,0.045)"; ctx.lineWidth = 1;
  for (let gx = ((-v.cx * scale + w / 2) % 46 + 46) % 46; gx < w; gx += 46) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
  for (let gy = ((-v.cy * scale + h / 2) % 46 + 46) % 46; gy < h; gy += 46) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }

  const ccx = toX(F.cx), ccy = toY(F.cy);
  // range rings + labels
  const ringStep = v.radiusNm > 20 ? 10 : 5;
  ctx.font = "9px ui-monospace, monospace"; ctx.textAlign = "center";
  for (let nm = ringStep; nm <= v.radiusNm + 1; nm += ringStep) {
    const rr = nm * F.pxPerNm * scale;
    ctx.strokeStyle = "rgba(55,224,200,0.2)"; ctx.beginPath(); ctx.arc(ccx, ccy, rr, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(120,200,190,0.45)"; ctx.fillText(nm + "nm", ccx, ccy - rr + 11);
  }
  // compass rose
  const outer = v.radiusNm * F.pxPerNm * scale;
  for (let d = 0; d < 360; d += 10) {
    const a = (d - 90) * Math.PI / 180, big = d % 30 === 0;
    ctx.strokeStyle = "rgba(55,224,200,0.28)";
    ctx.beginPath(); ctx.moveTo(ccx + Math.cos(a) * outer, ccy + Math.sin(a) * outer); ctx.lineTo(ccx + Math.cos(a) * (outer - (big ? 13 : 6)), ccy + Math.sin(a) * (outer - (big ? 13 : 6))); ctx.stroke();
    if (big) { ctx.fillStyle = "rgba(120,200,190,0.55)"; ctx.fillText(String(d / 10).padStart(2, "0"), ccx + Math.cos(a) * (outer - 24), ccy + Math.sin(a) * (outer - 24) + 3); }
  }

  // extended centrelines + approach-plate altitude gates (arrival runways)
  F.runways.forEach((r) => {
    if (r.role === "OFF") return;
    const isArr = r.role === "ARR" || r.role === "BOTH";
    const tx = toX(r.thr.x), ty = toY(r.thr.y);
    ctx.strokeStyle = "rgba(55,224,200,0.3)"; ctx.setLineDash([5, 5]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(toX(r.thr.x - r.ux * 10 * F.pxPerNm), toY(r.thr.y - r.uy * 10 * F.pxPerNm)); ctx.stroke();
    ctx.setLineDash([]);
    const showGates = isArr && !v.chart && v.radiusNm >= 6;
    for (let nm = 2; nm <= 10; nm += 2) {
      const px = toX(r.thr.x - r.ux * nm * F.pxPerNm), py = toY(r.thr.y - r.uy * nm * F.pxPerNm), pp = showGates ? 6 : 4;
      ctx.strokeStyle = "rgba(55,224,200,0.55)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px - r.uy * pp, py + r.ux * pp); ctx.lineTo(px + r.uy * pp, py - r.ux * pp); ctx.stroke();
      if (showGates) {
        // altitude gate on a 3° glidepath (G3 ft/nm)
        ctx.fillStyle = "rgba(140,215,200,0.8)"; ctx.font = "8px ui-monospace, monospace"; ctx.textAlign = "left";
        ctx.fillText(`${nm}·${Math.round(nm * G3 / 10) * 10}`, px + r.uy * 8 + 3, py - r.ux * 8 + 3);
      }
    }
    // FAF marker (~4nm, glidepath intercept) — the maltese cross of a real plate
    if (showGates) {
      const fx = toX(r.thr.x - r.ux * 4 * F.pxPerNm), fy = toY(r.thr.y - r.uy * 4 * F.pxPerNm);
      ctx.strokeStyle = "rgba(255,205,135,0.85)"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(fx, fy, 4.5, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx - 6.5, fy); ctx.lineTo(fx + 6.5, fy); ctx.moveTo(fx, fy - 6.5); ctx.lineTo(fx, fy + 6.5); ctx.stroke();
      ctx.fillStyle = "rgba(255,205,135,0.9)"; ctx.font = "7.5px ui-monospace, monospace"; ctx.textAlign = "center";
      ctx.fillText("FAF", fx, fy - 9);
    }
  });

  // taxiways + gates (brighter when zoomed in)
  ctx.strokeStyle = zoomedIn ? "rgba(120,180,168,0.5)" : "rgba(90,150,140,0.22)"; ctx.lineWidth = zoomedIn ? 2 : 1;
  F.edges.forEach(([a, b]) => { const na = F.nodes[a], nb = F.nodes[b]; if (na && nb) { ctx.beginPath(); ctx.moveTo(toX(na.x), toY(na.y)); ctx.lineTo(toX(nb.x), toY(nb.y)); ctx.stroke(); } });
  if (zoomedIn) { ctx.fillStyle = "rgba(150,220,205,0.6)"; (F.gates || []).forEach((g) => { const n = F.nodes[g]; if (n) { ctx.beginPath(); ctx.arc(toX(n.x), toY(n.y), 2.4, 0, Math.PI * 2); ctx.fill(); } }); }
  // ground-chart labels
  if (v.chart) {
    ctx.font = "8px ui-monospace, monospace"; ctx.textAlign = "center";
    ctx.fillStyle = "rgba(120,180,168,0.55)";
    for (const k in F.nodes) { if (!k.startsWith("G") && !k.startsWith("H")) { const n = F.nodes[k]; ctx.fillText(k, toX(n.x), toY(n.y) - 3); } }
    ctx.fillStyle = "rgba(150,220,205,0.85)"; (F.gates || []).forEach((g) => { const n = F.nodes[g]; if (n) ctx.fillText(g, toX(n.x), toY(n.y) + 9); });
    ctx.fillStyle = "rgba(255,205,135,0.85)"; const holds = F.meta.holds || {}; for (const rw in holds) { const n = F.nodes[holds[rw]]; if (n) ctx.fillText("⊣" + rw, toX(n.x), toY(n.y) - 4); }
    ctx.fillStyle = "rgba(55,224,200,0.35)"; ctx.font = "11px ui-monospace, monospace"; ctx.textAlign = "right"; ctx.fillText("GROUND CHART · SMR", w - 14, 22);
  }

  // runways (asphalt fill + edges + centreline + threshold bars + numbers)
  F.runways.forEach((r) => {
    const off = r.role === "OFF";
    const ax = toX(r.ax), ay = toY(r.ay), bx = toX(r.bx), by = toY(r.by);
    const wpx = Math.max(3, r.w * scale);
    ctx.save(); ctx.shadowColor = "rgba(55,224,200,0.4)"; ctx.shadowBlur = off ? 0 : 6;
    ctx.strokeStyle = off ? "rgba(150,180,175,0.4)" : "#0f2b26"; ctx.lineWidth = wpx; ctx.lineCap = "butt";
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); ctx.restore();
    if (!off) {
      // edge lines
      ctx.strokeStyle = "rgba(180,235,222,0.85)"; ctx.lineWidth = 1;
      const nx = -r.uy * wpx / 2, ny = r.ux * wpx / 2;
      [[nx, ny], [-nx, -ny]].forEach(([ox, oy]) => { ctx.beginPath(); ctx.moveTo(toX(r.ax) + ox, toY(r.ay) + oy); ctx.lineTo(toX(r.bx) + ox, toY(r.by) + oy); ctx.stroke(); });
      // centreline
      ctx.strokeStyle = "rgba(180,235,222,0.5)"; ctx.setLineDash([7, 6]); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); ctx.setLineDash([]);
    }
    // designators
    ctx.fillStyle = "#a7e8db"; ctx.font = "bold 11px ui-monospace, monospace"; ctx.textAlign = "center";
    ctx.fillText(r.nameA, toX(r.ax) - r.uy * 0 + (r.ax < r.bx ? -1 : 1) * 0, toY(r.ay) - 8);
    ctx.fillText(r.nameB, toX(r.bx), toY(r.by) - 8);
  });

  // sweep
  ctx.save(); ctx.translate(ccx, ccy); ctx.rotate(sweep);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, outer, -0.34, 0); ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, outer, 0); g.addColorStop(0, "rgba(55,224,200,0.16)"); g.addColorStop(1, "rgba(55,224,200,0)");
  ctx.fillStyle = g; ctx.fill(); ctx.restore();

  if (mode === "LIVE") {
    // real ADS-B traffic (read-only)
    (S.live || []).forEach((a) => {
      const x = toX(a.x), y = toY(a.y); if (x < -40 || x > w + 40 || y < -40 || y > h + 40) return;
      const col = a.sel ? "#ff6b6b" : "#3fd3ff";
      const hr = a.hdg * Math.PI / 180, lead = Math.min(36, (a.spd || 0) * 0.11);
      ctx.strokeStyle = col; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(hr) * lead, y - Math.cos(hr) * lead); ctx.stroke();
      ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = a.sel ? 8 : 4; ctx.translate(x, y); ctx.rotate(hr);
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(4, 4); ctx.lineTo(0, 1.6); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill(); ctx.restore();
      if (a.sel) { ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.stroke(); }
      ctx.textAlign = "left"; ctx.font = "9px ui-monospace, monospace";
      ctx.fillStyle = col; ctx.fillText(a.cs, x + 12, y - 10);
      ctx.fillStyle = "rgba(190,235,245,0.9)";
      ctx.fillText((a.alt == null ? "—" : a.alt < 1000 ? "GND" : (a.alt / 100 | 0).toString().padStart(3, "0")) + " " + (a.spd | 0), x + 12, y);
    });
    ctx.fillStyle = "rgba(63,211,255,0.55)"; ctx.font = "10px ui-monospace, monospace"; ctx.textAlign = "left";
    ctx.fillText("◉ LIVE ADS-B · " + F.meta.icao + " · information only — not for control", 14, h - 14);
  } else {
    // selected taxi route
    const selA = S.aircraft.find((a) => a.sel && a.route && a.route.length);
    if (selA) { ctx.strokeStyle = "rgba(255,180,90,0.6)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(toX(selA.x), toY(selA.y)); selA.route.forEach((p) => ctx.lineTo(toX(p.x), toY(p.y))); ctx.stroke(); ctx.setLineDash([]); }
    (S.conflicts || []).forEach(([a, b]) => { ctx.strokeStyle = "#ff5a63"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(toX(a.x), toY(a.y)); ctx.lineTo(toX(b.x), toY(b.y)); ctx.stroke(); ctx.setLineDash([]); });
    // holding-pattern orbit for the selected aircraft (standard right-hand racetrack)
    const holdA = S.aircraft.find((a) => a.sel && a.state === "HOLD");
    if (holdA) {
      const KTS = F.pxPerNm / 3600, th = holdA.hdg * Math.PI / 180;
      const Rpx = (holdA.spd * KTS) / (TURN_RATE * Math.PI / 180);
      const cxF = holdA.x + Math.cos(th) * Rpx, cyF = holdA.y + Math.sin(th) * Rpx;
      ctx.strokeStyle = "rgba(255,205,135,0.7)"; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.arc(toX(cxF), toY(cyF), Rpx * scale, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,205,135,0.85)"; ctx.font = "8px ui-monospace, monospace"; ctx.textAlign = "center";
      ctx.fillText("HOLD", toX(cxF), toY(cyF) + 3);
    }
    S.aircraft.forEach((a) => {
      const x = toX(a.x), y = toY(a.y);
      const col = a.sel ? "#ff6b6b" : a.kind === "ARR" ? "#37e0c8" : "#ffb454";
      ctx.strokeStyle = "rgba(120,200,190,0.28)"; ctx.lineWidth = 1;
      for (let i = 1; i < a.trail.length; i++) { ctx.globalAlpha = i / a.trail.length * 0.5; ctx.beginPath(); ctx.moveTo(toX(a.trail[i - 1][0]), toY(a.trail[i - 1][1])); ctx.lineTo(toX(a.trail[i][0]), toY(a.trail[i][1])); ctx.stroke(); }
      ctx.globalAlpha = 1;
      const hr = a.hdg * Math.PI / 180, lead = Math.min(36, a.spd * 0.13);
      ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(hr) * lead, y - Math.cos(hr) * lead); ctx.stroke();
      ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = a.sel ? 8 : 4; ctx.translate(x, y); ctx.rotate(hr);
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -5.5); ctx.lineTo(4.5, 4.5); ctx.lineTo(0, 1.8); ctx.lineTo(-4.5, 4.5); ctx.closePath(); ctx.fill(); ctx.restore();
      if (a.sel) { ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.stroke(); }
      if (a.conf) { ctx.strokeStyle = "#ff5a63"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.stroke(); }
      if (a.wakeWarn && !a.conf) { ctx.strokeStyle = "#ffb454"; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
      const dbx = x + 13, dby = y - 11; const trend = a.altCmd > a.alt + 60 ? "↑" : a.altCmd < a.alt - 60 ? "↓" : "";
      ctx.textAlign = "left"; ctx.font = "9px ui-monospace, monospace";
      ctx.fillStyle = col; ctx.fillText(a.cs + (a.wake === "H" ? " ⬢" : ""), dbx, dby);
      ctx.fillStyle = "rgba(200,235,228,0.9)";
      ctx.fillText((a.alt < 1000 ? "GND" : (a.alt / 100 | 0).toString().padStart(3, "0")) + trend + " " + (a.spd | 0), dbx, dby + 10);
      if (a.state === "HOLD") { ctx.fillStyle = "#ffd08a"; ctx.fillText("⟳HOLD", dbx, dby + 20); }
      else if (a.wakeWarn) { ctx.fillStyle = "#ffb454"; ctx.fillText("WAKE", dbx, dby + 20); }
      else if (a.cleared?.land) { ctx.fillStyle = "#8fffe0"; ctx.fillText("★LAND", dbx, dby + 20); }
      else if (a.state === "READY") { ctx.fillStyle = "#ffd08a"; ctx.fillText("HOLD", dbx, dby + 20); }
      else if (a.ga) { ctx.fillStyle = "#ff9b9b"; ctx.fillText("G/A", dbx, dby + 20); }
    });
    ctx.fillStyle = "rgba(120,200,190,0.5)"; ctx.font = "10px ui-monospace, monospace"; ctx.textAlign = "left";
    ctx.fillText(F.meta.icao + " · " + F.meta.label.split("·")[0].trim(), 14, h - 14);
  }

  // ── Jeppesen-style ground-chart furniture: north arrow, scale bar, info box ──
  if (v.chart) {
    // north arrow (top-right)
    const nx = w - 34, ny = 54;
    ctx.strokeStyle = "rgba(120,200,190,0.7)"; ctx.fillStyle = "rgba(120,200,190,0.7)"; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(nx, ny - 16); ctx.lineTo(nx - 5, ny + 6); ctx.lineTo(nx, ny + 1); ctx.lineTo(nx + 5, ny + 6); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(nx, ny + 1); ctx.lineTo(nx, ny + 10); ctx.stroke();
    ctx.font = "bold 10px ui-monospace, monospace"; ctx.textAlign = "center"; ctx.fillStyle = "rgba(150,220,205,0.9)";
    ctx.fillText("N", nx, ny - 19);
    // scale bar (bottom-right): pick a round nm length that fits ~120px
    const targetPx = 120; let barNm = 0.5; const barPx = () => barNm * F.pxPerNm * scale;
    [0.25, 0.5, 1, 2, 3, 5].forEach((n) => { if (n * F.pxPerNm * scale <= targetPx) barNm = n; });
    const bp = barPx(), sbx = w - 20 - bp, sby = h - 26;
    ctx.strokeStyle = "rgba(150,220,205,0.85)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(sbx, sby); ctx.lineTo(sbx + bp, sby); ctx.moveTo(sbx, sby - 4); ctx.lineTo(sbx, sby + 4); ctx.moveTo(sbx + bp, sby - 4); ctx.lineTo(sbx + bp, sby + 4); ctx.stroke();
    ctx.fillStyle = "rgba(150,220,205,0.9)"; ctx.font = "9px ui-monospace, monospace"; ctx.textAlign = "center";
    ctx.fillText(barNm < 1 ? barNm + " nm" : barNm + " nm", sbx + bp / 2, sby - 7);
    // info box (top-left): field, freqs, runways
    const m = F.meta, lines = [
      `${m.icao} · ${m.label.split("·")[0].trim()}`,
      m.twr ? `TWR ${m.twr}` : null, m.gnd ? `GND ${m.gnd}` : null, m.dep ? `DEP ${m.dep}` : null,
      `RWY ${F.runways.filter((r) => r.role !== "OFF").map((r) => r.name).join(" / ")}`,
    ].filter(Boolean);
    const bw = 158, bh = 14 + lines.length * 13, bx0 = 12, by0 = h - bh - 30;
    ctx.fillStyle = "rgba(6,24,21,0.85)"; ctx.strokeStyle = "rgba(55,224,200,0.3)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.rect(bx0, by0, bw, bh); ctx.fill(); ctx.stroke();
    ctx.textAlign = "left"; ctx.font = "9px ui-monospace, monospace";
    lines.forEach((ln, i) => { ctx.fillStyle = i === 0 ? "rgba(55,224,200,0.95)" : "rgba(160,215,205,0.85)"; ctx.fillText(ln, bx0 + 8, by0 + 16 + i * 13); });
  }
}

/* ═══════════════════════ styles ═══════════════════════ */
const CSS = `
.pyr{position:fixed;inset:0;display:flex;flex-direction:column;background:#04100e;color:#dff3ee;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
.pyr *{box-sizing:border-box}
.pyr-top{display:flex;align-items:center;gap:14px;height:50px;padding:0 14px;border-bottom:1px solid rgba(55,224,200,.16);flex:none;font-family:ui-monospace,monospace}
.pyr-brand{display:flex;align-items:center;gap:9px;font-size:12px;letter-spacing:.24em;color:#dff3ee;text-decoration:none;font-weight:600}
.pyr-brand b{color:#37e0c8}
.pyr-mark{color:#37e0c8;animation:pyrpulse 1.6s infinite}@keyframes pyrpulse{0%,100%{opacity:.4}50%{opacity:1}}
.pyr-apt{display:flex;align-items:center;gap:7px;font-size:8px;letter-spacing:.14em;color:#7fb8ac}
.pyr-apt select{font-family:ui-monospace,monospace;font-size:11px;background:#0a221e;color:#dff3ee;border:1px solid rgba(55,224,200,.3);border-radius:7px;padding:5px 8px}
.pyr-atis{display:flex;align-items:center;gap:12px;font-size:9.5px;letter-spacing:.06em;color:#9fd4c9;padding:5px 11px;border:1px solid rgba(55,224,200,.2);border-radius:8px;background:#0a1f1b}
.pyr-atis b{color:#37e0c8;letter-spacing:.12em}
.pyr-spacer{flex:1}
.pyr-stat{font-size:11px;color:#9fd4c9}.pyr-stat b{color:#37e0c8}
.pyr-score{font-size:9.5px;letter-spacing:.1em;color:#7fb8ac;padding:5px 10px;border:1px solid rgba(55,224,200,.25);border-radius:8px;background:#0a1f1b}
.pyr-score b{font-size:13px;color:#8fffe0;margin-left:4px}
.pyr-score.neg b{color:#ff9b9b}
.pyr-wxtag{color:#8fbdff!important;border:1px solid rgba(143,189,255,.35);border-radius:5px;padding:2px 6px;letter-spacing:.08em;cursor:help}
.pyr-metar{font-family:ui-monospace,monospace;font-size:9.5px;line-height:1.5;color:#8fbdb2;background:#08201c;border:1px solid rgba(55,224,200,.12);border-radius:7px;padding:8px 9px;word-break:break-word}
.pyr-events{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);display:flex;flex-direction:column;gap:4px;align-items:center;pointer-events:none;z-index:4}
.pyr-event{display:flex;align-items:center;gap:8px;font-family:ui-monospace,monospace;font-size:10px;padding:4px 10px;border-radius:7px;background:#0a1f1bdd;border:1px solid rgba(55,224,200,.18)}
.pyr-event-d{font-weight:700;min-width:30px;text-align:right}
.pyr-event.pos .pyr-event-d{color:#8fffe0}.pyr-event.neg .pyr-event-d{color:#ff9b9b}
.pyr-event-x{color:#9fd4c9;letter-spacing:.03em}
.pyr-clock{font-size:13px;color:#dff3ee;letter-spacing:.05em}
.pyr-btn{font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.06em;color:#04100e;background:#37e0c8;border:0;border-radius:8px;padding:8px 12px;cursor:pointer;min-width:38px}
.pyr-btn.ghost{background:transparent;color:#9fd4c9;border:1px solid rgba(55,224,200,.3);font-size:10px}
.pyr-btn:hover{filter:brightness(1.1)}
.pyr-stage{flex:1;display:flex;min-height:0}
.pyr-strips{width:238px;flex:none;border-right:1px solid rgba(55,224,200,.14);background:#061815;display:flex;flex-direction:column;overflow:hidden}
.pyr-bay{display:flex;flex-direction:column;flex:1;min-height:0;border-bottom:1px solid rgba(55,224,200,.1)}
.pyr-bay-h{display:flex;justify-content:space-between;padding:9px 12px;font-family:ui-monospace,monospace;font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;color:#7fb8ac;background:#0a1f1b}
.pyr-bay-h span{color:#37e0c8}
.pyr-bay-l{flex:1;overflow-y:auto;padding:6px;display:flex;flex-direction:column;gap:5px}
.pyr-bay-empty{font-family:ui-monospace,monospace;font-size:9px;color:#436c63;padding:6px 8px}
.pyr-strip{text-align:left;background:#0a221e;border:1px solid rgba(55,224,200,.14);border-left:3px solid #37e0c8;border-radius:8px;padding:8px 10px;cursor:pointer;transition:.12s}
.pyr-strip.dep{border-left-color:#ffb454}
.pyr-strip:hover{background:#0e2a25;border-color:rgba(55,224,200,.4)}
.pyr-strip.sel{background:#1a2b28;border-color:#ff6b6b;border-left-color:#ff6b6b}
.pyr-strip-cs{font-family:ui-monospace,monospace;font-size:13px;font-weight:700;color:#dff3ee;display:flex;align-items:center;gap:6px}
.pyr-strip-clr{color:#8fffe0;font-size:10px}
.pyr-strip-meta{font-family:ui-monospace,monospace;font-size:8.5px;letter-spacing:.04em;color:#7fb8ac;margin-top:2px;text-transform:uppercase}
.pyr-strip-nums{font-family:ui-monospace,monospace;font-size:10px;color:#9fd4c9;margin-top:3px}
.pyr-postabs{display:flex;gap:2px;padding:0 8px;background:#061815;border-bottom:1px solid rgba(55,224,200,.14);flex:none;overflow-x:auto}
.pyr-postab{position:relative;font-family:ui-monospace,monospace;font-size:9.5px;letter-spacing:.09em;color:#7fb8ac;background:transparent;border:0;border-bottom:2px solid transparent;padding:11px 13px;cursor:pointer;white-space:nowrap}
.pyr-postab:hover{color:#dff3ee}
.pyr-postab.on{color:#37e0c8;border-bottom-color:#37e0c8}
.pyr-postab-n{margin-left:6px;font-size:8px;color:#04100e;background:#37e0c8;border-radius:8px;padding:1px 5px}
.pyr-info{padding:14px;display:flex;flex-direction:column;gap:8px;overflow-y:auto}
.pyr-info-h{font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.1em;color:#37e0c8;margin-bottom:4px}
.pyr-info-row{display:flex;justify-content:space-between;gap:10px;font-family:ui-monospace,monospace;font-size:11px;color:#9fd4c9;padding:6px 0;border-bottom:1px solid rgba(55,224,200,.08)}
.pyr-info-row b{color:#dff3ee}
.pyr-info-p{font-size:11.5px;line-height:1.65;color:#7fb8ac;margin-top:6px}.pyr-info-p b{color:#9fd4c9}
.pyr-atis-big{font-family:ui-monospace,monospace;font-size:60px;font-weight:700;color:#37e0c8;text-align:center;line-height:1;padding:8px 0}
.pyr-info-btn{font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.08em;color:#04100e;background:#37e0c8;border:0;border-radius:8px;padding:9px;cursor:pointer;margin-top:6px}
.pyr-viewtoggle{position:absolute;left:50%;top:12px;transform:translateX(-50%);display:flex;background:#0a1f1bcc;border:1px solid rgba(55,224,200,.25);border-radius:9px;overflow:hidden;font-family:ui-monospace,monospace;z-index:4}
.pyr-viewtoggle button{font-size:9.5px;letter-spacing:.1em;color:#9fd4c9;background:transparent;border:0;padding:7px 14px;cursor:pointer}
.pyr-viewtoggle button.on{color:#04100e;background:#37e0c8}
.pyr-clr-note{font-family:ui-monospace,monospace;font-size:9px;color:#8fbdff;letter-spacing:.04em;margin-top:4px}
.pyr-btn.live{background:#3fd3ff;color:#04100e}
.pyr-live-h{font-family:ui-monospace,monospace;font-size:12px;letter-spacing:.1em;color:#3fd3ff;display:flex;align-items:center;gap:8px;margin-bottom:8px}
.pyr-live-dot{width:8px;height:8px;border-radius:50%;background:#3fd3ff;margin-left:auto}
.pyr-live-dot.ok{box-shadow:0 0 8px #3fd3ff;animation:pyrpulse 1.4s infinite}
.pyr-live-dot.loading{background:#ffd08a}
.pyr-live-dot.error,.pyr-live-dot.empty{background:#ff6b6b}
.pyr-live-stat{font-family:ui-monospace,monospace;font-size:11px;color:#9fd4c9;margin-bottom:12px;letter-spacing:.03em}
.pyr-scopewrap{position:relative;flex:1;min-width:0}
.pyr-scopewrap canvas{display:block;cursor:crosshair}
.pyr-zoom{position:absolute;right:14px;top:12px;display:flex;flex-direction:column;align-items:center;gap:4px;background:#0a1f1bcc;border:1px solid rgba(55,224,200,.25);border-radius:9px;padding:6px;font-family:ui-monospace,monospace}
.pyr-zoom button{width:26px;height:26px;font-size:15px;color:#37e0c8;background:#0e2a25;border:1px solid rgba(55,224,200,.25);border-radius:6px;cursor:pointer;line-height:1}
.pyr-zoom button:hover{background:#14352e}
.pyr-zoom span{font-size:9px;color:#9fd4c9;letter-spacing:.04em}
.pyr-legend{position:absolute;left:14px;top:12px;display:flex;flex-direction:column;gap:5px;font-family:ui-monospace,monospace;font-size:9px;color:#9fd4c9;pointer-events:none}
.pyr-legend span{display:inline-flex;align-items:center;gap:6px}.pyr-legend i{width:8px;height:8px;border-radius:2px}
.pyr-legend-hint{color:#5f8f85;margin-top:3px}
.pyr-spawn{position:absolute;right:14px;bottom:14px;display:flex;gap:6px}
.pyr-spawn button{font-family:ui-monospace,monospace;font-size:9.5px;color:#9fd4c9;background:#0a1f1bcc;border:1px solid rgba(55,224,200,.25);border-radius:7px;padding:7px 10px;cursor:pointer}
.pyr-spawn button:hover{border-color:#37e0c8;color:#dff3ee}
.pyr-conflict{position:absolute;left:50%;top:48px;transform:translateX(-50%);font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.07em;color:#04100e;background:#ff5a63;padding:7px 14px;border-radius:8px;font-weight:600;animation:pyrflash 1s infinite;z-index:5;white-space:nowrap}
@keyframes pyrflash{0%,100%{opacity:1}50%{opacity:.55}}
.pyr-airborne{font-family:ui-monospace,monospace;font-size:10px;color:#9fd4c9;padding:8px 4px;letter-spacing:.06em}
.pyr-side{width:300px;flex:none;border-left:1px solid rgba(55,224,200,.16);background:#061815;display:flex;flex-direction:column;min-height:0}
.pyr-ctl{padding:14px;display:flex;flex-direction:column;gap:12px;border-bottom:1px solid rgba(55,224,200,.12)}
.pyr-selhead{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.pyr-selcs{font-family:ui-monospace,monospace;font-size:21px;font-weight:700;color:#dff3ee;letter-spacing:.03em}
.pyr-seltag{font-family:ui-monospace,monospace;font-size:8.5px;letter-spacing:.09em;padding:4px 7px;border-radius:6px}
.pyr-seltag.arr{color:#04100e;background:#37e0c8}.pyr-seltag.dep{color:#04100e;background:#ffb454}
.pyr-selgrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
.pyr-selgrid div{background:#0a221e;border:1px solid rgba(55,224,200,.14);border-radius:8px;padding:7px 8px}
.pyr-selgrid span{display:block;font-family:ui-monospace,monospace;font-size:7.5px;letter-spacing:.1em;color:#6faea2;text-transform:uppercase}
.pyr-selgrid b{font-family:ui-monospace,monospace;font-size:13px;color:#dff3ee}
.pyr-cmd{display:flex;flex-direction:column;gap:6px}
.pyr-cmd-lbl{font-family:ui-monospace,monospace;font-size:7.5px;letter-spacing:.14em;text-transform:uppercase;color:#6faea2;margin-top:3px}
.pyr-row{display:flex;gap:5px}.pyr-row.wrap{flex-wrap:wrap}
.pyr-row button{font-family:ui-monospace,monospace;font-size:11px;color:#dff3ee;background:#0a221e;border:1px solid rgba(55,224,200,.25);border-radius:7px;padding:8px 9px;cursor:pointer;transition:.12s;flex:1;min-width:0}
.pyr-row button:hover{border-color:#37e0c8;background:#0e2a25}
.pyr-row button.go{color:#04100e;background:#37e0c8;border-color:#37e0c8;font-weight:600}
.pyr-row button.warn{color:#04100e;background:#ff9b6b;border-color:#ff9b6b;font-weight:600}
.pyr-row input{font-family:ui-monospace,monospace;font-size:12px;color:#dff3ee;background:#0a221e;border:1px solid rgba(55,224,200,.25);border-radius:7px;padding:8px;width:50px;text-align:center}
.pyr-empty{padding:16px;color:#7fb8ac;border-bottom:1px solid rgba(55,224,200,.12)}.pyr-empty-t{font-family:ui-monospace,monospace;font-size:12px;color:#dff3ee;margin-bottom:7px}
.pyr-empty p{font-size:12px;line-height:1.6}
.pyr-comms{flex:1;display:flex;flex-direction:column;min-height:0}
.pyr-comms-h{padding:9px 14px;font-family:ui-monospace,monospace;font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;color:#37e0c8;border-bottom:1px solid rgba(55,224,200,.1)}
.pyr-comms-l{flex:1;overflow-y:auto;padding:8px 12px;display:flex;flex-direction:column;gap:6px}
.pyr-msg{display:flex;gap:8px;font-family:ui-monospace,monospace;font-size:10.5px;line-height:1.4}
.pyr-msg-f{flex:none;font-size:8px;letter-spacing:.06em;padding:2px 5px;border-radius:4px;height:fit-content}
.pyr-msg.twr .pyr-msg-f{color:#04100e;background:#37e0c8}
.pyr-msg.pilot .pyr-msg-f{color:#9fd4c9;border:1px solid rgba(120,180,168,.3)}
.pyr-msg.twr .pyr-msg-t{color:#bfeee2}
.pyr-msg.pilot .pyr-msg-t{color:#8fbdb2}
@media(max-width:960px){.pyr-strips{width:180px}.pyr-side{width:250px}}
@media(max-width:720px){.pyr-strips{display:none}.pyr-side{width:220px}}
`;
