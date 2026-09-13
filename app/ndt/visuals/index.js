"use client";
/* NDT Learning Bay — bespoke interactive visuals, one per session.
 * Each component is self-contained and receives { accent, accent2, session }.
 * VISUALS maps a session's `visual` key to its component; missing keys fall
 * back to a styled Placeholder so the platform is always navigable. */
import { useState, useEffect, useRef } from "react";

/* ── shared bits ── */
function VStage({ children, label }) {
  return (
    <div className="v-stage">
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

/* ══════════════ 1.1 · Destructive vs Non-Destructive ══════════════ */
function IntroTesting({ accent, accent2 }) {
  const [mode, setMode] = useState("ndt");
  const [t, setT] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    setT(0); let start;
    const loop = (ts) => { start ??= ts; setT(Math.min(1, (ts - start) / 1800)); if (ts - start < 1800) raf.current = requestAnimationFrame(loop); };
    raf.current = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf.current);
  }, [mode]);
  const break_ = mode === "dt" ? t : 0;
  const scanX = mode === "ndt" ? 40 + t * 220 : -100;
  const neck = 1 - break_ * 0.5, gap = break_ > 0.75 ? (break_ - 0.75) * 120 : 0;
  return (
    <div>
      <Seg accent={accent} value={mode} onChange={setMode} options={[{ v: "ndt", label: "Non-Destructive" }, { v: "dt", label: "Destructive" }]} />
      <VStage label={mode === "ndt" ? "The part is scanned and stays fit for service — the flaw is found, the component keeps flying." : "A specimen is loaded to failure to measure bulk strength — the sample is consumed."}>
        <svg viewBox="0 0 320 160" className="v-svg">
          <defs>
            <linearGradient id="bar1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cbd5e1" /><stop offset="1" stopColor="#94a3b8" /></linearGradient>
          </defs>
          {/* specimen bar */}
          <g transform="translate(160,80)">
            <rect x={-90 - gap} y={-16 * neck} width={90} height={32 * neck} rx="3" fill="url(#bar1)" stroke="#64748b" />
            <rect x={gap} y={-16 * neck} width={90} height={32 * neck} rx="3" fill="url(#bar1)" stroke="#64748b" />
            {/* internal flaw (only meaningful in NDT) */}
            <ellipse cx={-14} cy={0} rx="9" ry="4" fill={mode === "ndt" && scanX > 130 ? "#ef4444" : "#7f1420"} opacity={mode === "ndt" ? 0.9 : 0.5} />
            {mode === "dt" && break_ > 0.75 && <text x="0" y="-30" textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="700">FRACTURE</text>}
          </g>
          {/* grips */}
          <rect x="20" y="60" width="18" height="40" rx="3" fill="#334155" />
          <rect x="282" y="60" width="18" height="40" rx="3" fill="#334155" />
          {/* NDT scanner */}
          {mode === "ndt" && (
            <g transform={`translate(${scanX},44)`}>
              <rect x="-14" y="-14" width="28" height="16" rx="3" fill={accent} />
              <path d="M -12 4 L 12 4 L 6 20 L -6 20 Z" fill={accent2} opacity="0.35" />
              <line x1="0" y1="4" x2="0" y2="36" stroke={accent2} strokeWidth="1.5" strokeDasharray="3 3" />
            </g>
          )}
        </svg>
      </VStage>
      <div className="v-row">
        <div className="v-fact"><b style={{ color: accent }}>{mode === "ndt" ? "100%" : "1 sample"}</b><span>{mode === "ndt" ? "of parts inspectable" : "consumed per test"}</span></div>
        <div className="v-fact"><b style={{ color: accent }}>{mode === "ndt" ? "Repeatable" : "One-shot"}</b><span>{mode === "ndt" ? "re-inspect in service" : "destroys the specimen"}</span></div>
        <div className="v-fact"><b style={{ color: accent }}>{mode === "ndt" ? "Flaw-focused" : "Bulk property"}</b><span>{mode === "ndt" ? "finds the defect" : "strength / ductility"}</span></div>
      </div>
    </div>
  );
}

