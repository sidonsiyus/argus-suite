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

/* ══════════════ 2.1 · Capillary action ══════════════ */
function LptIntro({ accent }) {
  const [clean, setClean] = useState(true);
  return (
    <div>
      <Seg accent={accent} value={clean ? "clean" : "dirty"} onChange={(v) => setClean(v === "clean")}
        options={[{ v: "clean", label: "Clean surface" }, { v: "dirty", label: "Contaminated" }]} />
      <VStage label={clean ? "On a clean surface, capillary action pulls penetrant deep into the crack — it will bleed back out to reveal the flaw." : "Oil, rust or paint blocks the crack opening — capillary action is stopped and the flaw stays invisible."}>
        <svg viewBox="0 0 200 130" className="v-svg" style={{ maxWidth: 340 }}>
          <rect x="10" y="46" width="180" height="76" rx="3" fill="#cbd5e1" stroke="#64748b" />
          {/* crack — a narrow V into the block */}
          <path d="M 96 46 L 100 46 L 99 104 L 97 104 Z" fill="#0f172a" />
          {/* penetrant that has entered (animated by height) */}
          <rect x="96.5" y="48" rx="0" width="3" fill={accent}
            style={{ height: clean ? 54 : 0, transition: "height 1.4s ease" }} />
          {/* dye applied on the surface */}
          <rect x="60" y="42" width="80" height="5" rx="2.5" fill={accent} opacity="0.9" />
          {/* contamination film blocking the opening */}
          {!clean && <rect x="88" y="43" width="24" height="4" rx="2" fill="#7c6f66" />}
          <text x="100" y="118" textAnchor="middle" fontSize="7" fill="#94a3b8">surface-breaking crack</text>
          <text x="150" y="40" textAnchor="middle" fontSize="7.5" fill={accent}>penetrant</text>
        </svg>
      </VStage>
      <div className="v-tagline"><span style={{ color: clean ? accent : "#b91c1c", fontWeight: 700 }}>{clean ? "✓ Penetrant enters the flaw" : "✗ Flaw blocked — a missed crack"}</span></div>
    </div>
  );
}

/* ══════════════ 2.2 · Penetrant type & sensitivity ══════════════ */
function PenetrantProps({ accent }) {
  const [dye, setDye] = useState("fluor");
  const [rem, setRem] = useState("solvent");
  const sens = (dye === "fluor" ? 2 : 1) + (rem === "post" ? 2 : rem === "solvent" ? 1 : 0);
  const bars = Math.min(5, sens + 1);
  return (
    <div>
      <Seg accent={accent} value={dye} onChange={setDye} options={[{ v: "visible", label: "Visible dye" }, { v: "fluor", label: "Fluorescent" }]} />
      <div style={{ height: 6 }} />
      <Seg accent={accent} value={rem} onChange={setRem} options={[{ v: "water", label: "Water-washable" }, { v: "solvent", label: "Solvent" }, { v: "post", label: "Post-emulsifiable" }]} />
      <VStage label={dye === "fluor" ? "Fluorescent penetrant glows yellow-green under UV in a dark booth — the highest contrast and sensitivity." : "Visible red dye is read under ordinary white light — simple and portable, lower sensitivity."}>
        <svg viewBox="0 0 220 90" className="v-svg" style={{ maxWidth: 320 }}>
          <rect x="10" y="10" width="200" height="70" rx="4" fill={dye === "fluor" ? "#0b1020" : "#e7ecf2"} stroke="#64748b" />
          {[[70, 34], [120, 50], [150, 30], [95, 60]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3.5 - i * 0.3} fill={dye === "fluor" ? "#a3ff3c" : "#d21f26"} style={{ filter: dye === "fluor" ? "drop-shadow(0 0 4px #a3ff3c)" : "none" }} />
          ))}
          <path d="M 60 26 L 90 66" stroke={dye === "fluor" ? "#a3ff3c" : "#d21f26"} strokeWidth="1.6" style={{ filter: dye === "fluor" ? "drop-shadow(0 0 3px #a3ff3c)" : "none" }} />
          <text x="110" y="87" textAnchor="middle" fontSize="7" fill="#94a3b8">{dye === "fluor" ? "under UV (black) light" : "under white light"}</text>
        </svg>
      </VStage>
      <div className="v-slider"><span>Sensitivity</span><div className="v-meter">{[0, 1, 2, 3, 4].map((i) => <i key={i} style={{ background: i < bars ? accent : undefined }} />)}</div><b>{["low", "low", "med", "high", "v.high", "ultra"][bars]}</b></div>
    </div>
  );
}

/* ══════════════ 2.3 · Developer bleed-out ══════════════ */
function Developer({ accent }) {
  const [t, setT] = useState(30);
  const r = 2 + (t / 100) * 16; // indication grows with developing time
  return (
    <div>
      <VStage label={`Developing time ${t}%: the developer wicks trapped penetrant back out and spreads it into a visible indication — several times wider than the crack itself.`}>
        <svg viewBox="0 0 200 110" className="v-svg" style={{ maxWidth: 340 }}>
          <rect x="10" y="20" width="180" height="80" rx="3" fill="#f8fafc" stroke="#94a3b8" />
          <text x="100" y="15" textAnchor="middle" fontSize="7.5" fill="#94a3b8">white developer coat</text>
          {/* buried crack */}
          <line x1="100" y1="55" x2="100" y2="80" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
          {/* bleed-out indication */}
          <ellipse cx="100" cy="60" rx={r} ry={r * 0.6} fill={accent} opacity="0.85" />
          <ellipse cx="100" cy="60" rx={r * 1.5} ry={r * 0.9} fill={accent} opacity="0.18" />
        </svg>
      </VStage>
      <div className="v-slider"><span>Developing time</span><input type="range" min="0" max="100" value={t} onChange={(e) => setT(+e.target.value)} style={{ accentColor: accent }} /><b>{t}%</b></div>
      <div className="v-tagline"><span style={{ color: t < 25 ? "#b91c1c" : accent, fontWeight: 700 }}>{t < 25 ? "Too little time — weak, easy to miss" : t > 85 ? "Fully developed — clear indication" : "Bleeding out…"}</span></div>
    </div>
  );
}

/* ══════════════ 2.4 · Will LPT work? ══════════════ */
const LPT_CASES = [
  { id: "a", label: "Surface crack in aluminium", ok: true, why: "Surface-breaking + non-porous → LPT works (and MT can't, being non-magnetic)." },
  { id: "b", label: "Internal porosity in a casting", ok: false, why: "Internal, doesn't break the surface → invisible to LPT. Use RT or UT." },
  { id: "c", label: "Crack in a porous casting", ok: false, why: "Porous material soaks up penetrant everywhere, masking the flaw." },
  { id: "d", label: "Crack on a very rough weld", ok: false, why: "Roughness traps penetrant and creates false indications — clean/grind first." },
  { id: "e", label: "Fatigue crack on a machined shaft", ok: true, why: "Smooth, non-porous, surface-breaking → an ideal LPT job." },
];
function LptProsCons({ accent }) {
  const [sel, setSel] = useState("a");
  const c = LPT_CASES.find((x) => x.id === sel);
  return (
    <div>
      <div className="v-chips">
        {LPT_CASES.map((x) => <button key={x.id} className={"v-chip" + (sel === x.id ? " on" : "")} onClick={() => setSel(x.id)} style={sel === x.id ? { borderColor: accent, color: accent } : undefined}>{x.label}</button>)}
      </div>
      <VStage label={c.why}>
        <div className="v-verdict" style={{ borderColor: (c.ok ? "#3fae5a" : "#b91c1c") + "66" }}>
          <span className="v-verdict-ic" style={{ color: c.ok ? "#3fae5a" : "#b91c1c" }}>{c.ok ? "✓" : "✗"}</span>
          <b style={{ color: c.ok ? "#3fae5a" : "#b91c1c" }}>{c.ok ? "LPT will find it" : "LPT won't find it"}</b>
        </div>
      </VStage>
    </div>
  );
}

