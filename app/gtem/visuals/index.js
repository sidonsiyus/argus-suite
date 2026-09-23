"use client";
/* GTEM Learning Bay — bespoke interactive, animated engine visuals.
 * Each component receives { accent, accent2, session } and is self-contained.
 * VISUALS maps a session's `visual` key to its component; missing keys fall
 * back to a styled Placeholder so the platform is always navigable. */
import { useState, useEffect, useRef, useMemo } from "react";

/* ── shared kit ── */
const REDUCED = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function useTick(active = true, speed = 1) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!active || REDUCED()) return;
    let raf, start;
    const loop = (ts) => { start ??= ts; setT(((ts - start) / 1000) * speed); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, speed]);
  return t;
}
function usePlay(initial = true) { return useState(initial && !REDUCED()); }
function PlayPill({ on, set, label = "Animate" }) {
  return <button className={"v-play" + (on ? " on" : "")} onClick={() => set((v) => !v)} title={on ? "Pause" : "Play"}><span>{on ? "❚❚" : "▶"}</span>{label}</button>;
}
function VStage({ children, label, pill }) {
  return (
    <div className="v-stage">
      {pill && <div className="v-stage-top">{pill}</div>}
      {children}
      {label && <div className="v-cap">{label}</div>}
    </div>
  );
}
function Seg({ options, value, onChange, accent }) {
  return (
    <div className="v-seg" role="tablist">
      {options.map((o) => (
        <button key={o.v} className={value === o.v ? "on" : ""} onClick={() => onChange(o.v)}
          style={value === o.v ? { background: accent, borderColor: accent } : undefined}>{o.label}</button>
      ))}
    </div>
  );
}
// interpolate cool→hot by fraction 0..1 (blue intake → white/orange combustion → cooling)
function heat(f) {
  const stops = [[34,211,238], [96,165,250], [255,180,84], [255,90,20], [255,140,40], [255,180,120]];
  const x = Math.max(0, Math.min(0.999, f)) * (stops.length - 1);
  const i = Math.floor(x), r = x - i, a = stops[i], b = stops[i + 1] || a;
  return `rgb(${Math.round(a[0] + (b[0]-a[0])*r)},${Math.round(a[1]+(b[1]-a[1])*r)},${Math.round(a[2]+(b[2]-a[2])*r)})`;
}