/* ══════════════ 1.2 · NDT vs Mechanical (attribute compare) ══════════════ */
function NdtVsMech({ accent }) {
  const rows = [
    { k: "Specimen", mech: "Separate sample, destroyed", ndt: "The real part, unharmed" },
    { k: "Coverage", mech: "Statistical, few samples", ndt: "Up to 100% of parts" },
    { k: "Repeatable?", mech: "No — one-shot", ndt: "Yes — re-inspect in service" },
    { k: "Measures", mech: "Bulk strength & ductility", ndt: "Flaws, geometry, properties" },
    { k: "When", mech: "Material qualification", ndt: "Manufacturing → in-service" },
  ];
  const [hi, setHi] = useState(null);
  return (
    <VStage label="Destructive tests qualify a material by breaking a sample; NDT keeps the part and hunts the flaw. Hover a row.">
      <div className="v-compare">
        <div className="v-compare-h"><span /><span className="mech">Destructive</span><span className="ndtc" style={{ color: accent }}>Non-Destructive</span></div>
        {rows.map((r, i) => (
          <div key={r.k} className={"v-compare-r" + (hi === i ? " hi" : "")} onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(null)}>
            <span className="k">{r.k}</span><span className="mech">{r.mech}</span><span className="ndtc">{r.ndt}</span>
          </div>
        ))}
      </div>
    </VStage>
  );
}

/* ══════════════ 1.3 · The six NDT methods (interactive map) ══════════════ */
const METHODS = [
  { id: "VT", name: "Visual", energy: "Light", depth: "surface", d: "The eye (aided or unaided) finds visible surface flaws.", ic: "👁" },
  { id: "PT", name: "Liquid Penetrant", energy: "Dye + capillarity", depth: "surface", d: "Dye seeps into surface-breaking cracks and is drawn back out.", ic: "💧" },
  { id: "MT", name: "Magnetic Particle", energy: "Magnetic field", depth: "surface", d: "Leakage fields at cracks gather iron particles.", ic: "🧲" },
  { id: "ET", name: "Eddy Current", energy: "Induced current", depth: "surface", d: "Cracks disturb induced eddy currents in conductors.", ic: "🌀" },
  { id: "UT", name: "Ultrasonic", energy: "Sound waves", depth: "volumetric", d: "Sound pulses echo off internal flaws.", ic: "〰" },
  { id: "RT", name: "Radiography", energy: "X / γ rays", depth: "volumetric", d: "Radiation casts a shadow image of internal structure.", ic: "☢" },
];
function MethodMap({ accent, accent2 }) {
  const [sel, setSel] = useState("UT");
  const [filter, setFilter] = useState("all");
  const m = METHODS.find((x) => x.id === sel);
  return (
    <div>
      <Seg accent={accent} value={filter} onChange={setFilter} options={[{ v: "all", label: "All six" }, { v: "surface", label: "Surface" }, { v: "volumetric", label: "Volumetric" }]} />
      <div className="v-methods">
        {METHODS.map((x) => {
          const dim = filter !== "all" && x.depth !== filter;
          return (
            <button key={x.id} className={"v-method" + (sel === x.id ? " on" : "") + (dim ? " dim" : "")}
              onClick={() => setSel(x.id)} style={sel === x.id ? { borderColor: accent, boxShadow: `0 0 0 2px ${accent}44` } : undefined}>
              <span className="mi">{x.ic}</span><b>{x.id}</b><small>{x.name}</small>
              <span className={"mdepth " + x.depth}>{x.depth === "surface" ? "surface" : "volumetric"}</span>
            </button>
          );
        })}
      </div>
      <VStage label={`${m.name} testing · probing energy: ${m.energy}`}>
        <div className="v-methoddetail" style={{ borderColor: accent + "55" }}>
          <span className="big" style={{ color: accent }}>{m.ic} {m.id}</span>
          <p>{m.d}</p>
          <span className={"mdepth " + m.depth}>{m.depth === "surface" ? "Surface & near-surface" : "Volumetric (through the part)"}</span>
        </div>
      </VStage>
    </div>
  );
}