/* ══════════════ 2.5 · The six-step LPT procedure ══════════════ */
const LPT_STEPS = [
  { n: "Pre-clean", d: "Remove oil, rust and paint so the flaw is open and dry." },
  { n: "Apply penetrant", d: "Coat the surface evenly with penetrant." },
  { n: "Dwell", d: "Wait — capillary action pulls penetrant into the flaw." },
  { n: "Remove excess", d: "Wipe/rinse the surface, leaving penetrant only in the flaw." },
  { n: "Develop", d: "Apply a thin white developer that wicks penetrant back out." },
  { n: "Inspect", d: "Read the indication under the correct light." },
];
function LptProcedure({ accent }) {
  const [step, setStep] = useState(0);
  const s = step;
  return (
    <div>
      <div className="v-steps">
        {LPT_STEPS.map((x, i) => <button key={i} className={"v-step" + (i === s ? " on" : "") + (i < s ? " done" : "")} onClick={() => setStep(i)} style={i === s ? { borderColor: accent, color: accent } : undefined}><b>{i + 1}</b>{x.n}</button>)}
      </div>
      <VStage label={`Step ${s + 1} — ${LPT_STEPS[s].n}: ${LPT_STEPS[s].d}`}>
        <svg viewBox="0 0 200 110" className="v-svg" style={{ maxWidth: 340 }}>
          {/* base part, cleaner as step advances */}
          <rect x="10" y="30" width="180" height="70" rx="3" fill={s === 4 || s === 5 ? "#f8fafc" : "#cbd5e1"} stroke="#64748b" />
          {s === 0 && [[40, 45], [150, 55], [90, 70]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="#7c6f66" opacity="0.7" />)}
          {/* crack */}
          <line x1="100" y1="30" x2="100" y2="72" stroke="#334155" strokeWidth={s >= 4 ? 1 : 1.4} strokeDasharray={s >= 4 ? "2 2" : "0"} />
          {/* penetrant on surface (steps 1-2) */}
          {(s === 1 || s === 2) && <rect x="20" y="26" width="160" height="6" rx="3" fill={accent} opacity="0.85" />}
          {/* penetrant in crack (steps 2+) */}
          {s >= 2 && <rect x="98.5" y="32" width="3" height={s >= 4 ? 30 : 38} fill={accent} />}
          {/* developer coat (steps 4-5) */}
          {(s === 4 || s === 5) && <rect x="10" y="30" width="180" height="6" rx="2" fill="#ffffff" opacity="0.9" />}
          {/* indication bleed-out (step 5) */}
          {s === 5 && <ellipse cx="100" cy="40" rx="10" ry="6" fill={accent} />}
          <text x="100" y="107" textAnchor="middle" fontSize="7" fill="#94a3b8">{LPT_STEPS[s].n}</text>
        </svg>
      </VStage>
      <div className="v-stepnav">
        <button className="v-navb" onClick={() => setStep((v) => Math.max(0, v - 1))} disabled={s === 0}>← Back</button>
        <span>{s + 1} / 6</span>
        <button className="v-navb" onClick={() => setStep((v) => Math.min(5, v + 1))} disabled={s === 5} style={{ borderColor: accent, color: accent }}>Next →</button>
      </div>
    </div>
  );
}

/* ══════════════ 2.6 · Magnetic flux leakage ══════════════ */
function MptIntro({ accent }) {
  const [crack, setCrack] = useState(true);
  return (
    <div>
      <Seg accent={accent} value={crack ? "on" : "off"} onChange={(v) => setCrack(v === "on")}
        options={[{ v: "off", label: "No flaw" }, { v: "on", label: "Crack present" }]} />
      <VStage label={crack ? "A crack interrupts the magnetic flux, forcing a leakage field out of the surface. Magnetic particles gather at the leakage field, drawing a visible line over the flaw." : "With no flaw, the magnetic flux flows smoothly through the bar and nothing shows on the surface."}>
        <svg viewBox="0 0 240 120" className="v-svg" style={{ maxWidth: 380 }}>
          <rect x="20" y="50" width="200" height="34" rx="3" fill="#cbd5e1" stroke="#64748b" />
          <text x="30" y="72" fontSize="12" fill="#b91c1c" fontWeight="700">N</text>
          <text x="205" y="72" fontSize="12" fill="#1d4ed8" fontWeight="700">S</text>
          {/* internal flux lines */}
          {[60, 67, 74].map((y) => <line key={y} x1="42" y1={y} x2="198" y2={y} stroke={accent} strokeWidth="1" opacity="0.5" />)}
          {crack && <>
            {/* crack */}
            <line x1="120" y1="50" x2="120" y2="74" stroke="#0f172a" strokeWidth="2.5" />
            {/* leakage field arcs above the crack */}
            {[8, 14, 20].map((r, i) => <path key={i} d={`M ${120 - r} 50 A ${r} ${r} 0 0 1 ${120 + r} 50`} fill="none" stroke={accent} strokeWidth="1.2" opacity={0.8 - i * 0.2} />)}
            {/* particles gathering */}
            {[-3, 0, 3, -6, 6, 0].map((dx, i) => <circle key={i} cx={120 + dx} cy={46 - (i % 3) * 3} r="1.8" fill="#3a2e29" />)}
            <text x="120" y="30" textAnchor="middle" fontSize="7.5" fill={accent}>leakage field + particles</text>
          </>}
        </svg>
      </VStage>
      <div className="v-tagline"><span style={{ color: crack ? accent : "var(--muted)", fontWeight: 700 }}>{crack ? "✓ Flaw revealed by gathered particles" : "Flux flows uninterrupted — nothing to see"}</span></div>
    </div>
  );
}

