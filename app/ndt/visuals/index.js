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
  IntroTesting, NdtVsMech, MethodMap, VisualInspect,
};

export function Visual({ session, accent, accent2 }) {
  const C = (session && VISUALS[session.visual]) || Placeholder;
  return <C accent={accent} accent2={accent2} session={session} />;
}