/* ══════════════ 1.9 · Visual inspection — defect hunt ══════════════ */
function VisualInspect({ accent }) {
  const flaws = [
    { x: 70, y: 55, r: 8, aided: false, label: "Surface crack" },
    { x: 210, y: 40, r: 6, aided: false, label: "Corrosion pit" },
    { x: 150, y: 110, r: 5, aided: true, label: "Hairline crack" },
    { x: 255, y: 95, r: 4, aided: true, label: "Fastener fretting" },
  ];
  const [tool, setTool] = useState("unaided");
  const [found, setFound] = useState([]);
  const visible = (f) => tool === "aided" || !f.aided;
  const hit = (i) => { if (!found.includes(i)) setFound([...found, i]); };
  const total = flaws.length, aidedNeeded = flaws.filter((f) => f.aided).length;
  return (
    <div>
      <Seg accent={accent} value={tool} onChange={setTool} options={[{ v: "unaided", label: "👁 Unaided eye" }, { v: "aided", label: "🔍 Aided (borescope)" }]} />
      <VStage label={`Found ${found.length} / ${total}. ${tool === "unaided" ? `${aidedNeeded} fine flaws need the aided tool.` : "Magnification reveals the hairline flaws."}`}>
        <svg viewBox="0 0 320 150" className="v-svg v-hunt">
          <rect x="8" y="8" width="304" height="134" rx="6" fill="#e7ecf2" stroke="#94a3b8" />
          {/* panel rivets */}
          {[30, 70, 110, 150, 190, 230, 270].map((x) => <circle key={x} cx={x} cy="20" r="2.4" fill="#94a3b8" />)}
          {[30, 70, 110, 150, 190, 230, 270].map((x) => <circle key={x + "b"} cx={x} cy="130" r="2.4" fill="#94a3b8" />)}
          {flaws.map((f, i) => visible(f) && (
            <g key={i} onClick={() => hit(i)} style={{ cursor: "pointer" }}>
              <circle cx={f.x} cy={f.y} r={f.r + 6} fill="transparent" />
              {found.includes(i)
                ? <g><circle cx={f.x} cy={f.y} r={f.r + 4} fill="none" stroke={accent} strokeWidth="2" /><text x={f.x} y={f.y - f.r - 8} textAnchor="middle" fontSize="8" fill={accent} fontWeight="700">{f.label}</text></g>
                : <path d={`M ${f.x - f.r} ${f.y} q ${f.r} ${-f.r * 0.7} ${f.r * 2} 0`} fill="none" stroke="#b91c1c" strokeWidth="1.6" opacity={f.aided ? 0.6 : 0.9} />}
            </g>
          ))}
        </svg>
      </VStage>
      {found.length === total && <div className="v-win" style={{ color: accent }}>✓ All flaws found — note the fine ones only appeared with the aided tool.</div>}
    </div>
  );
}

