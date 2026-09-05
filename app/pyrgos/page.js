"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { LAYOUTS, LAYOUT_KEYS } from "@/lib/pyrgos/layouts";

/* ═══════════════════════ engine (field-pixel space) ═══════════════════════ */
const TURN_RATE = 3.2;         // deg/s (before sim-speed scaling)
const SIM_SPEED = 3;           // time acceleration so a final isn't 3 real minutes
const G3 = 318;                // ft per nm on a 3° glide
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

function hdgOf(ax, ay, bx, by) { return norm360(Math.atan2(bx - ax, ay - by) * 180 / Math.PI); }

// Precompute a field: runway geometry, active ends, taxi network, scale.
function buildField(key) {
  const L = LAYOUTS[key];
  const pts = [];
  const runways = L.runways.map((r) => {
    const dx = r.bx - r.ax, dy = r.by - r.ay;
    const len = Math.hypot(dx, dy);
    pts.push([r.ax, r.ay], [r.bx, r.by]);
    // active landing/departure end = r.dir
    const dirIsB = r.dir === r.nameB;
    const thr = dirIsB ? { x: r.ax, y: r.ay } : { x: r.bx, y: r.by }; // approach threshold
    const far = dirIsB ? { x: r.bx, y: r.by } : { x: r.ax, y: r.ay };
    const ux = (far.x - thr.x) / len, uy = (far.y - thr.y) / len;    // landing travel dir
    const hdg = hdgOf(thr.x, thr.y, far.x, far.y);
    return { ...r, len, thr, far, ux, uy, hdg, name: r.dir };
  });
  Object.values(L.nodes).forEach((n) => pts.push([n.x, n.y]));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const longest = Math.max(...runways.map((r) => r.len));
  const pxPerNm = longest / 2.2;   // assume the longest runway ≈ 2.2 nm
  const arr = runways.filter((r) => r.role === "ARR" || r.role === "BOTH");
  const dep = runways.filter((r) => r.role === "DEP" || r.role === "BOTH");
  return {
    key, meta: L, runways, nodes: L.nodes, edges: L.edges, gates: L.gates,
    cx, cy, pxPerNm, arrRwys: arr.length ? arr : runways, depRwys: dep.length ? dep : runways,
  };
}

let UID = 1;
function spawnArrival(F) {
  const r = pick(F.arrRwys);
  const dNm = rnd(7, 13);
  const px = dNm * F.pxPerNm;
  const off = rnd(-0.6, 0.6) * F.pxPerNm;            // small lateral offset
  const perpx = -r.uy, perpy = r.ux;
  const x = r.thr.x - r.ux * px + perpx * off;
  const y = r.thr.y - r.uy * px + perpy * off;
  const [ic, tel] = pick(AIRLINES);
  const alt = Math.round(rnd(2600, 4200) / 100) * 100;
  return {
    id: UID++, cs: ic + (100 + (Math.random() * 899 | 0)), tele: tel, type: pick(TYPES),
    kind: "ARR", state: "ARR", rwy: r,
    x, y, hdg: r.hdg, alt, spd: 210, hdgCmd: r.hdg, altCmd: alt, spdCmd: 180,
    appr: true, cleared: {}, trail: [], sel: false, waited: 0,
  };
}
function spawnDeparture(F) {
  const r = pick(F.depRwys);
  const [ic, tel] = pick(AIRLINES);
  return {
    id: UID++, cs: ic + (100 + (Math.random() * 899 | 0)), tele: tel, type: pick(TYPES),
    kind: "DEP", state: "READY", rwy: r,
    x: r.thr.x, y: r.thr.y, hdg: r.hdg, alt: 0, spd: 0, hdgCmd: r.hdg, altCmd: 5000, spdCmd: 250,
    cleared: {}, trail: [], sel: false, waited: 0,
  };
}