/* ══════════════ 2.7 · Field direction vs flaw orientation ══════════════ */
function Magnetization({ accent }) {
  const [method, setMethod] = useState("yoke");
  const yoke = method === "yoke"; // longitudinal field (horizontal) finds transverse cracks
  return (
    <div>
      <Seg accent={accent} value={method} onChange={setMethod}
        options={[{ v: "yoke", label: "Yoke — longitudinal field" }, { v: "coil", label: "Coil — axial field" }, { v: "direct", label: "Direct — circular field" }]} />
      <VStage label={yoke ? "A yoke drives a longitudinal field between its poles — it reveals cracks that lie TRANSVERSE (across) the field. A crack parallel to the field is missed." : method === "coil" ? "A coil around the part gives an axial field — ideal for transverse cracks in long parts like shafts and bars." : "Direct magnetization (current through the part) gives a circular field around the current path — it reveals LONGITUDINAL cracks."}>
        <svg viewBox="0 0 240 120" className="v-svg" style={{ maxWidth: 380 }}>
          <rect x="30" y="46" width="180" height="34" rx="3" fill="#cbd5e1" stroke="#64748b" />
          {/* field direction arrow */}
          {method === "direct"
            ? <g><ellipse cx="120" cy="63" rx="60" ry="20" fill="none" stroke={accent} strokeWidth="1.4" strokeDasharray="4 3" /><text x="120" y="40" textAnchor="middle" fontSize="7.5" fill={accent}>circular field</text></g>
            : <g><line x1="40" y1="63" x2="200" y2="63" stroke={accent} strokeWidth="1.4" /><polygon points="200,63 192,59 192,67" fill={accent} /><text x="120" y="40" textAnchor="middle" fontSize="7.5" fill={accent}>{method === "coil" ? "axial field" : "longitudinal field"}</text></g>}
          {/* cracks: one transverse, one longitudinal — highlight the detected one */}
          <line x1="90" y1="48" x2="90" y2="78" stroke={method !== "direct" ? "#22c55e" : "#94a3b8"} strokeWidth={method !== "direct" ? 3 : 1.5} />
          <line x1="130" y1="63" x2="165" y2="63" stroke={method === "direct" ? "#22c55e" : "#94a3b8"} strokeWidth={method === "direct" ? 3 : 1.5} />
          <text x="90" y="92" textAnchor="middle" fontSize="6.5" fill={method !== "direct" ? "#22c55e" : "#94a3b8"}>transverse</text>
          <text x="147" y="92" textAnchor="middle" fontSize="6.5" fill={method === "direct" ? "#22c55e" : "#94a3b8"}>longitudinal</text>
        </svg>
      </VStage>
      <div className="v-tagline"><span style={{ color: "#22c55e", fontWeight: 700 }}>Detects the {method === "direct" ? "longitudinal" : "transverse"} crack · the parallel one is missed</span></div>
    </div>
  );
}