/* ══════════════ 1.4 · Manufacturing defect gallery ══════════════ */
const DEFECTS = [
  { id: "porosity", name: "Porosity", where: "Welds · castings", depth: "volumetric", d: "Gas trapped during solidification — rounded voids. Best seen by radiography.",
    svg: (c) => <g>{[[60, 40], [78, 52], [66, 62], [92, 44], [104, 58]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3 + (i % 3)} fill={c} opacity="0.85" />)}</g> },
  { id: "crack", name: "Crack", where: "Any process", depth: "surface", d: "A tight planar separation. Surface cracks → PT/MT; internal → UT (reflects off the flat face).",
    svg: (c) => <path d="M 40 30 L 62 46 L 58 60 L 84 66 L 100 54" fill="none" stroke={c} strokeWidth="2" /> },
  { id: "fusion", name: "Lack of fusion", where: "Welds", depth: "volumetric", d: "Weld metal never bonded to the base — a flat planar flaw. UT finds it; RT can miss it edge-on.",
    svg: (c) => <path d="M 44 34 L 44 62 M 44 48 L 100 48" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" /> },
  { id: "inclusion", name: "Inclusion", where: "Welds · castings", depth: "volumetric", d: "Foreign matter (slag, oxide) embedded in the metal. Shows on radiography.",
    svg: (c) => <g><rect x="58" y="42" width="10" height="7" rx="2" fill={c} /><rect x="78" y="52" width="8" height="6" rx="2" fill={c} opacity="0.8" /></g> },
  { id: "lamination", name: "Lamination", where: "Rolled plate", depth: "volumetric", d: "A flat separation parallel to the surface, from rolled stock. UT straight-beam detects it.",
    svg: (c) => <line x1="40" y1="48" x2="104" y2="48" stroke={c} strokeWidth="3" /> },
  { id: "shrinkage", name: "Shrinkage", where: "Castings", depth: "volumetric", d: "Cavities from uneven solidification in thick sections. Radiography / CT reveal it.",
    svg: (c) => <path d="M 62 40 Q 72 34 84 40 Q 90 50 82 58 Q 70 64 60 56 Q 54 48 62 40 Z" fill="none" stroke={c} strokeWidth="1.6" /> },
];
function DefectGallery({ accent }) {
  const [sel, setSel] = useState("porosity");
  const d = DEFECTS.find((x) => x.id === sel);
  return (
    <div>
      <div className="v-chips">
        {DEFECTS.map((x) => <button key={x.id} className={"v-chip" + (sel === x.id ? " on" : "")} onClick={() => setSel(x.id)} style={sel === x.id ? { borderColor: accent, color: accent } : undefined}>{x.name}</button>)}
      </div>
      <VStage label={`${d.name} · ${d.where} · ${d.depth === "surface" ? "surface-breaking" : "internal / volumetric"} — ${d.d}`}>
        <svg viewBox="0 0 144 92" className="v-svg" style={{ maxWidth: 340 }}>
          <rect x="8" y="20" width="128" height="52" rx="3" fill="#cbd5e1" stroke="#64748b" />
          <line x1="72" y1="20" x2="72" y2="72" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="2 2" />
          {d.svg(accent)}
          <text x="72" y="86" textAnchor="middle" fontSize="7" fill="#94a3b8">cross-section of a part</text>
        </svg>
      </VStage>
      <div className="v-tagline"><span className={"mdepth " + d.depth}>{d.depth === "surface" ? "Surface method (PT/MT)" : "Volumetric method (RT/UT)"}</span></div>
    </div>
  );
}

/* ══════════════ 1.5 · Corrosion thickness trend ══════════════ */
function MaterialChar({ accent }) {
  const [insp, setInsp] = useState(3);
  const start = 6.0, minLimit = 4.0, rate = 0.28; // mm, mm/inspection
  const readings = Array.from({ length: 7 }, (_, i) => +(start - rate * i).toFixed(2));
  const cur = readings[insp];
  const remaining = Math.max(0, Math.floor((cur - minLimit) / rate));
  const W = 300, H = 130, pad = 26;
  const x = (i) => pad + (i / 6) * (W - pad * 2);
  const y = (v) => H - pad - ((v - 3.5) / (6.2 - 3.5)) * (H - pad * 2);
  return (
    <div>
      <VStage label={`Inspection #${insp}: wall = ${cur} mm. Minimum allowed = ${minLimit} mm. At this corrosion rate, ~${remaining} inspections of safe life remain.`}>
        <svg viewBox={`0 0 ${W} ${H}`} className="v-svg" style={{ maxWidth: 420 }}>
          <line x1={pad} y1={y(minLimit)} x2={W - pad} y2={y(minLimit)} stroke="#dc2626" strokeWidth="1.2" strokeDasharray="4 3" />
          <text x={W - pad} y={y(minLimit) - 4} textAnchor="end" fontSize="8" fill="#dc2626">min {minLimit}mm</text>
          <polyline points={readings.slice(0, insp + 1).map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke={accent} strokeWidth="2" />
          {readings.slice(0, insp + 1).map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={i === insp ? 4 : 2.5} fill={accent} />)}
          <text x={pad} y={H - 8} fontSize="8" fill="#94a3b8">new</text>
          <text x={W - pad} y={H - 8} textAnchor="end" fontSize="8" fill="#94a3b8">inspections →</text>
        </svg>
      </VStage>
      <div className="v-slider"><span>Inspection</span><input type="range" min="1" max="6" value={insp} onChange={(e) => setInsp(+e.target.value)} style={{ accentColor: accent }} /><b>#{insp}</b></div>
      <div className="v-row">
        <div className="v-fact"><b style={{ color: accent }}>{cur} mm</b><span>measured wall</span></div>
        <div className="v-fact"><b style={{ color: cur <= minLimit ? "#dc2626" : accent }}>{(cur - minLimit).toFixed(2)} mm</b><span>margin left</span></div>
        <div className="v-fact"><b style={{ color: accent }}>{remaining}</b><span>inspections of life</span></div>
      </div>
    </div>
  );
}