/* ══════════════ FLAGSHIP · Gas Turbine Engine Explorer ══════════════ */
const STATIONS = [
  { k: "intake", x: 42, label: "Intake", P: 1.0, T: 1.0, V: 0.8 },
  { k: "fan", x: 92, label: "Fan", P: 1.5, T: 1.1, V: 0.7 },
  { k: "lpc", x: 140, label: "LP Comp", P: 4, T: 1.4, V: 0.6 },
  { k: "hpc", x: 196, label: "HP Comp", P: 30, T: 2.6, V: 0.5 },
  { k: "comb", x: 256, label: "Combustor", P: 29, T: 6.5, V: 0.55 },
  { k: "hpt", x: 312, label: "HP Turbine", P: 10, T: 4.5, V: 0.9 },
  { k: "lpt", x: 362, label: "LP Turbine", P: 3, T: 3.0, V: 1.0 },
  { k: "nozzle", x: 424, label: "Nozzle", P: 1.1, T: 2.4, V: 1.6 },
];
function EngineExplorer({ accent = "#ff7a1a", accent2 = "#ffb454" }) {
  const [on, setOn] = usePlay(true);
  const [type, setType] = useState("turbofan");
  const [thr, setThr] = useState(75);
  const [sel, setSel] = useState(null);
  const t = useTick(on, 1);
  const speed = 0.35 + (thr / 100) * 1.15;
  const N = 26;
  const particles = useMemo(() => Array.from({ length: N }, (_, i) => i / N), []);
  const showFan = type === "turbofan" || type === "turboprop" || type === "turboshaft";
  const showBypass = type === "turbofan";
  const showProp = type === "turboprop";
  const showShaft = type === "turboshaft";
  const n1 = Math.round(thr * 0.98);
  const egt = Math.round(380 + (thr / 100) * 520);
  const core = { top: 78, bot: 122 }; // core duct band

  return (
    <div>
      <div className="ge-top">
        <Seg accent={accent} value={type} onChange={setType} options={[
          { v: "turbojet", label: "Turbojet" }, { v: "turbofan", label: "Turbofan" },
          { v: "turboprop", label: "Turboprop" }, { v: "turboshaft", label: "Turboshaft" },
        ]} />
        <PlayPill on={on} set={setOn} label="Flow" />
      </div>

      <VStage label={sel ? `${STATIONS.find(s=>s.k===sel)?.label}: P≈${STATIONS.find(s=>s.k===sel)?.P}× · T≈${STATIONS.find(s=>s.k===sel)?.T}× inlet` : "Drag the throttle · click a station · switch engine type. Particles heat up through combustion and accelerate out the nozzle."}>
        <svg viewBox="0 0 480 200" className="v-svg">
          <defs>
            <linearGradient id="ge-body" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#2b221d" /><stop offset="1" stopColor="#1c1613" />
            </linearGradient>
            <radialGradient id="ge-flame" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff3d0" /><stop offset="0.5" stopColor="#ff7a1a" /><stop offset="1" stopColor="#ff5722" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* prop / fan spinner (left) */}
          {showProp && (
            <g transform="translate(20,100)">
              {[0,1,2,3].map(i => (
                <ellipse key={i} rx="4" ry="26" fill={accent2} opacity="0.9"
                  transform={`rotate(${(t*speed*220 + i*90)%360})`} />
              ))}
              <circle r="6" fill="#31261f" stroke={accent} />
            </g>
          )}

          {/* nacelle */}
          <path d="M40 70 Q120 58 250 62 Q360 66 440 74 L462 84 L462 116 L440 126 Q360 134 250 138 Q120 142 40 130 Z" fill="url(#ge-body)" stroke="#463831" />
          {/* bypass duct */}
          {showBypass && <>
            <path d="M78 66 Q250 60 440 74 L440 82 Q250 70 96 76 Z" fill="none" stroke={accent2} strokeOpacity="0.5" />
            <path d="M78 134 Q250 140 440 126 L440 118 Q250 130 96 124 Z" fill="none" stroke={accent2} strokeOpacity="0.5" />
          </>}
          {/* core duct highlight */}
          <path d={`M96 ${core.top} L250 82 L${STATIONS[5].x} 90 L410 96 L410 104 L${STATIONS[5].x} 110 L250 118 L96 ${core.bot} Z`} fill="#120d0b" stroke="#3a2e29" />

          {/* combustor flame */}
          <ellipse cx={STATIONS[4].x + 8} cy="100" rx={18 + Math.sin(t*6)*2} ry="15" fill="url(#ge-flame)" opacity={0.55 + 0.25*Math.sin(t*8) + thr/300} />

          {/* fan blades */}
          {showFan && (
            <g transform="translate(92,100)">
              {[0,1,2,3,4,5].map(i => (
                <rect key={i} x="-2" y="-34" width="4" height="34" rx="2" fill={accent} opacity="0.85"
                  transform={`rotate(${(t*speed*260 + i*60)%360})`} />
              ))}
              <circle r="5" fill="#31261f" stroke={accent} />
            </g>
          )}
          {/* compressor + turbine spool discs */}
          {[140,196,312,362].map((x,i) => (
            <g key={x} transform={`translate(${x},100)`}>
              {[0,1,2,3,4,5,6,7].map(j => (
                <line key={j} x1="0" y1="0" x2="0" y2={i<2?-16:-14} stroke={i<2?accent2:"#ff8a65"} strokeWidth="2" opacity="0.75"
                  transform={`rotate(${((t*speed*(i<2?200:300)) + j*45)%360})`} />
              ))}
              <circle r="3.5" fill="#31261f" />
            </g>
          ))}

          {/* airflow particles through core */}
          {particles.map((off, i) => {
            const f = ((t * speed * 0.14 + off) % 1);
            const x = 96 + f * (424 - 96);
            const y = 100 + Math.sin((f * 6 + i) * 1.6) * (f > 0.5 ? 5 : 8);
            const r = f > 0.62 ? 2.4 + (f-0.62)*4 : 2; // expand out the nozzle
            return <circle key={i} cx={x} cy={y} r={r} fill={heat(f)} opacity={0.9} />;
          })}
          {/* bypass particles */}
          {showBypass && particles.slice(0,10).map((off,i) => {
            const f = ((t*speed*0.16 + off) % 1);
            const x = 96 + f*(440-96);
            return <circle key={"b"+i} cx={x} cy={i%2? 71 : 129} r="1.8" fill="#60a5fa" opacity="0.7" />;
          })}
          {/* exhaust cone */}
          <path d="M410 96 L448 99 L448 101 L410 104 Z" fill="#31261f" />

          {/* station click targets + ticks */}
          {STATIONS.map((s) => (
            <g key={s.k} onClick={() => setSel(sel===s.k?null:s.k)} style={{ cursor: "pointer" }}>
              <rect x={s.x-10} y="55" width="20" height="90" fill={sel===s.k? accent : "transparent"} opacity={sel===s.k?0.1:0} />
              <line x1={s.x} y1="150" x2={s.x} y2="156" stroke={sel===s.k?accent:"#5f544d"} strokeWidth="1.5" />
              <text x={s.x} y="166" textAnchor="middle" fontSize="7" fill={sel===s.k?accent:"#8f8078"} style={{fontFamily:"ui-monospace,monospace"}}>{s.label}</text>
            </g>
          ))}
          {showShaft && <text x="30" y="185" fontSize="8" fill={accent2}>⟲ shaft power out</text>}
        </svg>
      </VStage>

      {/* throttle + live readouts */}
      <div className="ge-ctrl">
        <div className="ge-thr">
          <label>Throttle</label>
          <input type="range" min="20" max="100" value={thr} onChange={(e)=>setThr(+e.target.value)} style={{ accentColor: accent }} />
          <span style={{ color: accent }}>{thr}%</span>
        </div>
        <div className="ge-read">
          <div><b style={{color:accent}}>{n1}%</b><span>N1</span></div>
          <div><b style={{color:"#ff8a65"}}>{egt}°C</b><span>EGT</span></div>
          <div><b style={{color:accent2}}>{(1 + thr/100 * 29).toFixed(0)}×</b><span>Peak P</span></div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════ 1.1 · Newton's third law — action/reaction ══════════════ */
function PropulsionBasics({ accent = "#ff7a1a", accent2 = "#ffb454" }) {
  const [on, setOn] = usePlay(true);
  const t = useTick(on, 1);
  const push = (Math.sin(t * 2) * 0.5 + 0.5); // 0..1
  return (
    <VStage pill={<PlayPill on={on} set={setOn} label="Thrust" />}
      label="Newton's third law: the engine accelerates air rearward (blue arrow); the equal-and-opposite reaction (orange) thrusts the aircraft forward.">
      <svg viewBox="0 0 320 150" className="v-svg">
        {/* aircraft body */}
        <g transform={`translate(${push*14},0)`}>
          <path d="M120 70 L200 62 Q230 66 240 75 Q230 84 200 88 L120 80 Z" fill="#2b221d" stroke={accent} />
          <path d="M150 62 L165 42 L180 62 Z" fill="#31261f" stroke="#463831" />
          {/* engine */}
          <rect x="120" y="66" width="34" height="18" rx="6" fill="#120d0b" stroke={accent} />
        </g>
        {/* rearward air */}
        {[0,1,2,3,4].map(i => {
          const f = ((t*1.2 + i/5) % 1);
          return <circle key={i} cx={118 - f*90} cy={75 + Math.sin(i)*4} r={2+f*2} fill="#60a5fa" opacity={1-f*0.7} />;
        })}
        <line x1="110" y1="110" x2="40" y2="110" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arL)" />
        <line x1="210" y1="110" x2="280" y2="110" stroke={accent} strokeWidth="3" markerEnd="url(#arR)" />
        <text x="70" y="126" fontSize="8" fill="#60a5fa">air accelerated aft</text>
        <text x="214" y="126" fontSize="8" fill={accent}>thrust forward</text>
        <defs>
          <marker id="arR" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill={accent}/></marker>
          <marker id="arL" markerWidth="8" markerHeight="8" refX="0" refY="3" orient="auto"><path d="M6 0 L0 3 L6 6" fill="#60a5fa"/></marker>
        </defs>
      </svg>
    </VStage>
  );
}

/* ══════════════ 1.2 / 1.11 · P–T–V through the engine ══════════════ */
function StationPTV({ accent = "#ff7a1a", accent2 = "#ffb454" }) {
  const [on, setOn] = usePlay(true);
  const [metric, setMetric] = useState("P");
  const t = useTick(on, 1);
  const grow = Math.min(1, t / 1.2);
  const vals = STATIONS.map(s => (metric === "P" ? s.P / 30 : metric === "T" ? s.T / 6.5 : s.V / 1.6));
  return (
    <div>
      <div className="ge-top">
        <Seg accent={accent} value={metric} onChange={setMetric} options={[{v:"P",label:"Pressure"},{v:"T",label:"Temperature"},{v:"V",label:"Velocity"}]} />
        <PlayPill on={on} set={setOn} />
      </div>
      <VStage label={metric==="P"?"Pressure rises through the compressor, is held in combustion, then drops across the turbine and nozzle.":metric==="T"?"Temperature peaks straight after combustion — the turbine inlet is the hottest, most limited point.":"Velocity is traded against pressure by ducts and nozzles, accelerating hard at the exhaust."}>
        <svg viewBox="0 0 460 160" className="v-svg">
          {STATIONS.map((s, i) => {
            const h = vals[i] * 110 * grow;
            return (
              <g key={s.k} transform={`translate(${20 + i*56},0)`}>
                <rect x="0" y={130 - h} width="30" height={h} rx="4" fill={metric==="T"? heat(vals[i]) : accent} opacity="0.9" />
                <text x="15" y="144" textAnchor="middle" fontSize="6.5" fill="#8f8078" style={{fontFamily:"ui-monospace,monospace"}}>{s.label}</text>
              </g>
            );
          })}
          <line x1="10" y1="130" x2="450" y2="130" stroke="#463831" />
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 1.3 · Brayton cycle ══════════════ */
function BraytonCycle({ accent = "#ff7a1a", accent2 = "#ffb454" }) {
  const [pr, setPr] = useState(12);
  const [on, setOn] = usePlay(true);
  const t = useTick(on, 1);
  // trace a point around the cycle
  const seg = (t * 0.5) % 4;
  return (
    <div>
      <div className="ge-thr" style={{marginBottom:8}}>
        <label>Pressure ratio</label>
        <input type="range" min="4" max="40" value={pr} onChange={(e)=>setPr(+e.target.value)} style={{accentColor:accent}} />
        <span style={{color:accent}}>{pr}:1</span>
        <PlayPill on={on} set={setOn} label="Trace" />
      </div>
      <VStage label="The ideal gas-turbine cycle: 1→2 compression, 2→3 constant-pressure heat addition (combustion), 3→4 expansion through the turbine, 4→1 heat rejection. Higher pressure ratio = more work per cycle.">
        <svg viewBox="0 0 320 170" className="v-svg">
          {/* axes */}
          <line x1="40" y1="140" x2="300" y2="140" stroke="#463831" /><text x="300" y="153" fontSize="8" fill="#8f8078" textAnchor="end">Volume</text>
          <line x1="40" y1="140" x2="40" y2="18" stroke="#463831" /><text x="46" y="16" fontSize="8" fill="#8f8078">Pressure</text>
          {(() => {
            const topY = 130 - (Math.min(pr,40)/40)*100;
            const pts = { 1:[80,130], 2:[70,topY], 3:[250,topY], 4:[260,130] };
            const path = `M${pts[1]} L${pts[2]} L${pts[3]} L${pts[4]} Z`;
            const order=[pts[1],pts[2],pts[3],pts[4],pts[1]];
            const i = Math.floor(seg), f = seg - i;
            const a = order[i], b = order[i+1];
            const cx = a[0]+(b[0]-a[0])*f, cy = a[1]+(b[1]-a[1])*f;
            return <>
              <path d={path.replace(/(\d+),(\d+)/g,"$1 $2")} fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="2" />
              {Object.entries(pts).map(([k,p])=> <g key={k}><circle cx={p[0]} cy={p[1]} r="3" fill={accent2}/><text x={p[0]+ (k==='1'||k==='4'?-2:2)} y={p[1]-6} fontSize="9" fill="#c8b9af" textAnchor={k==='1'||k==='4'?'end':'start'}>{k}</text></g>)}
              <circle cx={cx} cy={cy} r="4" fill="#fff3d0" stroke={accent} />
              <text x="155" y={topY-6} fontSize="7.5" fill={accent} textAnchor="middle">combustion (const. P)</text>
            </>;
          })()}
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 1.7 · Thrust builder ══════════════ */
function ThrustBuilder({ accent = "#ff7a1a", accent2 = "#ffb454" }) {
  const [v2, setV2] = useState(600); // jet velocity
  const v1 = 240; // inlet velocity
  const net = Math.max(0, Math.round((v2 - v1) * 0.9));
  const grossL = Math.min(120, v2/6), dragL = Math.min(60, v1/6);
  return (
    <div>
      <div className="ge-thr" style={{marginBottom:8}}>
        <label>Jet velocity</label>
        <input type="range" min="300" max="900" value={v2} onChange={(e)=>setV2(+e.target.value)} style={{accentColor:accent}} />
        <span style={{color:accent}}>{v2} m/s</span>
      </div>
      <VStage label={`Net thrust = gross thrust − momentum drag. Faster jet exhaust (right, orange) beats the momentum drag of incoming air (left, blue). Net ≈ ${net} units.`}>
        <svg viewBox="0 0 320 140" className="v-svg">
          <rect x="120" y="55" width="80" height="30" rx="8" fill="#120d0b" stroke={accent} />
          <text x="160" y="74" fontSize="8" fill="#c8b9af" textAnchor="middle">engine</text>
          {/* momentum drag (incoming) */}
          <line x1="120" y1="40" x2={120-dragL} y2="40" stroke="#60a5fa" strokeWidth="4" markerEnd="url(#tbL)" />
          <text x={118-dragL} y="34" fontSize="7.5" fill="#60a5fa" textAnchor="end">momentum drag</text>
          {/* gross thrust (jet) */}
          <line x1="200" y1="100" x2={200+grossL} y2="100" stroke={accent} strokeWidth="5" markerEnd="url(#tbR)" />
          <text x={202+grossL} y="94" fontSize="7.5" fill={accent}>gross thrust</text>
          {/* net */}
          <line x1="160" y1="120" x2={160+net/8} y2="120" stroke={accent2} strokeWidth="6" markerEnd="url(#tbR)" />
          <text x="160" y="134" fontSize="8" fill={accent2}>net thrust →</text>
          <defs>
            <marker id="tbR" markerWidth="9" markerHeight="9" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7" fill={accent}/></marker>
            <marker id="tbL" markerWidth="9" markerHeight="9" refX="1" refY="3.5" orient="auto"><path d="M7 0 L0 3.5 L7 7" fill="#60a5fa"/></marker>
          </defs>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 1.6 · Engine-type comparison ══════════════ */
const ENGINES = [
  { k: "turboprop", label: "Turboprop", best: 0.45, peak: 0.55, note: "Low & slow — best propulsive efficiency below ~0.5 Mach; short regional hops.", color: "#22d3ee" },
  { k: "turbofan",  label: "Turbofan",  best: 0.82, peak: 0.85, note: "Subsonic cruise king — high bypass gives quiet, economical thrust at 0.75–0.85 Mach.", color: "#ff7a1a" },
  { k: "turbojet",  label: "Turbojet",  best: 1.6,  peak: 2.2,  note: "High speed — efficient only well above the sound barrier; military & legacy supersonic.", color: "#ff5722" },
  { k: "turboshaft",label: "Turboshaft",best: 0.0,  peak: 0.3,  note: "Shaft power, not thrust — helicopters, APUs, pumps. Speed-independent.", color: "#14b8a6" },
];
function EngineCompare({ accent = "#ff7a1a", accent2 = "#ffb454" }) {
  const [mach, setMach] = useState(0.8);
  // propulsive efficiency curve per engine — gaussian around its best point
  const eff = (e) => e.k === "turboshaft" ? 0.3 : Math.max(0.05, e.peak * Math.exp(-Math.pow((mach - e.best) / 0.55, 2)));
  const ranked = [...ENGINES].map(e => ({ ...e, e: eff(e) })).sort((a, b) => b.e - a.e);
  const winner = ranked[0];
  return (
    <div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Flight speed</label>
        <input type="range" min="0.2" max="2.2" step="0.05" value={mach} onChange={(e) => setMach(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: accent }}>Mach {mach.toFixed(2)}</span>
      </div>
      <VStage label={`Best for Mach ${mach.toFixed(2)}: ${winner.label}. ${winner.note}`}>
        <svg viewBox="0 0 340 180" className="v-svg">
          {/* efficiency curves */}
          <line x1="30" y1="150" x2="326" y2="150" stroke="#463831" />
          <text x="326" y="164" fontSize="7.5" fill="#8f8078" textAnchor="end">Mach →</text>
          <text x="30" y="16" fontSize="7.5" fill="#8f8078">propulsive η</text>
          {ENGINES.map((e) => {
            const pts = Array.from({ length: 40 }, (_, i) => {
              const m = 0.2 + (i / 39) * 2.0;
              const y = e.k === "turboshaft" ? 0.3 : Math.max(0.05, e.peak * Math.exp(-Math.pow((m - e.best) / 0.55, 2)));
              return `${30 + ((m - 0.2) / 2.0) * 296},${150 - Math.min(1, y) * 120}`;
            }).join(" ");
            return <polyline key={e.k} points={pts} fill="none" stroke={e.color} strokeWidth={winner.k === e.k ? 3 : 1.4} opacity={winner.k === e.k ? 1 : 0.5} />;
          })}
          {/* current mach marker */}
          <line x1={30 + ((mach - 0.2) / 2.0) * 296} y1="30" x2={30 + ((mach - 0.2) / 2.0) * 296} y2="150" stroke={accent} strokeDasharray="3 3" opacity="0.6" />
          {/* legend / ranking */}
          {ranked.map((e, i) => (
            <g key={e.k} transform={`translate(${236},${34 + i * 18})`}>
              <rect x="-4" y="-9" width="108" height="16" rx="4" fill={i === 0 ? e.color : "transparent"} opacity={i === 0 ? 0.14 : 0} />
              <circle cx="2" cy="0" r="3" fill={e.color} />
              <text x="10" y="3" fontSize="8" fill={i === 0 ? "#f3e9e2" : "#a99a91"} style={{ fontFamily: "ui-monospace,monospace" }}>{e.label}</text>
              <text x="100" y="3" fontSize="8" fill={e.color} textAnchor="end">{Math.round(e.e * 100)}%</text>
            </g>
          ))}
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 1.8 · Performance parameters (THP / ESHP / SFC) ══════════════ */
function PerformanceCalc({ accent = "#ff7a1a", accent2 = "#ffb454" }) {
  const [thrust, setThrust] = useState(80);   // kN
  const [tas, setTas] = useState(240);        // m/s
  const [fuel, setFuel] = useState(2600);     // kg/h
  const thp = Math.round((thrust * 1000 * tas) / 745.7); // W→hp
  const sfc = (fuel / (thrust * 1000 / 9.81)).toFixed(3); // kg/h per kgf (approx)
  const Bar = ({ label, val, max, unit, color }) => (
    <div className="pc-row">
      <span className="pc-lab">{label}</span>
      <div className="pc-track"><div className="pc-fill" style={{ width: `${Math.min(100, (val / max) * 100)}%`, background: color }} /></div>
      <span className="pc-val" style={{ color }}>{val.toLocaleString()} <em>{unit}</em></span>
    </div>
  );
  return (
    <div>
      <VStage label="Thrust horsepower converts thrust × speed into power; SFC is fuel burned per unit thrust — the headline economy figure. Slide the inputs to see the numbers move.">
        <div className="pc-panel">
          <label className="pc-ctl"><span>Net thrust</span><input type="range" min="10" max="120" value={thrust} onChange={(e) => setThrust(+e.target.value)} style={{ accentColor: accent }} /><b style={{ color: accent }}>{thrust} kN</b></label>
          <label className="pc-ctl"><span>True airspeed</span><input type="range" min="60" max="320" value={tas} onChange={(e) => setTas(+e.target.value)} style={{ accentColor: accent }} /><b style={{ color: accent }}>{tas} m/s</b></label>
          <label className="pc-ctl"><span>Fuel flow</span><input type="range" min="600" max="6000" step="50" value={fuel} onChange={(e) => setFuel(+e.target.value)} style={{ accentColor: accent }} /><b style={{ color: accent }}>{fuel} kg/h</b></label>
          <div className="pc-out">
            <Bar label="Thrust HP" val={thp} max={60000} unit="hp" color={accent} />
            <Bar label="SFC" val={+sfc} max={1.4} unit="kg/kgf·h" color={"#ff8a65"} />
          </div>
        </div>
      </VStage>
    </div>
  );
}

/* ══════════════ 1.9 · Efficiency chain (thermal × propulsive = overall) ══════════════ */
function EfficiencyDial({ accent = "#ff7a1a", accent2 = "#ffb454" }) {
  const [thermal, setThermal] = useState(45);
  const [prop, setProp] = useState(72);
  const overall = ((thermal / 100) * (prop / 100) * 100).toFixed(1);
  const Dial = ({ v, label, color }) => {
    const R = 34, C = 2 * Math.PI * R, dash = (v / 100) * C;
    return (
      <div className="ef-dial">
        <svg viewBox="0 0 90 90" width="96" height="96">
          <circle cx="45" cy="45" r={R} fill="none" stroke="#3a2e29" strokeWidth="8" />
          <circle cx="45" cy="45" r={R} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`} transform="rotate(-90 45 45)" />
          <text x="45" y="42" textAnchor="middle" fontSize="17" fill="#f3e9e2" fontWeight="700">{v}%</text>
          <text x="45" y="56" textAnchor="middle" fontSize="7.5" fill="#a99a91">{label}</text>
        </svg>
      </div>
    );
  };
  return (
    <div>
      <VStage label={`Overall efficiency = thermal × propulsive = ${overall}%. Most of the fuel's energy never becomes thrust — the two efficiencies multiply, so both must be high.`}>
        <div className="ef-wrap">
          <Dial v={thermal} label="thermal" color={accent} />
          <span className="ef-op">×</span>
          <Dial v={prop} label="propulsive" color={"#22d3ee"} />
          <span className="ef-op">=</span>
          <Dial v={+overall} label="overall" color={accent2} />
        </div>
        <div className="ef-ctls">
          <label className="pc-ctl"><span>Thermal η</span><input type="range" min="20" max="60" value={thermal} onChange={(e) => setThermal(+e.target.value)} style={{ accentColor: accent }} /></label>
          <label className="pc-ctl"><span>Propulsive η</span><input type="range" min="30" max="95" value={prop} onChange={(e) => setProp(+e.target.value)} style={{ accentColor: "#22d3ee" }} /></label>
        </div>
      </VStage>
    </div>
  );
}

/* ══════════════ 1.10 · Bypass ratio ══════════════ */
function BypassRatio({ accent = "#ff7a1a", accent2 = "#ffb454" }) {
  const [on, setOn] = usePlay(true);
  const [bpr, setBpr] = useState(6);
  const t = useTick(on, 1);
  const fanR = 26 + bpr * 3.2;           // fan grows with BPR
  const sfc = (0.72 - Math.min(bpr, 12) * 0.03).toFixed(2);
  const noise = Math.max(0, Math.round(105 - bpr * 2.4));
  return (
    <div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Bypass ratio</label>
        <input type="range" min="0" max="12" step="0.5" value={bpr} onChange={(e) => setBpr(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: accent }}>{bpr}:1</span>
        <PlayPill on={on} set={setOn} label="Flow" />
      </div>
      <VStage label={`Bypass ratio ${bpr}:1 — more cold air moved slowly = better fuel burn and less noise. Est. SFC ${sfc} · jet noise ${noise} dB(rel).`}>
        <svg viewBox="0 0 320 170" className="v-svg">
          {/* cowl */}
          <ellipse cx="70" cy="85" rx="26" ry={fanR} fill="#1c1613" stroke={accent} />
          {/* spinning fan */}
          <g transform="translate(70,85)">
            {Array.from({ length: 10 }).map((_, i) => (
              <rect key={i} x="-2.5" y={-fanR + 4} width="5" height={fanR - 6} rx="2" fill={accent} opacity="0.8"
                transform={`rotate(${(t * 200 + i * 36) % 360})`} />
            ))}
            <circle r="6" fill="#31261f" stroke={accent2} />
          </g>
          {/* core (constant) */}
          <rect x="96" y="70" width="150" height="30" rx="6" fill="#120d0b" stroke="#463831" />
          <text x="171" y="89" fontSize="7.5" fill="#8f8078" textAnchor="middle">core (hot)</text>
          {/* bypass streams — count scales with BPR */}
          {Array.from({ length: Math.max(2, Math.round(bpr)) }).map((_, i) => {
            const f = ((t * 0.5 + i / bpr) % 1);
            const y = 85 - fanR + 8 + (i / Math.max(1, bpr)) * (2 * fanR - 16);
            const inCore = Math.abs(y - 85) < 16;
            if (inCore) return null;
            return <circle key={i} cx={96 + f * 200} cy={y} r="2" fill="#60a5fa" opacity={0.8} />;
          })}
          {/* hot core jet */}
          {Array.from({ length: 6 }).map((_, i) => {
            const f = ((t * 0.9 + i / 6) % 1);
            return <circle key={"h" + i} cx={246 + f * 60} cy={85 + Math.sin(i) * 4} r={2 + f * 2} fill={heat(0.7)} opacity={1 - f * 0.6} />;
          })}
          {/* readouts */}
          <g transform="translate(230,120)">
            <text x="0" y="0" fontSize="8" fill="#a99a91">SFC</text><text x="70" y="0" fontSize="9" fill={accent} textAnchor="end">{sfc}</text>
            <text x="0" y="16" fontSize="8" fill="#a99a91">noise</text><text x="70" y="16" fontSize="9" fill="#22d3ee" textAnchor="end">{noise} dB</text>
          </g>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 1.12 · Engine ratings & flat rating ══════════════ */
function EngineRatings({ accent = "#ff7a1a", accent2 = "#ffb454" }) {
  const [oat, setOat] = useState(15);     // °C ambient
  const corner = 30;                       // flat-rating corner temp
  // thrust: flat (100%) up to corner, then falls
  const thrustPct = oat <= corner ? 100 : Math.max(60, 100 - (oat - corner) * 2.2);
  const px = (temp) => 40 + ((temp + 20) / 80) * 260;   // -20..60 → x
  const py = (pct) => 140 - ((pct - 55) / 50) * 120;
  const curve = Array.from({ length: 60 }, (_, i) => {
    const temp = -20 + (i / 59) * 80;
    const p = temp <= corner ? 100 : Math.max(60, 100 - (temp - corner) * 2.2);
    return `${px(temp)},${py(p)}`;
  }).join(" ");
  return (
    <div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Ambient temp (OAT)</label>
        <input type="range" min="-20" max="55" value={oat} onChange={(e) => setOat(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: accent }}>{oat}°C</span>
      </div>
      <VStage label={oat <= corner
        ? `Below the flat-rating corner (${corner}°C) the engine holds full rated thrust — protecting the hot section from over-temperature on cold days.`
        : `Above the corner temperature, thrust falls off: at ${oat}°C the engine delivers ~${Math.round(thrustPct)}% of rated thrust.`}>
        <svg viewBox="0 0 320 165" className="v-svg">
          <line x1="40" y1="140" x2="308" y2="140" stroke="#463831" /><text x="308" y="153" fontSize="7.5" fill="#8f8078" textAnchor="end">OAT °C</text>
          <line x1="40" y1="140" x2="40" y2="18" stroke="#463831" /><text x="44" y="16" fontSize="7.5" fill="#8f8078">thrust %</text>
          {/* corner marker */}
          <line x1={px(corner)} y1="20" x2={px(corner)} y2="140" stroke={accent2} strokeDasharray="3 3" opacity="0.5" />
          <text x={px(corner)} y="30" fontSize="7" fill={accent2} textAnchor="middle">flat-rating corner</text>
          <polyline points={curve} fill="none" stroke={accent} strokeWidth="2.5" />
          {/* current point */}
          <circle cx={px(oat)} cy={py(thrustPct)} r="5" fill="#fff3d0" stroke={accent} />
          <text x={px(oat)} y={py(thrustPct) - 10} fontSize="8" fill={accent} textAnchor="middle">{Math.round(thrustPct)}%</text>
        </svg>
      </VStage>
    </div>
  );
}

/* ── styled fallback ── */
function Placeholder({ accent = "#ff7a1a", session }) {
  return (
    <div className="v-ph">
      <div className="v-ph-ring" style={{ borderColor: accent }}>
        <span style={{ color: accent }}>◉</span>
      </div>
      <p className="v-ph-t">Interactive visual</p>
      <p className="v-ph-s">A bespoke animated visual for <b>{session?.title || "this session"}</b> is being crafted for this unit.</p>
    </div>
  );
}

/* ── registry ── */
export const VISUALS = {
  EngineExplorer,
  PropulsionBasics,
  StationPTV,
  BraytonCycle,
  ThrustBuilder,
  EngineCompare,
  PerformanceCalc,
  EfficiencyDial,
  BypassRatio,
  EngineRatings,
};

export function Visual({ visual, accent, accent2, session }) {
  const key = visual || session?.visual;
  const C = VISUALS[key] || Placeholder;
  return <C accent={accent || session?.accent} accent2={accent2 || session?.accent2} session={session} />;
}