function stepAircraft(a, dt, F) {
  const KTS = F.pxPerNm / 3600;  // px/s per knot
  a.waited += dt;
  // trail
  a._t = (a._t || 0) + dt;
  if (a._t > 1.1) { a._t = 0; a.trail.push([a.x, a.y]); if (a.trail.length > 7) a.trail.shift(); }

  const r = a.rwy;
  // speed & altitude servo
  a.spd += Math.sign(a.spdCmd - a.spd) * Math.min(Math.abs(a.spdCmd - a.spd), 6 * dt);
  const climbRate = 32; // ft/s
  a.alt += Math.sign(a.altCmd - a.alt) * Math.min(Math.abs(a.altCmd - a.alt), climbRate * dt);

  if (a.state === "READY") { a.hdg = r.hdg; return; }

  if (a.state === "TKOF") {
    a.spd += 42 * dt;
    a.x += r.ux * a.spd * KTS * dt; a.y += r.uy * a.spd * KTS * dt; a.hdg = r.hdg;
    if (a.spd > 150) { a.state = "DEP"; a.altCmd = Math.max(a.altCmd, 5000); a.spdCmd = 250; }
    return;
  }

  // heading servo toward hdgCmd (unless auto-tracking localizer)
  let targetHdg = a.hdgCmd;
  if (a.kind === "ARR" && a.appr && a.state === "ARR") {
    // localizer capture: steer to the extended centreline through the threshold
    const relx = a.x - r.thr.x, rely = a.y - r.thr.y;
    const along = -(relx * r.ux + rely * r.uy);           // + = short of threshold
    const cross = relx * (-r.uy) + rely * (r.ux);         // signed lateral offset
    const intercept = r.hdg + Math.max(-32, Math.min(32, -cross / (F.pxPerNm * 0.5) * 30));
    targetHdg = norm360(intercept);
    // glidepath
    const nm = Math.max(0, along) / F.pxPerNm;
    a.altCmd = Math.min(a.altCmd, Math.round(nm * G3 + 20));
    a.spdCmd = nm > 5 ? 190 : nm > 2 ? 160 : 140;
    // touchdown
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
    if (rolled > r.len - 40 || a.spd <= 26) a.done = true;
    return;
  }

  // normal flight: move along heading
  a.x += Math.sin(a.hdg * Math.PI / 180) * a.spd * KTS * dt;
  a.y += -Math.cos(a.hdg * Math.PI / 180) * a.spd * KTS * dt;

  // depart cleanup: leave when far & high
  const dc = Math.hypot(a.x - F.cx, a.y - F.cy) / F.pxPerNm;
  if ((a.kind === "DEP" && dc > 16 && a.alt > 4000) || dc > 26) a.done = true;
}