/* ══════════════ 1.6 · Cost of failure vs inspection ══════════════ */
function MeritsScale({ accent }) {
  const [mode, setMode] = useState("ndt");
  const ndt = mode === "ndt";
  return (
    <div>
      <Seg accent={accent} value={mode} onChange={setMode} options={[{ v: "ndt", label: "With scheduled NDT" }, { v: "none", label: "Run to failure" }]} />
      <VStage label={ndt ? "A planned inspection costs a little time and finds the flaw early — the part is repaired or replaced on your terms." : "Skipping inspection risks unplanned failure: secondary damage, an aircraft on ground, investigation — orders of magnitude more costly."}>
        <svg viewBox="0 0 300 150" className="v-svg" style={{ maxWidth: 400 }}>
          <line x1="150" y1="20" x2="150" y2="120" stroke="#64748b" strokeWidth="2" />
          <polygon points="140,120 160,120 150,132" fill="#64748b" />
          <g transform={`translate(0, ${ndt ? -12 : 12})`}>
            <line x1="150" y1="30" x2="70" y2="30" stroke="#64748b" strokeWidth="1.5" />
            <rect x="40" y="30" width="60" height="34" rx="4" fill={accent} opacity={ndt ? 1 : 0.4} />
            <text x="70" y="50" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="700">Inspection</text>
            <text x="70" y="60" textAnchor="middle" fontSize="7" fill="#fff">low cost</text>
          </g>
          <g transform={`translate(0, ${ndt ? 12 : -12})`}>
            <line x1="150" y1="30" x2="230" y2="30" stroke="#64748b" strokeWidth="1.5" />
            <rect x="200" y="30" width="60" height={ndt ? 34 : 52} rx="4" fill="#dc2626" opacity={ndt ? 0.4 : 1} />
            <text x="230" y="50" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="700">Failure</text>
            <text x="230" y="60" textAnchor="middle" fontSize="7" fill="#fff">{ndt ? "avoided" : "huge cost"}</text>
          </g>
        </svg>
      </VStage>
      <div className="v-row">
        <div className="v-fact"><b style={{ color: accent }}>{ndt ? "Planned" : "Reactive"}</b><span>{ndt ? "maintenance on your terms" : "AOG, secondary damage"}</span></div>
        <div className="v-fact"><b style={{ color: accent }}>{ndt ? "Reused" : "Lost"}</b><span>{ndt ? "good parts kept in service" : "part + downstream damage"}</span></div>
        <div className="v-fact"><b style={{ color: accent }}>{ndt ? "Documented" : "Investigated"}</b><span>{ndt ? "evidence for regulators" : "after the fact"}</span></div>
      </div>
    </div>
  );
}

/* ══════════════ 1.7 · Flaw orientation & detectability ══════════════ */
function LimitsRadar({ accent }) {
  const [ang, setAng] = useState(0); // 0 = facing beam (best), 90 = edge-on (worst)
  const det = Math.round(Math.cos((ang * Math.PI) / 180) * 100);
  const rad = (ang * Math.PI) / 180;
  const cx = 150, cy = 95, L = 34;
  const dx = Math.cos(rad) * L, dy = Math.sin(rad) * L;
  const col = det > 66 ? "#22c55e" : det > 33 ? "#eab308" : "#dc2626";
  return (
    <div>
      <VStage label={`Crack at ${ang}° to the beam. Detectability ≈ ${det}%. A crack facing the beam reflects strongly; edge-on it nearly vanishes — orientation can matter more than size.`}>
        <svg viewBox="0 0 300 150" className="v-svg" style={{ maxWidth: 400 }}>
          <rect x="30" y="70" width="240" height="60" rx="3" fill="#cbd5e1" stroke="#64748b" />
          {/* UT probe + beam from top */}
          <rect x="138" y="18" width="24" height="12" rx="2" fill={accent} />
          <line x1="150" y1="30" x2="150" y2="70" stroke={accent} strokeWidth="2" strokeDasharray="3 3" />
          <polygon points="146,64 154,64 150,72" fill={accent} />
          {/* crack at angle, centred in the block */}
          <line x1={cx - dx} y1={cy - dy} x2={cx + dx} y2={cy + dy} stroke={col} strokeWidth="4" strokeLinecap="round" />
          {/* echo strength bar */}
          <rect x="30" y="140" width="240" height="6" rx="3" fill="#e2e8f0" />
          <rect x="30" y="140" width={2.4 * det} height="6" rx="3" fill={col} />
        </svg>
      </VStage>
      <div className="v-slider"><span>Crack angle</span><input type="range" min="0" max="90" value={ang} onChange={(e) => setAng(+e.target.value)} style={{ accentColor: accent }} /><b>{ang}°</b></div>
      <div className="v-tagline"><span style={{ color: col, fontWeight: 700 }}>{det > 66 ? "Strong echo — reliably detected" : det > 33 ? "Weak echo — may be missed" : "Near-invisible to this beam"}</span></div>
    </div>
  );
}

