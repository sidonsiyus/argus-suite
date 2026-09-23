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

/* ══════════════ 2.1 · Inlet duct — diffuse & recover ══════════════ */
function InletDuct({ accent = "#22d3ee", accent2 = "#67e8f9" }) {
  const [on, setOn] = usePlay(true);
  const [sup, setSup] = useState(false);
  const [spd, setSpd] = useState(60);
  const t = useTick(on, 1);
  const recovery = sup ? Math.round(88 + (spd / 100) * 6) : Math.round(96 + (spd / 100) * 3);
  return (
    <div>
      <div className="ge-top">
        <Seg accent={accent} value={sup ? "s" : "u"} onChange={(v) => setSup(v === "s")} options={[{ v: "u", label: "Subsonic" }, { v: "s", label: "Supersonic" }]} />
        <PlayPill on={on} set={setOn} label="Flow" />
      </div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Airspeed</label>
        <input type="range" min="20" max="100" value={spd} onChange={(e) => setSpd(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: accent }}>{spd}%</span>
      </div>
      <VStage label={sup ? `Supersonic inlet: shock waves decelerate the flow before the diffuser. Pressure recovery ≈ ${recovery}%.` : `Subsonic diffuser: the duct widens, slowing the air and raising its pressure. Ram recovery ≈ ${recovery}%.`}>
        <svg viewBox="0 0 320 150" className="v-svg">
          {/* diffuser duct */}
          <path d="M30 60 L120 60 L250 45 L250 105 L120 90 L30 90 Z" fill="#101a1c" stroke={accent} opacity="0.9" />
          <text x="255" y="78" fontSize="7" fill="#7fb0b8">compressor face</text>
          {/* shock waves for supersonic */}
          {sup && [0, 1, 2].map((i) => <line key={i} x1={54 + i * 16} y1="55" x2={44 + i * 16} y2="95" stroke={accent2} strokeWidth="1.5" opacity="0.7" />)}
          {/* particles slowing as duct widens */}
          {Array.from({ length: 14 }).map((_, i) => {
            const f = ((t * (0.2 + spd / 200) + i / 14) % 1);
            const x = 30 + f * 210;
            const slow = 1 - f * 0.55; // slows downstream
            return <circle key={i} cx={x} cy={75 + Math.sin(i * 2) * (10 + f * 6)} r={1.6 + f * 1.6} fill={accent} opacity={slow} />;
          })}
          {/* pressure bar */}
          <rect x="270" y={110 - recovery * 0.8} width="14" height={recovery * 0.8} rx="3" fill={accent2} opacity="0.85" />
          <text x="277" y="122" fontSize="7" fill="#7fb0b8" textAnchor="middle">P</text>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 2.2 · Inlet configuration & distortion ══════════════ */
const INLETS = {
  podded: { label: "Podded", rec: 98, dist: 0.08, note: "Clean air, highest pressure recovery — the airliner standard." },
  buried: { label: "Buried", rec: 93, dist: 0.28, note: "Lower drag/signature, but long ducts add distortion." },
  sduct: { label: "S-duct", rec: 91, dist: 0.4, note: "Hides the compressor face; the bends create distortion to manage." },
  chin: { label: "Chin", rec: 95, dist: 0.18, note: "Good for high angle of attack; used on some fighters." },
};
function InletConfig({ accent = "#22d3ee", accent2 = "#67e8f9" }) {
  const [k, setK] = useState("podded");
  const cfg = INLETS[k];
  const cells = 24;
  return (
    <div>
      <div className="ge-top">
        <Seg accent={accent} value={k} onChange={setK} options={Object.entries(INLETS).map(([v, c]) => ({ v, label: c.label }))} />
      </div>
      <VStage label={`${cfg.label}: pressure recovery ${cfg.rec}%. ${cfg.note}`}>
        <svg viewBox="0 0 300 150" className="v-svg">
          <text x="150" y="16" fontSize="8" fill="#7fb0b8" textAnchor="middle">compressor-face distortion map</text>
          {/* distortion disc */}
          {Array.from({ length: cells }).map((_, i) => {
            const ang = (i / cells) * Math.PI * 2;
            return Array.from({ length: 4 }).map((__, r) => {
              const rad = 14 + r * 12;
              const x = 150 + Math.cos(ang) * rad, y = 80 + Math.sin(ang) * rad;
              // distortion concentrated at bottom for buried/sduct
              const local = cfg.dist * (0.5 + 0.5 * Math.sin(ang - Math.PI / 2));
              return <circle key={i + "-" + r} cx={x} cy={y} r="5.5" fill={heat(0.15 + local)} opacity={0.85} />;
            });
          })}
          <circle cx="150" cy="80" r="60" fill="none" stroke={accent} strokeOpacity="0.4" />
          <rect x="235" y={120 - cfg.rec * 0.9} width="14" height={cfg.rec * 0.9} rx="3" fill={accent2} />
          <text x="242" y="132" fontSize="7" fill="#7fb0b8" textAnchor="middle">rec</text>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 2.3 · Axial vs centrifugal compressor ══════════════ */
function CompressorTypes({ accent = "#22d3ee", accent2 = "#67e8f9" }) {
  const [on, setOn] = usePlay(true);
  const [type, setType] = useState("axial");
  const t = useTick(on, 1);
  return (
    <div>
      <div className="ge-top">
        <Seg accent={accent} value={type} onChange={setType} options={[{ v: "axial", label: "Axial" }, { v: "centrifugal", label: "Centrifugal" }]} />
        <PlayPill on={on} set={setOn} label="Spin" />
      </div>
      <VStage label={type === "axial" ? "Axial: air flows straight through many rotor/stator stages, each adding a small pressure rise — high flow in a slim engine." : "Centrifugal: the impeller flings air radially outward; a diffuser turns that velocity into a large pressure rise in a short, rugged package."}>
        <svg viewBox="0 0 320 150" className="v-svg">
          {type === "axial" ? (
            <>
              <path d="M30 55 L290 63 L290 87 L30 95 Z" fill="#101a1c" stroke={accent} opacity="0.7" />
              {[60, 96, 132, 168, 204, 240].map((x, i) => (
                <g key={x}>
                  <rect x={x} y={i % 2 ? 58 : 64} width="4" height="28" rx="1.5" fill={i % 2 ? accent2 : accent} opacity="0.85" />
                </g>
              ))}
              {/* flow particles */}
              {Array.from({ length: 10 }).map((_, i) => {
                const f = ((t * 0.4 + i / 10) % 1);
                return <circle key={i} cx={30 + f * 260} cy={75 + Math.sin(i) * 6} r={1.8 + f * 1.4} fill={heat(0.1 + f * 0.25)} opacity="0.9" />;
              })}
              <text x="150" y="120" fontSize="7.5" fill="#7fb0b8" textAnchor="middle">6 stages → high overall pressure ratio</text>
            </>
          ) : (
            <>
              <circle cx="150" cy="78" r="52" fill="#101a1c" stroke={accent} opacity="0.6" />
              <g transform="translate(150,78)">
                {Array.from({ length: 12 }).map((_, i) => (
                  <path key={i} d="M0 0 Q14 -4 30 4" fill="none" stroke={accent} strokeWidth="2.5" opacity="0.8"
                    transform={`rotate(${(t * 160 + i * 30) % 360})`} />
                ))}
                <circle r="7" fill="#16292d" stroke={accent2} />
              </g>
              {/* outward particles */}
              {Array.from({ length: 12 }).map((_, i) => {
                const f = ((t * 0.6 + i / 12) % 1);
                const ang = (i / 12) * Math.PI * 2 + t;
                const rad = 8 + f * 46;
                return <circle key={i} cx={150 + Math.cos(ang) * rad} cy={78 + Math.sin(ang) * rad} r={1.6 + f * 1.4} fill={heat(0.1 + f * 0.3)} opacity={1 - f * 0.4} />;
              })}
              <text x="150" y="142" fontSize="7.5" fill="#7fb0b8" textAnchor="middle">1 stage → big pressure rise, large frontal area</text>
            </>
          )}
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 2.4 · Ice protection ══════════════ */
function IceProtection({ accent = "#22d3ee", accent2 = "#67e8f9" }) {
  const [mode, setMode] = useState("off");
  const iced = mode === "off";
  const lipT = mode === "off" ? -8 : mode === "hot" ? 42 : 30;
  return (
    <div>
      <div className="ge-top">
        <Seg accent={accent} value={mode} onChange={setMode} options={[{ v: "off", label: "Anti-ice OFF" }, { v: "hot", label: "Hot-air" }, { v: "elec", label: "Electrical" }]} />
      </div>
      <VStage label={iced ? "Anti-ice off: supercooled water freezes on the inlet lip and spinner — distorting flow and risking ingestion when it sheds." : mode === "hot" ? "Hot-air anti-ice: compressor bleed warms the inlet lip and cowl, keeping them ice-free (small performance cost)." : "Electrical anti-ice: heating elements protect probes and the spinner without costing bleed air."}>
        <svg viewBox="0 0 300 150" className="v-svg">
          {/* nacelle lip */}
          <path d="M60 40 Q40 75 60 110 L120 100 Q108 75 120 50 Z" fill="#101a1c" stroke={mode === "off" ? "#7fb0b8" : accent} strokeWidth={mode === "off" ? 1 : 2} />
          <path d="M120 50 L250 60 L250 90 L120 100 Z" fill="#0d1518" stroke="#24383c" />
          {/* spinner */}
          <ellipse cx="135" cy="75" rx="10" ry="22" fill="#16292d" stroke={mode === "off" ? "#7fb0b8" : accent} />
          {/* ice buildup */}
          {iced && <>
            <path d="M58 44 Q46 58 52 66 L62 60 Q58 50 64 46 Z" fill="#bfe9f2" opacity="0.85" />
            <path d="M56 92 Q44 100 54 108 L64 100 Q58 96 62 90 Z" fill="#bfe9f2" opacity="0.85" />
            <circle cx="126" cy="60" r="4" fill="#bfe9f2" opacity="0.8" />
          </>}
          {/* heat glow */}
          {!iced && <path d="M60 40 Q40 75 60 110 L120 100 Q108 75 120 50 Z" fill={mode === "hot" ? "rgba(255,120,40,0.25)" : "rgba(34,211,238,0.22)"} />}
          {mode === "hot" && Array.from({ length: 4 }).map((_, i) => <circle key={i} cx={200 - i * 20} cy={75 + Math.sin(i) * 6} r="2.5" fill="#ff8a65" opacity="0.7" />)}
          {/* temp readout */}
          <text x="230" y="120" fontSize="9" fill={lipT < 0 ? "#7fb0b8" : accent} textAnchor="end">lip {lipT}°C</text>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 2.5 · Fan balancing ══════════════ */
function FanBalance({ accent = "#22d3ee", accent2 = "#67e8f9" }) {
  const [on, setOn] = usePlay(true);
  const [trim, setTrim] = useState(0); // 0..100 cancels imbalance at ~70
  const t = useTick(on, 1);
  const residual = Math.abs(70 - trim) / 70; // 0 = balanced
  const wobble = residual * 5;
  const vib = (residual * 4.5 + 0.2).toFixed(1);
  return (
    <div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Trim weight</label>
        <input type="range" min="0" max="100" value={trim} onChange={(e) => setTrim(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: vib < 1 ? accent : "#ff8a65" }}>{vib} ips</span>
        <PlayPill on={on} set={setOn} label="Spin" />
      </div>
      <VStage label={vib < 1 ? "Balanced — trim weight cancels the fan's imbalance; vibration is within limits." : "Imbalance causes the fan to wobble and vibrate. Slide the trim weight to cancel it and watch vibration fall."}>
        <svg viewBox="0 0 300 150" className="v-svg">
          <g transform={`translate(${150 + Math.sin(t * 8) * wobble},${78 + Math.cos(t * 8) * wobble})`}>
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x="-2.5" y="-48" width="5" height="44" rx="2.5" fill={accent} opacity="0.85"
                transform={`rotate(${(t * 220 + i * 30) % 360})`} />
            ))}
            <circle r="8" fill="#16292d" stroke={accent2} />
            {/* imbalance marker */}
            <circle cx="0" cy="-46" r={3 + residual * 3} fill={residual > 0.1 ? "#ff8a65" : accent2}
              transform={`rotate(${(t * 220) % 360})`} />
          </g>
          {/* vibration meter */}
          <rect x="40" y="130" width="220" height="8" rx="4" fill="#16292d" />
          <rect x="40" y="130" width={Math.min(220, vib * 44)} height="8" rx="4" fill={vib < 1 ? accent : "#ff8a65"} />
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 2.6 · Compressor map — stall & surge ══════════════ */
function StallSurge({ accent = "#22d3ee", accent2 = "#67e8f9" }) {
  const [op, setOp] = useState(55); // operating point along working line
  const surged = op > 88;
  const [on, setOn] = usePlay(true);
  const t = useTick(on && surged, 1);
  return (
    <div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Throttle push</label>
        <input type="range" min="20" max="100" value={op} onChange={(e) => setOp(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: surged ? "#ff5722" : accent }}>{surged ? "SURGE" : "stable"}</span>
        <PlayPill on={on} set={setOn} label="Flow" />
      </div>
      <VStage label={surged ? "Operating point crossed the surge line — flow reverses through the compressor with a bang, thrust loss and high EGT." : "The operating point runs up the working line. The gap to the surge line above is the surge margin — keep clear of it."}>
        <svg viewBox="0 0 300 160" className="v-svg">
          <line x1="40" y1="140" x2="288" y2="140" stroke="#24383c" /><text x="288" y="153" fontSize="7" fill="#7fb0b8" textAnchor="end">mass flow</text>
          <line x1="40" y1="140" x2="40" y2="16" stroke="#24383c" /><text x="44" y="14" fontSize="7" fill="#7fb0b8">pressure ratio</text>
          {/* surge line */}
          <path d="M60 120 Q120 60 210 34" fill="none" stroke="#ff5722" strokeWidth="2" strokeDasharray="4 3" />
          <text x="150" y="44" fontSize="7" fill="#ff5722">surge line</text>
          {/* working line */}
          <path d="M70 132 Q150 100 250 70" fill="none" stroke={accent} strokeWidth="2" />
          <text x="215" y="86" fontSize="7" fill={accent}>working line</text>
          {/* operating point */}
          {(() => {
            const f = (op - 20) / 80;
            const x = 70 + f * 180, y = 132 - f * 62;
            return <>
              <circle cx={x} cy={y} r="5.5" fill={surged ? "#ff5722" : "#dff6fb"} stroke={surged ? "#ff5722" : accent} />
              {surged && Array.from({ length: 6 }).map((_, i) => {
                const rf = ((t * 1.5 + i / 6) % 1);
                return <circle key={i} cx={x - rf * 120} cy={y + Math.sin(i) * 6} r={2 + rf * 2} fill="#ff8a65" opacity={1 - rf} />;
              })}
            </>;
          })()}
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 2.7 · Airflow control — bleed & variable vanes ══════════════ */
function AirflowControl({ accent = "#22d3ee", accent2 = "#67e8f9" }) {
  const [spd, setSpd] = useState(40);
  // at low speed you need bleed open + vanes closed
  const bleedOpen = spd < 60;
  const vaneAngle = 40 - (spd / 100) * 40; // more closed (angled) at low speed
  const stable = spd < 60 ? bleedOpen : true;
  const [on, setOn] = usePlay(true);
  const t = useTick(on, 1);
  return (
    <div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Engine speed</label>
        <input type="range" min="20" max="100" value={spd} onChange={(e) => setSpd(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: accent }}>{spd}% N</span>
        <PlayPill on={on} set={setOn} label="Flow" />
      </div>
      <VStage label={spd < 60 ? "At low speed the front stages pump more than the rear can swallow — the bleed valve opens (dumping excess air) and the variable vanes angle to keep incidence correct." : "At high speed the compressor is matched: bleeds close and vanes open to the running position."}>
        <svg viewBox="0 0 320 150" className="v-svg">
          <path d="M30 55 L290 62 L290 88 L30 95 Z" fill="#101a1c" stroke={accent} opacity="0.7" />
          {/* variable vanes */}
          {[70, 100, 130].map((x) => (
            <line key={x} x1={x} y1="60" x2={x + Math.sin((vaneAngle * Math.PI) / 180) * 10} y2="90" stroke={accent2} strokeWidth="3" />
          ))}
          <text x="100" y="112" fontSize="7" fill="#7fb0b8" textAnchor="middle">variable vanes</text>
          {/* bleed valve */}
          <g transform="translate(200,62)">
            <rect x="-6" y="-2" width="12" height="6" fill={bleedOpen ? accent : "#24383c"} />
            {bleedOpen && Array.from({ length: 4 }).map((_, i) => {
              const f = ((t * 0.8 + i / 4) % 1);
              return <circle key={i} cx="0" cy={-4 - f * 26} r="2" fill={accent} opacity={1 - f} />;
            })}
          </g>
          <text x="200" y="112" fontSize="7" fill="#7fb0b8" textAnchor="middle">bleed valve</text>
          {/* core flow */}
          {Array.from({ length: 8 }).map((_, i) => {
            const f = ((t * 0.4 + i / 8) % 1);
            return <circle key={i} cx={30 + f * 260} cy={75 + Math.sin(i) * 5} r="2" fill={heat(0.12 + f * 0.2)} opacity="0.85" />;
          })}
          <text x="255" y="132" fontSize="8" fill={stable ? accent : "#ff8a65"} textAnchor="end">{stable ? "stable" : "front-stage stall risk"}</text>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 2.8 · Combustor zones ══════════════ */
function Combustor({ accent = "#22d3ee", accent2 = "#67e8f9" }) {
  const [on, setOn] = usePlay(true);
  const [far, setFar] = useState(50); // fuel-air ratio 0..100
  const t = useTick(on, 1);
  const stable = far > 25 && far < 78;
  return (
    <div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Fuel–air ratio</label>
        <input type="range" min="5" max="100" value={far} onChange={(e) => setFar(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: stable ? accent : "#ff8a65" }}>{stable ? "stable" : far <= 25 ? "lean blow-out" : "rich / smoke"}</span>
        <PlayPill on={on} set={setOn} label="Burn" />
      </div>
      <VStage label="Air is staged: ~¼ enters the primary zone to burn, the secondary zone completes combustion, and the dilution zone mixes in the rest to cool the gas to a turbine-safe temperature.">
        <svg viewBox="0 0 320 150" className="v-svg">
          <defs>
            <radialGradient id="cb-flame" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff3d0" /><stop offset="0.5" stopColor="#ff7a1a" /><stop offset="1" stopColor="#ff5722" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M40 45 Q60 35 90 38 L250 42 L250 108 L90 112 Q60 115 40 105 Z" fill="#101a1c" stroke={accent} />
          {/* zones */}
          <text x="90" y="30" fontSize="7" fill={accent2} textAnchor="middle">primary</text>
          <text x="160" y="30" fontSize="7" fill={accent2} textAnchor="middle">secondary</text>
          <text x="225" y="30" fontSize="7" fill={accent2} textAnchor="middle">dilution</text>
          <line x1="120" y1="40" x2="120" y2="110" stroke="#24383c" strokeDasharray="3 3" />
          <line x1="195" y1="41" x2="195" y2="109" stroke="#24383c" strokeDasharray="3 3" />
          {/* flame */}
          <ellipse cx="95" cy="75" rx={22 + Math.sin(t * 6) * 3} ry={16 + far / 8} fill="url(#cb-flame)" opacity={0.5 + far / 220} />
          {/* liner cooling film holes */}
          {[60, 90, 120, 150, 180, 210].map((x) => (
            <circle key={x} cx={x} cy="44" r="1.5" fill={accent} opacity="0.6" />
          ))}
          {/* dilution air arrows */}
          {[205, 225, 245].map((x) => <line key={x} x1={x} y1="40" x2={x} y2="60" stroke={accent} strokeWidth="1.5" markerEnd="url(#cdA)" />)}
          {/* cooled exit particles */}
          {Array.from({ length: 8 }).map((_, i) => {
            const f = ((t * 0.5 + i / 8) % 1);
            return <circle key={i} cx={95 + f * 155} cy={75 + Math.sin(i) * 6} r="2.4" fill={heat(0.85 - f * 0.35)} opacity="0.9" />;
          })}
          <defs><marker id="cdA" markerWidth="7" markerHeight="7" refX="3.5" refY="6" orient="auto"><path d="M0 0 L3.5 6 L7 0" fill={accent} /></marker></defs>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 2.9 · Turbine stage — NGV + rotor ══════════════ */
function TurbineStage({ accent = "#22d3ee", accent2 = "#67e8f9" }) {
  const [on, setOn] = usePlay(true);
  const t = useTick(on, 1);
  return (
    <VStage pill={<PlayPill on={on} set={setOn} label="Gas" />}
      label="Nozzle guide vanes (fixed) accelerate and turn the hot gas onto the rotating blades, which extract work — dropping the gas pressure and temperature.">
      <svg viewBox="0 0 320 150" className="v-svg">
        <path d="M30 50 L290 55 L290 95 L30 100 Z" fill="#101a1c" stroke={accent} opacity="0.6" />
        {/* NGVs (fixed, angled) */}
        {[70, 92, 114, 136].map((x) => <path key={x} d={`M${x} 55 Q${x + 8} 75 ${x} 95`} fill="none" stroke={accent2} strokeWidth="3" />)}
        <text x="103" y="118" fontSize="7" fill="#7fb0b8" textAnchor="middle">NGV (fixed)</text>
        {/* rotor blades */}
        {[175, 197, 219, 241].map((x, i) => (
          <rect key={x} x={x} y={62 + Math.sin(t * 4 + i) * 4} width="4" height="26" rx="2" fill={accent} opacity="0.85" />
        ))}
        <text x="208" y="118" fontSize="7" fill="#7fb0b8" textAnchor="middle">rotor (spins)</text>
        {/* hot gas cooling as it gives up energy */}
        {Array.from({ length: 12 }).map((_, i) => {
          const f = ((t * 0.5 + i / 12) % 1);
          return <circle key={i} cx={30 + f * 260} cy={75 + Math.sin((f * 8 + i)) * 7} r={2.6 - f} fill={heat(0.9 - f * 0.5)} opacity="0.9" />;
        })}
        {/* work-out arrow */}
        <line x1="270" y1="120" x2="295" y2="120" stroke={accent} strokeWidth="3" markerEnd="url(#twA)" />
        <text x="250" y="118" fontSize="7" fill={accent} textAnchor="end">shaft work →</text>
        <defs><marker id="twA" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill={accent} /></marker></defs>
      </svg>
    </VStage>
  );
}

/* ══════════════ 2.10 · Blade stress & creep ══════════════ */
function CreepStress({ accent = "#22d3ee", accent2 = "#67e8f9" }) {
  const [rpm, setRpm] = useState(70);
  const [cool, setCool] = useState(true);
  const [on, setOn] = usePlay(true);
  const t = useTick(on, 0.5);
  const metalT = (cool ? 780 : 780 + 260) + (rpm / 100) * 120;
  const stress = (rpm / 100);
  // creep grows over time, faster when hot & stressed
  const creepRate = stress * (cool ? 0.4 : 1.1);
  const stretch = Math.min(18, (t % 12) * creepRate);
  const danger = metalT > 1000 && stress > 0.7;
  return (
    <div>
      <div className="ge-top" style={{ gap: 12 }}>
        <div className="ge-thr">
          <label>Rotor speed</label>
          <input type="range" min="20" max="100" value={rpm} onChange={(e) => setRpm(+e.target.value)} style={{ accentColor: accent }} />
          <span style={{ color: accent }}>{rpm}%</span>
        </div>
        <Seg accent={accent} value={cool ? "c" : "n"} onChange={(v) => setCool(v === "c")} options={[{ v: "c", label: "Cooled" }, { v: "n", label: "Uncooled" }]} />
      </div>
      <VStage label={`Centrifugal stress + heat cause creep — slow permanent stretch. Metal ≈ ${Math.round(metalT)}°C. ${danger ? "Hot & highly stressed: creep is rapid — blade life is short." : "Cooling keeps the metal temperature down, slowing creep and extending blade life."}`} pill={<PlayPill on={on} set={setOn} label="Time" />}>
        <svg viewBox="0 0 300 150" className="v-svg">
          {/* disk hub */}
          <rect x="30" y="70" width="30" height="16" rx="3" fill="#16292d" stroke={accent} />
          {/* blade, stretching with creep */}
          <g>
            <rect x="60" y={74 - stretch / 2} width={70 + stretch} height="8" rx="3" fill={heat(Math.min(0.95, (metalT - 700) / 500))} opacity="0.9" />
            {cool && Array.from({ length: 5 }).map((_, i) => <circle key={i} cx={72 + i * 12} cy="78" r="1.3" fill="#dff6fb" opacity="0.8" />)}
          </g>
          {/* casing line the blade creeps toward */}
          <line x1="145" y1="60" x2="145" y2="96" stroke="#ff5722" strokeDasharray="3 3" opacity="0.6" />
          <text x="148" y="58" fontSize="7" fill="#ff5722">casing</text>
          {/* centrifugal arrow */}
          <line x1="95" y1="105" x2="135" y2="105" stroke={accent2} strokeWidth="2" markerEnd="url(#csA)" />
          <text x="95" y="120" fontSize="7" fill={accent2}>centrifugal load →</text>
          <text x="235" y="30" fontSize="9" fill={danger ? "#ff5722" : accent}>creep {stretch.toFixed(1)}</text>
          <defs><marker id="csA" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill={accent2} /></marker></defs>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 2.11 · Exhaust nozzle & choking ══════════════ */
function Nozzle({ accent = "#22d3ee", accent2 = "#67e8f9" }) {
  const [pr, setPr] = useState(2.5);
  const [condi, setCondi] = useState(false);
  const [on, setOn] = usePlay(true);
  const t = useTick(on, 1);
  const choked = pr >= 1.9;
  const exitMach = condi ? Math.min(2.2, 0.6 + (pr - 1) * 0.7) : Math.min(1, 0.5 + (pr - 1) * 0.4);
  return (
    <div>
      <div className="ge-top">
        <Seg accent={accent} value={condi ? "cd" : "c"} onChange={(v) => setCondi(v === "cd")} options={[{ v: "c", label: "Convergent" }, { v: "cd", label: "Con-Di" }]} />
        <PlayPill on={on} set={setOn} label="Flow" />
      </div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Pressure ratio</label>
        <input type="range" min="1.2" max="6" step="0.1" value={pr} onChange={(e) => setPr(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: accent }}>{pr.toFixed(1)}:1</span>
      </div>
      <VStage label={condi ? `Convergent-divergent nozzle: the divergent section accelerates the sonic flow to supersonic. Exit ≈ Mach ${exitMach.toFixed(2)}.` : `Convergent nozzle: accelerates gas up to sonic. ${choked ? "Choked — exit pressure stays above ambient (pressure thrust)." : "Subsonic exit."} Exit ≈ Mach ${exitMach.toFixed(2)}.`}>
        <svg viewBox="0 0 320 140" className="v-svg">
          {condi ? (
            <path d="M30 45 L150 58 L190 66 L280 45 L280 95 L190 74 L150 82 L30 95 Z" fill="#101a1c" stroke={accent} />
          ) : (
            <path d="M30 45 L200 62 L200 78 L30 95 Z" fill="#101a1c" stroke={accent} />
          )}
          {/* throat marker */}
          <line x1={condi ? 170 : 200} y1="40" x2={condi ? 170 : 200} y2="100" stroke={choked ? "#ff5722" : "#24383c"} strokeDasharray="3 3" />
          <text x={condi ? 170 : 200} y="38" fontSize="6.5" fill={choked ? "#ff5722" : "#7fb0b8"} textAnchor="middle">throat{choked ? " (choked)" : ""}</text>
          {/* particles accelerating */}
          {Array.from({ length: 12 }).map((_, i) => {
            const f = ((t * (0.4 + exitMach * 0.3) + i / 12) % 1);
            const x = 30 + f * (condi ? 260 : 250);
            const r = f > 0.55 ? 2.6 - (f - 0.55) : 2.2;
            return <circle key={i} cx={x} cy={70 + Math.sin(i * 2) * (8 - f * 5)} r={r} fill={heat(0.6 + f * 0.2)} opacity="0.9" />;
          })}
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 2.12 · Thrust reverser ══════════════ */
function ThrustReverser({ accent = "#22d3ee", accent2 = "#67e8f9" }) {
  const [dep, setDep] = useState(false);
  const [on, setOn] = usePlay(true);
  const t = useTick(on, 1);
  return (
    <div>
      <div className="ge-top">
        <Seg accent={accent} value={dep ? "d" : "s"} onChange={(v) => setDep(v === "d")} options={[{ v: "s", label: "Stowed" }, { v: "d", label: "Deployed" }]} />
        <PlayPill on={on} set={setOn} label="Flow" />
      </div>
      <VStage label={dep ? "Deployed (on the ground only): blocker doors close the bypass duct and cascade vanes turn the cold air forward — a retarding force that helps stop the aircraft." : "Stowed: bypass air flows straight aft as normal thrust. Reversers deploy only with weight-on-wheels and fail-safe interlocks."}>
        <svg viewBox="0 0 320 150" className="v-svg">
          <path d="M40 55 L250 60 L250 90 L40 95 Z" fill="#101a1c" stroke={accent} opacity="0.7" />
          {/* blocker doors */}
          {dep && <>
            <line x1="230" y1="60" x2="200" y2="72" stroke={accent2} strokeWidth="4" />
            <line x1="230" y1="90" x2="200" y2="78" stroke={accent2} strokeWidth="4" />
            {/* cascade vanes forward flow */}
            {[0, 1, 2].map((i) => <path key={i} d={`M230 ${52 - i * 3} q-10 -8 -26 -6`} fill="none" stroke={accent} strokeWidth="2" />)}
            {[0, 1, 2].map((i) => <path key={"b" + i} d={`M230 ${98 + i * 3} q-10 8 -26 6`} fill="none" stroke={accent} strokeWidth="2" />)}
          </>}
          {/* flow particles */}
          {Array.from({ length: 10 }).map((_, i) => {
            const f = ((t * 0.5 + i / 10) % 1);
            if (dep) {
              // forward-turned
              const x = 230 - f * 180;
              const y = (i % 2 ? 48 : 102) - Math.sin(f * 3) * 4;
              return <circle key={i} cx={x} cy={y} r="2" fill={accent} opacity={1 - f * 0.5} />;
            }
            const x = 40 + f * 250;
            return <circle key={i} cx={x} cy={75 + Math.sin(i) * 6} r="2" fill={heat(0.2 + f * 0.15)} opacity="0.85" />;
          })}
          {/* net force arrow */}
          {dep
            ? <><line x1="150" y1="128" x2="90" y2="128" stroke="#ff5722" strokeWidth="4" markerEnd="url(#trL)" /><text x="152" y="132" fontSize="7.5" fill="#ff5722">retarding force</text></>
            : <><line x1="170" y1="128" x2="240" y2="128" stroke={accent} strokeWidth="4" markerEnd="url(#trR)" /><text x="168" y="132" fontSize="7.5" fill={accent} textAnchor="end">thrust</text></>}
          <defs>
            <marker id="trR" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill={accent} /></marker>
            <marker id="trL" markerWidth="8" markerHeight="8" refX="0" refY="3" orient="auto"><path d="M6 0 L0 3 L6 6" fill="#ff5722" /></marker>
          </defs>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 3.1 / 3.4 · Fuel system flow ══════════════ */
const FUEL_STAGES = [
  { k: "tank", x: 30, label: "Tank", d: "The aircraft fuel tanks — the source of supply." },
  { k: "boost", x: 80, label: "Boost", d: "Low-pressure boost pump lifts fuel and prevents vapour lock." },
  { k: "filter", x: 128, label: "Filter", d: "Removes contaminants; a heat exchanger warms the fuel to prevent ice." },
  { k: "hp", x: 176, label: "HP pump", d: "High-pressure pump raises fuel to injection pressure." },
  { k: "fcu", x: 226, label: "FCU", d: "Fuel control unit meters the exact flow for the operating point." },
  { k: "div", x: 278, label: "Divider", d: "Flow divider stages primary/secondary nozzle circuits." },
  { k: "noz", x: 322, label: "Nozzles", d: "Atomise the fuel into the combustor as a fine, shaped spray." },
];
function FuelSystem({ accent = "#f59e0b", accent2 = "#fbbf24" }) {
  const [on, setOn] = usePlay(true);
  const [sel, setSel] = useState(null);
  const t = useTick(on, 1);
  return (
    <VStage pill={<PlayPill on={on} set={setOn} label="Fuel" />}
      label={sel ? `${FUEL_STAGES.find((s) => s.k === sel).label}: ${FUEL_STAGES.find((s) => s.k === sel).d}` : "Tank → boost pump → filter/heat-exchanger → HP pump → fuel control → flow divider → nozzles. Click a stage."}>
      <svg viewBox="0 0 360 120" className="v-svg">
        <line x1="30" y1="60" x2="335" y2="60" stroke="#4a3a1c" strokeWidth="6" strokeLinecap="round" />
        {/* fuel droplets */}
        {Array.from({ length: 12 }).map((_, i) => {
          const f = ((t * 0.3 + i / 12) % 1);
          return <circle key={i} cx={30 + f * 305} cy="60" r="2.4" fill={accent2} opacity="0.9" />;
        })}
        {FUEL_STAGES.map((s) => (
          <g key={s.k} onClick={() => setSel(sel === s.k ? null : s.k)} style={{ cursor: "pointer" }}>
            <circle cx={s.x} cy="60" r={sel === s.k ? 11 : 8} fill={sel === s.k ? accent : "#2b230f"} stroke={accent} />
            <text x={s.x} y="88" fontSize="7" fill={sel === s.k ? accent : "#b89a5c"} textAnchor="middle" style={{ fontFamily: "ui-monospace,monospace" }}>{s.label}</text>
          </g>
        ))}
      </svg>
    </VStage>
  );
}

/* ══════════════ 3.2 · Fuel metering — the safe corridor ══════════════ */
function FuelMetering({ accent = "#f59e0b", accent2 = "#fbbf24" }) {
  const [thr, setThr] = useState(50);
  // operating fuel line sits inside the corridor; slams push toward the ceiling
  const opFuel = 20 + (thr / 100) * 70;
  const ceiling = (x) => 40 + x * 0.55;        // surge / over-temp
  const floor = (x) => 8 + x * 0.15;           // flame-out
  const px = (x) => 40 + x * 2.4, py = (v) => 130 - v * 1.15;
  return (
    <div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Throttle demand</label>
        <input type="range" min="10" max="100" value={thr} onChange={(e) => setThr(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: accent }}>{thr}%</span>
      </div>
      <VStage label="Fuel is scheduled inside a safe corridor: below the surge/over-temp ceiling (red) and above the flame-out floor (blue). The control keeps the fuel line between them at all times.">
        <svg viewBox="0 0 300 150" className="v-svg">
          <line x1="40" y1="130" x2="290" y2="130" stroke="#4a3a1c" /><text x="290" y="145" fontSize="7" fill="#b89a5c" textAnchor="end">engine speed</text>
          <line x1="40" y1="130" x2="40" y2="14" stroke="#4a3a1c" /><text x="44" y="13" fontSize="7" fill="#b89a5c">fuel flow</text>
          {/* corridor */}
          {(() => {
            const cPts = Array.from({ length: 40 }, (_, i) => `${px(i * 2.5)},${py(ceiling(i * 2.5))}`).join(" ");
            const fPts = Array.from({ length: 40 }, (_, i) => `${px(i * 2.5)},${py(floor(i * 2.5))}`).join(" ");
            return <>
              <polyline points={cPts} fill="none" stroke="#ff5722" strokeWidth="2" strokeDasharray="4 3" /><text x="210" y="60" fontSize="7" fill="#ff5722">surge / over-temp</text>
              <polyline points={fPts} fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 3" /><text x="210" y="120" fontSize="7" fill="#22d3ee">flame-out</text>
            </>;
          })()}
          {/* operating point */}
          <circle cx={px(thr * 2.5)} cy={py(opFuel)} r="5.5" fill="#fff3d0" stroke={accent} />
          <text x={px(thr * 2.5)} y={py(opFuel) - 9} fontSize="7.5" fill={accent} textAnchor="middle">fuel</text>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 3.3 · FADEC closed loop ══════════════ */
function FadecLoop({ accent = "#f59e0b", accent2 = "#fbbf24" }) {
  const [on, setOn] = usePlay(true);
  const t = useTick(on, 1);
  const nodes = [
    { k: "eng", x: 150, y: 30, label: "Engine" },
    { k: "sens", x: 250, y: 90, label: "Sensors" },
    { k: "eec", x: 150, y: 130, label: "EEC (A/B)" },
    { k: "act", x: 50, y: 90, label: "Actuators" },
  ];
  const loop = ["eng", "sens", "eec", "act"];
  const seg = (t * 0.6) % 4;
  return (
    <VStage pill={<PlayPill on={on} set={setOn} label="Loop" />}
      label="FADEC is a closed loop: the engine's sensors feed the dual-channel EEC, which computes and commands the actuators (fuel valve, vanes, bleeds), changing the engine — measured again, many times a second.">
      <svg viewBox="0 0 300 160" className="v-svg">
        {/* arrows around the loop */}
        {loop.map((k, i) => {
          const a = nodes.find((n) => n.k === k), b = nodes.find((n) => n.k === loop[(i + 1) % 4]);
          return <line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#4a3a1c" strokeWidth="2" />;
        })}
        {/* travelling pulse */}
        {(() => {
          const i = Math.floor(seg), f = seg - i;
          const a = nodes.find((n) => n.k === loop[i]), b = nodes.find((n) => n.k === loop[(i + 1) % 4]);
          return <circle cx={a.x + (b.x - a.x) * f} cy={a.y + (b.y - a.y) * f} r="4.5" fill={accent2} />;
        })()}
        {nodes.map((n) => (
          <g key={n.k}>
            <rect x={n.x - 34} y={n.y - 12} width="68" height="24" rx="6" fill={n.k === "eec" ? accent : "#2b230f"} stroke={accent} />
            <text x={n.x} y={n.y + 4} fontSize="8.5" fill={n.k === "eec" ? "#1a1206" : "#e8cf97"} textAnchor="middle" fontWeight="700">{n.label}</text>
          </g>
        ))}
      </svg>
    </VStage>
  );
}

/* ══════════════ 3.5 / 3.9 · Start sequence timeline ══════════════ */
function StartSequence({ accent = "#f59e0b", accent2 = "#fbbf24" }) {
  const [on, setOn] = usePlay(true);
  const t = useTick(on, 1);
  const dur = 10; // seconds for a full start
  const p = (t % dur) / dur; // 0..1 play head
  // curves as functions of progress
  const n2 = (x) => Math.min(1, x * 1.4);            // rises then levels near idle
  const egt = (x) => x < 0.28 ? 0 : Math.min(1, (x - 0.28) * 4) * Math.exp(-(x - 0.45) * 1.2) + (x > 0.5 ? 0.35 : 0);
  const n1 = (x) => x < 0.4 ? 0 : Math.min(0.75, (x - 0.4) * 1.3);
  const events = [
    { at: 0.02, label: "starter" }, { at: 0.2, label: "ignition" }, { at: 0.28, label: "fuel" },
    { at: 0.34, label: "light-off" }, { at: 0.62, label: "self-sustain" }, { at: 0.9, label: "idle" },
  ];
  const W = 300, H = 120, x0 = 30, y0 = 110;
  const X = (x) => x0 + x * (W - 40), Y = (v) => y0 - v * 92;
  const curve = (fn, n) => Array.from({ length: n }, (_, i) => `${X(i / (n - 1))},${Y(fn(i / (n - 1)))}`).join(" ");
  return (
    <VStage pill={<PlayPill on={on} set={setOn} label="Play start" />}
      label={`A start is choreographed: starter spins N2, ignition on, fuel on → light-off (EGT rises), engine accelerates to idle. ${p < 0.34 ? "Watch for the EGT light-off." : p < 0.62 ? "Accelerating — EGT peaking within limits." : "Stabilising at idle."}`}>
      <svg viewBox="0 0 300 140" className="v-svg">
        <line x1={x0} y1={y0} x2={W - 10} y2={y0} stroke="#4a3a1c" /><text x={W - 10} y={y0 + 13} fontSize="7" fill="#b89a5c" textAnchor="end">time</text>
        {/* curves */}
        <polyline points={curve(n2, 40)} fill="none" stroke={accent} strokeWidth="2" /><text x={W - 12} y={Y(n2(1)) - 3} fontSize="7" fill={accent} textAnchor="end">N2</text>
        <polyline points={curve(egt, 40)} fill="none" stroke="#ff5722" strokeWidth="2" /><text x={W - 12} y={Y(egt(0.9))} fontSize="7" fill="#ff5722" textAnchor="end">EGT</text>
        <polyline points={curve(n1, 40)} fill="none" stroke="#22d3ee" strokeWidth="2" /><text x={W - 12} y={Y(n1(1)) + 8} fontSize="7" fill="#22d3ee" textAnchor="end">N1</text>
        {/* events */}
        {events.map((e) => (
          <g key={e.label}>
            <line x1={X(e.at)} y1="18" x2={X(e.at)} y2={y0} stroke={p >= e.at ? accent2 : "#3a2f14"} strokeWidth="1" strokeDasharray="2 2" />
            <text x={X(e.at)} y="15" fontSize="5.6" fill={p >= e.at ? accent2 : "#7a6636"} textAnchor="middle">{e.label}</text>
          </g>
        ))}
        {/* play head */}
        <line x1={X(p)} y1="18" x2={X(p)} y2={y0} stroke="#fff3d0" strokeWidth="1.5" />
      </svg>
    </VStage>
  );
}

/* ══════════════ 3.6 · Starter types ══════════════ */
function StarterTypes({ accent = "#f59e0b", accent2 = "#fbbf24" }) {
  const [k, setK] = useState("pneumatic");
  const [on, setOn] = usePlay(true);
  const t = useTick(on, 1);
  const info = {
    pneumatic: "Air-turbine starter — spun by APU, ground cart or cross-bleed air. Light, powerful: the airline norm.",
    electric: "Electric starter / starter-generator — motors the engine, then generates power. No air needed.",
    apu: "The APU (a small gas turbine) supplies bleed air and power to start the main engines on the ground.",
  };
  return (
    <div>
      <div className="ge-top">
        <Seg accent={accent} value={k} onChange={setK} options={[{ v: "pneumatic", label: "Pneumatic" }, { v: "electric", label: "Electric" }, { v: "apu", label: "APU / cross-bleed" }]} />
        <PlayPill on={on} set={setOn} label="Spin" />
      </div>
      <VStage label={info[k]}>
        <svg viewBox="0 0 300 130" className="v-svg">
          {/* source */}
          <rect x="20" y="50" width="60" height="34" rx="6" fill="#2b230f" stroke={accent} />
          <text x="50" y="71" fontSize="8" fill="#e8cf97" textAnchor="middle">{k === "electric" ? "Battery/Gen" : k === "apu" ? "APU" : "Air"}</text>
          {/* feed particles */}
          {Array.from({ length: 6 }).map((_, i) => {
            const f = ((t * 0.6 + i / 6) % 1);
            return <circle key={i} cx={82 + f * 90} cy="67" r="2" fill={k === "electric" ? "#22d3ee" : accent2} opacity={1 - f * 0.4} />;
          })}
          {/* starter motor */}
          <g transform="translate(200,67)">
            <circle r="26" fill="#1f1809" stroke={accent} />
            {Array.from({ length: 8 }).map((_, i) => (
              <rect key={i} x="-1.5" y="-24" width="3" height="22" rx="1.5" fill={accent2}
                transform={`rotate(${(t * 260 + i * 45) % 360})`} />
            ))}
            <circle r="5" fill="#2b230f" />
          </g>
          <text x="200" y="112" fontSize="7.5" fill="#b89a5c" textAnchor="middle">starter → HP spool</text>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 3.7 / 3.8 · Ignition ══════════════ */
function Ignition({ accent = "#f59e0b", accent2 = "#fbbf24" }) {
  const [on, setOn] = usePlay(true);
  const [energy, setEnergy] = useState(60);
  const t = useTick(on, 1);
  const spark = (t * 2) % 1 < 0.12; // periodic spark
  return (
    <div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Spark energy</label>
        <input type="range" min="20" max="100" value={energy} onChange={(e) => setEnergy(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: accent }}>{(energy / 25).toFixed(1)} J</span>
        <PlayPill on={on} set={setOn} label="Fire" />
      </div>
      <VStage label="A capacitor-discharge exciter stores energy and dumps it through a shielded lead to the igniter plug, throwing a high-energy spark that lights the atomised mixture — far stronger than automotive ignition.">
        <svg viewBox="0 0 300 120" className="v-svg">
          {/* exciter */}
          <rect x="20" y="45" width="54" height="32" rx="5" fill="#2b230f" stroke={accent} />
          <text x="47" y="65" fontSize="7.5" fill="#e8cf97" textAnchor="middle">exciter</text>
          {/* charge bar */}
          <rect x="26" y="82" width="42" height="5" rx="2.5" fill="#3a2f14" />
          <rect x="26" y="82" width={(energy / 100) * 42} height="5" rx="2.5" fill={accent} />
          {/* lead */}
          <line x1="74" y1="61" x2="210" y2="61" stroke="#5a4a24" strokeWidth="4" />
          {/* igniter plug */}
          <rect x="210" y="52" width="28" height="18" rx="3" fill="#1f1809" stroke={accent} />
          {/* spark */}
          {spark && <>
            <path d={`M238 61 l6 -${3 + energy / 20} l3 ${4 + energy / 20} l6 -${2 + energy / 25}`} fill="none" stroke="#fff3d0" strokeWidth="2" />
            <circle cx="252" cy="61" r={3 + energy / 30} fill="#fff3d0" opacity="0.8" />
          </>}
          <text x="252" y="90" fontSize="7" fill="#b89a5c" textAnchor="middle">igniter plug</text>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 3.10 / 5.4 · Ground safety zones ══════════════ */
function SafetyZones({ accent = "#f59e0b", accent2 = "#fbbf24" }) {
  const [power, setPower] = useState(50);
  const intake = 3 + (power / 100) * 6;   // metres
  const blast = 30 + (power / 100) * 130; // metres
  return (
    <div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Power setting</label>
        <input type="range" min="20" max="100" value={power} onChange={(e) => setPower(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: accent }}>{power}%</span>
      </div>
      <VStage label={`Danger zones grow with power. Intake ingestion hazard ≈ ${intake.toFixed(0)} m ahead; exhaust blast hazard ≈ ${blast.toFixed(0)} m behind. Never enter these with the engine running.`}>
        <svg viewBox="0 0 320 130" className="v-svg">
          {/* intake suction zone */}
          <path d={`M120 65 m0 0 a${8 + intake * 4} 30 0 0 0 -${8 + intake * 4} 0`} fill="none" />
          <ellipse cx={120 - (8 + intake * 3)} cy="65" rx={8 + intake * 3} ry="26" fill="rgba(255,90,20,0.14)" stroke="#ff5722" strokeDasharray="3 3" />
          <text x={120 - (8 + intake * 3)} y="30" fontSize="7" fill="#ff5722" textAnchor="middle">intake ⚠</text>
          {/* engine */}
          <rect x="120" y="52" width="60" height="26" rx="8" fill="#2b230f" stroke={accent} />
          {/* blast zone */}
          <path d={`M180 52 L${180 + blast} 40 L${180 + blast} 90 L180 78 Z`} fill="rgba(255,180,60,0.12)" stroke={accent2} strokeDasharray="3 3" />
          <text x={180 + blast * 0.6} y="105" fontSize="7" fill={accent2} textAnchor="middle">exhaust blast ⚠</text>
          {/* blast particles */}
          {Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={182 + (i / 6) * blast} cy={65 + Math.sin(i) * 8} r="2" fill={accent2} opacity="0.5" />)}
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 3.11 / 3.12 · System integration ══════════════ */
function SystemReview({ accent = "#f59e0b", accent2 = "#fbbf24" }) {
  const [on, setOn] = usePlay(true);
  const t = useTick(on, 1);
  const sys = [
    { k: "start", label: "Starting", y: 30, note: "airflow" },
    { k: "ign", label: "Ignition", y: 65, note: "spark" },
    { k: "fuel", label: "Fuel", y: 100, note: "energy" },
  ];
  return (
    <VStage pill={<PlayPill on={on} set={setOn} label="Run" />}
      label="Fuel, ignition and starting act in concert: the starter provides airflow, ignition the spark, fuel the energy — converging on a stable start and run.">
      <svg viewBox="0 0 300 130" className="v-svg">
        {sys.map((s, i) => (
          <g key={s.k}>
            <rect x="20" y={s.y - 12} width="80" height="24" rx="6" fill="#2b230f" stroke={accent} />
            <text x="60" y={s.y + 4} fontSize="8.5" fill="#e8cf97" textAnchor="middle">{s.label}</text>
            <line x1="100" y1={s.y} x2="210" y2="65" stroke="#4a3a1c" strokeWidth="1.5" />
            {/* pulse */}
            {(() => { const f = ((t * 0.5 + i / 3) % 1); return <circle cx={100 + f * 110} cy={s.y + (65 - s.y) * f} r="2.5" fill={accent2} />; })()}
            <text x="105" y={s.y - 4} fontSize="6" fill="#8a7440">{s.note}</text>
          </g>
        ))}
        {/* engine */}
        <circle cx="240" cy="65" r="26" fill={accent} stroke={accent2} />
        <text x="240" y="62" fontSize="8" fill="#1a1206" textAnchor="middle" fontWeight="700">stable</text>
        <text x="240" y="73" fontSize="8" fill="#1a1206" textAnchor="middle" fontWeight="700">start</text>
      </svg>
    </VStage>
  );
}

/* ── shared arc gauge (Unit IV) ── */
function ArcGauge({ value, min = 0, max = 100, unit, label, redFrom, accent = "#ff5722", size = 130 }) {
  const a0 = 135, a1 = 405; // sweep
  const frac = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const ang = (a0 + frac * (a1 - a0)) * Math.PI / 180;
  const R = size / 2 - 14, cx = size / 2, cy = size / 2;
  const pol = (deg, r) => [cx + Math.cos(deg * Math.PI / 180) * r, cy + Math.sin(deg * Math.PI / 180) * r];
  const arc = (from, to, r) => {
    const [x0, y0] = pol(from, r), [x1, y1] = pol(to, r);
    return `M${x0} ${y0} A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const redAng = redFrom != null ? a0 + ((redFrom - min) / (max - min)) * (a1 - a0) : null;
  const nx = cx + Math.cos(ang) * (R - 4), ny = cy + Math.sin(ang) * (R - 4);
  const over = redFrom != null && value >= redFrom;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <path d={arc(a0, a1, R)} fill="none" stroke="#3a2018" strokeWidth="9" strokeLinecap="round" />
      {redAng != null && <path d={arc(redAng, a1, R)} fill="none" stroke="#ff5722" strokeWidth="9" strokeLinecap="round" opacity="0.55" />}
      <path d={arc(a0, a0 + frac * (a1 - a0), R)} fill="none" stroke={over ? "#ff5722" : accent} strokeWidth="9" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={over ? "#ff5722" : "#fff3d0"} strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r="4" fill="#2b1a13" stroke={accent} />
      <text x={cx} y={cy + R - 2} textAnchor="middle" fontSize="15" fontWeight="700" fill={over ? "#ff5722" : "#f3e4dd"}>{typeof value === "number" ? (value % 1 ? value.toFixed(2) : value) : value}</text>
      <text x={cx} y={cy + R + 10} textAnchor="middle" fontSize="7" fill="#b8968a">{unit}</text>
      <text x={cx} y="14" textAnchor="middle" fontSize="8" fill={accent} style={{ fontFamily: "ui-monospace,monospace" }}>{label}</text>
    </svg>
  );
}

/* ══════════════ 4.1 · EGT / ITT gauge ══════════════ */
function EgtGauge({ accent = "#ff5722", accent2 = "#ff8a65" }) {
  const [thr, setThr] = useState(60);
  const [wear, setWear] = useState(20);
  const egt = Math.round(380 + (thr / 100) * 480 + (wear / 100) * 120);
  const redline = 950;
  const margin = redline - egt;
  return (
    <div>
      <div className="ge-top" style={{ gap: 12 }}>
        <div className="ge-thr"><label>Thrust</label><input type="range" min="20" max="100" value={thr} onChange={(e) => setThr(+e.target.value)} style={{ accentColor: accent }} /><span style={{ color: accent }}>{thr}%</span></div>
        <div className="ge-thr"><label>Engine wear</label><input type="range" min="0" max="100" value={wear} onChange={(e) => setWear(+e.target.value)} style={{ accentColor: accent }} /><span style={{ color: accent }}>{wear}%</span></div>
      </div>
      <VStage label={`EGT ${egt}°C · red-line ${redline}°C · margin ${margin}°C. As the engine wears, EGT for the same thrust rises and the margin to the red-line shrinks — a headline health indicator.`}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, padding: 8 }}>
          <ArcGauge value={egt} min={300} max={1050} unit="°C" label="EGT" redFrom={redline} accent={accent} size={150} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: margin < 60 ? "#ff5722" : accent2, fontVariantNumeric: "tabular-nums" }}>{margin}°</div>
            <div style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", fontFamily: "var(--mono)" }}>EGT margin</div>
          </div>
        </div>
      </VStage>
    </div>
  );
}

/* ══════════════ 4.2 · Thrust indication — EPR vs N1 ══════════════ */
function EprGauge({ accent = "#ff5722", accent2 = "#ff8a65" }) {
  const [thr, setThr] = useState(70);
  const epr = (1.05 + (thr / 100) * 0.55).toFixed(2);
  const n1 = Math.round(30 + (thr / 100) * 70);
  return (
    <div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Throttle</label>
        <input type="range" min="20" max="100" value={thr} onChange={(e) => setThr(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: accent }}>{thr}%</span>
      </div>
      <VStage label="Thrust is set on a parameter, not measured directly. EPR (pressure ratio) and N1 (fan speed) both track thrust — manufacturers pick one as primary; both move together with the throttle.">
        <div style={{ display: "flex", justifyContent: "center", gap: 16, padding: 8 }}>
          <ArcGauge value={+epr} min={1} max={1.7} unit="ratio" label="EPR" accent={accent} size={140} />
          <ArcGauge value={n1} min={0} max={110} unit="% RPM" label="N1" redFrom={104} accent={accent2} size={140} />
        </div>
      </VStage>
    </div>
  );
}

/* ══════════════ 4.3 · Oil & fuel ══════════════ */
function OilFuelGauge({ accent = "#ff5722", accent2 = "#ff8a65" }) {
  const [thr, setThr] = useState(60);
  const [fault, setFault] = useState(false);
  const oilP = fault ? 12 : Math.round(45 + (thr / 100) * 30);
  const oilT = Math.round(70 + (thr / 100) * 40);
  const ff = Math.round(400 + (thr / 100) * 2400);
  return (
    <div>
      <div className="ge-top" style={{ gap: 12 }}>
        <div className="ge-thr"><label>Thrust</label><input type="range" min="20" max="100" value={thr} onChange={(e) => setThr(+e.target.value)} style={{ accentColor: accent }} /><span style={{ color: accent }}>{thr}%</span></div>
        <Seg accent={accent} value={fault ? "f" : "n"} onChange={(v) => setFault(v === "f")} options={[{ v: "n", label: "Normal" }, { v: "f", label: "Oil fault" }]} />
      </div>
      <VStage label={fault ? "Low oil pressure! Bearings fail quickly without lubrication — a time-critical emergency the fluid gauges catch before the thrust gauges." : "Oil pressure and temperature confirm lubrication and cooling; fuel flow shows consumption and, cross-checked, abnormal operation."}>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, padding: 6 }}>
          <ArcGauge value={oilP} min={0} max={90} unit="psi" label="OIL P" redFrom={oilP < 20 ? 0 : null} accent={oilP < 20 ? "#ff5722" : accent} size={120} />
          <ArcGauge value={oilT} min={40} max={150} unit="°C" label="OIL T" redFrom={140} accent={accent2} size={120} />
          <ArcGauge value={ff} min={0} max={3200} unit="kg/h" label="FUEL" accent={accent} size={120} />
        </div>
      </VStage>
    </div>
  );
}

/* ══════════════ 4.4 / 4.12 · Engine gauge cluster (EICAS) ══════════════ */
function EngineGaugeCluster({ accent = "#ff5722", accent2 = "#ff8a65" }) {
  const [thr, setThr] = useState(65);
  const rows = [
    { k: "N1", v: Math.round(28 + thr * 0.72), max: 110, red: 104, u: "%" },
    { k: "EGT", v: Math.round(360 + thr * 5.4), max: 1050, red: 950, u: "°C" },
    { k: "N2", v: Math.round(55 + thr * 0.45), max: 110, red: 105, u: "%" },
    { k: "FF", v: Math.round(400 + thr * 26), max: 3200, red: null, u: "kg/h" },
    { k: "VIB", v: +(0.4 + (thr > 90 ? 2 : 0.3)).toFixed(1), max: 5, red: 4, u: "ips" },
  ];
  return (
    <div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Thrust lever</label>
        <input type="range" min="20" max="100" value={thr} onChange={(e) => setThr(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: accent }}>{thr}%</span>
      </div>
      <VStage label="EICAS/ECAM gather every parameter into one alerting picture. Green is normal, amber caution, red the limit. A parameter out of family is spotted instantly against the whole set.">
        <svg viewBox="0 0 300 160" className="v-svg">
          {rows.map((r, i) => {
            const frac = Math.min(1, r.v / r.max);
            const over = r.red != null && r.v >= r.red;
            const y = 20 + i * 28;
            return (
              <g key={r.k}>
                <text x="14" y={y + 4} fontSize="9" fill="#b8968a" style={{ fontFamily: "ui-monospace,monospace" }}>{r.k}</text>
                <rect x="52" y={y - 6} width="180" height="12" rx="6" fill="#2b1a13" />
                {r.red != null && <rect x={52 + (r.red / r.max) * 180} y={y - 6} width={180 - (r.red / r.max) * 180} height="12" rx="6" fill="#ff5722" opacity="0.4" />}
                <rect x="52" y={y - 6} width={frac * 180} height="12" rx="6" fill={over ? "#ff5722" : accent} />
                <text x="242" y={y + 4} fontSize="9" fill={over ? "#ff5722" : "#f3e4dd"} textAnchor="start" style={{ fontVariantNumeric: "tabular-nums" }}>{r.v}</text>
              </g>
            );
          })}
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 4.5 · Spool speed ══════════════ */
function SpeedGauge({ accent = "#ff5722", accent2 = "#ff8a65" }) {
  const [thr, setThr] = useState(60);
  const n1 = Math.round(28 + thr * 0.72), n2 = Math.round(58 + thr * 0.44);
  const over = n2 > 105;
  return (
    <div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Power</label>
        <input type="range" min="20" max="105" value={thr} onChange={(e) => setThr(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: over ? "#ff5722" : accent }}>{over ? "OVERSPEED" : thr + "%"}</span>
      </div>
      <VStage label="Each spool's speed is shown as a percentage of a design datum. N1 is the fan/LP spool, N2 the HP spool. Overspeed protection prevents a catastrophic disk burst.">
        <div style={{ display: "flex", justifyContent: "center", gap: 20, padding: 8 }}>
          <ArcGauge value={n1} min={0} max={110} unit="% N1" label="LP SPOOL" redFrom={104} accent={accent} size={140} />
          <ArcGauge value={n2} min={0} max={115} unit="% N2" label="HP SPOOL" redFrom={105} accent={accent2} size={140} />
        </div>
      </VStage>
    </div>
  );
}

/* ══════════════ 4.6 / 5.7 · Vibration monitor ══════════════ */
function VibMonitor({ accent = "#ff5722", accent2 = "#ff8a65" }) {
  const [on, setOn] = usePlay(true);
  const [imbalance, setImbalance] = useState(20);
  const t = useTick(on, 1);
  const level = (imbalance / 100 * 4 + 0.3);
  const alarm = level > 3;
  const hist = useMemo(() => Array.from({ length: 40 }, (_, i) => i), []);
  return (
    <div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Rotor imbalance</label>
        <input type="range" min="0" max="100" value={imbalance} onChange={(e) => setImbalance(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: alarm ? "#ff5722" : accent }}>{level.toFixed(1)} ips</span>
        <PlayPill on={on} set={setOn} label="Live" />
      </div>
      <VStage label={alarm ? "Vibration above limit — imbalance, bearing wear or a rub. Investigate; fan imbalance is often cured by trim balancing." : "A healthy rotor runs smoothly. Rising vibration warns of imbalance or bearing wear before it becomes damage."}>
        <svg viewBox="0 0 300 130" className="v-svg">
          {/* live waveform */}
          <polyline points={hist.map((i) => `${20 + i * 6.7},${65 + Math.sin(t * 6 + i * 0.8) * level * 8}`).join(" ")}
            fill="none" stroke={alarm ? "#ff5722" : accent} strokeWidth="1.6" />
          {/* limit lines */}
          <line x1="20" y1={65 - 3 * 8} x2="288" y2={65 - 3 * 8} stroke="#ff5722" strokeDasharray="3 3" opacity="0.5" />
          <line x1="20" y1={65 + 3 * 8} x2="288" y2={65 + 3 * 8} stroke="#ff5722" strokeDasharray="3 3" opacity="0.5" />
          <text x="24" y={65 - 3 * 8 - 3} fontSize="6.5" fill="#ff5722">limit</text>
          {/* level bar */}
          <rect x="20" y="112" width="268" height="8" rx="4" fill="#2b1a13" />
          <rect x="20" y="112" width={Math.min(268, level / 5 * 268)} height="8" rx="4" fill={alarm ? "#ff5722" : accent} />
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 4.7 · Torque / power ══════════════ */
function TorqueGauge({ accent = "#ff5722", accent2 = "#ff8a65" }) {
  const [tq, setTq] = useState(60);
  const [rpm, setRpm] = useState(95); // governed prop speed
  const shp = Math.round((tq / 100) * (rpm / 100) * 1200);
  const over = tq > 100;
  return (
    <div>
      <div className="ge-top" style={{ gap: 12 }}>
        <div className="ge-thr"><label>Torque</label><input type="range" min="10" max="110" value={tq} onChange={(e) => setTq(+e.target.value)} style={{ accentColor: accent }} /><span style={{ color: over ? "#ff5722" : accent }}>{tq}%</span></div>
        <div className="ge-thr"><label>Prop RPM</label><input type="range" min="60" max="100" value={rpm} onChange={(e) => setRpm(+e.target.value)} style={{ accentColor: accent }} /><span style={{ color: accent }}>{rpm}%</span></div>
      </div>
      <VStage label={`Turboprops/turboshafts make power, not jet thrust — torque is the primary gauge. Power = torque × RPM ≈ ${shp} SHP. Torque is limited to protect the gearbox.`}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, padding: 8 }}>
          <ArcGauge value={tq} min={0} max={120} unit="% torque" label="TORQUE" redFrom={100} accent={accent} size={150} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: accent2, fontVariantNumeric: "tabular-nums" }}>{shp}</div>
            <div style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", fontFamily: "var(--mono)" }}>shaft HP</div>
          </div>
        </div>
      </VStage>
    </div>
  );
}

/* ══════════════ 4.8 · Augmentation overview ══════════════ */
function AugmentOverview({ accent = "#ff5722", accent2 = "#ff8a65" }) {
  const [k, setK] = useState("injection");
  const boost = k === "injection" ? 12 : 55;
  const fuelCost = k === "injection" ? 5 : 120;
  return (
    <div>
      <div className="ge-top">
        <Seg accent={accent} value={k} onChange={setK} options={[{ v: "dry", label: "Dry" }, { v: "injection", label: "Injection" }, { v: "afterburner", label: "Afterburner" }]} />
      </div>
      <VStage label={k === "dry" ? "Dry rating: the engine's thrust with no augmentation." : k === "injection" ? "Injection boosts mass flow (density) to restore hot-day take-off thrust — a modest boost for little extra fuel." : "Afterburning burns extra fuel downstream for a large thrust boost — at an enormous fuel cost."}>
        <svg viewBox="0 0 300 140" className="v-svg">
          {/* thrust bar */}
          <text x="20" y="34" fontSize="8" fill="#b8968a">thrust</text>
          <rect x="70" y="24" width="200" height="18" rx="6" fill="#2b1a13" />
          <rect x="70" y="24" width="120" height="18" rx="6" fill={accent} />
          <rect x="190" y="24" width={k === "dry" ? 0 : (boost / 70) * 80} height="18" rx="6" fill={accent2} />
          <text x="130" y="37" fontSize="8" fill="#1a0f0a" textAnchor="middle" fontWeight="700">dry</text>
          {k !== "dry" && <text x={190 + (boost / 70) * 40} y="37" fontSize="7" fill="#1a0f0a" textAnchor="middle" fontWeight="700">+{boost}%</text>}
          {/* fuel bar */}
          <text x="20" y="84" fontSize="8" fill="#b8968a">fuel</text>
          <rect x="70" y="74" width="200" height="18" rx="6" fill="#2b1a13" />
          <rect x="70" y="74" width="80" height="18" rx="6" fill="#ffb454" />
          <rect x="150" y="74" width={k === "dry" ? 0 : (fuelCost / 120) * 118} height="18" rx="6" fill="#ff5722" />
          {k !== "dry" && <text x={150 + (fuelCost / 120) * 59} y="87" fontSize="7" fill="#1a0f0a" textAnchor="middle" fontWeight="700">+{fuelCost}%</text>}
          <text x="150" y="122" fontSize="7.5" fill="#b8968a" textAnchor="middle">{k === "afterburner" ? "huge thrust, huge fuel burn" : k === "injection" ? "modest boost, little fuel" : "baseline"}</text>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 4.9 / 4.10 · Water / water-methanol injection ══════════════ */
function WaterInjection({ accent = "#ff5722", accent2 = "#ff8a65" }) {
  const [on, setOn] = usePlay(true);
  const [flow, setFlow] = useState(0);
  const t = useTick(on, 1);
  const density = 1 + (flow / 100) * 0.14;
  const thrust = Math.round(100 + (flow / 100) * 14);
  return (
    <div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Injection flow</label>
        <input type="range" min="0" max="100" value={flow} onChange={(e) => setFlow(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: accent }}>{flow}%</span>
        <PlayPill on={on} set={setOn} label="Spray" />
      </div>
      <VStage label={`Water (or water-methanol) sprayed into the inlet cools and densifies the air — density ×${density.toFixed(2)}, so more mass flows and thrust rises to ${thrust}% of dry. Methanol adds antifreeze + a little energy.`}>
        <svg viewBox="0 0 300 130" className="v-svg">
          {/* inlet */}
          <path d="M30 45 L150 52 L150 78 L30 85 Z" fill="#2b1a13" stroke={accent} />
          {/* spray nozzle */}
          <circle cx="60" cy="65" r="3" fill={accent2} />
          {/* water droplets */}
          {flow > 0 && Array.from({ length: Math.round(flow / 12) + 2 }).map((_, i) => {
            const f = ((t * 0.8 + i / 8) % 1);
            return <circle key={i} cx={60 + f * 88} cy={55 + (i % 3) * 8 + Math.sin(f * 6) * 3} r="1.6" fill="#7fd4e0" opacity={1 - f * 0.4} />;
          })}
          {/* engine + thrust bar */}
          <rect x="150" y="50" width="60" height="30" rx="6" fill="#1a0f0a" stroke={accent} />
          <rect x="150" y="100" width="120" height="10" rx="5" fill="#2b1a13" />
          <rect x="150" y="100" width={(thrust - 90) / 25 * 120} height="10" rx="5" fill={accent} />
          <text x="272" y="108" fontSize="8" fill={accent} textAnchor="end">{thrust}% thrust</text>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 4.11 · Afterburner ══════════════ */
function Afterburner({ accent = "#ff5722", accent2 = "#ff8a65" }) {
  const [on, setOn] = usePlay(true);
  const [reheat, setReheat] = useState(false);
  const t = useTick(on, 1);
  const nozzle = reheat ? 22 : 10; // opening
  const thrust = reheat ? 160 : 100;
  return (
    <div>
      <div className="ge-top">
        <Seg accent={accent} value={reheat ? "on" : "off"} onChange={(v) => setReheat(v === "on")} options={[{ v: "off", label: "Dry" }, { v: "on", label: "Reheat ON" }]} />
        <PlayPill on={on} set={setOn} label="Flow" />
      </div>
      <VStage label={reheat ? `Reheat lit: fuel burns in the jet pipe's spare oxygen, adding heat and jet velocity — thrust ~${thrust}% of dry. The variable nozzle opens to pass the extra volume (or the core would surge).` : "Dry: core exhaust flows out the nozzle normally. The jet pipe carries plenty of unburned oxygen — spare capacity for reheat."}>
        <svg viewBox="0 0 320 120" className="v-svg">
          <defs>
            <radialGradient id="ab-flame" cx="0.3" cy="0.5" r="0.7">
              <stop offset="0" stopColor="#fff3d0" /><stop offset="0.4" stopColor="#ff7a1a" /><stop offset="1" stopColor="#ff5722" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* jet pipe */}
          <path d={`M30 45 L230 50 L${250} ${60 - nozzle} L${250} ${60 + nozzle} L230 70 L30 75 Z`} fill="#1a0f0a" stroke={accent} />
          {/* spray bars */}
          {[110, 130, 150].map((x) => <line key={x} x1={x} y1="50" x2={x} y2="70" stroke={accent2} strokeWidth="1.5" />)}
          {/* flame holder */}
          <path d="M165 55 l8 5 l-8 5 Z" fill="#3a2018" stroke={accent2} />
          {/* reheat flame */}
          {reheat && <ellipse cx="215" cy="60" rx={40 + Math.sin(t * 8) * 5} ry={12 + nozzle / 2} fill="url(#ab-flame)" opacity="0.8" />}
          {/* exhaust particles */}
          {Array.from({ length: 12 }).map((_, i) => {
            const f = ((t * (reheat ? 1 : 0.6) + i / 12) % 1);
            return <circle key={i} cx={30 + f * (reheat ? 290 : 250)} cy={60 + Math.sin(i) * 6} r={1.8 + (reheat ? f * 2 : 0)} fill={heat(reheat ? 0.75 : 0.35)} opacity={1 - f * 0.5} />;
          })}
          {/* thrust readout */}
          <text x="30" y="100" fontSize="9" fill={reheat ? "#ff5722" : accent}>thrust {thrust}%</text>
          <text x="250" y="100" fontSize="7" fill="#b8968a" textAnchor="end">nozzle {reheat ? "open" : "nominal"}</text>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 5.1 / 5.12 · Engine health hub ══════════════ */
function HealthOverview({ accent = "#14b8a6", accent2 = "#5eead4" }) {
  const [on, setOn] = usePlay(true);
  const [sel, setSel] = useState(null);
  const t = useTick(on, 1);
  const streams = [
    { k: "flight", label: "Flight data", x: 40, y: 30, note: "EGT margin, fuel flow, speeds — trended over many flights." },
    { k: "oil", label: "Oil analysis", x: 260, y: 30, note: "Chip detectors + SOAP reveal wear metals from bearings/gears." },
    { k: "vib", label: "Vibration", x: 40, y: 105, note: "Accelerometer spectra localise fan, spool or bearing problems." },
    { k: "bore", label: "Borescope", x: 260, y: 105, note: "Direct internal inspection confirms and locates defects." },
  ];
  return (
    <VStage pill={<PlayPill on={on} set={setOn} label="Data" />}
      label={sel ? streams.find((s) => s.k === sel).note : "On-condition maintenance builds a health picture from four streams. Correlating them — not one indicator — reveals the true condition. Click a stream."}>
      <svg viewBox="0 0 300 140" className="v-svg">
        {streams.map((s, i) => (
          <g key={s.k}>
            <line x1={s.x < 150 ? s.x + 40 : s.x - 40} y1={s.y} x2="150" y2="70" stroke="#1c3a37" strokeWidth="1.5" />
            {(() => { const f = ((t * 0.5 + i / 4) % 1); const ex = s.x < 150 ? s.x + 40 : s.x - 40; return <circle cx={ex + (150 - ex) * f} cy={s.y + (70 - s.y) * f} r="2.5" fill={accent2} />; })()}
            <g onClick={() => setSel(sel === s.k ? null : s.k)} style={{ cursor: "pointer" }}>
              <rect x={s.x - 40} y={s.y - 12} width="80" height="24" rx="6" fill={sel === s.k ? accent : "#10201e"} stroke={accent} />
              <text x={s.x} y={s.y + 4} fontSize="8" fill={sel === s.k ? "#04100e" : "#aee5dd"} textAnchor="middle">{s.label}</text>
            </g>
          </g>
        ))}
        <circle cx="150" cy="70" r="26" fill={accent} stroke={accent2} />
        <text x="150" y="67" fontSize="7.5" fill="#04100e" textAnchor="middle" fontWeight="700">ENGINE</text>
        <text x="150" y="77" fontSize="7.5" fill="#04100e" textAnchor="middle" fontWeight="700">HEALTH</text>
      </svg>
    </VStage>
  );
}

/* ══════════════ 5.2 · Ground run profile ══════════════ */
function GroundRun({ accent = "#14b8a6", accent2 = "#5eead4" }) {
  const [on, setOn] = usePlay(true);
  const t = useTick(on, 1);
  const dur = 12;
  const p = (t % dur) / dur;
  // power profile: idle → warm-up → full → stabilise → cool → shutdown
  const power = (x) => {
    if (x < 0.12) return 0.2;
    if (x < 0.3) return 0.2 + (x - 0.12) * 1.5;
    if (x < 0.55) return 1.0;
    if (x < 0.7) return 0.55;
    if (x < 0.88) return 0.55 - (x - 0.7) * 1.9;
    return 0.2;
  };
  const phase = p < 0.12 ? "idle" : p < 0.3 ? "warm-up" : p < 0.55 ? "full power" : p < 0.7 ? "stabilise" : p < 0.88 ? "cool-down" : "shut-down";
  const W = 300, x0 = 30, y0 = 110;
  const X = (x) => x0 + x * (W - 50), Y = (v) => y0 - v * 88;
  const curve = Array.from({ length: 60 }, (_, i) => `${X(i / 59)},${Y(power(i / 59))}`).join(" ");
  return (
    <VStage pill={<PlayPill on={on} set={setOn} label="Run" />}
      label={`A ground run follows a disciplined profile — warm-up, stabilise, record, cool-down — to avoid thermal shock. Current phase: ${phase}. Power ${Math.round(power(p) * 100)}%.`}>
      <svg viewBox="0 0 300 130" className="v-svg">
        <line x1={x0} y1={y0} x2={W - 14} y2={y0} stroke="#1c3a37" /><text x={W - 14} y={y0 + 13} fontSize="7" fill="#6bbab0" textAnchor="end">time</text>
        <polyline points={curve} fill="none" stroke={accent} strokeWidth="2.5" />
        <line x1={X(p)} y1="18" x2={X(p)} y2={y0} stroke="#dffbf6" strokeWidth="1.5" />
        <circle cx={X(p)} cy={Y(power(p))} r="4.5" fill="#dffbf6" stroke={accent} />
        <text x={X(p)} y="14" fontSize="7" fill={accent2} textAnchor="middle">{phase}</text>
      </svg>
    </VStage>
  );
}

/* ══════════════ 5.3 · Troubleshooting tree ══════════════ */
const SYMPTOMS = {
  vib: { label: "High vibration", causes: ["Fan imbalance (blade/ice/fouling)", "Bearing wear", "Rotor rub"] },
  egt: { label: "High EGT / low margin", causes: ["Compressor fouling", "Hot-section wear", "Bleed/vane fault"] },
  oil: { label: "Low oil pressure", causes: ["Leak", "Pump/seal wear", "Bearing debris blocking"] },
  start: { label: "Slow / hot start", causes: ["Fuel schedule fault", "Ignition weak", "Insufficient starter air"] },
};
function Troubleshoot({ accent = "#14b8a6", accent2 = "#5eead4" }) {
  const [k, setK] = useState("vib");
  const s = SYMPTOMS[k];
  return (
    <div>
      <div className="ge-top">
        <Seg accent={accent} value={k} onChange={setK} options={Object.entries(SYMPTOMS).map(([v, c]) => ({ v, label: c.label.split(" ")[0] + (c.label.includes("/") ? "…" : "") }))} />
      </div>
      <VStage label={`Structured diagnosis: symptom → possible causes → tests → confirmed fault. Symptom: “${s.label}”. Test each candidate cause to isolate the fault.`}>
        <svg viewBox="0 0 300 140" className="v-svg">
          {/* symptom node */}
          <rect x="20" y="55" width="90" height="30" rx="7" fill={accent} stroke={accent2} />
          <text x="65" y="74" fontSize="8" fill="#04100e" textAnchor="middle" fontWeight="700">{s.label}</text>
          {s.causes.map((c, i) => {
            const y = 25 + i * 40;
            return (
              <g key={i}>
                <line x1="110" y1="70" x2="150" y2={y + 13} stroke="#1c3a37" strokeWidth="1.5" />
                <rect x="150" y={y} width="140" height="26" rx="6" fill="#10201e" stroke={accent} />
                <text x="158" y={y + 16} fontSize="7.5" fill="#aee5dd">{c}</text>
              </g>
            );
          })}
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 5.5 · EGT margin trend ══════════════ */
function TrendMonitor({ accent = "#14b8a6", accent2 = "#5eead4" }) {
  const [washAt, setWashAt] = useState(0); // 0 = no wash, else flight index
  const N = 40;
  const margin = (i) => {
    let m = 60 - i * 0.7; // steady fouling decline
    if (washAt && i >= washAt) m += Math.min(18, (i - washAt) * 0 + 18); // wash recovers ~18
    return Math.max(5, m);
  };
  const W = 300, x0 = 34, y0 = 112;
  const X = (i) => x0 + (i / (N - 1)) * (W - 48), Y = (m) => y0 - (m / 65) * 92;
  const pts = Array.from({ length: N }, (_, i) => `${X(i)},${Y(margin(i))}`).join(" ");
  return (
    <div>
      <div className="ge-top">
        <Seg accent={accent} value={washAt ? "w" : "n"} onChange={(v) => setWashAt(v === "w" ? 24 : 0)} options={[{ v: "n", label: "No wash" }, { v: "w", label: "Wash @ flight 24" }]} />
      </div>
      <VStage label={washAt ? "The EGT margin recovered after the wash — so the loss was fouling, not hot-section wear. A wash-recoverable trend is diagnostic as well as restorative." : "EGT margin drifts down over many flights. Is it fouling (wash-recoverable) or real wear? Trend monitoring — and the wash response — tells you."}>
        <svg viewBox="0 0 300 130" className="v-svg">
          <line x1={x0} y1={y0} x2={W - 14} y2={y0} stroke="#1c3a37" /><text x={W - 14} y={y0 + 13} fontSize="7" fill="#6bbab0" textAnchor="end">flights</text>
          <text x={x0} y="14" fontSize="7" fill="#6bbab0">EGT margin °C</text>
          {/* threshold */}
          <line x1={x0} y1={Y(15)} x2={W - 14} y2={Y(15)} stroke="#ff5722" strokeDasharray="3 3" opacity="0.6" /><text x={x0 + 4} y={Y(15) - 3} fontSize="6.5" fill="#ff5722">action threshold</text>
          <polyline points={pts} fill="none" stroke={accent} strokeWidth="2.5" />
          {washAt && <><line x1={X(washAt)} y1="18" x2={X(washAt)} y2={y0} stroke={accent2} strokeDasharray="2 2" /><text x={X(washAt)} y="15" fontSize="6.5" fill={accent2} textAnchor="middle">wash</text></>}
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 5.6 · Oil wear-metal analysis ══════════════ */
function OilAnalysis({ accent = "#14b8a6", accent2 = "#5eead4" }) {
  const [hours, setHours] = useState(30);
  const metals = [
    { k: "Fe", label: "Iron", base: 4, rate: 0.9, part: "gears / shafts" },
    { k: "Cr", label: "Chromium", base: 2, rate: 0.3, part: "bearings" },
    { k: "Ni", label: "Nickel", base: 1.5, rate: 0.25, part: "turbine" },
    { k: "Ag", label: "Silver", base: 0.5, rate: hours > 60 ? 1.4 : 0.1, part: "plated bearing" },
    { k: "Cu", label: "Copper", base: 1, rate: 0.2, part: "bushings" },
  ];
  const vals = metals.map((m) => +(m.base + (hours / 100) * m.rate * 100 / 10).toFixed(1));
  const alarm = metals.map((m, i) => vals[i] > 12);
  const worst = alarm.findIndex(Boolean);
  return (
    <div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Hours since overhaul</label>
        <input type="range" min="0" max="100" value={hours} onChange={(e) => setHours(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: accent }}>{hours * 40}h</span>
      </div>
      <VStage label={worst >= 0 ? `${metals[worst].label} is rising sharply — pointing to the ${metals[worst].part}. A jump in one wear metal localises the wearing component.` : "Spectrometric oil analysis (SOAP) tracks wear metals. Each alloy points to a component; a rising trend flags incipient wear before failure."}>
        <svg viewBox="0 0 300 130" className="v-svg">
          <line x1="30" y1="105" x2="290" y2="105" stroke="#1c3a37" />
          <line x1="30" y1={105 - 12 * 6.5} x2="290" y2={105 - 12 * 6.5} stroke="#ff5722" strokeDasharray="3 3" opacity="0.5" /><text x="34" y={105 - 12 * 6.5 - 3} fontSize="6.5" fill="#ff5722">alarm</text>
          {metals.map((m, i) => {
            const h = Math.min(90, vals[i] * 6.5);
            return (
              <g key={m.k} transform={`translate(${44 + i * 50},0)`}>
                <rect x="0" y={105 - h} width="30" height={h} rx="4" fill={alarm[i] ? "#ff5722" : accent} opacity="0.9" />
                <text x="15" y="118" fontSize="7.5" fill="#aee5dd" textAnchor="middle">{m.k}</text>
                <text x="15" y={105 - h - 3} fontSize="6.5" fill={alarm[i] ? "#ff5722" : accent2} textAnchor="middle">{vals[i]}</text>
              </g>
            );
          })}
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 5.8 · Borescope inspection ══════════════ */
function Borescope({ accent = "#14b8a6", accent2 = "#5eead4" }) {
  const [on, setOn] = usePlay(true);
  const [defect, setDefect] = useState(true);
  const t = useTick(on, 0.4);
  const bladeAng = (t * 40) % 45; // rotor slowly turning
  return (
    <div>
      <div className="ge-top">
        <Seg accent={accent} value={defect ? "d" : "c"} onChange={(v) => setDefect(v === "d")} options={[{ v: "c", label: "Clean" }, { v: "d", label: "Defect present" }]} />
        <PlayPill on={on} set={setOn} label="Rotate" />
      </div>
      <VStage label={defect ? "A borescope reveals internal defects without teardown — here a nick on a compressor blade. It is measured against the manual's limits and logged." : "The borescope view of a healthy blade row, inspected blade-by-blade by turning the rotor through the access port."}>
        <svg viewBox="0 0 300 130" className="v-svg">
          {/* scope circular field */}
          <circle cx="150" cy="65" r="55" fill="#04100e" stroke={accent} strokeWidth="2" />
          <clipPath id="scopeClip"><circle cx="150" cy="65" r="53" /></clipPath>
          <g clipPath="url(#scopeClip)">
            {/* blades */}
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i * 45 + bladeAng) * Math.PI / 180;
              const x = 150 + Math.cos(a) * 30, y = 65 + Math.sin(a) * 30;
              return <g key={i} transform={`translate(${x},${y}) rotate(${i * 45 + bladeAng})`}>
                <rect x="-4" y="-22" width="8" height="40" rx="3" fill="#173a35" stroke={accent} opacity="0.8" />
                {defect && i === 2 && <path d="M4 -6 l5 2 l-5 3" fill="none" stroke="#ff5722" strokeWidth="1.6" />}
              </g>;
            })}
            <circle cx="150" cy="65" r="10" fill="#0a1a18" stroke={accent} />
          </g>
          {/* crosshair + reticle */}
          <line x1="150" y1="14" x2="150" y2="24" stroke={accent2} /><line x1="150" y1="106" x2="150" y2="116" stroke={accent2} />
          {defect && <><circle cx="172" cy="56" r="9" fill="none" stroke="#ff5722" /><text x="200" y="40" fontSize="7" fill="#ff5722">nick — measure vs limit</text></>}
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 5.9 · Inspection standards ══════════════ */
function InspectionStandards({ accent = "#14b8a6", accent2 = "#5eead4" }) {
  const [size, setSize] = useState(0.4); // defect size mm
  const disp = size < 0.6 ? "Serviceable" : size < 1.6 ? "Repairable" : "Reject";
  const col = disp === "Serviceable" ? "#22c55e" : disp === "Repairable" ? "#f59e0b" : "#ff5722";
  return (
    <div>
      <div className="ge-thr" style={{ marginBottom: 8 }}>
        <label>Defect size</label>
        <input type="range" min="0.1" max="2.5" step="0.05" value={size} onChange={(e) => setSize(+e.target.value)} style={{ accentColor: accent }} />
        <span style={{ color: col }}>{size.toFixed(2)} mm</span>
      </div>
      <VStage label={`Manual limits turn a measurement into a disposition. At ${size.toFixed(2)} mm this defect is: ${disp}. Within limits → serviceable; beyond → repair; past repair → reject.`}>
        <svg viewBox="0 0 300 100" className="v-svg">
          {/* bands */}
          <rect x="30" y="40" width="90" height="22" fill="#22c55e" opacity="0.25" /><text x="75" y="55" fontSize="8" fill="#22c55e" textAnchor="middle">Serviceable</text>
          <rect x="120" y="40" width="100" height="22" fill="#f59e0b" opacity="0.25" /><text x="170" y="55" fontSize="8" fill="#f59e0b" textAnchor="middle">Repairable</text>
          <rect x="220" y="40" width="60" height="22" fill="#ff5722" opacity="0.25" /><text x="250" y="55" fontSize="8" fill="#ff5722" textAnchor="middle">Reject</text>
          {/* pointer */}
          {(() => { const x = 30 + (size / 2.5) * 250; return <><line x1={x} y1="30" x2={x} y2="72" stroke={col} strokeWidth="2" /><circle cx={x} cy="30" r="4" fill={col} /></>; })()}
          <text x="150" y="90" fontSize="7.5" fill={col} textAnchor="middle" fontWeight="700">→ {disp}</text>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 5.10 · Compressor wash ══════════════ */
function CompressorWash({ accent = "#14b8a6", accent2 = "#5eead4" }) {
  const [on, setOn] = usePlay(true);
  const [washing, setWashing] = useState(false);
  const t = useTick(on, 1);
  // fouling accumulates unless washing
  const clean = washing ? Math.min(1, (t % 4) / 2) : 0.15;
  const margin = Math.round(20 + clean * 40);
  return (
    <div>
      <div className="ge-top">
        <Seg accent={accent} value={washing ? "w" : "f"} onChange={(v) => setWashing(v === "w")} options={[{ v: "f", label: "Fouled" }, { v: "w", label: "Washing" }]} />
        <PlayPill on={on} set={setOn} label="Spray" />
      </div>
      <VStage label={washing ? `Washing removes salt/dust fouling — compressor efficiency recovers and EGT margin climbs back to ${margin}°C. A cheap, effective performance recovery.` : "Fouling coats the blades, cutting efficiency and eating EGT margin. Switch to washing to recover the lost performance."}>
        <svg viewBox="0 0 300 120" className="v-svg">
          {/* blades, colour = cleanliness */}
          {Array.from({ length: 9 }).map((_, i) => {
            const c = washing ? (i < clean * 9 ? accent2 : "#3a3320") : "#3a3320";
            return <rect key={i} x={40 + i * 24} y="35" width="12" height="46" rx="3" fill={c} stroke={accent} opacity="0.9" />;
          })}
          {/* wash spray */}
          {washing && Array.from({ length: 8 }).map((_, i) => {
            const f = ((t * 0.9 + i / 8) % 1);
            return <circle key={i} cx={40 + f * 220} cy={45 + (i % 3) * 12} r="1.8" fill="#7fd4e0" opacity={1 - f * 0.4} />;
          })}
          {/* margin bar */}
          <text x="20" y="104" fontSize="8" fill="#6bbab0">EGT margin</text>
          <rect x="90" y="97" width="180" height="9" rx="4.5" fill="#10201e" />
          <rect x="90" y="97" width={(margin / 60) * 180} height="9" rx="4.5" fill={accent} />
          <text x="274" y="105" fontSize="8" fill={accent} textAnchor="end">{margin}°</text>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 5.11 · FOD ══════════════ */
function Fod({ accent = "#14b8a6", accent2 = "#5eead4" }) {
  const [on, setOn] = usePlay(true);
  const [prevent, setPrevent] = useState(false);
  const t = useTick(on, 1);
  return (
    <div>
      <div className="ge-top">
        <Seg accent={accent} value={prevent ? "p" : "r"} onChange={(v) => setPrevent(v === "p")} options={[{ v: "r", label: "Unprotected" }, { v: "p", label: "FOD discipline" }]} />
        <PlayPill on={on} set={setOn} label="Run" />
      </div>
      <VStage label={prevent ? "FOD discipline — FOD walks, inlet covers, tool control — keeps debris out of the intake. Prevention is a culture, not a device." : "Ramp debris, birds and ice get ingested and strike the fast blades — nicks, cracks, even liberated blades. Switch on FOD discipline to prevent it."}>
        <svg viewBox="0 0 300 120" className="v-svg">
          {/* intake */}
          <path d="M170 30 Q150 60 170 90 L250 80 L250 40 Z" fill="#10201e" stroke={accent} />
          {/* fan */}
          <g transform="translate(180,60)">
            {Array.from({ length: 8 }).map((_, i) => <rect key={i} x="-1.5" y="-24" width="3" height="24" rx="1.5" fill={accent2} transform={`rotate(${(t * 200 + i * 45) % 360})`} />)}
          </g>
          {/* debris */}
          {!prevent && Array.from({ length: 4 }).map((_, i) => {
            const f = ((t * 0.5 + i / 4) % 1);
            return <g key={i}><rect x={30 + f * 130} y={45 + i * 8} width="5" height="4" fill="#b8968a" transform={`rotate(${f * 180} ${32 + f * 130} ${47 + i * 8})`} /></g>;
          })}
          {/* damaged blade / protected */}
          {!prevent
            ? <text x="180" y="108" fontSize="7.5" fill="#ff5722" textAnchor="middle">✗ blade nicks, cracks, FOD damage</text>
            : <><path d="M40 45 h80 v30 h-80 z" fill="none" stroke={accent} strokeDasharray="4 3" opacity="0.5" /><text x="80" y="63" fontSize="7" fill={accent2} textAnchor="middle">inlet cover</text><text x="180" y="108" fontSize="7.5" fill={accent} textAnchor="middle">✓ intake protected</text></>}
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
  // Unit II — construction
  InletDuct,
  InletConfig,
  CompressorTypes,
  IceProtection,
  FanBalance,
  StallSurge,
  AirflowControl,
  Combustor,
  TurbineStage,
  CreepStress,
  Nozzle,
  ThrustReverser,
  // Unit III — fuel, ignition & starting
  FuelSystem,
  FuelMetering,
  FadecLoop,
  StartSequence,
  StarterTypes,
  Ignition,
  SafetyZones,
  SystemReview,
  // Unit IV — indication & power augmentation
  EgtGauge,
  EprGauge,
  OilFuelGauge,
  EngineGaugeCluster,
  SpeedGauge,
  VibMonitor,
  TorqueGauge,
  AugmentOverview,
  WaterInjection,
  Afterburner,
  // Unit V — monitoring & ground operation
  HealthOverview,
  GroundRun,
  Troubleshoot,
  TrendMonitor,
  OilAnalysis,
  Borescope,
  InspectionStandards,
  CompressorWash,
  Fod,
};

export function Visual({ visual, accent, accent2, session }) {
  const key = visual || session?.visual;
  const C = VISUALS[key] || Placeholder;
  return <C accent={accent || session?.accent} accent2={accent2 || session?.accent2} session={session} />;
}