/* ══════════════ 2.8 · Magnetic particle media ══════════════ */
function MptParticles({ accent }) {
  const [wet, setWet] = useState(true);
  const [fluor, setFluor] = useState(true);
  const pc = fluor ? "#a3ff3c" : "#3a2e29";
  return (
    <div>
      <Seg accent={accent} value={wet ? "wet" : "dry"} onChange={(v) => setWet(v === "wet")} options={[{ v: "dry", label: "Dry powder" }, { v: "wet", label: "Wet suspension" }]} />
      <div style={{ height: 6 }} />
      <Seg accent={accent} value={fluor ? "f" : "v"} onChange={(v) => setFluor(v === "f")} options={[{ v: "v", label: "Visible" }, { v: "f", label: "Fluorescent (UV)" }]} />
      <VStage label={`${wet ? "Wet suspension carries particles into the finest flaws — higher sensitivity" : "Dry powder suits rough surfaces and field work"} · ${fluor ? "fluorescent particles glow under UV for the highest contrast" : "visible particles are read under white light"}.`}>
        <svg viewBox="0 0 220 96" className="v-svg" style={{ maxWidth: 340 }}>
          <rect x="10" y="30" width="200" height="50" rx="3" fill={fluor ? "#0b1020" : "#cbd5e1"} stroke="#64748b" />
          <line x1="110" y1="30" x2="110" y2="70" stroke="#334155" strokeWidth="2" />
          {/* particle build-up over the crack — denser when wet */}
          {Array.from({ length: wet ? 26 : 14 }).map((_, i) => {
            const dx = (Math.sin(i * 2.3) * (wet ? 5 : 8)); const dy = (i % 6) * 3 - 8;
            return <circle key={i} cx={110 + dx} cy={40 + dy} r={wet ? 1.3 : 1.8} fill={pc} style={fluor ? { filter: "drop-shadow(0 0 2px #a3ff3c)" } : undefined} />;
          })}
          <text x="110" y="90" textAnchor="middle" fontSize="7" fill="#94a3b8">particles gather at the leakage field</text>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 2.9 · Demagnetization ══════════════ */
function Demag({ accent }) {
  const [cyc, setCyc] = useState(0);
  const residual = Math.round(100 * Math.exp(-cyc / 3)); // decays with cycles
  const W = 280, H = 90, mid = 45;
  // build a decaying-AC waveform up to the current cycle count
  const N = Math.max(1, cyc);
  const wave = Array.from({ length: 160 }, (_, i) => {
    const p = i / 159; const amp = Math.exp(-p * (N / 1.5)); const yv = mid - Math.sin(p * N * Math.PI * 2) * amp * 34;
    return `${10 + p * (W - 20)},${yv}`;
  }).join(" ");
  return (
    <div>
      <VStage label={`${cyc} demag cycles: a reversing AC field of decreasing amplitude drives residual magnetism toward zero. A gauss meter verifies it is below the specified limit.`}>
        <svg viewBox={`0 0 ${W} ${H}`} className="v-svg" style={{ maxWidth: 400 }}>
          <line x1="10" y1={mid} x2={W - 10} y2={mid} stroke="#94a3b8" strokeWidth="0.6" />
          {cyc > 0 && <polyline points={wave} fill="none" stroke={accent} strokeWidth="1.6" />}
          <text x={W - 12} y="14" textAnchor="end" fontSize="8" fill="#94a3b8">decaying AC field →</text>
        </svg>
      </VStage>
      <div className="v-slider"><span>Demag cycles</span><input type="range" min="0" max="9" value={cyc} onChange={(e) => setCyc(+e.target.value)} style={{ accentColor: accent }} /><b>{cyc}</b></div>
      <div className="v-row">
        <div className="v-fact"><b style={{ color: residual < 15 ? "#3fae5a" : "#b91c1c" }}>{residual}%</b><span>residual field (gauss)</span></div>
        <div className="v-fact"><b style={{ color: residual < 15 ? "#3fae5a" : accent }}>{residual < 15 ? "PASS" : "above limit"}</b><span>vs specification</span></div>
      </div>
    </div>
  );
}

/* ══════════════ 3.1 · Heat flow reveals a flaw ══════════════ */
function ThermoPrinciple({ accent }) {
  const [t, setT] = useState(50);
  const contrast = Math.sin((t / 100) * Math.PI) * (t < 8 ? t / 8 : 1); // peaks mid-cooling
  return (
    <div>
      <VStage label={`${t}% into the cooling after a heat flash: sound material drains heat away, but the void traps it — a warm spot grows over the hidden flaw, then fades as everything equalises.`}>
        <svg viewBox="0 0 220 110" className="v-svg" style={{ maxWidth: 360 }}>
          <rect x="10" y="20" width="200" height="70" rx="4" fill="#334155" />
          {/* even residual heat */}
          <rect x="10" y="20" width="200" height="70" rx="4" fill="#f59e0b" opacity={0.12 * (1 - t / 130)} />
          {/* void + hot spot over it */}
          <rect x="96" y="58" width="28" height="10" rx="2" fill="#0b1020" />
          <ellipse cx="110" cy="42" rx="26" ry="16" fill={accent} opacity={0.75 * contrast} style={{ filter: "blur(2px)" }} />
          <text x="110" y="102" textAnchor="middle" fontSize="7" fill="#94a3b8">hidden void (poor heat conductor)</text>
        </svg>
      </VStage>
      <div className="v-slider"><span>Time after flash</span><input type="range" min="0" max="100" value={t} onChange={(e) => setT(+e.target.value)} style={{ accentColor: accent }} /><b>{t}%</b></div>
      <div className="v-tagline"><span style={{ color: contrast > 0.4 ? accent : "var(--muted)", fontWeight: 700 }}>{contrast > 0.4 ? "✓ Thermal contrast — flaw visible" : "waiting for contrast to build…"}</span></div>
    </div>
  );
}

/* ══════════════ 3.2 · Contact vs non-contact ══════════════ */
function ContactNonContact({ accent }) {
  const [mode, setMode] = useState("ir");
  const ir = mode === "ir";
  return (
    <div>
      <Seg accent={accent} value={mode} onChange={setMode} options={[{ v: "lc", label: "Contact — liquid crystal" }, { v: "ir", label: "Non-contact — IR camera" }]} />
      <VStage label={ir ? "An infrared camera reads the part's radiation from a distance — fast, wide-area, works on hot or moving parts (needs emissivity data)." : "A thermochromic coating on the surface maps temperature as vivid colour — cheap and high-resolution, but contact and a narrow range."}>
        <svg viewBox="0 0 220 110" className="v-svg" style={{ maxWidth: 360 }}>
          <rect x="20" y="34" width="180" height="56" rx="4" fill={ir ? "#0b1020" : "#111"} stroke="#64748b" />
          {ir ? <>
            {[["#4b1d6b", 30], ["#b1215f", 70], ["#f59e0b", 55], ["#fde047", 130], ["#f97316", 100]].map(([c, x], i) => <circle key={i} cx={20 + x} cy={50 + (i % 3) * 12} r={12 - i} fill={c} opacity="0.8" style={{ filter: "blur(2px)" }} />)}
            <g transform="translate(180,14)"><rect x="-14" y="-10" width="28" height="16" rx="2" fill={accent} /><path d="M -10 6 L 10 6 L 4 22 L -4 22 Z" fill={accent} opacity="0.25" /></g>
          </> : <>
            {[["#dc2626", 0], ["#f59e0b", 24], ["#22c55e", 48], ["#3b82f6", 72], ["#6366f1", 96], ["#dc2626", 120], ["#f59e0b", 144]].map(([c, x], i) => <rect key={i} x={30 + x} y="40" width="24" height="44" fill={c} opacity="0.85" />)}
          </>}
          <text x="110" y="104" textAnchor="middle" fontSize="7" fill="#94a3b8">{ir ? "IR radiation map (remote)" : "liquid-crystal colour map (on surface)"}</text>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 3.3 · Thermochromic liquid crystal ══════════════ */
function LiquidCrystal({ accent }) {
  const [temp, setTemp] = useState(50);
  // colour-play band 35–65: below=black, in-band spectrum, above=black
  const col = temp < 35 || temp > 65 ? "#0b0b0b" : `hsl(${(65 - temp) / 30 * 260}, 85%, 52%)`;
  const inBand = temp >= 35 && temp <= 65;
  return (
    <div>
      <VStage label={`At ${temp}°C the crystal shows ${inBand ? "a colour set by temperature (red hot → blue cool)" : "black — outside its narrow colour-play band"}. You choose the formulation to bracket the temperatures of interest.`}>
        <svg viewBox="0 0 220 90" className="v-svg" style={{ maxWidth: 320 }}>
          <rect x="20" y="20" width="180" height="50" rx="6" fill={col} stroke="#64748b" style={{ transition: "fill .2s" }} />
          <text x="110" y="82" textAnchor="middle" fontSize="7.5" fill="#94a3b8">thermochromic coating (band 35–65°C)</text>
        </svg>
      </VStage>
      <div className="v-slider"><span>Temperature</span><input type="range" min="20" max="80" value={temp} onChange={(e) => setTemp(+e.target.value)} style={{ accentColor: accent }} /><b>{temp}°C</b></div>
      <div className="v-tagline"><span style={{ color: inBand ? accent : "var(--muted)", fontWeight: 700 }}>{inBand ? "In the colour-play band — reading temperature" : "Outside the band — appears black"}</span></div>
    </div>
  );
}

/* ══════════════ 3.4 · Thermal vs photon detectors ══════════════ */
function IrDetectors({ accent }) {
  const [type, setType] = useState("thermal");
  const photon = type === "photon";
  const rows = [
    { k: "Sensitivity", t: 2, p: 5 }, { k: "Speed", t: 2, p: 5 }, { k: "Cost", t: 1, p: 4 }, { k: "Cooling", t: 0, p: 5 },
  ];
  return (
    <div>
      <Seg accent={accent} value={type} onChange={setType} options={[{ v: "thermal", label: "Thermal (uncooled)" }, { v: "photon", label: "Photon (cooled)" }]} />
      <VStage label={photon ? "Photon (quantum) detectors convert IR photons straight to signal — very sensitive and fast, but must be cryogenically cooled and cost more." : "Thermal detectors (microbolometers) absorb heat and change a property — uncooled, cheap and robust, but slower and less sensitive."}>
        <div className="v-bars">
          {rows.map((r) => (
            <div key={r.k} className="v-bar"><span>{r.k === "Cost" ? "Affordability" : r.k === "Cooling" ? "Cooling need" : r.k}</span>
              <div className="v-bar-track">{[0, 1, 2, 3, 4].map((i) => <i key={i} style={{ background: i < (photon ? (r.k === "Cost" ? 5 - r.p : r.p) : (r.k === "Cost" ? 5 - r.t : r.t)) ? accent : undefined }} />)}</div>
            </div>
          ))}
        </div>
      </VStage>
    </div>
  );
}

/* ══════════════ 3.5 · Active vs passive thermography ══════════════ */
function ThermoInstrument({ accent }) {
  const [mode, setMode] = useState("active");
  const active = mode === "active";
  return (
    <div>
      <Seg accent={accent} value={mode} onChange={setMode} options={[{ v: "passive", label: "Passive" }, { v: "active", label: "Active" }]} />
      <VStage label={active ? "Active: a flash heats the surface and the camera films it cooling. Sound material dissipates heat evenly; a hidden flaw slows it and appears as an anomaly." : "Passive: the camera reads temperature differences the part already has — like a loose electrical joint running hot."}>
        <svg viewBox="0 0 220 110" className="v-svg" style={{ maxWidth: 360 }}>
          <rect x="15" y="34" width="190" height="56" rx="4" fill="#334155" stroke="#64748b" />
          {active ? <>
            <g transform="translate(110,14)"><path d="M -10 0 L 10 0 M 0 -8 L 0 8 M -7 -6 L 7 6 M 7 -6 L -7 6" stroke="#fde047" strokeWidth="1.6" /></g>
            <ellipse cx="90" cy="60" rx="20" ry="12" fill={accent} opacity="0.6" style={{ filter: "blur(2px)" }} />
            <rect x="80" y="70" width="20" height="8" rx="2" fill="#0b1020" />
            <text x="90" y="102" textAnchor="middle" fontSize="7" fill="#94a3b8">flash → flaw traps heat</text>
          </> : <>
            <rect x="150" y="46" width="14" height="14" rx="2" fill="#475569" />
            <ellipse cx="157" cy="53" rx="16" ry="10" fill={accent} opacity="0.7" style={{ filter: "blur(2px)" }} />
            <text x="110" y="102" textAnchor="middle" fontSize="7" fill="#94a3b8">a naturally hot connection</text>
          </>}
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 3.6 · Eddy current generation ══════════════ */
function EddyGen({ accent }) {
  const [crack, setCrack] = useState(true);
  return (
    <div>
      <Seg accent={accent} value={crack ? "on" : "off"} onChange={(v) => setCrack(v === "on")} options={[{ v: "off", label: "Sound conductor" }, { v: "on", label: "Crack present" }]} />
      <VStage label={crack ? "The crack forces the eddy currents to divert around it, changing their path — the coil's impedance shifts, producing a signal." : "In a sound conductor the induced eddy currents flow in smooth loops and the coil sees a steady baseline impedance."}>
        <svg viewBox="0 0 220 120" className="v-svg" style={{ maxWidth: 360 }}>
          <rect x="20" y="55" width="180" height="55" rx="3" fill="#cbd5e1" stroke="#64748b" />
          {/* coil above */}
          <ellipse cx="110" cy="40" rx="26" ry="9" fill="none" stroke={accent} strokeWidth="2" />
          <line x1="110" y1="31" x2="110" y2="55" stroke={accent} strokeWidth="1.2" strokeDasharray="3 3" />
          {/* eddy current loops */}
          {[18, 30].map((r, i) => crack
            ? <g key={i}><path d={`M ${110 - r} 80 a ${r} 7 0 0 1 ${r - 6} -6`} fill="none" stroke={accent} strokeWidth="1.4" opacity={0.8 - i * 0.2} /><path d={`M ${110 + 6} 74 a ${r} 7 0 0 1 ${r - 6} 6`} fill="none" stroke={accent} strokeWidth="1.4" opacity={0.8 - i * 0.2} /></g>
            : <ellipse key={i} cx="110" cy="80" rx={r} ry="7" fill="none" stroke={accent} strokeWidth="1.4" opacity={0.8 - i * 0.2} />)}
          {crack && <line x1="110" y1="55" x2="110" y2="90" stroke="#0f172a" strokeWidth="2.5" />}
          <text x="110" y="118" textAnchor="middle" fontSize="7" fill="#94a3b8">induced eddy currents</text>
        </svg>
      </VStage>
      <div className="v-tagline"><span style={{ color: crack ? accent : "var(--muted)", fontWeight: 700 }}>{crack ? "✓ Impedance shifts — flaw detected" : "steady baseline impedance"}</span></div>
    </div>
  );
}

/* ══════════════ 3.7 · Probe types & the impedance plane ══════════════ */
function EddyProbes({ accent }) {
  const [effect, setEffect] = useState("crack");
  // crack signal points one way, lift-off another
  const ang = effect === "crack" ? -55 : effect === "liftoff" ? 200 : -20;
  const x = 110 + Math.cos((ang * Math.PI) / 180) * 40, y = 70 + Math.sin((ang * Math.PI) / 180) * 40;
  return (
    <div>
      <Seg accent={accent} value={effect} onChange={setEffect} options={[{ v: "crack", label: "Crack" }, { v: "liftoff", label: "Lift-off" }, { v: "cond", label: "Conductivity" }]} />
      <VStage label={`On the impedance plane, a ${effect === "crack" ? "crack" : effect === "liftoff" ? "lift-off change" : "conductivity change"} moves the signal in its own characteristic direction — that's how the operator tells a real crack from lift-off or a benign feature.`}>
        <svg viewBox="0 0 220 140" className="v-svg" style={{ maxWidth: 300 }}>
          <line x1="30" y1="70" x2="190" y2="70" stroke="#64748b" strokeWidth="0.8" />
          <line x1="110" y1="15" x2="110" y2="125" stroke="#64748b" strokeWidth="0.8" />
          <text x="186" y="66" fontSize="7" fill="#94a3b8">R</text><text x="114" y="22" fontSize="7" fill="#94a3b8">X</text>
          <line x1="110" y1="70" x2={x} y2={y} stroke={accent} strokeWidth="2" />
          <circle cx={x} cy={y} r="4" fill={accent} />
        </svg>
      </VStage>
      <div className="v-tagline"><span style={{ color: accent, fontWeight: 700 }}>Differential probes respond to abrupt changes (cracks); absolute probes measure the slow ones (conductivity, thickness)</span></div>
    </div>
  );
}

/* ══════════════ 3.8 · Eddy current arrangements ══════════════ */
const EDDY_ARR = [
  { id: "surface", name: "Surface probe", d: "A coil scanned over a face to find cracks — the most common arrangement." },
  { id: "encircle", name: "Encircling coil", d: "The bar or tube passes through the coil; the whole cross-section is tested at speed." },
  { id: "remote", name: "Remote field", d: "An internal probe reads the through-wall field to inspect tube walls from inside." },
];
function EddyArrange({ accent }) {
  const [sel, setSel] = useState("surface");
  const a = EDDY_ARR.find((x) => x.id === sel);
  return (
    <div>
      <div className="v-chips">{EDDY_ARR.map((x) => <button key={x.id} className={"v-chip" + (sel === x.id ? " on" : "")} onClick={() => setSel(x.id)} style={sel === x.id ? { borderColor: accent, color: accent } : undefined}>{x.name}</button>)}</div>
      <VStage label={a.d}>
        <svg viewBox="0 0 220 96" className="v-svg" style={{ maxWidth: 320 }}>
          {sel === "surface" && <><rect x="20" y="50" width="180" height="36" rx="3" fill="#cbd5e1" stroke="#64748b" /><ellipse cx="110" cy="40" rx="20" ry="7" fill="none" stroke={accent} strokeWidth="2" /><line x1="70" y1="68" x2="70" y2="82" stroke="#0f172a" strokeWidth="2" /></>}
          {sel === "encircle" && <><rect x="30" y="44" width="160" height="16" rx="8" fill="#cbd5e1" stroke="#64748b" /><ellipse cx="110" cy="52" rx="10" ry="24" fill="none" stroke={accent} strokeWidth="2.5" /><polygon points="182,52 170,48 170,56" fill="#64748b" /></>}
          {sel === "remote" && <><rect x="20" y="34" width="180" height="12" rx="2" fill="#cbd5e1" stroke="#64748b" /><rect x="20" y="60" width="180" height="12" rx="2" fill="#cbd5e1" stroke="#64748b" /><rect x="70" y="48" width="16" height="10" rx="2" fill={accent} /><line x1="86" y1="53" x2="180" y2="53" stroke={accent} strokeWidth="1.2" strokeDasharray="3 3" /></>}
          <text x="110" y="92" textAnchor="middle" fontSize="7" fill="#94a3b8">{a.name}</text>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 3.9 · Skin effect & frequency ══════════════ */
function EtProsCons({ accent }) {
  const [freq, setFreq] = useState(50);
  const depth = Math.max(6, 46 - (freq / 100) * 38); // higher freq → shallower
  return (
    <div>
      <VStage label={`At ${freq}% frequency the eddy currents penetrate ~${Math.round(46 - depth + 6)} 'units' deep. Higher frequency = shallower and more surface-sensitive (skin effect); lower = deeper. Eddy current is always a surface/near-surface method.`}>
        <svg viewBox="0 0 220 100" className="v-svg" style={{ maxWidth: 340 }}>
          <rect x="20" y="20" width="180" height="70" rx="3" fill="#cbd5e1" stroke="#64748b" />
          <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={accent} stopOpacity="0.85" /><stop offset="1" stopColor={accent} stopOpacity="0" /></linearGradient>
          <rect x="20" y="20" width="180" height={depth} fill="url(#skin)" style={{ transition: "height .15s" }} />
          <ellipse cx="110" cy="14" rx="18" ry="6" fill="none" stroke={accent} strokeWidth="2" />
          <text x="110" y="86" textAnchor="middle" fontSize="7" fill="#3a2e29">eddy-current penetration depth</text>
        </svg>
      </VStage>
      <div className="v-slider"><span>Frequency</span><input type="range" min="0" max="100" value={freq} onChange={(e) => setFreq(+e.target.value)} style={{ accentColor: accent }} /><b>{freq < 40 ? "low" : freq > 70 ? "high" : "mid"}</b></div>
      <div className="v-tagline"><span style={{ color: accent, fontWeight: 700 }}>{freq > 70 ? "Shallow — fine surface cracks" : freq < 40 ? "Deeper — but still near-surface" : "Balanced penetration"}</span></div>
    </div>
  );
}

/* ══════════════ 4.1 · Pulse-echo A-scan ══════════════ */
function UtPrinciple({ accent }) {
  const [depth, setDepth] = useState(45); // % of thickness
  const flawY = 30 + (depth / 100) * 46;
  const flawEchoX = 40 + (depth / 100) * 150; // echo time ∝ depth
  return (
    <div>
      <VStage label={`A pulse-echo probe times the echoes. The flaw sits at ${depth}% depth, so its echo returns before the back-wall echo — its arrival time gives the depth.`}>
        <svg viewBox="0 0 220 160" className="v-svg" style={{ maxWidth: 380 }}>
          {/* block + probe + flaw */}
          <rect x="20" y="26" width="180" height="52" rx="3" fill="#cbd5e1" stroke="#64748b" />
          <rect x="96" y="16" width="28" height="10" rx="2" fill={accent} />
          <rect x="104" y={flawY} width="12" height="4" rx="2" fill="#dc2626" />
          <line x1="110" y1="26" x2="110" y2={flawY} stroke={accent} strokeWidth="1" strokeDasharray="2 2" />
          {/* A-scan */}
          <line x1="20" y1="140" x2="200" y2="140" stroke="#64748b" strokeWidth="0.8" />
          <line x1="40" y1="96" x2="40" y2="140" stroke={accent} strokeWidth="2" />
          <text x="40" y="152" textAnchor="middle" fontSize="6.5" fill="#94a3b8">pulse</text>
          <line x1={flawEchoX} y1="112" x2={flawEchoX} y2="140" stroke="#dc2626" strokeWidth="2" style={{ transition: "all .12s" }} />
          <text x={flawEchoX} y="152" textAnchor="middle" fontSize="6.5" fill="#dc2626">flaw</text>
          <line x1="192" y1="104" x2="192" y2="140" stroke="#475569" strokeWidth="2" />
          <text x="192" y="152" textAnchor="middle" fontSize="6.5" fill="#94a3b8">back wall</text>
          <text x="110" y="92" textAnchor="middle" fontSize="7" fill="#94a3b8">A-scan · echo amplitude vs time</text>
        </svg>
      </VStage>
      <div className="v-slider"><span>Flaw depth</span><input type="range" min="5" max="90" value={depth} onChange={(e) => setDepth(+e.target.value)} style={{ accentColor: accent }} /><b>{depth}%</b></div>
    </div>
  );
}

/* ══════════════ 4.2 · Piezoelectric transducer ══════════════ */
function Transducer({ accent }) {
  const [mode, setMode] = useState("send");
  const send = mode === "send";
  return (
    <div>
      <Seg accent={accent} value={mode} onChange={setMode} options={[{ v: "send", label: "Send (voltage → sound)" }, { v: "recv", label: "Receive (sound → voltage)" }]} />
      <VStage label={send ? "A voltage pulse deforms the piezoelectric crystal, which launches a sound pulse into the part." : "A returning echo deforms the crystal, which generates a voltage the instrument reads. One crystal does both."}>
        <svg viewBox="0 0 220 120" className="v-svg" style={{ maxWidth: 340 }}>
          <rect x="80" y="20" width="60" height="20" rx="3" fill={accent} opacity={send ? 1 : 0.5} />
          <text x="110" y="34" textAnchor="middle" fontSize="8" fill="#fff">crystal</text>
          {/* voltage side */}
          <text x="110" y="14" textAnchor="middle" fontSize="8" fill={send ? accent : "var(--muted)"}>{send ? "⚡ voltage in" : "⚡ voltage out"}</text>
          {/* part + wave */}
          <rect x="30" y="52" width="160" height="56" rx="3" fill="#cbd5e1" stroke="#64748b" />
          {[0, 1, 2].map((i) => <path key={i} d={`M 40 ${68 + i * 14} q 30 -6 60 0 q 30 6 60 0`} fill="none" stroke={accent} strokeWidth="1.4" opacity={(send ? 1 : 0.6) * (1 - i * 0.25)} transform={send ? "" : "scale(1,-1) translate(0,-160)"} />)}
          <polygon points={send ? "110,44 106,52 114,52" : "110,52 106,44 114,44"} fill={accent} />
        </svg>
      </VStage>
      <div className="v-tagline"><span style={{ color: accent, fontWeight: 700 }}>{send ? "Electrical → mechanical: launching a pulse" : "Mechanical → electrical: reading the echo"}</span></div>
    </div>
  );
}

/* ══════════════ 4.3 · Pulse-echo vs through-transmission ══════════════ */
function UtMethods({ accent }) {
  const [mode, setMode] = useState("pe");
  const pe = mode === "pe";
  return (
    <div>
      <Seg accent={accent} value={mode} onChange={setMode} options={[{ v: "pe", label: "Pulse-echo" }, { v: "tt", label: "Through-transmission" }]} />
      <VStage label={pe ? "One probe sends and receives from the same side; the flaw echo's timing gives its depth. Needs access to only one side — the standard method." : "A transmitter and a receiver sit on opposite faces; a flaw reduces the received signal. Needs two-sided access and gives no depth."}>
        <svg viewBox="0 0 220 110" className="v-svg" style={{ maxWidth: 360 }}>
          <rect x="20" y="34" width="180" height="46" rx="3" fill="#cbd5e1" stroke="#64748b" />
          <rect x="96" y="24" width="28" height="10" rx="2" fill={accent} />
          <rect x="104" y="55" width="12" height="4" rx="2" fill="#dc2626" />
          {pe ? <>
            <line x1="110" y1="34" x2="110" y2="55" stroke={accent} strokeWidth="1.4" />
            <line x1="110" y1="55" x2="110" y2="34" stroke="#dc2626" strokeWidth="1.4" strokeDasharray="3 2" />
            <text x="150" y="20" fontSize="7" fill={accent}>send + receive</text>
          </> : <>
            <rect x="96" y="80" width="28" height="10" rx="2" fill="#475569" />
            <line x1="110" y1="34" x2="110" y2="80" stroke={accent} strokeWidth="1.4" opacity="0.5" strokeDasharray="3 2" />
            <text x="150" y="20" fontSize="7" fill={accent}>transmit ↓</text>
            <text x="150" y="102" fontSize="7" fill="#475569">receive ↓ (weakened)</text>
          </>}
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 4.4 · Straight vs angle beam ══════════════ */
function BeamAngles({ accent }) {
  const [angle, setAngle] = useState("angle");
  const straight = angle === "straight";
  return (
    <div>
      <Seg accent={accent} value={angle} onChange={setAngle} options={[{ v: "straight", label: "Straight beam" }, { v: "angle", label: "Angle beam" }]} />
      <VStage label={straight ? "A straight beam travels down and reflects off flaws parallel to the surface — but runs straight past a vertical weld crack." : "An angle beam refracts sideways (via a wedge), reaching the vertical weld crack the straight beam misses."}>
        <svg viewBox="0 0 220 110" className="v-svg" style={{ maxWidth: 360 }}>
          <rect x="20" y="40" width="180" height="55" rx="3" fill="#cbd5e1" stroke="#64748b" />
          {/* weld with vertical crack */}
          <rect x="100" y="40" width="20" height="55" fill="#b8c2cc" />
          <line x1="110" y1="50" x2="110" y2="85" stroke="#dc2626" strokeWidth="3" />
          {straight ? <>
            <rect x="46" y="30" width="24" height="10" rx="2" fill={accent} />
            <line x1="58" y1="40" x2="58" y2="90" stroke={accent} strokeWidth="2" strokeDasharray="3 3" />
            <text x="58" y="106" textAnchor="middle" fontSize="6.5" fill="#94a3b8">misses the crack</text>
          </> : <>
            <rect x="46" y="30" width="24" height="10" rx="2" fill={accent} transform="rotate(20 58 35)" />
            <line x1="60" y1="40" x2="110" y2="66" stroke={accent} strokeWidth="2" />
            <polygon points="110,66 103,63 105,70" fill={accent} />
            <text x="90" y="106" textAnchor="middle" fontSize="6.5" fill="#22c55e">hits the crack ✓</text>
          </>}
        </svg>
      </VStage>
      <div className="v-tagline"><span style={{ color: straight ? "#b91c1c" : "#22c55e", fontWeight: 700 }}>{straight ? "✗ Vertical crack missed — wrong orientation" : "✓ Angle beam reaches the weld crack"}</span></div>
    </div>
  );
}

/* ══════════════ 4.5 · A / B / C scan ══════════════ */
function ScanTypes({ accent }) {
  const [scan, setScan] = useState("A");
  return (
    <div>
      <Seg accent={accent} value={scan} onChange={setScan} options={[{ v: "A", label: "A-scan" }, { v: "B", label: "B-scan" }, { v: "C", label: "C-scan" }]} />
      <VStage label={scan === "A" ? "A-scan: echo amplitude vs time at one point — the trace you read to detect and size." : scan === "B" ? "B-scan: A-scans stacked along a line into a cross-sectional (side) view showing flaw depth and length." : "C-scan: a top-down plan map colour-coded by echo strength — shows the flaw's extent over an area."}>
        <svg viewBox="0 0 220 100" className="v-svg" style={{ maxWidth: 340 }}>
          {scan === "A" && <><line x1="20" y1="80" x2="200" y2="80" stroke="#64748b" strokeWidth="0.8" /><line x1="40" y1="30" x2="40" y2="80" stroke={accent} strokeWidth="2" /><line x1="110" y1="52" x2="110" y2="80" stroke="#dc2626" strokeWidth="2" /><line x1="185" y1="40" x2="185" y2="80" stroke="#475569" strokeWidth="2" /></>}
          {scan === "B" && <><rect x="20" y="20" width="180" height="60" rx="3" fill="#e2e8f0" stroke="#64748b" /><line x1="20" y1="24" x2="200" y2="24" stroke="#475569" strokeWidth="2" /><line x1="20" y1="76" x2="200" y2="76" stroke="#475569" strokeWidth="2" /><ellipse cx="120" cy="50" rx="22" ry="6" fill="#dc2626" opacity="0.8" /></>}
          {scan === "C" && <><rect x="20" y="14" width="180" height="72" rx="3" fill="#0b3d2e" stroke="#64748b" />{[[80, 40, 18], [130, 55, 12]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.7} fill="#dc2626" opacity="0.85" style={{ filter: "blur(1px)" }} />)}</>}
          <text x="110" y="96" textAnchor="middle" fontSize="7" fill="#94a3b8">{scan === "A" ? "trace (depth)" : scan === "B" ? "cross-section (side)" : "plan map (top-down)"}</text>
        </svg>
      </VStage>
    </div>
  );
}

/* ══════════════ 4.6 · Phased array beam steering ══════════════ */
function PhasedArray({ accent }) {
  const [ang, setAng] = useState(0); // -40..40
  const rad = ((ang + 90) * Math.PI) / 180;
  const ox = 110, oy = 34, L = 70;
  return (
    <div>
      <VStage label={`Beam steered to ${ang}° — with no probe motion. Each element fires with a tiny delay so the wavefronts add up in the chosen direction. Sweeping the angle builds a live sectorial image.`}>
        <svg viewBox="0 0 220 120" className="v-svg" style={{ maxWidth: 360 }}>
          <rect x="20" y="30" width="180" height="80" rx="3" fill="#cbd5e1" stroke="#64748b" />
          {/* element array */}
          {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={92 + i * 3} y="24" width="2.2" height="8" rx="1" fill={accent} />)}
          {/* swept fan (faint) */}
          {[-40, -20, 0, 20, 40].map((a) => { const r = ((a + 90) * Math.PI) / 180; return <line key={a} x1={ox} y1={oy} x2={ox + Math.cos(r) * L} y2={oy + Math.sin(r) * L} stroke={accent} strokeWidth="1" opacity="0.18" />; })}
          {/* active beam */}
          <line x1={ox} y1={oy} x2={ox + Math.cos(rad) * L} y2={oy + Math.sin(rad) * L} stroke={accent} strokeWidth="3" strokeLinecap="round" />
          <text x="110" y="118" textAnchor="middle" fontSize="7" fill="#94a3b8">electronically steered beam</text>
        </svg>
      </VStage>
      <div className="v-slider"><span>Beam angle</span><input type="range" min="-40" max="40" value={ang} onChange={(e) => setAng(+e.target.value)} style={{ accentColor: accent }} /><b>{ang}°</b></div>
    </div>
  );
}

/* ══════════════ 4.7 · TOFD tip diffraction ══════════════ */
function Tofd({ accent }) {
  const [h, setH] = useState(40); // crack height %
  const topY = 42, botY = topY + (h / 100) * 34;
  return (
    <div>
      <VStage label={`TOFD times the waves diffracted from the crack's top and bottom tips. Taller crack (${h}%) → bigger gap between the two tip signals — that gives the through-wall height directly, regardless of echo strength.`}>
        <svg viewBox="0 0 220 130" className="v-svg" style={{ maxWidth: 360 }}>
          <rect x="20" y="34" width="180" height="52" rx="3" fill="#cbd5e1" stroke="#64748b" />
          <rect x="30" y="24" width="22" height="10" rx="2" fill={accent} transform="rotate(30 41 29)" />
          <rect x="168" y="24" width="22" height="10" rx="2" fill="#475569" transform="rotate(-30 179 29)" />
          <text x="41" y="18" fontSize="6.5" fill={accent}>T</text><text x="179" y="18" fontSize="6.5" fill="#475569">R</text>
          {/* crack + tips */}
          <line x1="110" y1={topY} x2="110" y2={botY} stroke="#dc2626" strokeWidth="2.5" />
          <circle cx="110" cy={topY} r="2.5" fill="#fde047" /><circle cx="110" cy={botY} r="2.5" fill="#fde047" />
          {/* signal timeline */}
          <line x1="20" y1="110" x2="200" y2="110" stroke="#64748b" strokeWidth="0.8" />
          <line x1="40" y1="98" x2="40" y2="110" stroke="#94a3b8" strokeWidth="1.6" />
          <text x="40" y="122" textAnchor="middle" fontSize="6" fill="#94a3b8">lateral</text>
          <line x1={70 + (topY - 42) } y1="100" x2={70} y2="110" stroke="#dc2626" strokeWidth="1.8" />
          <text x="70" y="122" textAnchor="middle" fontSize="6" fill="#dc2626">top tip</text>
          <line x1={90 + (h / 100) * 60} y1="100" x2={90 + (h / 100) * 60} y2="110" stroke="#dc2626" strokeWidth="1.8" />
          <text x={90 + (h / 100) * 60} y="122" textAnchor="middle" fontSize="6" fill="#dc2626">bottom tip</text>
        </svg>
      </VStage>
      <div className="v-slider"><span>Crack height</span><input type="range" min="10" max="95" value={h} onChange={(e) => setH(+e.target.value)} style={{ accentColor: accent }} /><b>{h}%</b></div>
    </div>
  );
}

/* ══════════════ 4.8 · Acoustic emission principle ══════════════ */
function AePrinciple({ accent }) {
  const [load, setLoad] = useState(30);
  const active = load > 60;
  return (
    <div>
      <VStage label={active ? `Under ${load}% load the crack grows and releases a burst of stress-wave energy — the sensors 'hear' it. AE reacts only to ACTIVE damage.` : `At ${load}% load the crack is stable and silent — no emission. AE needs the structure stressed to trigger active flaws.`}>
        <svg viewBox="0 0 220 110" className="v-svg" style={{ maxWidth: 360 }}>
          <rect x="20" y="40" width="180" height="40" rx="3" fill="#cbd5e1" stroke="#64748b" />
          {/* load arrows */}
          <polygon points="10,60 20,54 20,66" fill={active ? "#dc2626" : "#94a3b8"} />
          <polygon points="210,60 200,54 200,66" fill={active ? "#dc2626" : "#94a3b8"} />
          {/* crack */}
          <line x1="110" y1="48" x2="110" y2="72" stroke="#dc2626" strokeWidth="2.5" />
          {/* sensors */}
          <rect x="55" y="32" width="12" height="8" rx="2" fill={accent} /><rect x="153" y="32" width="12" height="8" rx="2" fill={accent} />
          {/* emission waves */}
          {active && [10, 18, 26].map((r, i) => <circle key={i} cx="110" cy="60" r={r} fill="none" stroke={accent} strokeWidth="1.3" opacity={0.8 - i * 0.22} />)}
          <text x="110" y="98" textAnchor="middle" fontSize="7" fill="#94a3b8">{active ? "stress-wave burst → sensors" : "stable crack — silent"}</text>
        </svg>
      </VStage>
      <div className="v-slider"><span>Load</span><input type="range" min="0" max="100" value={load} onChange={(e) => setLoad(+e.target.value)} style={{ accentColor: accent }} /><b>{load}%</b></div>
      <div className="v-tagline"><span style={{ color: active ? accent : "var(--muted)", fontWeight: 700 }}>{active ? "✓ Active emission detected" : "no emission — flaw not growing"}</span></div>
    </div>
  );
}

/* ══════════════ 4.9 · AE source location ══════════════ */
function AeApplications({ accent }) {
  const [src, setSrc] = useState({ x: 130, y: 60 });
  const sensors = [{ x: 40, y: 30 }, { x: 190, y: 30 }, { x: 40, y: 95 }, { x: 190, y: 95 }];
  const dist = (s) => Math.round(Math.hypot(s.x - src.x, s.y - src.y));
  return (
    <div>
      <VStage label="Click anywhere on the tank to place an active source. Each sensor 'hears' it at a different time; comparing those arrival times triangulates where the damage is — so UT/RT can go straight to the spot.">
        <svg viewBox="0 0 230 125" className="v-svg" style={{ maxWidth: 380, cursor: "crosshair" }}
          onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); const sx = ((e.clientX - r.left) / r.width) * 230, sy = ((e.clientY - r.top) / r.height) * 125; setSrc({ x: Math.max(20, Math.min(210, sx)), y: Math.max(18, Math.min(107, sy)) }); }}>
          <rect x="14" y="14" width="202" height="97" rx="8" fill="#e2e8f0" stroke="#64748b" />
          {sensors.map((s, i) => <g key={i}><circle cx={s.x} cy={s.y} r={4} fill={accent} /><circle cx={s.x} cy={s.y} r={dist(s) * 0.9} fill="none" stroke={accent} strokeWidth="0.8" opacity="0.25" /></g>)}
          <g><circle cx={src.x} cy={src.y} r="5" fill="#dc2626" /><circle cx={src.x} cy={src.y} r="9" fill="none" stroke="#dc2626" strokeWidth="1.2" /></g>
          <text x="115" y="121" textAnchor="middle" fontSize="7" fill="#94a3b8">4 sensors · red = located active source</text>
        </svg>
      </VStage>
      <div className="v-tagline"><span style={{ color: accent, fontWeight: 700 }}>Arrival-time differences pinpoint the source — global monitoring, local follow-up</span></div>
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
  // Unit I
  IntroTesting, NdtVsMech, MethodMap, DefectGallery, MaterialChar,
  MeritsScale, LimitsRadar, MaterialProps, VisualInspect,
  // Unit II
  LptIntro, PenetrantProps, Developer, LptProsCons, LptProcedure,
  MptIntro, Magnetization, MptParticles, Demag,
  // Unit III
  ThermoPrinciple, ContactNonContact, LiquidCrystal, IrDetectors, ThermoInstrument,
  EddyGen, EddyProbes, EddyArrange, EtProsCons,
  // Unit IV
  UtPrinciple, Transducer, UtMethods, BeamAngles, ScanTypes,
  PhasedArray, Tofd, AePrinciple, AeApplications,
};

export function Visual({ session, accent, accent2 }) {
  const C = (session && VISUALS[session.visual]) || Placeholder;
  return <C accent={accent} accent2={accent2} session={session} />;
}