/* ══════════════ 1.8 · Material → method matrix ══════════════ */
const MATERIALS = [
  { id: "al", name: "Aluminium", ferro: false, cond: true, methods: { MT: false, ET: true, UT: true, RT: true } },
  { id: "ti", name: "Titanium", ferro: false, cond: true, methods: { MT: false, ET: true, UT: true, RT: true } },
  { id: "steel", name: "Steel", ferro: true, cond: true, methods: { MT: true, ET: true, UT: true, RT: true } },
  { id: "cfrp", name: "Composite", ferro: false, cond: false, methods: { MT: false, ET: false, UT: true, RT: true } },
];
function MaterialProps({ accent }) {
  const [sel, setSel] = useState("steel");
  const m = MATERIALS.find((x) => x.id === sel);
  const props = [{ k: "Ferromagnetic", v: m.ferro }, { k: "Conductive", v: m.cond }];
  const methodInfo = { MT: "Magnetic Particle", ET: "Eddy Current", UT: "Ultrasonic", RT: "Radiography" };
  return (
    <div>
      <div className="v-chips">
        {MATERIALS.map((x) => <button key={x.id} className={"v-chip" + (sel === x.id ? " on" : "")} onClick={() => setSel(x.id)} style={sel === x.id ? { borderColor: accent, color: accent } : undefined}>{x.name}</button>)}
      </div>
      <VStage label={`${m.name}: its physical properties decide the toolbox — a method lights up only if the physics allows it.`}>
        <div className="v-matrix">
          <div className="v-mprops">
            {props.map((p) => <div key={p.k} className={"v-mprop" + (p.v ? " yes" : "")}><span className="dot" style={p.v ? { background: accent } : undefined} />{p.k}</div>)}
          </div>
          <div className="v-mmethods">
            {Object.keys(m.methods).map((k) => (
              <div key={k} className={"v-mmethod" + (m.methods[k] ? " on" : "")} style={m.methods[k] ? { borderColor: accent, color: accent } : undefined}>
                <b>{k}</b><small>{methodInfo[k]}</small><span>{m.methods[k] ? "✓ viable" : "✗ can't"}</span>
              </div>
            ))}
          </div>
        </div>
      </VStage>
    </div>
  );
}

/* ── polished fallback for sessions whose bespoke visual isn't built yet ── */
function Placeholder({ accent, session }) {
  return (
    <VStage label={`${session?.method || "Interactive"} · bespoke visual in build`}>
      <div className="v-ph" style={{ borderColor: accent + "44" }}>
        <span className="v-ph-ic" style={{ color: accent }}>{session?.method || "◎"}</span>
        <b>{session?.title}</b>
        <p>{session?.summary}</p>
      </div>
    </VStage>
  );
}

export const VISUALS = {
  IntroTesting, NdtVsMech, MethodMap, DefectGallery, MaterialChar,
  MeritsScale, LimitsRadar, MaterialProps, VisualInspect,
};

export function Visual({ session, accent, accent2 }) {
  const C = (session && VISUALS[session.visual]) || Placeholder;
  return <C accent={accent} accent2={accent2} session={session} />;
}