/* ═══════════════════════ component ═══════════════════════ */
export default function Pyrgos() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const sim = useRef(null);
  const view = useRef({ radiusNm: 14, cx: 0, cy: 0 });
  const raf = useRef(0);
  const lastT = useRef(0);

  const [layoutKey, setLayoutKey] = useState("chennai");
  const [paused, setPaused] = useState(false);
  const [sel, setSel] = useState(null);      // selected aircraft snapshot
  const [counts, setCounts] = useState({ arr: 0, dep: 0 });
  const [clock, setClock] = useState("--:--:--");
  const [hdgInput, setHdgInput] = useState("");

  // (re)build the field + sim when airport changes
  useEffect(() => {
    const F = buildField(layoutKey);
    sim.current = { F, aircraft: [], spawnT: 3, wind: Math.round(F.runways[0].hdg) };
    view.current = { radiusNm: 14, cx: F.cx, cy: F.cy };
    setSel(null);
    // seed a few
    for (let i = 0; i < 3; i++) sim.current.aircraft.push(spawnArrival(F));
    sim.current.aircraft.push(spawnDeparture(F));
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      window.__PYR = { sim, view, step: (dt) => { const S = sim.current; S.aircraft.forEach((a) => stepAircraft(a, dt, S.F)); S.aircraft = S.aircraft.filter((a) => !a.done); } };
    }
  }, [layoutKey]);

  // main loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let sweep = 0;

    function resize() {
      const w = wrapRef.current.clientWidth, h = wrapRef.current.clientHeight;
      canvas.width = w * DPR; canvas.height = h * DPR;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrapRef.current);

    function frame(t) {
      const S = sim.current;
      const dt = Math.min(0.05, (t - lastT.current) / 1000) || 0;
      lastT.current = t;
      if (S && !paused) tick(S, dt * SIM_SPEED);
      if (S) render(ctx, canvas, S, view.current, DPR, (sweep += dt * 0.55));
      raf.current = requestAnimationFrame(frame);
    }

    function tick(S, dt) {
      const F = S.F;
      // spawn stream
      S.spawnT -= dt;
      if (S.spawnT <= 0) {
        S.spawnT = rnd(12, 22);
        const arrCount = S.aircraft.filter((a) => a.kind === "ARR" && !a.done).length;
        S.aircraft.push(Math.random() < (arrCount < 4 ? 0.7 : 0.3) ? spawnArrival(F) : spawnDeparture(F));
      }
      S.aircraft.forEach((a) => stepAircraft(a, dt, F));
      S.aircraft = S.aircraft.filter((a) => !a.done);
      // reflect selection
      const s = S.aircraft.find((a) => a.sel);
      if (s) syncSel(s);
    }

    let syncAcc = 0;
    function syncSel(s) {
      syncAcc++;
      if (syncAcc % 6 !== 0) return; // throttle React updates
      setSel({ id: s.id, cs: s.cs, tele: s.tele, type: s.type, kind: s.kind, state: s.state,
        alt: Math.round(s.alt / 100) * 100, spd: Math.round(s.spd), hdg: Math.round(s.hdg),
        rwy: s.rwy.name, land: !!s.cleared.land });
    }

    frame(performance.now());
    return () => { cancelAnimationFrame(raf.current); ro.disconnect(); };
  }, [paused]);

  // hud clock + counts
  useEffect(() => {
    const id = setInterval(() => {
      setClock(new Date().toISOString().slice(11, 19));
      const S = sim.current; if (!S) return;
      setCounts({
        arr: S.aircraft.filter((a) => a.kind === "ARR" && !a.done).length,
        dep: S.aircraft.filter((a) => a.kind === "DEP" && !a.done).length,
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // click select
  const onCanvasClick = useCallback((e) => {
    const S = sim.current; if (!S) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const v = view.current, w = rect.width, h = rect.height;
    const scale = Math.min(w, h) / 2 / (v.radiusNm * S.F.pxPerNm);
    let best = null, bd = 26;
    S.aircraft.forEach((a) => {
      const sx = w / 2 + (a.x - v.cx) * scale, sy = h / 2 + (a.y - v.cy) * scale;
      const d = Math.hypot(sx - mx, sy - my);
      if (d < bd) { bd = d; best = a; }
    });
    S.aircraft.forEach((a) => (a.sel = false));
    if (best) { best.sel = true; setSel({ id: best.id, cs: best.cs, tele: best.tele, type: best.type, kind: best.kind, state: best.state, alt: Math.round(best.alt / 100) * 100, spd: Math.round(best.spd), hdg: Math.round(best.hdg), rwy: best.rwy.name, land: !!best.cleared.land }); }
    else setSel(null);
  }, []);

  // command helpers
  const withSel = (fn) => { const S = sim.current; const a = S?.aircraft.find((x) => x.sel); if (a) { fn(a); } };
  const cmdHdg = (deg) => withSel((a) => { a.appr = false; a.hdgCmd = norm360(deg); });
  const cmdTurn = (delta) => withSel((a) => { a.appr = false; a.hdgCmd = norm360(a.hdgCmd + delta); });
  const cmdAlt = (ft) => withSel((a) => { a.altCmd = ft; });
  const cmdSpd = (kt) => withSel((a) => { a.spdCmd = kt; });
  const cmdApproach = () => withSel((a) => { if (a.kind === "ARR") { a.appr = true; a.state = "ARR"; } });
  const cmdLand = () => withSel((a) => { if (a.kind === "ARR") { a.cleared.land = true; a.appr = true; a.state = "ARR"; } });
  const cmdTakeoff = () => withSel((a) => { if (a.kind === "DEP" && (a.state === "READY")) { a.state = "TKOF"; a.spd = 20; } });
  const cmdGoAround = () => withSel((a) => { a.appr = false; a.cleared.land = false; a.altCmd = 3000; a.spdCmd = 210; a.hdgCmd = norm360(a.rwy.hdg + 25); });

  const applyHdg = () => { const d = parseInt(hdgInput, 10); if (!isNaN(d)) { cmdHdg(d); setHdgInput(""); } };

  return (
    <div className="pyr">
      <style>{CSS}</style>

      <header className="pyr-top">
        <Link href="/" className="pyr-brand">
          <span className="pyr-mark">◉</span> PYRGOS <b>TOWER CONTROL</b>
        </Link>
        <label className="pyr-apt">FIELD
          <select value={layoutKey} onChange={(e) => setLayoutKey(e.target.value)}>
            {LAYOUT_KEYS.map((k) => <option key={k} value={k}>{LAYOUTS[k].icao} · {LAYOUTS[k].label.split("·")[0].trim()}</option>)}
          </select>
        </label>
        <div className="pyr-freq">TWR {sim.current?.F.meta.twr} · GND {sim.current?.F.meta.gnd}</div>
        <div className="pyr-spacer" />
        <div className="pyr-stat"><b>{counts.arr}</b> ARR · <b>{counts.dep}</b> DEP</div>
        <div className="pyr-clock">{clock}Z</div>
        <button className="pyr-btn" onClick={() => setPaused((p) => !p)}>{paused ? "▶ Resume" : "⏸ Pause"}</button>
        <a className="pyr-btn ghost" href="/pyrgos.html" title="Original full simulator">Classic ↗</a>
      </header>

      <div className="pyr-stage">
        <div className="pyr-scopewrap" ref={wrapRef}>
          <canvas ref={canvasRef} onClick={onCanvasClick} />
          <div className="pyr-legend">
            <span><i style={{ background: "#37e0c8" }} />Arrival</span>
            <span><i style={{ background: "#ffb454" }} />Departure</span>
            <span><i style={{ background: "#ff6b6b" }} />Selected</span>
            <span className="pyr-legend-hint">click a target · rings 5/10/15 nm</span>
          </div>
        </div>

        <aside className="pyr-side">
          {sel ? (
            <>
              <div className="pyr-selhead">
                <div className="pyr-selcs">{sel.cs}</div>
                <div className={"pyr-seltag " + (sel.kind === "ARR" ? "arr" : "dep")}>{sel.kind} · {sel.type}</div>
              </div>
              <div className="pyr-selgrid">
                <div><span>ALT</span><b>{sel.alt < 1000 ? sel.alt + " ft" : "FL" + Math.round(sel.alt / 100)}</b></div>
                <div><span>SPD</span><b>{sel.spd} kt</b></div>
                <div><span>HDG</span><b>{String(sel.hdg).padStart(3, "0")}°</b></div>
                <div><span>RWY</span><b>{sel.rwy}</b></div>
                <div><span>STATE</span><b>{sel.state}</b></div>
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
                <div className="pyr-row wrap">
                  {[2000, 3000, 5000, 8000, 12000].map((f) => <button key={f} onClick={() => cmdAlt(f)}>{f >= 1000 ? f / 1000 + "k" : f}</button>)}
                </div>
                <div className="pyr-cmd-lbl">Speed</div>
                <div className="pyr-row wrap">
                  {[140, 160, 180, 210, 250].map((s) => <button key={s} onClick={() => cmdSpd(s)}>{s}</button>)}
                </div>
                <div className="pyr-cmd-lbl">Clearance</div>
                <div className="pyr-row wrap">
                  {sel.kind === "ARR" ? <>
                    <button className="go" onClick={cmdApproach}>Cleared approach</button>
                    <button className="go" onClick={cmdLand}>Cleared to land</button>
                    <button className="warn" onClick={cmdGoAround}>Go around</button>
                  </> : <>
                    <button className="go" onClick={cmdTakeoff}>Cleared for takeoff</button>
                  </>}
                </div>
              </div>
            </>
          ) : (
            <div className="pyr-empty">
              <div className="pyr-empty-t">No target selected</div>
              <p>Click an aircraft on the scope to vector it, assign altitude/speed, and issue clearances. Arrivals stream onto final — clear them to land before the threshold or they go around.</p>
            </div>
          )}
          <div className="pyr-side-foot">
            Phase 1 · radar scope + core sim · rebuilt from pyrgos.html · <a href="/pyrgos.html">classic</a>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ═══════════════════════ render ═══════════════════════ */
function render(ctx, canvas, S, v, DPR, sweep) {
  const F = S.F;
  const w = canvas.width / DPR, h = canvas.height / DPR;
  const scale = Math.min(w, h) / 2 / (v.radiusNm * F.pxPerNm);
  const toX = (fx) => w / 2 + (fx - v.cx) * scale;
  const toY = (fy) => h / 2 + (fy - v.cy) * scale;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#04100e"; ctx.fillRect(0, 0, w, h);

  // faint scan grid
  ctx.strokeStyle = "rgba(55,224,200,0.05)"; ctx.lineWidth = 1;
  for (let gx = 0; gx < w; gx += 46) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
  for (let gy = 0; gy < h; gy += 46) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }

  const ccx = toX(F.cx), ccy = toY(F.cy);
  // range rings + compass
  ctx.strokeStyle = "rgba(55,224,200,0.22)"; ctx.fillStyle = "rgba(120,200,190,0.5)";
  ctx.font = "9px ui-monospace, monospace"; ctx.textAlign = "center";
  for (let nm = 5; nm <= v.radiusNm + 1; nm += 5) {
    const rr = nm * F.pxPerNm * scale;
    ctx.beginPath(); ctx.arc(ccx, ccy, rr, 0, Math.PI * 2); ctx.stroke();
    ctx.fillText(nm + "nm", ccx, ccy - rr + 11);
  }
  // compass ticks
  const outer = (v.radiusNm) * F.pxPerNm * scale;
  ctx.strokeStyle = "rgba(55,224,200,0.3)";
  for (let d = 0; d < 360; d += 10) {
    const a = (d - 90) * Math.PI / 180;
    const r1 = outer, r2 = outer - (d % 30 === 0 ? 12 : 6);
    ctx.beginPath();
    ctx.moveTo(ccx + Math.cos(a) * r1, ccy + Math.sin(a) * r1);
    ctx.lineTo(ccx + Math.cos(a) * r2, ccy + Math.sin(a) * r2);
    ctx.stroke();
    if (d % 30 === 0) { ctx.fillStyle = "rgba(120,200,190,0.6)"; ctx.fillText(String(d / 10).padStart(2, "0"), ccx + Math.cos(a) * (outer - 22), ccy + Math.sin(a) * (outer - 22) + 3); }
  }

  // extended centrelines + runways
  F.runways.forEach((r) => {
    const tx = toX(r.thr.x), ty = toY(r.thr.y), fx = toX(r.far.x), fy = toY(r.far.y);
    // extended centreline with distance ticks
    ctx.strokeStyle = "rgba(55,224,200,0.35)"; ctx.setLineDash([5, 5]); ctx.lineWidth = 1;
    const ex = toX(r.thr.x - r.ux * 10 * F.pxPerNm), ey = toY(r.thr.y - r.uy * 10 * F.pxPerNm);
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.setLineDash([]);
    for (let nm = 2; nm <= 10; nm += 2) {
      const px = toX(r.thr.x - r.ux * nm * F.pxPerNm), py = toY(r.thr.y - r.uy * nm * F.pxPerNm);
      const perp = 4; ctx.beginPath(); ctx.moveTo(px - r.uy * perp, py + r.ux * perp); ctx.lineTo(px + r.uy * perp, py - r.ux * perp); ctx.stroke();
    }
    // runway body
    ctx.strokeStyle = r.role === "OFF" ? "rgba(150,180,175,0.35)" : "#cfeee7";
    ctx.lineWidth = Math.max(3, r.w * scale * 0.9); ctx.lineCap = "butt";
    ctx.beginPath(); ctx.moveTo(toX(r.ax), toY(r.ay)); ctx.lineTo(toX(r.bx), toY(r.by)); ctx.stroke();
    // centreline dashes
    ctx.strokeStyle = "rgba(10,25,22,0.7)"; ctx.lineWidth = 1; ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.moveTo(toX(r.ax), toY(r.ay)); ctx.lineTo(toX(r.bx), toY(r.by)); ctx.stroke();
    ctx.setLineDash([]);
    // designators
    ctx.fillStyle = "#8fded0"; ctx.font = "bold 10px ui-monospace, monospace";
    ctx.save(); ctx.translate(toX(r.ax), toY(r.ay)); ctx.fillText(r.nameA, 0, -6); ctx.restore();
    ctx.save(); ctx.translate(toX(r.bx), toY(r.by)); ctx.fillText(r.nameB, 0, -6); ctx.restore();
  });

  // taxiways (faint) + gates
  ctx.strokeStyle = "rgba(90,150,140,0.28)"; ctx.lineWidth = 1;
  F.edges.forEach(([a, b]) => {
    const na = F.nodes[a], nb = F.nodes[b]; if (!na || !nb) return;
    ctx.beginPath(); ctx.moveTo(toX(na.x), toY(na.y)); ctx.lineTo(toX(nb.x), toY(nb.y)); ctx.stroke();
  });
  ctx.fillStyle = "rgba(120,200,190,0.5)";
  (F.gates || []).forEach((g) => { const n = F.nodes[g]; if (!n) return; ctx.beginPath(); ctx.arc(toX(n.x), toY(n.y), 2, 0, Math.PI * 2); ctx.fill(); });

  // sweep
  ctx.save(); ctx.translate(ccx, ccy); ctx.rotate(sweep);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, outer, -0.32, 0);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, outer, 0);
  g.addColorStop(0, "rgba(55,224,200,0.16)"); g.addColorStop(1, "rgba(55,224,200,0)");
  ctx.fillStyle = g; ctx.fill(); ctx.restore();

  // aircraft
  S.aircraft.forEach((a) => {
    const x = toX(a.x), y = toY(a.y);
    const col = a.sel ? "#ff6b6b" : a.kind === "ARR" ? "#37e0c8" : "#ffb454";
    // trail
    ctx.strokeStyle = "rgba(120,200,190,0.25)"; ctx.lineWidth = 1;
    for (let i = 1; i < a.trail.length; i++) {
      ctx.globalAlpha = i / a.trail.length * 0.5;
      ctx.beginPath(); ctx.moveTo(toX(a.trail[i - 1][0]), toY(a.trail[i - 1][1])); ctx.lineTo(toX(a.trail[i][0]), toY(a.trail[i][1])); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // velocity leader
    const hr = a.hdg * Math.PI / 180;
    const lead = Math.min(34, a.spd * 0.12);
    ctx.strokeStyle = col; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(hr) * lead, y - Math.cos(hr) * lead); ctx.stroke();
    // target (chevron)
    ctx.save(); ctx.translate(x, y); ctx.rotate(hr);
    ctx.fillStyle = col; ctx.beginPath();
    ctx.moveTo(0, -5); ctx.lineTo(4, 4); ctx.lineTo(0, 1.5); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill();
    ctx.restore();
    if (a.sel) { ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.stroke(); }
    // data block
    const dbx = x + 12, dby = y - 10;
    ctx.font = "9px ui-monospace, monospace"; ctx.textAlign = "left";
    ctx.fillStyle = col; ctx.fillText(a.cs, dbx, dby);
    ctx.fillStyle = "rgba(190,230,222,0.85)";
    const fl = a.alt < 1000 ? "GND" : (a.alt / 100 | 0).toString().padStart(3, "0");
    ctx.fillText(fl + " " + (a.spd | 0), dbx, dby + 10);
    if (a.cleared?.land) { ctx.fillStyle = "#8fffe0"; ctx.fillText("★LAND", dbx, dby + 20); }
    else if (a.state === "READY") { ctx.fillStyle = "#ffd08a"; ctx.fillText("HOLD", dbx, dby + 20); }
    else if (a.ga) { ctx.fillStyle = "#ff9b9b"; ctx.fillText("G/A", dbx, dby + 20); }
  });

  // field label
  ctx.fillStyle = "rgba(120,200,190,0.55)"; ctx.font = "10px ui-monospace, monospace"; ctx.textAlign = "left";
  ctx.fillText(F.meta.icao + " · " + F.meta.label.split("·")[0].trim(), 14, h - 14);
}

/* ═══════════════════════ styles ═══════════════════════ */
const CSS = `
.pyr{position:fixed;inset:0;display:flex;flex-direction:column;background:#04100e;color:#dff3ee;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
.pyr *{box-sizing:border-box}
.pyr-top{display:flex;align-items:center;gap:14px;height:52px;padding:0 16px;border-bottom:1px solid rgba(55,224,200,.16);background:linear-gradient(180deg,#06181500,#0618159a);backdrop-filter:blur(8px);flex:none;font-family:ui-monospace,monospace}
.pyr-brand{display:flex;align-items:center;gap:9px;font-size:13px;letter-spacing:.26em;color:#dff3ee;text-decoration:none;font-weight:600}
.pyr-brand b{color:#37e0c8;font-weight:600}
.pyr-mark{color:#37e0c8;animation:pyrpulse 1.6s infinite}
@keyframes pyrpulse{0%,100%{opacity:.4}50%{opacity:1}}
.pyr-apt{display:flex;align-items:center;gap:7px;font-size:8.5px;letter-spacing:.16em;color:#7fb8ac}
.pyr-apt select{font-family:ui-monospace,monospace;font-size:11px;background:#0a221e;color:#dff3ee;border:1px solid rgba(55,224,200,.3);border-radius:7px;padding:5px 8px}
.pyr-freq{font-size:10px;letter-spacing:.08em;color:#6faea2}
.pyr-spacer{flex:1}
.pyr-stat{font-size:11px;letter-spacing:.08em;color:#9fd4c9}.pyr-stat b{color:#37e0c8}
.pyr-clock{font-size:13px;color:#dff3ee;letter-spacing:.06em}
.pyr-btn{font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#04100e;background:#37e0c8;border:0;border-radius:8px;padding:8px 12px;cursor:pointer}
.pyr-btn.ghost{background:transparent;color:#9fd4c9;border:1px solid rgba(55,224,200,.3)}
.pyr-btn:hover{filter:brightness(1.08)}
.pyr-stage{flex:1;display:flex;min-height:0}
.pyr-scopewrap{position:relative;flex:1;min-width:0}
.pyr-scopewrap canvas{display:block;cursor:crosshair}
.pyr-legend{position:absolute;left:14px;top:12px;display:flex;flex-direction:column;gap:5px;font-family:ui-monospace,monospace;font-size:9px;letter-spacing:.06em;color:#9fd4c9;pointer-events:none}
.pyr-legend span{display:inline-flex;align-items:center;gap:6px}
.pyr-legend i{width:8px;height:8px;border-radius:2px}
.pyr-legend-hint{color:#5f8f85;margin-top:3px}
.pyr-side{width:290px;flex:none;border-left:1px solid rgba(55,224,200,.16);background:#061815;display:flex;flex-direction:column;padding:16px;gap:14px;overflow-y:auto}
.pyr-selhead{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.pyr-selcs{font-family:ui-monospace,monospace;font-size:22px;font-weight:700;color:#dff3ee;letter-spacing:.04em}
.pyr-seltag{font-family:ui-monospace,monospace;font-size:9px;letter-spacing:.1em;padding:4px 8px;border-radius:6px}
.pyr-seltag.arr{color:#04100e;background:#37e0c8}.pyr-seltag.dep{color:#04100e;background:#ffb454}
.pyr-selgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pyr-selgrid div{background:#0a221e;border:1px solid rgba(55,224,200,.14);border-radius:9px;padding:8px 10px}
.pyr-selgrid span{display:block;font-family:ui-monospace,monospace;font-size:8px;letter-spacing:.14em;color:#6faea2;text-transform:uppercase}
.pyr-selgrid b{font-family:ui-monospace,monospace;font-size:14px;color:#dff3ee}
.pyr-cmd{display:flex;flex-direction:column;gap:7px}
.pyr-cmd-lbl{font-family:ui-monospace,monospace;font-size:8px;letter-spacing:.16em;text-transform:uppercase;color:#6faea2;margin-top:4px}
.pyr-row{display:flex;gap:6px}.pyr-row.wrap{flex-wrap:wrap}
.pyr-row button{font-family:ui-monospace,monospace;font-size:11px;color:#dff3ee;background:#0a221e;border:1px solid rgba(55,224,200,.25);border-radius:8px;padding:8px 10px;cursor:pointer;transition:.12s;flex:1;min-width:0}
.pyr-row button:hover{border-color:#37e0c8;background:#0e2a25}
.pyr-row button.go{color:#04100e;background:#37e0c8;border-color:#37e0c8;font-weight:600}
.pyr-row button.warn{color:#04100e;background:#ff9b6b;border-color:#ff9b6b;font-weight:600}
.pyr-row input{font-family:ui-monospace,monospace;font-size:12px;color:#dff3ee;background:#0a221e;border:1px solid rgba(55,224,200,.25);border-radius:8px;padding:8px;width:54px;text-align:center}
.pyr-empty{color:#7fb8ac}.pyr-empty-t{font-family:ui-monospace,monospace;font-size:13px;color:#dff3ee;margin-bottom:8px;letter-spacing:.04em}
.pyr-empty p{font-size:12px;line-height:1.6;color:#7fb8ac}
.pyr-side-foot{margin-top:auto;font-family:ui-monospace,monospace;font-size:8.5px;letter-spacing:.06em;color:#4f7f75;line-height:1.6}
.pyr-side-foot a{color:#6faea2}
@media(max-width:820px){.pyr-side{width:100%;position:absolute;bottom:0;left:0;right:0;height:46%;border-left:0;border-top:1px solid rgba(55,224,200,.2)}.pyr-stage{flex-direction:column}}
`;
