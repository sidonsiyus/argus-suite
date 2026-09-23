"use client";
/* GTEM Learning Bay — React rewrite of the NDT inspection bay.
 * Inspection-console identity (warm-dark + safety red + hazard stripes),
 * Inter type, deep per-session content. 5 units × 9 sessions = 45.
 * Old public/gtem-inspection-bay.html stays as the fallback until verified. */
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { UNITS, ALL_SESSIONS, SESSION_COUNT, COURSE } from "../../lib/gtem/curriculum";
import { DETAIL } from "../../lib/gtem/content";
import { EXTRA } from "../../lib/gtem/extra";
import { QUIZ } from "../../lib/gtem/assessments";
import { VIDEOS } from "../../lib/gtem/videos";
import { Visual } from "./visuals";

const KEY = "gtem_v1";
const yt = (q) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q + " gas turbine engine explained");

export default function GtemBay() {
  const [dark, setDark] = useState(true);
  const [openUnit, setOpenUnit] = useState(1);
  const [cur, setCur] = useState("1.1");
  const [done, setDone] = useState({});
  const [marks, setMarks] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch((s) => !s); }
      else if (e.key === "Escape") setSearch(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(KEY) || "{}"); if (s.done) setDone(s.done); if (s.marks) setMarks(s.marks); if (s.dark != null) setDark(s.dark); if (s.cur) setCur(s.cur); } catch (e) {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (!loaded) return; try { localStorage.setItem(KEY, JSON.stringify({ done, marks, dark, cur })); } catch (e) {} }, [done, marks, dark, cur, loaded]);
  useEffect(() => { if (mainRef.current) mainRef.current.scrollTop = 0; }, [cur]);

  const session = useMemo(() => ALL_SESSIONS.find((s) => s.id === cur), [cur]);
  const idx = useMemo(() => ALL_SESSIONS.findIndex((s) => s.id === cur), [cur]);
  const doneCount = Object.values(done).filter(Boolean).length;
  const pct = Math.round((doneCount / SESSION_COUNT) * 100);
  const unitProgress = (u) => u.sessions.filter((s) => done[s.id]).length;

  const go = useCallback((id) => { setCur(id); setNavOpen(false); const s = ALL_SESSIONS.find((x) => x.id === id); if (s) setOpenUnit(s.unitId); }, []);
  const goHome = () => { setCur("home"); setNavOpen(false); };
  const markDone = (id) => setDone((d) => ({ ...d, [id]: true }));
  const toggleMark = (id) => setMarks((m) => ({ ...m, [id]: !m[id] }));
  const prev = () => idx > 0 && go(ALL_SESSIONS[idx - 1].id);
  const next = () => idx < ALL_SESSIONS.length - 1 && go(ALL_SESSIONS[idx + 1].id);
  const curUnit = useMemo(() => UNITS.find((u) => u.id === (session ? session.unitId : 0)), [session]);

  return (
    <div className="gtem" data-theme={dark ? "dark" : "light"}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gtem-scan" style={{ width: pct + "%" }} />
      {/* ── mobile top bar ── */}
      <div className="gtem-mbar">
        <button className="gtem-hamb" onClick={() => setNavOpen(true)} aria-label="Open menu"><span /><span /><span /></button>
        <button className="gtem-mbar-brand" onClick={goHome}><span className="gtem-logo">◆</span>GTEM Learning</button>
        <span className="gtem-mbar-prog">{doneCount}/{SESSION_COUNT}</span>
      </div>
      {navOpen && <div className="gtem-backdrop" onClick={() => setNavOpen(false)} />}
      {/* ── rail ── */}
      <aside className={"gtem-rail" + (navOpen ? " open" : "")}>
        <button className="gtem-brand" onClick={goHome}>
          <span className="gtem-logo">◆</span>
          <span className="gtem-brandtx"><small>Engine Module · {COURSE.code}</small><b>GTEM Learning</b></span>
        </button>
        <div className="gtem-prog">
          <div className="gtem-prog-top"><span>Certification progress</span><b>{doneCount}/{SESSION_COUNT}</b></div>
          <div className="gtem-bar"><i style={{ width: pct + "%" }} /></div>
        </div>
        <button className="gtem-searchbtn" onClick={() => setSearch(true)}><span className="gtem-search-ic">⌕</span>Search<kbd>⌘K</kbd></button>
        <nav className="gtem-nav">
          <button className={"gtem-home" + (cur === "home" ? " on" : "")} onClick={goHome}><span className="gtem-home-ic">◎</span>Overview</button>
          <button className={"gtem-home" + (cur === "revise" ? " on" : "")} onClick={() => { setCur("revise"); setNavOpen(false); }}><span className="gtem-home-ic">◆</span>Revision &amp; exams</button>
          {UNITS.map((u) => {
            const open = openUnit === u.id, up = unitProgress(u);
            return (
              <div key={u.id} className="gtem-unit">
                <button className={"gtem-unit-h" + (open ? " open" : "")} onClick={() => setOpenUnit(open ? 0 : u.id)}>
                  <span className="uc">{u.code}</span>
                  <span className="ut">{u.title}<small>{up}/{u.sessions.length} · {u.tag}</small></span>
                  <span className="uchev">{open ? "▾" : "▸"}</span>
                </button>
                {open && (
                  <div className="gtem-sessions">
                    {u.sessions.map((s) => (
                      <button key={s.id} className={"gtem-sess" + (cur === s.id ? " on" : "")} onClick={() => go(s.id)}>
                        <span className={"sn" + (done[s.id] ? " ok" : "")}>{done[s.id] ? "✓" : s.n}</span>
                        <span className="st">{s.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <button className="gtem-theme" onClick={() => setDark((d) => !d)}>{dark ? "☾  Dark" : "☀  Light"}</button>
      </aside>

      {/* ── main ── */}
      <main className="gtem-main" ref={mainRef}>
        {cur === "home" ? <Home go={go} done={done} /> : cur === "revise" ? <Revise go={go} /> : session ? (
          <SessionView key={session.id} session={session} done={!!done[session.id]}
            onDone={() => markDone(session.id)} onPrev={prev} onNext={next}
            hasPrev={idx > 0} hasNext={idx < ALL_SESSIONS.length - 1}
            unitDone={curUnit ? unitProgress(curUnit) : 0} unitTotal={12}
            bookmarked={!!marks[session.id]} onBookmark={() => toggleMark(session.id)}
            nextSession={idx < ALL_SESSIONS.length - 1 ? ALL_SESSIONS[idx + 1] : null} go={go} />
        ) : null}
      </main>
      {search && <SearchPalette onClose={() => setSearch(false)} go={(id) => { go(id); setSearch(false); }} />}
    </div>
  );
}

/* ── command-palette search ── */
function SearchPalette({ onClose, go }) {
  const [q, setQ] = useState("");
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const ql = q.trim().toLowerCase();
  const sessions = (ql ? ALL_SESSIONS.filter((s) => (s.title + " " + s.method + " " + s.unitTitle + " " + (s.summary || "")).toLowerCase().includes(ql)) : ALL_SESSIONS).slice(0, ql ? 8 : 6);
  const terms = ql ? Object.entries(DETAIL).flatMap(([id, d]) => (d.keyTerms || []).map((t) => ({ ...t, id }))).filter((t) => (t.t + " " + t.d).toLowerCase().includes(ql)).slice(0, 6) : [];
  return (
    <div className="gtem-search-ovl" onClick={onClose}>
      <div className="gtem-search" onClick={(e) => e.stopPropagation()}>
        <div className="gtem-search-in"><span className="gtem-search-ic">⌕</span><input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sessions, methods and glossary terms…" /></div>
        <div className="gtem-search-res">
          {sessions.length > 0 && <div className="gtem-search-grp">Sessions</div>}
          {sessions.map((s) => (
            <button key={s.id} className="gtem-search-i" onClick={() => go(s.id)}>
              <span className="si-n" style={{ color: s.accent }}>{s.unitCode}.{s.n}</span>
              <span className="si-t">{s.title}</span><span className="si-m">{s.method}</span>
            </button>
          ))}
          {terms.length > 0 && <div className="gtem-search-grp">Glossary</div>}
          {terms.map((t, i) => (
            <button key={i} className="gtem-search-i term" onClick={() => go(t.id)}>
              <span className="si-term">{t.t}</span><span className="si-def">{t.d}</span>
            </button>
          ))}
          {ql && sessions.length === 0 && terms.length === 0 && <div className="gtem-search-empty">No matches for “{q}”.</div>}
        </div>
        <div className="gtem-search-foot"><span>{sessions.length + terms.length} result{sessions.length + terms.length === 1 ? "" : "s"}</span><kbd>esc</kbd></div>
      </div>
    </div>
  );
}

/* ── revision & exams ── */
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
function unitTerms(uid) { const u = UNITS.find((x) => x.id === uid); return u ? u.sessions.flatMap((s) => (DETAIL[s.id]?.keyTerms || []).map((t) => ({ ...t, sid: s.id }))) : []; }
function allTerms() { return UNITS.flatMap((u) => unitTerms(u.id)); }
function unitQuestions(uid) { const u = UNITS.find((x) => x.id === uid); return u ? u.sessions.flatMap((s) => (QUIZ[s.id] || []).map((q) => ({ ...q, sid: s.id }))) : []; }

function Revise({ go }) {
  const [mode, setMode] = useState("flash");
  const [exam, setExam] = useState(null);
  return (
    <div className="gtem-revwrap">
      <div className="gtem-rev-head">
        <span className="gtem-eyebrow"><i className="led" />Revise · self-test</span>
        <h1>Revision &amp; exams</h1>
        <p>Drill the glossary with flashcards, then test yourself with a per-unit exam or the final across all five methods.</p>
      </div>
      <div className="gtem-rev-tabs">
        <button className={mode === "flash" ? "on" : ""} onClick={() => setMode("flash")}>◆ Flashcards</button>
        <button className={mode === "exam" ? "on" : ""} onClick={() => setMode("exam")}>▦ Exams</button>
      </div>
      {mode === "flash" ? <FlashHub /> : <ExamHub onStart={setExam} />}
      {exam && <ExamRunner exam={exam} onClose={() => setExam(null)} />}
    </div>
  );
}
function FlashHub() {
  const [uid, setUid] = useState(0);
  const cards = useMemo(() => shuffle(uid ? unitTerms(uid) : allTerms()), [uid]);
  return (
    <div>
      <div className="gtem-cmp-filter gtem-rev-filter">
        <button className={uid === 0 ? "on" : ""} onClick={() => setUid(0)}>All</button>
        {UNITS.map((u) => <button key={u.id} className={uid === u.id ? "on" : ""} onClick={() => setUid(u.id)}>Unit {u.code}</button>)}
      </div>
      <Flashcards key={uid} cards={cards} />
    </div>
  );
}
function Flashcards({ cards }) {
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [known, setKnown] = useState(() => new Set());
  if (!cards.length) return <div className="gtem-rev-empty">No terms.</div>;
  const c = cards[i % cards.length];
  const nav = (d) => { setFlip(false); setI((v) => (v + d + cards.length) % cards.length); };
  const markKnown = () => { setKnown((k) => new Set(k).add(i)); nav(1); };
  return (
    <div className="gtem-flash">
      <div className="gtem-flash-meta"><span>{i + 1} / {cards.length}</span><span>{known.size} marked known</span></div>
      <button className={"gtem-flashcard" + (flip ? " on" : "")} onClick={() => setFlip((f) => !f)}>
        <span className="gtem-flashcard-in">
          <span className="gtem-flashcard-f"><small>TERM</small><b>{c.t}</b><em>tap to reveal</em></span>
          <span className="gtem-flashcard-b"><small>DEFINITION</small><p>{c.d}</p></span>
        </span>
      </button>
      <div className="gtem-flash-nav">
        <button className="gtem-navb" onClick={() => nav(-1)}>← Prev</button>
        <button className="gtem-navb ok" onClick={markKnown}>✓ Got it</button>
        <button className="gtem-navb" onClick={() => nav(1)}>Next →</button>
      </div>
    </div>
  );
}
function ExamHub({ onStart }) {
  const start = (title, qs) => onStart({ title, questions: shuffle(qs).slice(0, Math.min(qs.length, 12)) });
  return (
    <div className="gtem-examcards">
      {UNITS.map((u) => { const qs = unitQuestions(u.id); return (
        <button key={u.id} className="gtem-examcard" onClick={() => start("Unit " + u.code + " exam", qs)}>
          <span className="gtem-examcard-k">Unit {u.code}</span><b>{u.title}</b><small>{Math.min(qs.length, 12)} questions · pass 70%</small>
        </button>
      ); })}
      <button className="gtem-examcard final" onClick={() => start("Final exam · all methods", UNITS.flatMap((u) => unitQuestions(u.id)))}>
        <span className="gtem-examcard-k">Final</span><b>All five methods</b><small>12 questions · pass 70%</small>
      </button>
    </div>
  );
}
function ExamRunner({ exam, onClose }) {
  const [ans, setAns] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const qs = exam.questions;
  const score = qs.reduce((n, q, i) => n + (ans[i] === q.answer ? 1 : 0), 0);
  const pct = Math.round((score / qs.length) * 100), pass = pct >= 70;
  return (
    <div className="gtem-exam-ovl" onClick={onClose}>
      <div className="gtem-exam" onClick={(e) => e.stopPropagation()}>
        <div className="gtem-exam-h"><b>{exam.title}</b>{!submitted && <span className="gtem-exam-prog">{Object.keys(ans).length}/{qs.length}</span>}<button className="mdl-x" onClick={onClose}>✕</button></div>
        <div className="gtem-exam-body">
          {submitted && <div className={"gtem-exam-score" + (pass ? " pass" : " fail")}><b>{pct}%</b><span>{score}/{qs.length} correct · {pass ? "PASS" : "below 70% — review & retake"}</span></div>}
          {qs.map((q, i) => (
            <div key={i} className="gtem-q">
              <b>{i + 1}. {q.q}</b>
              <div className="gtem-opts">
                {q.options.map((o, j) => {
                  const sel = ans[i] === j, right = submitted && j === q.answer, wrong = submitted && sel && j !== q.answer;
                  return <button key={j} className={"gtem-opt" + (sel ? " sel" : "") + (right ? " right" : "") + (wrong ? " wrong" : "")} disabled={submitted} onClick={() => setAns((a) => ({ ...a, [i]: j }))}><span className="gtem-opt-m">{String.fromCharCode(65 + j)}</span>{o}</button>;
                })}
              </div>
              {submitted && <p className={"gtem-explain" + (ans[i] === q.answer ? " ok" : " no")}>{ans[i] === q.answer ? "✓ " : "✗ "}{q.explain}</p>}
            </div>
          ))}
        </div>
        <div className="gtem-exam-foot">
          {!submitted ? <button className="gtem-btn sm" disabled={Object.keys(ans).length < qs.length} onClick={() => setSubmitted(true)}>Submit exam</button>
            : <><button className="gtem-btn sm ghost" onClick={() => { setAns({}); setSubmitted(false); }}>Retake</button><button className="gtem-btn sm" onClick={onClose}>Done</button></>}
        </div>
      </div>
    </div>
  );
}

/* ── overview / home ── */
function Home({ go, done }) {
  const doneCount = Object.values(done).filter(Boolean).length;
  return (
    <div className="gtem-home-wrap">
      <div className="gtem-hero">
        <div className="gtem-hero-stripe" />
        <div className="gtem-hero-body">
          <span className="gtem-eyebrow"><i className="led" />{COURSE.program} · {COURSE.code}</span>
          <h1>Find the flaw.<br /><span className="g">Keep the part flying.</span></h1>
          <p>Non-Destructive Testing inspects an aircraft component for hidden defects without ever taking it apart. Walk {SESSION_COUNT} in-depth sessions across five methods — each with a hands-on interactive, curated video, detailed lesson and a knowledge check — on the way to Certified Inspector.</p>
          <div className="gtem-hero-cta">
            <button className="gtem-btn" onClick={() => go(doneCount ? nextUndone(done) : "1.1")}>{doneCount ? "Resume learning" : "Begin Unit I"} →</button>
            <span className="gtem-hero-stat"><b>{doneCount}</b> / {SESSION_COUNT} sessions complete</span>
          </div>
        </div>
      </div>
      <div className="gtem-sec-eyebrow">The five methods · 45 sessions</div>
      <div className="gtem-unitcards">
        {UNITS.map((u) => {
          const up = u.sessions.filter((s) => done[s.id]).length;
          return (
            <button key={u.id} className="gtem-uc" onClick={() => go(u.sessions[0].id)}>
              <div className="gtem-uc-top"><span className="gtem-uc-code">UNIT {u.code}</span><span className="gtem-uc-icon">{u.icon}</span></div>
              <b>{u.title}</b>
              <small>{u.blurb}</small>
              <div className="gtem-uc-foot"><span className="gtem-uc-tag">{u.tag} · {u.sessions.length} sessions</span><span className="gtem-uc-prog">{up}/{u.sessions.length}</span></div>
            </button>
          );
        })}
      </div>
      <MethodCompare />
    </div>
  );
}

/* ── method comparison tool ── */
const METHODS_CMP = [
  { id: "VT", name: "Visual", kind: "surface", energy: "Light", materials: "Any", finds: "Visible surface flaws", cost: 1, portable: 3 },
  { id: "PT", name: "Liquid Penetrant", kind: "surface", energy: "Dye + capillarity", materials: "Non-porous", finds: "Surface-breaking cracks", cost: 1, portable: 3 },
  { id: "MT", name: "Magnetic Particle", kind: "surface", energy: "Magnetic field", materials: "Ferromagnetic", finds: "Surface / near-surface cracks", cost: 2, portable: 3 },
  { id: "ET", name: "Eddy Current", kind: "surface", energy: "Induced current", materials: "Conductive", finds: "Cracks, conductivity, coatings", cost: 2, portable: 2 },
  { id: "IR", name: "Thermography", kind: "surface", energy: "Infrared / heat", materials: "Most", finds: "Delaminations, hot spots", cost: 3, portable: 2 },
  { id: "UT", name: "Ultrasonic", kind: "volumetric", energy: "Sound", materials: "Most solids", finds: "Internal flaws, thickness", cost: 2, portable: 2 },
  { id: "AE", name: "Acoustic Emission", kind: "volumetric", energy: "Stress waves", materials: "Most", finds: "Active / growing damage", cost: 3, portable: 2 },
  { id: "RT", name: "Radiography", kind: "volumetric", energy: "X / γ rays", materials: "Most", finds: "Internal volumetric flaws", cost: 3, portable: 1 },
];
function MethodCompare() {
  const [filter, setFilter] = useState("all");
  const rows = METHODS_CMP.filter((m) => filter === "all" || m.kind === filter);
  const dots = (n) => "●".repeat(n) + "○".repeat(3 - n);
  return (
    <div className="gtem-cmp">
      <div className="gtem-cmp-h">
        <div className="gtem-sec-eyebrow" style={{ margin: 0 }}>Compare the eight methods</div>
        <div className="gtem-cmp-filter">
          {[["all", "All"], ["surface", "Surface"], ["volumetric", "Volumetric"]].map(([v, l]) => (
            <button key={v} className={filter === v ? "on" : ""} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="gtem-cmp-scroll">
        <table className="gtem-cmp-t">
          <thead><tr><th>Method</th><th>Reach</th><th>Energy</th><th>Materials</th><th>Detects</th><th>Cost</th><th>Portability</th></tr></thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td><b>{m.id}</b> {m.name}</td>
                <td><span className={"gtem-cmp-tag " + m.kind}>{m.kind}</span></td>
                <td>{m.energy}</td><td>{m.materials}</td><td>{m.finds}</td>
                <td className="gtem-cmp-dots">{dots(m.cost)}</td><td className="gtem-cmp-dots">{dots(m.portable)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function nextUndone(done) { const s = ALL_SESSIONS.find((x) => !done[x.id]); return s ? s.id : "1.1"; }
function readMins(detail, extra) {
  let w = (detail.overview || "").split(/\s+/).length;
  (detail.sections || []).forEach((s) => { w += (s.p || "").split(/\s+/).length; (s.list || []).forEach((l) => (w += l.split(/\s+/).length)); });
  (extra?.deepDives || []).forEach((d) => (w += (d.p || "").split(/\s+/).length));
  if (extra?.caseStudy) w += Object.values(extra.caseStudy).join(" ").split(/\s+/).length;
  return Math.max(3, Math.round(w / 190));
}

/* ── one session ── */
function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const root = document.querySelector(".gtem-main");
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id);
    }, { root, rootMargin: "-18% 0px -72% 0px", threshold: 0 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids.join(",")]); // eslint-disable-line
  return active;
}
function specFor(s) {
  const m = s.method;
  if (/LPT/.test(m)) return [["Reach", "Surface-breaking"], ["Materials", "Any non-porous"], ["Finds", "Surface cracks & porosity"]];
  if (/MPT/.test(m)) return [["Reach", "Surface & near-surface"], ["Materials", "Ferromagnetic only"], ["Finds", "Surface/near-surface cracks"]];
  if (/IR/.test(m)) return [["Reach", "Sub-surface (thermal)"], ["Materials", "Most"], ["Finds", "Delaminations, hot spots"]];
  if (/ET/.test(m)) return [["Reach", "Surface & near-surface"], ["Materials", "Conductive only"], ["Finds", "Cracks, conductivity, coatings"]];
  if (/UT/.test(m)) return [["Reach", "Volumetric"], ["Materials", "Most solids"], ["Finds", "Internal flaws, thickness"]];
  if (/AE/.test(m)) return [["Reach", "Whole structure"], ["Materials", "Most"], ["Finds", "Active / growing damage"]];
  if (/RT/.test(m)) return [["Reach", "Volumetric"], ["Materials", "Most"], ["Finds", "Internal volumetric flaws"]];
  if (/Visual/.test(m)) return [["Reach", "Surface (visible)"], ["Materials", "Any"], ["Finds", "Visible surface features"]];
  return [["Unit", "Unit " + s.unitCode], ["Focus", m], ["Sessions", "12"]];
}
function Spine({ secs, active, onJump }) {
  return (
    <div className="gtem-spine" aria-hidden>
      {secs.map((s) => (
        <button key={s.id} className={"gtem-spine-dot" + (active === "sec-" + s.id ? " on" : "")} onClick={() => onJump("sec-" + s.id)} title={s.label} />
      ))}
    </div>
  );
}
function ProgressRing({ value, max }) {
  const pct = max ? value / max : 0, r = 26, c = 2 * Math.PI * r;
  return (
    <div className="gtem-ring">
      <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r={r} className="gtem-ring-bg" /><circle cx="32" cy="32" r={r} className="gtem-ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 32 32)" /></svg>
      <div className="gtem-ring-tx"><b>{value}</b><span>/ {max}</span></div>
    </div>
  );
}
function Notes({ id }) {
  const nk = "gtem_notes_" + id;
  const [v, setV] = useState("");
  useEffect(() => { try { setV(localStorage.getItem(nk) || ""); } catch (e) { setV(""); } }, [nk]);
  const save = (t) => { setV(t); try { localStorage.setItem(nk, t); } catch (e) {} };
  return (
    <div className="gtem-side-card">
      <div className="gtem-side-k">My notes</div>
      <textarea className="gtem-notes" value={v} onChange={(e) => save(e.target.value)} placeholder="Jot anything for this session… (saved on this device)" />
    </div>
  );
}
// Build the grounding context sent to the tutor route for this session.
function tutorContext(session) {
  const d = DETAIL[session.id] || {};
  const x = EXTRA[session.id] || {};
  return {
    unit: "Unit " + session.unitCode + " · " + (UNITS.find((u) => u.id === session.unit)?.title || ""),
    title: session.n + " " + session.title,
    overview: d.overview || session.summary || "",
    sections: (d.sections || []).map((s) => ({ h: s.h, p: s.p })),
    terms: d.keyTerms || [],
    caseStudy: x.caseStudy || null,
  };
}
function AskTutor({ session }) {
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState([]); // {role:'you'|'tutor', text}
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  // Fresh thread when the session changes.
  useEffect(() => { setMsgs([]); setQ(""); setBusy(false); }, [session.id]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs, busy]);

  const send = useCallback(async () => {
    const question = q.trim();
    if (!question || busy) return;
    setMsgs((m) => [...m, { role: "you", text: question }]);
    setQ("");
    setBusy(true);
    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context: tutorContext(session) }),
      });
      const d = await r.json();
      const text = d?.answer
        || (d?.error === "tutor_unconfigured"
            ? "The tutor isn't switched on yet — ask your instructor to add the API key. In the meantime, try the lesson notes and case file above."
            : "I couldn't reach the tutor just now. Please try again in a moment, or ask your instructor.");
      setMsgs((m) => [...m, { role: "tutor", text }]);
    } catch {
      setMsgs((m) => [...m, { role: "tutor", text: "Network hiccup — I couldn't reach the tutor. Try again in a moment." }]);
    } finally {
      setBusy(false);
    }
  }, [q, busy, session]);

  const suggestions = [
    "Explain this session simply",
    "Give me a real aviation example",
    "How is this method different from the others?",
  ];

  return (
    <div className="gtem-side-card gtem-ask">
      <div className="gtem-side-k">Ask a doubt <span className="gtem-ask-badge">AI tutor</span></div>
      <div className="gtem-ask-log" ref={scrollRef}>
        {msgs.length === 0 && !busy && (
          <div className="gtem-ask-empty">
            <p>Stuck on anything in this session? Ask and I'll explain — grounded in this lesson.</p>
            <div className="gtem-ask-sugs">
              {suggestions.map((s) => (
                <button key={s} className="gtem-ask-sug" onClick={() => setQ(s)} disabled={busy}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={"gtem-ask-msg " + m.role}>
            <span className="gtem-ask-who">{m.role === "you" ? "You" : "Tutor"}</span>
            <div className="gtem-ask-bubble">{m.text}</div>
          </div>
        ))}
        {busy && <div className="gtem-ask-msg tutor"><span className="gtem-ask-who">Tutor</span><div className="gtem-ask-bubble gtem-ask-typing"><i /><i /><i /></div></div>}
      </div>
      <div className="gtem-ask-in">
        <textarea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type your doubt…  (Enter to send)"
          rows={2}
          disabled={busy}
        />
        <button className="gtem-ask-send" onClick={send} disabled={busy || !q.trim()}>{busy ? "…" : "Ask"}</button>
      </div>
      <div className="gtem-ask-foot">AI can be wrong — verify anything important with your instructor.</div>
    </div>
  );
}
function SidePanel({ session, secs, active, onJump, unitDone, unitTotal, done, onDone, bookmarked, onBookmark, nextSession, go }) {
  return (
    <aside className="gtem-side">
      <div className="gtem-side-card gtem-otp-card">
        <div className="gtem-side-k">On this page</div>
        <nav className="gtem-otp">
          {secs.map((s) => (
            <button key={s.id} className={"gtem-otp-i" + (active === "sec-" + s.id ? " on" : "")} onClick={() => onJump("sec-" + s.id)}>{s.label}</button>
          ))}
        </nav>
      </div>
      <div className="gtem-side-card gtem-action">
        <div className="gtem-action-top"><ProgressRing value={unitDone} max={unitTotal} /><div className="gtem-action-lbl"><b>Unit {session.unitCode}</b><span>{unitDone}/{unitTotal} sessions</span></div></div>
        <button className={"gtem-side-btn primary" + (done ? " is" : "")} onClick={onDone} disabled={done}>{done ? "✓ Completed" : "Mark complete"}</button>
        <button className={"gtem-side-btn" + (bookmarked ? " on" : "")} onClick={onBookmark}>{bookmarked ? "★ Bookmarked" : "☆ Bookmark"}</button>
        {nextSession && <button className="gtem-nextup" onClick={() => go(nextSession.id)}><span>Next up</span><b>{nextSession.title}</b><em>→</em></button>}
      </div>
      <div className="gtem-side-card">
        <div className="gtem-side-k">Quick spec · {session.method}</div>
        <div className="gtem-spec">{specFor(session).map(([k, v]) => <div key={k} className="gtem-spec-row"><span>{k}</span><b>{v}</b></div>)}</div>
      </div>
      <AskTutor session={session} />
      <Notes id={session.id} />
    </aside>
  );
}

function SessionView({ session, done, onDone, onPrev, onNext, hasPrev, hasNext, unitDone, unitTotal, bookmarked, onBookmark, nextSession, go }) {
  const videos = VIDEOS[session.id] || [];
  const quiz = QUIZ[session.id] || [];
  const detail = DETAIL[session.id];
  const extra = EXTRA[session.id];
  const secs = [
    { id: "interactive", label: "Interactive" },
    { id: "lesson", label: "In detail" },
    ...(extra?.deepDives ? [{ id: "deepdive", label: "Deep dive" }] : []),
    ...(extra?.myth ? [{ id: "myth", label: "Myth or fact" }] : []),
    { id: "video", label: "Video" },
    ...(detail?.keyTerms ? [{ id: "glossary", label: "Key terms" }] : []),
    ...(extra?.caseStudy ? [{ id: "case", label: "Case file" }] : []),
    ...(detail?.applications ? [{ id: "applications", label: "Applications" }] : []),
    ...(detail?.takeaways ? [{ id: "takeaways", label: "Takeaways" }] : []),
    ...(quiz.length ? [{ id: "quiz", label: "Check" }] : []),
  ];
  const active = useScrollSpy(secs.map((s) => "sec-" + s.id));
  const jump = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
  return (
    <div className="gtem-sesswrap" style={{ "--uc": session.accent, "--uc2": session.accent2 }}>
      <Spine secs={secs} active={active} onJump={jump} />
      <article className="gtem-session">
        <header className="gtem-sess-head">
          <span className="gtem-sess-wm" aria-hidden>{session.unitCode}.{session.n}</span>
          <span className="gtem-sess-crumb">Unit {session.unitCode} · {session.unitTitle}<b>· {session.method}</b></span>
          <h1>{session.title}</h1>
          <p className="gtem-lead">{detail?.overview || session.summary}</p>
          <div className="gtem-meta">
            <span className="gtem-chip red">{session.method}</span>
            <span className="gtem-chip">Session {session.n} of 12</span>
            {detail && <span className="gtem-chip">◷ ~{readMins(detail, extra)} min read</span>}
            {extra?.caseStudy && <span className="gtem-chip">▦ Case study</span>}
            {done && <span className="gtem-chip ok">✓ Complete</span>}
          </div>
        </header>

        <section id="sec-interactive" className="gtem-card gtem-console">
          <div className="gtem-card-h"><span className="gtem-k">Interactive</span><h2>Explore it</h2></div>
          <Visual session={session} accent={session.accent} accent2={session.accent2} />
        </section>

        {detail ? (
          <section id="sec-lesson" className="gtem-card gtem-lesson">
            <div className="gtem-card-h stripe"><span className="gtem-k">Lesson</span><h2>In detail</h2></div>
            {detail.sections.map((s, i) => (
              <div key={i} className="gtem-lsec">
                <h3><span className="gtem-lsec-n">{String(i + 1).padStart(2, "0")}</span>{s.h}</h3>
                <p>{s.p}</p>
                {s.list && <ul className="gtem-llist">{s.list.map((li, j) => <li key={j}>{li}</li>)}</ul>}
              </div>
            ))}
          </section>
        ) : (
          <section id="sec-lesson" className="gtem-card">
            <div className="gtem-card-h stripe"><span className="gtem-k">Lesson</span><h2>Teaching points</h2></div>
            <div className="gtem-points">
              {session.points.map((p, i) => (
                <div key={i} className="gtem-point"><span className="gtem-point-n">{i + 1}</span><div><b>{p.t}</b><p>{p.d}</p></div></div>
              ))}
            </div>
          </section>
        )}

        {extra?.deepDives && (
          <section id="sec-deepdive" className="gtem-card">
            <div className="gtem-card-h"><span className="gtem-k">Go deeper</span><h2>Deep dive</h2></div>
            <DeepDives items={extra.deepDives} />
          </section>
        )}

        {extra?.myth && <div id="sec-myth"><MythFact myth={extra.myth} /></div>}

        <section id="sec-video" className="gtem-card">
          <div className="gtem-card-h"><span className="gtem-k">Watch</span><h2>Video{videos.length > 1 ? "s" : ""}</h2></div>
          {videos.length ? (
            <div className="gtem-videos">
              {videos.map((v) => (
                <div key={v.id} className="gtem-vid">
                  <div className="gtem-vid-frame"><iframe src={`https://www.youtube.com/embed/${v.id}`} title={v.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
                  <span className="gtem-vid-t">{v.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <a className="gtem-vid-soon" href={yt(session.title)} target="_blank" rel="noopener noreferrer">
              <span className="pl">▶</span><span>Curated video coming — <b>search “{session.title}” on YouTube</b> ↗</span>
            </a>
          )}
        </section>

        {detail?.keyTerms && (
          <section id="sec-glossary" className="gtem-card">
            <div className="gtem-card-h"><span className="gtem-k">Glossary</span><h2>Key terms</h2><span className="gtem-hint">tap a card to flip</span></div>
            <div className="gtem-terms">
              {detail.keyTerms.map((t, i) => <FlipTerm key={i} term={t.t} def={t.d} />)}
            </div>
          </section>
        )}

        {extra?.caseStudy && <div id="sec-case"><CaseStudy c={extra.caseStudy} /></div>}

        {detail?.applications && (
          <section id="sec-applications" className="gtem-card">
            <div className="gtem-card-h"><span className="gtem-k">In service</span><h2>Aviation applications</h2></div>
            <ul className="gtem-apps">{detail.applications.map((x, i) => <li key={i}><span className="gtem-app-m">✈</span>{x}</li>)}</ul>
          </section>
        )}

        {detail?.takeaways && (
          <section id="sec-takeaways" className="gtem-card gtem-takeaways">
            <div className="gtem-card-h stripe"><span className="gtem-k">Remember</span><h2>Key takeaways</h2></div>
            <ul>{detail.takeaways.map((x, i) => <li key={i}><span className="tk">✓</span>{x}</li>)}</ul>
          </section>
        )}

        {quiz.length > 0 && <div id="sec-quiz"><Quiz key={session.id} quiz={quiz} onPass={onDone} /></div>}

        <div className="gtem-sess-foot">
          <button className="gtem-navbtn" onClick={onPrev} disabled={!hasPrev}>← Previous</button>
          <button className={"gtem-navbtn done" + (done ? " is" : "")} onClick={onDone} disabled={done}>{done ? "✓ Completed" : "Mark complete"}</button>
          <button className="gtem-navbtn" onClick={onNext} disabled={!hasNext}>Next →</button>
        </div>
      </article>
      <SidePanel session={session} secs={secs} active={active} onJump={jump} unitDone={unitDone} unitTotal={unitTotal} done={done} onDone={onDone} bookmarked={bookmarked} onBookmark={onBookmark} nextSession={nextSession} go={go} />
    </div>
  );
}

/* ── deep-dive accordion ── */
function DeepDives({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="gtem-dd">
      {items.map((it, i) => {
        const on = open === i;
        return (
          <div key={i} className={"gtem-dd-item" + (on ? " on" : "")}>
            <button className="gtem-dd-h" onClick={() => setOpen(on ? -1 : i)}>
              <span className="gtem-dd-plus">{on ? "−" : "+"}</span>{it.t}
            </button>
            {on && <p className="gtem-dd-b">{it.p}</p>}
          </div>
        );
      })}
    </div>
  );
}

/* ── myth vs fact reveal ── */
function MythFact({ myth }) {
  const [shown, setShown] = useState(false);
  return (
    <section className="gtem-card gtem-myth">
      <div className="gtem-card-h"><span className="gtem-k">Test your intuition</span><h2>Myth or fact?</h2></div>
      <div className="gtem-myth-claim">“{myth.claim}”</div>
      {!shown ? (
        <div className="gtem-myth-ask"><button className="gtem-mbtn myth" onClick={() => setShown("myth")}>Myth</button><button className="gtem-mbtn fact" onClick={() => setShown("fact")}>Fact</button></div>
      ) : (
        <div className="gtem-myth-rev"><span className="gtem-myth-tag">✗ Myth</span><p>{myth.truth}</p><button className="gtem-btn sm ghost" onClick={() => setShown(false)}>Try again</button></div>
      )}
    </section>
  );
}

/* ── flip-card glossary term ── */
function FlipTerm({ term, def }) {
  const [flip, setFlip] = useState(false);
  return (
    <button className={"gtem-flip" + (flip ? " on" : "")} onClick={() => setFlip((f) => !f)}>
      <span className="gtem-flip-in">
        <span className="gtem-flip-f"><b>{term}</b><small>tap for definition</small></span>
        <span className="gtem-flip-b">{def}</span>
      </span>
    </button>
  );
}

/* ── case file ── */
function CaseStudy({ c }) {
  const rows = [
    ["Context", c.context], ["The challenge", c.challenge], ["Approach", c.approach],
    ["What was found", c.finding], ["Outcome", c.outcome],
  ];
  return (
    <section className="gtem-card gtem-case">
      <div className="gtem-card-h stripe"><span className="gtem-k">Case file</span><h2>{c.title}</h2><span className="gtem-case-tag">{c.tag}</span></div>
      <div className="gtem-case-rows">
        {rows.map(([k, v]) => (<div key={k} className="gtem-case-row"><span className="gtem-case-k">{k}</span><p>{v}</p></div>))}
      </div>
      <div className="gtem-case-lesson"><span className="gtem-case-lb">Lesson</span>{c.lesson}</div>
    </section>
  );
}

/* ── knowledge check ── */
function Quiz({ quiz, onPass }) {
  const [ans, setAns] = useState({});
  const [checked, setChecked] = useState(false);
  const score = quiz.reduce((n, q, i) => n + (ans[i] === q.answer ? 1 : 0), 0);
  const all = Object.keys(ans).length === quiz.length;
  useEffect(() => { if (checked && score === quiz.length) onPass?.(); }, [checked]); // eslint-disable-line
  return (
    <section className="gtem-card">
      <div className="gtem-card-h"><span className="gtem-k">Check</span><h2>Knowledge check</h2>{checked && <span className="gtem-qscore">{score}/{quiz.length}</span>}</div>
      <div className="gtem-quiz">
        {quiz.map((q, i) => (
          <div key={i} className="gtem-q">
            <b>{i + 1}. {q.q}</b>
            <div className="gtem-opts">
              {q.options.map((o, j) => {
                const sel = ans[i] === j, right = checked && j === q.answer, wrong = checked && sel && j !== q.answer;
                return (
                  <button key={j} className={"gtem-opt" + (sel ? " sel" : "") + (right ? " right" : "") + (wrong ? " wrong" : "")}
                    onClick={() => !checked && setAns((a) => ({ ...a, [i]: j }))} disabled={checked}>
                    <span className="gtem-opt-m">{String.fromCharCode(65 + j)}</span>{o}
                  </button>
                );
              })}
            </div>
            {checked && <p className={"gtem-explain" + (ans[i] === q.answer ? " ok" : " no")}>{ans[i] === q.answer ? "✓ " : "✗ "}{q.explain}</p>}
          </div>
        ))}
      </div>
      {!checked ? (
        <button className="gtem-btn sm" onClick={() => setChecked(true)} disabled={!all}>Check answers</button>
      ) : (
        <div className="gtem-quiz-foot">
          <span>{score === quiz.length ? "Perfect — session marked complete." : `${score}/${quiz.length} correct. Review the explanations and retry.`}</span>
          <button className="gtem-btn sm ghost" onClick={() => { setAns({}); setChecked(false); }}>Retry</button>
        </div>
      )}
    </section>
  );
}

const CSS = `
.gtem{--font:var(--font-sans),Inter,system-ui,sans-serif;--mono:var(--font-mono),ui-monospace,monospace;
  --bg:#16100e;--bg2:#1e1613;--panel:#211a16;--panel2:#29201b;--panel3:#31261f;
  --ink:#f4eee9;--sub:#c8b9af;--muted:#8f8078;--faint:#5f544d;
  --border:#3a2e29;--line:#2c221e;--hair:#463831;
  --red:#ff7a1a;--red-deep:#c2410c;--red-soft:rgba(255,122,26,.14);
  --cyan:#22d3ee;--cyan-soft:rgba(34,211,238,.13);
  --grad:linear-gradient(120deg,#ffb454,#ff5722);
  --amber:linear-gradient(120deg,#ffb020,#e0630f);
  --stripe:repeating-linear-gradient(-45deg,#ff7a1a 0 9px,#1a1310 9px 18px);
  --shadow:0 24px 60px -30px rgba(0,0,0,.7);
  position:fixed;inset:0;display:grid;grid-template-columns:300px 1fr;font-family:var(--font);
  background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;overflow:hidden}
.gtem[data-theme="light"]{--bg:#eceae6;--bg2:#f5f3ef;--panel:#ffffff;--panel2:#f4f1ec;--panel3:#ece8e2;
  --ink:#1a1512;--sub:#42372f;--muted:#7c6f66;--faint:#a99e94;--border:#ddd6ce;--line:#e8e2da;--hair:#cfc7bd;
  --red:#e2620a;--red-deep:#b23a00;--red-soft:rgba(226,98,10,.08);--grad:linear-gradient(120deg,#ff9e3d,#e2620a);
  --cyan:#0891b2;--cyan-soft:rgba(8,145,178,.08);
  --stripe:repeating-linear-gradient(-45deg,#e2620a 0 9px,#fdeadb 9px 18px);--shadow:0 20px 50px -30px rgba(120,60,10,.26)}
.gtem *{box-sizing:border-box}
.gtem button{font-family:inherit;cursor:pointer}
.gtem ::selection{background:var(--red);color:#fff}
.gtem-scan{position:fixed;top:0;left:0;height:2px;z-index:50;background:var(--grad);box-shadow:0 0 10px var(--red);transition:width .5s}

/* ── rail ── */
.gtem-rail{display:flex;flex-direction:column;background:linear-gradient(180deg,var(--bg2),var(--bg));border-right:1px solid var(--border);min-height:0}
.gtem-brand{position:relative;display:flex;align-items:center;gap:12px;padding:20px 20px 16px;background:none;border:0;text-align:left;color:var(--ink)}
.gtem-brand::after{content:"";position:absolute;left:20px;right:20px;bottom:0;height:2px;background:var(--stripe);opacity:.8;border-radius:2px}
.gtem-logo{font-size:20px;color:var(--red);filter:drop-shadow(0 0 8px var(--red-soft))}
.gtem-brandtx small{display:block;font-family:var(--mono);font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--red);font-weight:700}
.gtem-brandtx b{display:block;font-size:16px;font-weight:700;letter-spacing:-.01em;margin-top:2px}
.gtem-prog{padding:16px 20px 14px}
.gtem-prog-top{display:flex;justify-content:space-between;font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:7px}
.gtem-prog-top b{color:var(--ink)}
.gtem-bar{height:6px;border-radius:4px;background:var(--panel2);overflow:hidden;border:1px solid var(--line)}
.gtem-bar i{display:block;height:100%;background:var(--grad);border-radius:4px;transition:width .5s;box-shadow:0 0 8px var(--red-soft)}
.gtem-nav{flex:1;overflow-y:auto;padding:6px 12px 12px}
.gtem-home{width:100%;display:flex;align-items:center;gap:9px;text-align:left;background:none;border:1px solid transparent;color:var(--sub);font-size:13.5px;font-weight:600;padding:10px 11px;border-radius:10px}
.gtem-home-ic{color:var(--muted)}
.gtem-home:hover{background:var(--panel);color:var(--ink)}
.gtem-home.on{background:var(--panel);border-color:var(--hair);color:var(--ink)}
.gtem-home.on .gtem-home-ic{color:var(--red)}
.gtem-unit{margin-top:3px}
.gtem-unit-h{position:relative;width:100%;display:flex;align-items:center;gap:10px;background:none;border:1px solid transparent;padding:9px 11px;border-radius:10px;text-align:left;color:var(--ink)}
.gtem-unit-h:hover{background:var(--panel)}
.gtem-unit-h.open{background:var(--panel);border-color:var(--hair)}
.uc{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:-.02em;min-width:30px;height:30px;padding:0 6px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:var(--panel2);border:1px solid var(--hair);color:var(--muted);flex:none}
.gtem-unit-h.open .uc{background:var(--grad);color:#fff;border-color:transparent}
.ut{flex:1;font-size:13px;font-weight:600;line-height:1.25}
.ut small{display:block;font-family:var(--mono);font-size:8.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);font-weight:500;margin-top:2px}
.uchev{color:var(--faint);font-size:10px}
.gtem-sessions{padding:3px 0 5px 10px;margin:2px 0 2px 14px;border-left:1px solid var(--line)}
.gtem-sess{position:relative;width:100%;display:flex;align-items:center;gap:10px;background:none;border:0;padding:7px 10px;border-radius:8px;text-align:left;color:var(--sub);font-size:12px;margin-top:1px}
.gtem-sess:hover{background:var(--panel);color:var(--ink)}
.gtem-sess.on{background:var(--panel);color:var(--ink);font-weight:600}
.gtem-sess.on::before{content:"";position:absolute;left:-11px;top:6px;bottom:6px;width:3px;background:var(--red);border-radius:0 3px 3px 0;box-shadow:0 0 8px var(--red)}
.sn{font-family:var(--mono);font-size:10px;width:18px;height:18px;flex:none;display:flex;align-items:center;justify-content:center;border-radius:5px;background:var(--panel2);border:1px solid var(--line);color:var(--muted)}
.sn.ok{background:var(--red-soft);border-color:transparent;color:var(--red)}
.st{line-height:1.25}
.gtem-theme{margin:8px 14px 16px;background:var(--panel2);border:1px solid var(--border);border-radius:10px;padding:10px;font-size:12px;color:var(--sub);font-family:var(--mono);letter-spacing:.04em}
.gtem-theme:hover{border-color:var(--red);color:var(--ink)}
/* rail search trigger */
.gtem-searchbtn{display:flex;align-items:center;gap:9px;margin:0 12px 8px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:9px 11px;font-size:12.5px;color:var(--muted)}
.gtem-searchbtn:hover{border-color:var(--line2);color:var(--ink)}
.gtem-search-ic{color:var(--red);font-size:14px}
.gtem-searchbtn kbd{margin-left:auto;font-family:var(--mono);font-size:9px;color:var(--faint);background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:2px 5px}
/* search palette */
.gtem-search-ovl{position:fixed;inset:0;z-index:80;background:rgba(6,4,3,.55);backdrop-filter:blur(3px);display:flex;justify-content:center;align-items:flex-start;padding:12vh 20px 20px;animation:gtemfade .12s ease}
@keyframes gtemfade{from{opacity:0}to{opacity:1}}
.gtem-search{width:100%;max-width:560px;background:var(--panel);border:1px solid var(--line2);border-radius:16px;box-shadow:0 30px 80px -30px rgba(0,0,0,.7);overflow:hidden;max-height:72vh;display:flex;flex-direction:column}
.gtem-search-in{display:flex;align-items:center;gap:11px;padding:16px 18px;border-bottom:1px solid var(--line)}
.gtem-search-in .gtem-search-ic{font-size:18px}
.gtem-search-in input{flex:1;background:none;border:0;outline:none;font-family:var(--font);font-size:16px;color:var(--ink)}
.gtem-search-res{overflow-y:auto;padding:8px}
.gtem-search-grp{font-family:var(--mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);padding:10px 10px 5px}
.gtem-search-i{width:100%;display:flex;align-items:center;gap:11px;text-align:left;background:none;border:0;padding:10px 11px;border-radius:9px;color:var(--ink)}
.gtem-search-i:hover{background:var(--panel2)}
.si-n{font-family:var(--mono);font-size:11px;font-weight:700;min-width:28px}
.si-t{flex:1;font-size:13.5px;font-weight:600}
.si-m{font-family:var(--mono);font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gtem-search-i.term{align-items:flex-start}
.si-term{font-size:13px;font-weight:700;min-width:120px;color:var(--red)}
.si-def{flex:1;font-size:12px;color:var(--muted);line-height:1.45}
.gtem-search-empty{padding:24px;text-align:center;font-size:13px;color:var(--muted)}
.gtem-search-foot{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-top:1px solid var(--line);font-family:var(--mono);font-size:10px;color:var(--faint)}
.gtem-search-foot kbd{background:var(--panel2);border:1px solid var(--line);border-radius:4px;padding:2px 6px}
/* method comparison */
.gtem-cmp{margin-top:38px}
.gtem-cmp-h{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:14px;flex-wrap:wrap}
.gtem-cmp-filter{display:inline-flex;gap:4px;background:var(--panel2);border:1px solid var(--line);border-radius:9px;padding:3px}
.gtem-cmp-filter button{background:none;border:0;border-radius:6px;padding:6px 13px;font-size:12px;font-weight:600;color:var(--muted)}
.gtem-cmp-filter button.on{background:var(--grad);color:#fff}
.gtem-cmp-scroll{overflow-x:auto;border:1px solid var(--border);border-radius:14px}
.gtem-cmp-t{width:100%;border-collapse:collapse;font-size:12.5px;min-width:640px}
.gtem-cmp-t th{text-align:left;font-family:var(--mono);font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--red);font-weight:700;padding:12px 14px;background:var(--panel2);border-bottom:1px solid var(--border)}
.gtem-cmp-t td{padding:12px 14px;border-bottom:1px solid var(--line);color:var(--sub)}
.gtem-cmp-t tr:last-child td{border-bottom:0}
.gtem-cmp-t tr:hover td{background:var(--panel2)}
.gtem-cmp-t td b{color:var(--ink);font-family:var(--mono)}
.gtem-cmp-tag{font-family:var(--mono);font-size:8.5px;letter-spacing:.04em;text-transform:uppercase;padding:3px 7px;border-radius:5px}
.gtem-cmp-tag.surface{background:rgba(255,176,32,.16);color:#c47f10}
.gtem-cmp-tag.volumetric{background:var(--red-soft);color:var(--red)}
.gtem-cmp-dots{color:var(--red);letter-spacing:2px;font-size:10px}
/* revision & exams */
.gtem-revwrap{max-width:900px;margin:0 auto;padding:40px 42px 90px}
.gtem-rev-head h1{font-size:36px;font-weight:800;letter-spacing:-.025em;margin:12px 0 12px}
.gtem-rev-head p{font-size:15px;line-height:1.65;color:var(--sub);max-width:600px}
.gtem-rev-tabs{display:inline-flex;gap:4px;background:var(--panel2);border:1px solid var(--line);border-radius:11px;padding:4px;margin:26px 0 20px}
.gtem-rev-tabs button{background:none;border:0;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:600;color:var(--muted)}
.gtem-rev-tabs button.on{background:var(--grad);color:#fff}
.gtem-rev-filter{margin-bottom:20px}
.gtem-rev-empty{padding:30px;text-align:center;color:var(--muted)}
.gtem-flash{max-width:520px;margin:0 auto}
.gtem-flash-meta{display:flex;justify-content:space-between;font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:12px}
.gtem-flashcard{width:100%;perspective:1200px;background:none;border:0;padding:0;height:220px}
.gtem-flashcard-in{position:relative;display:block;width:100%;height:100%;transition:transform .55s;transform-style:preserve-3d}
.gtem-flashcard.on .gtem-flashcard-in{transform:rotateY(180deg)}
.gtem-flashcard-f,.gtem-flashcard-b{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border:1px solid var(--border);border-radius:16px;padding:26px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-shadow:var(--shadow)}
.gtem-flashcard-f{background:linear-gradient(135deg,var(--panel),var(--panel2))}
.gtem-flashcard-f small,.gtem-flashcard-b small{font-family:var(--mono);font-size:9px;letter-spacing:.16em;color:var(--red);font-weight:700}
.gtem-flashcard-f b{font-size:26px;font-weight:700;margin:14px 0 10px;letter-spacing:-.01em}
.gtem-flashcard-f em{font-family:var(--mono);font-size:10px;color:var(--faint);font-style:normal}
.gtem-flashcard-b{background:var(--panel);transform:rotateY(180deg)}
.gtem-flashcard-b p{font-size:15px;line-height:1.6;color:var(--ink);margin-top:12px}
.gtem-flash-nav{display:flex;gap:10px;margin-top:16px}
.gtem-navb{flex:1;background:var(--panel);border:1px solid var(--border);border-radius:11px;padding:12px;font-size:13px;font-weight:600;color:var(--sub)}
.gtem-navb:hover{border-color:var(--red);color:var(--ink)}
.gtem-navb.ok{background:var(--red-soft);color:var(--red);border-color:transparent}
.gtem-examcards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
.gtem-examcard{position:relative;text-align:left;background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:18px;overflow:hidden;color:var(--ink)}
.gtem-examcard::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;background:var(--stripe);opacity:.85}
.gtem-examcard:hover{border-color:var(--red);transform:translateY(-2px)}
.gtem-examcard.final::before{background:var(--grad)}
.gtem-examcard-k{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.1em;color:var(--red)}
.gtem-examcard b{display:block;font-size:15px;font-weight:700;margin:8px 0 6px}
.gtem-examcard small{font-size:11.5px;color:var(--muted)}
.gtem-exam-ovl{position:fixed;inset:0;z-index:70;background:rgba(6,4,3,.6);backdrop-filter:blur(3px);display:flex;justify-content:center;align-items:flex-start;padding:6vh 20px 20px;animation:gtemfade .14s ease}
.gtem-exam{width:100%;max-width:640px;max-height:88vh;background:var(--panel);border:1px solid var(--line2);border-radius:16px;box-shadow:0 30px 80px -30px rgba(0,0,0,.7);display:flex;flex-direction:column;overflow:hidden}
.gtem-exam-h{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--line)}
.gtem-exam-h b{font-size:15px;flex:1}
.gtem-exam-prog{font-family:var(--mono);font-size:11px;color:var(--muted)}
.gtem-exam-h .mdl-x{position:static}
.gtem-exam-body{overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:20px}
.gtem-exam-score{border-radius:12px;padding:16px;text-align:center;border:1px solid}
.gtem-exam-score b{font-size:34px;font-weight:800;display:block}
.gtem-exam-score span{font-size:12.5px;color:var(--sub)}
.gtem-exam-score.pass{border-color:#3fae5a55;background:rgba(63,174,90,.1)}.gtem-exam-score.pass b{color:#3fae5a}
.gtem-exam-score.fail{border-color:var(--red-soft);background:var(--red-soft)}.gtem-exam-score.fail b{color:var(--red)}
.gtem-exam-foot{display:flex;gap:10px;justify-content:flex-end;padding:14px 18px;border-top:1px solid var(--line)}

/* ── main ── */
.gtem-main{overflow-y:auto;min-height:0;position:relative;
  background:
    radial-gradient(1000px 520px at 100% -8%,var(--red-soft),transparent 55%),
    linear-gradient(var(--line) 1px,transparent 1px),
    linear-gradient(90deg,var(--line) 1px,transparent 1px);
  background-size:auto,44px 44px,44px 44px;background-position:0 0,-1px -1px,-1px -1px}
.gtem[data-theme="light"] .gtem-main{background-blend-mode:normal}
.gtem-main::before{content:"";position:sticky;top:0;display:block;height:0;z-index:1}

/* home */
.gtem-home-wrap{max-width:1060px;margin:0 auto;padding:40px 42px 80px}
.gtem-hero{border:1px solid var(--border);border-radius:18px;overflow:hidden;background:linear-gradient(135deg,var(--panel),var(--bg2));box-shadow:var(--shadow)}
.gtem-hero-stripe{height:8px;background:var(--stripe)}
.gtem-hero-body{padding:34px 38px 36px}
.gtem-eyebrow{display:inline-flex;align-items:center;gap:9px;font-family:var(--mono);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--red);font-weight:700}
.gtem-eyebrow .led{width:8px;height:8px;border-radius:50%;background:var(--red);box-shadow:0 0 8px var(--red);animation:gtemblink 1.6s infinite}
@keyframes gtemblink{50%{opacity:.35}}
.gtem-hero h1{font-size:46px;line-height:1.04;font-weight:800;letter-spacing:-.025em;margin:14px 0 16px}
.gtem-hero h1 .g{color:var(--red)}
.gtem-hero p{max-width:660px;font-size:15px;line-height:1.7;color:var(--sub)}
.gtem-hero-cta{display:flex;align-items:center;gap:18px;margin-top:24px;flex-wrap:wrap}
.gtem-btn{background:var(--grad);color:#fff;border:0;border-radius:11px;padding:13px 24px;font-size:14px;font-weight:700;box-shadow:0 10px 24px -12px var(--red)}
.gtem-btn:hover{filter:brightness(1.06)}
.gtem-btn.sm{padding:10px 18px;font-size:13px}
.gtem-btn.ghost{background:transparent;border:1px solid var(--border);color:var(--sub);box-shadow:none}
.gtem-hero-stat{font-family:var(--mono);font-size:12px;color:var(--muted)}
.gtem-hero-stat b{color:var(--ink)}
.gtem-sec-eyebrow{font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin:34px 0 14px;padding-left:2px}
.gtem-unitcards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.gtem-uc{position:relative;text-align:left;background:var(--panel);border:1px solid var(--border);border-radius:15px;padding:18px 20px 16px;overflow:hidden;color:var(--ink);transition:transform .15s,border-color .15s,box-shadow .15s}
.gtem-uc::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;background:var(--stripe);opacity:.85}
.gtem-uc:hover{transform:translateY(-3px);border-color:var(--red);box-shadow:0 16px 36px -18px var(--red)}
.gtem-uc-top{display:flex;align-items:center;justify-content:space-between;margin-top:6px}
.gtem-uc-code{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.1em;color:var(--red)}
.gtem-uc-icon{font-size:22px;color:var(--muted)}
.gtem-uc b{display:block;font-size:18px;font-weight:700;margin:10px 0 7px;letter-spacing:-.01em}
.gtem-uc small{display:block;font-size:12.5px;line-height:1.55;color:var(--muted);min-height:56px}
.gtem-uc-foot{display:flex;align-items:center;justify-content:space-between;margin-top:14px}
.gtem-uc-tag{font-family:var(--mono);font-size:8.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}
.gtem-uc-prog{font-family:var(--mono);font-size:11px;color:var(--sub);font-weight:600}

/* session — 3-column layout: spine · article · side panel */
.gtem-sesswrap{display:grid;grid-template-columns:30px minmax(0,760px) 296px;gap:26px;justify-content:center;max-width:1240px;margin:0 auto;padding:36px 30px 90px;align-items:start}
.gtem-session{position:relative;min-width:0}
.gtem-sess-head{margin-bottom:24px;position:relative}
/* left spine */
.gtem-spine{position:sticky;top:40px;display:flex;flex-direction:column;gap:14px;align-items:center;padding-top:120px}
.gtem-spine::before{content:"";position:absolute;top:120px;bottom:8px;left:50%;width:1px;background:var(--line);transform:translateX(-.5px)}
.gtem-spine-dot{position:relative;width:9px;height:9px;border-radius:50%;background:var(--line2);border:0;padding:0;transition:.15s}
.gtem-spine-dot:hover{background:var(--muted);transform:scale(1.25)}
.gtem-spine-dot.on{background:var(--red);box-shadow:0 0 0 4px var(--red-soft)}
/* right side panel */
.gtem-side{position:sticky;top:28px;display:flex;flex-direction:column;gap:14px}
.gtem-side-card{background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:16px}
.gtem-side-k{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--red);font-weight:700;margin-bottom:11px}
.gtem-otp{display:flex;flex-direction:column;gap:1px}
.gtem-otp-i{position:relative;text-align:left;background:none;border:0;padding:7px 10px 7px 16px;font-size:12.5px;color:var(--muted);border-radius:7px;font-weight:500}
.gtem-otp-i:hover{background:var(--panel2);color:var(--ink)}
.gtem-otp-i.on{color:var(--ink);font-weight:600}
.gtem-otp-i.on::before{content:"";position:absolute;left:4px;top:8px;bottom:8px;width:3px;background:var(--red);border-radius:2px}
.gtem-action-top{display:flex;align-items:center;gap:13px;margin-bottom:13px}
.gtem-ring{position:relative;width:52px;height:52px;flex:none}
.gtem-ring svg{width:52px;height:52px}
.gtem-ring-bg{fill:none;stroke:var(--panel2);stroke-width:6}
.gtem-ring-fg{fill:none;stroke:var(--red);stroke-width:6;stroke-linecap:round;transition:stroke-dashoffset .5s}
.gtem-ring-tx{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:1px;font-family:var(--mono)}
.gtem-ring-tx b{font-size:15px;color:var(--ink)}
.gtem-ring-tx span{font-size:8px;color:var(--faint)}
.gtem-action-lbl b{display:block;font-size:13px;font-weight:700}
.gtem-action-lbl span{font-size:11px;color:var(--muted)}
.gtem-side-btn{width:100%;background:var(--panel2);border:1px solid var(--line);border-radius:9px;padding:10px;font-size:12.5px;font-weight:600;color:var(--sub);margin-top:8px}
.gtem-side-btn:hover:not(:disabled){border-color:var(--line2);color:var(--ink)}
.gtem-side-btn.primary{background:var(--grad);color:#fff;border-color:transparent;margin-top:0}
.gtem-side-btn.primary.is,.gtem-side-btn.primary:disabled{background:#3fae5a;opacity:1}
.gtem-side-btn.on{color:var(--red);border-color:var(--red-soft)}
.gtem-nextup{width:100%;text-align:left;background:var(--panel2);border:1px solid var(--line);border-radius:9px;padding:10px 12px;margin-top:8px;position:relative}
.gtem-nextup:hover{border-color:var(--red)}
.gtem-nextup span{display:block;font-family:var(--mono);font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}
.gtem-nextup b{display:block;font-size:12.5px;color:var(--ink);margin-top:2px;padding-right:14px;line-height:1.3}
.gtem-nextup em{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--red);font-style:normal}
.gtem-spec{display:flex;flex-direction:column;gap:8px}
.gtem-spec-row{display:flex;justify-content:space-between;gap:10px;font-size:12px}
.gtem-spec-row span{color:var(--muted)}
.gtem-spec-row b{color:var(--ink);font-weight:600;text-align:right}
.gtem-notes{width:100%;min-height:86px;resize:vertical;background:var(--panel2);border:1px solid var(--line);border-radius:9px;padding:10px;font-size:12.5px;font-family:var(--font);color:var(--ink);line-height:1.5}
.gtem-notes:focus{outline:none;border-color:var(--red)}
.gtem-ask-badge{display:inline-block;margin-left:6px;padding:1px 6px;border-radius:20px;background:var(--red-soft);color:var(--red);font-family:var(--font);font-size:8.5px;letter-spacing:.06em;font-weight:800;vertical-align:middle}
.gtem-ask-log{display:flex;flex-direction:column;gap:10px;max-height:340px;overflow-y:auto;margin-bottom:10px;padding-right:2px}
.gtem-ask-empty p{margin:0 0 10px;font-size:12.5px;color:var(--muted);line-height:1.55}
.gtem-ask-sugs{display:flex;flex-direction:column;gap:6px}
.gtem-ask-sug{text-align:left;background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-family:var(--font);font-size:12px;color:var(--ink);cursor:pointer;transition:border-color .15s,color .15s}
.gtem-ask-sug:hover{border-color:var(--red);color:var(--red)}
.gtem-ask-msg{display:flex;flex-direction:column;gap:3px}
.gtem-ask-msg.you{align-items:flex-end}
.gtem-ask-who{font-family:var(--mono);font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700}
.gtem-ask-bubble{max-width:92%;padding:9px 11px;border-radius:11px;font-size:12.5px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word}
.gtem-ask-msg.you .gtem-ask-bubble{background:var(--grad);color:#fff;border-bottom-right-radius:3px}
.gtem-ask-msg.tutor .gtem-ask-bubble{background:var(--panel2);border:1px solid var(--line);color:var(--ink);border-bottom-left-radius:3px}
.gtem-ask-typing{display:flex;gap:4px;align-items:center}
.gtem-ask-typing i{width:6px;height:6px;border-radius:50%;background:var(--red);opacity:.4;animation:gtemdot 1s infinite}
.gtem-ask-typing i:nth-child(2){animation-delay:.15s}.gtem-ask-typing i:nth-child(3){animation-delay:.3s}
@keyframes gtemdot{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
.gtem-ask-in{display:flex;gap:8px;align-items:flex-end}
.gtem-ask-in textarea{flex:1;resize:none;background:var(--panel2);border:1px solid var(--line);border-radius:9px;padding:9px 10px;font-size:12.5px;font-family:var(--font);color:var(--ink);line-height:1.45}
.gtem-ask-in textarea:focus{outline:none;border-color:var(--red)}
.gtem-ask-send{flex:none;background:var(--grad);color:#fff;border:none;border-radius:9px;padding:0 14px;height:38px;font-family:var(--font);font-size:12.5px;font-weight:700;cursor:pointer;transition:opacity .15s}
.gtem-ask-send:disabled{opacity:.45;cursor:default}
.gtem-ask-foot{margin-top:9px;font-size:10px;color:var(--muted);line-height:1.4}
@media(prefers-reduced-motion:reduce){.gtem-ask-typing i{animation:none}}
@media(max-width:1180px){.gtem-sesswrap{grid-template-columns:minmax(0,760px) 288px;max-width:1080px}.gtem-spine{display:none}}
@media(max-width:1000px){.gtem-sesswrap{grid-template-columns:minmax(0,820px)}.gtem-side{display:none}}
.gtem-sess-wm{position:absolute;top:-18px;right:-8px;font-family:var(--mono);font-size:96px;font-weight:800;line-height:1;color:var(--red);opacity:.06;letter-spacing:-.04em;pointer-events:none;user-select:none}
.gtem-sess-crumb{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.gtem-chip.ok{color:#3fae5a;border-color:rgba(63,174,90,.3);background:rgba(63,174,90,.1)}
/* technical corner brackets on key cards */
.gtem-console,.gtem-case{position:relative}
.gtem-console::before,.gtem-console::after,.gtem-case::before,.gtem-case::after{content:"";position:absolute;width:16px;height:16px;border:2px solid var(--red);opacity:.5;pointer-events:none}
.gtem-console::before,.gtem-case::before{top:10px;left:10px;border-right:0;border-bottom:0}
.gtem-console::after,.gtem-case::after{bottom:10px;right:10px;border-left:0;border-top:0}
.gtem-sess-crumb b{color:var(--red);margin-left:5px;font-weight:700}
.gtem-sess-head h1{font-size:34px;font-weight:800;letter-spacing:-.025em;margin:10px 0 14px;line-height:1.08}
.gtem-lead{font-size:16px;line-height:1.7;color:var(--sub);max-width:720px}
.gtem-meta{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
.gtem-chip{font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:var(--panel);border:1px solid var(--border);padding:6px 11px;border-radius:7px}
.gtem-chip.red{color:var(--red);border-color:var(--red-soft);background:var(--red-soft)}
.gtem-card{background:var(--panel);border:1px solid var(--border);border-radius:16px;padding:24px;margin-top:18px;box-shadow:var(--shadow)}
.gtem-card-h{display:flex;align-items:center;gap:11px;margin-bottom:18px;position:relative}
.gtem-card-h.stripe{padding-left:14px}
.gtem-card-h.stripe::before{content:"";position:absolute;left:0;top:2px;bottom:2px;width:4px;background:var(--stripe);border-radius:2px}
.gtem-k{font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--red);font-weight:700}
.gtem-card-h h2{font-size:17px;font-weight:700;letter-spacing:-.01em}
.gtem-console{background:linear-gradient(135deg,var(--panel),var(--panel2))}

/* detailed lesson */
.gtem-lsec{padding:18px 0;border-top:1px solid var(--line)}
.gtem-lsec:first-of-type{padding-top:4px;border-top:0}
.gtem-lsec h3{display:flex;align-items:baseline;gap:11px;font-size:17px;font-weight:700;letter-spacing:-.01em;margin-bottom:10px;line-height:1.3}
.gtem-lsec-n{font-family:var(--mono);font-size:12px;font-weight:700;color:var(--red);flex:none}
.gtem-lsec p{font-size:14.5px;line-height:1.75;color:var(--sub)}
.gtem-llist{margin:12px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:7px}
.gtem-llist li{position:relative;padding-left:20px;font-size:13.5px;line-height:1.55;color:var(--sub)}
.gtem-llist li::before{content:"▸";position:absolute;left:2px;color:var(--red)}

/* teaching points (fallback) */
.gtem-points{display:flex;flex-direction:column;gap:14px}
.gtem-point{display:flex;gap:14px}
.gtem-point-n{flex:none;width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:12px;font-weight:700;background:var(--red-soft);color:var(--red)}
.gtem-point b{font-size:14.5px;font-weight:700}
.gtem-point p{font-size:13.5px;color:var(--sub);line-height:1.6;margin-top:3px}

/* video */
.gtem-videos{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:720px){.gtem-videos{grid-template-columns:1fr}}
.gtem-vid-frame{position:relative;padding-top:56.25%;border-radius:11px;overflow:hidden;background:#000;border:1px solid var(--border)}
.gtem-vid-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.gtem-vid-t{display:block;font-size:12.5px;color:var(--sub);margin-top:8px}
.gtem-vid-soon{display:flex;align-items:center;gap:13px;border:1.5px dashed var(--hair);border-radius:12px;padding:18px;color:var(--sub);text-decoration:none;font-size:13.5px}
.gtem-vid-soon:hover{border-color:var(--red)}
.gtem-vid-soon .pl{font-size:20px;color:var(--red)}
.gtem-vid-soon b{color:var(--ink)}

/* key terms */
.gtem-terms{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:640px){.gtem-terms{grid-template-columns:1fr}}
.gtem-term{background:var(--panel2);border:1px solid var(--line);border-left:3px solid var(--red);border-radius:9px;padding:13px 15px}
.gtem-term b{font-size:13.5px;font-weight:700}
.gtem-term p{font-size:12.5px;line-height:1.55;color:var(--muted);margin-top:4px}

/* applications */
.gtem-apps{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px}
.gtem-apps li{display:flex;gap:12px;align-items:flex-start;font-size:14px;line-height:1.55;color:var(--sub)}
.gtem-app-m{flex:none;width:26px;height:26px;border-radius:8px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;font-size:12px}

/* takeaways */
.gtem-takeaways{background:linear-gradient(135deg,var(--panel),var(--panel2))}
.gtem-takeaways ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:11px}
.gtem-takeaways li{display:flex;gap:12px;align-items:flex-start;font-size:14.5px;line-height:1.6;color:var(--ink);font-weight:500}
.gtem-takeaways .tk{flex:none;width:22px;height:22px;border-radius:6px;background:var(--grad);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;margin-top:1px}

/* deep-dive accordion */
.gtem-hint{margin-left:auto;font-family:var(--mono);font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--faint)}
.gtem-dd{display:flex;flex-direction:column;gap:8px}
.gtem-dd-item{border:1px solid var(--line);border-radius:11px;overflow:hidden;background:var(--panel2);transition:border-color .15s}
.gtem-dd-item.on{border-color:var(--red-soft)}
.gtem-dd-h{width:100%;display:flex;align-items:center;gap:11px;background:none;border:0;padding:14px 15px;text-align:left;font-size:14px;font-weight:600;color:var(--ink)}
.gtem-dd-plus{font-family:var(--mono);font-size:16px;color:var(--red);width:16px;flex:none;text-align:center}
.gtem-dd-b{padding:0 15px 15px 42px;font-size:13.5px;line-height:1.65;color:var(--sub);margin:0}

/* myth vs fact */
.gtem-myth-claim{font-size:17px;font-weight:600;line-height:1.5;font-style:italic;color:var(--ink);padding:6px 0 16px}
.gtem-myth-ask{display:flex;gap:10px}
.gtem-mbtn{flex:1;padding:13px;border-radius:11px;border:1.5px solid var(--border);background:var(--panel2);font-size:14px;font-weight:700;color:var(--sub)}
.gtem-mbtn.myth:hover{border-color:var(--red);color:var(--red)}
.gtem-mbtn.fact:hover{border-color:#3fae5a;color:#3fae5a}
.gtem-myth-rev{border:1px solid var(--red-soft);background:var(--red-soft);border-radius:12px;padding:16px}
.gtem-myth-tag{display:inline-block;font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--red);margin-bottom:8px}
.gtem-myth-rev p{font-size:14px;line-height:1.65;color:var(--ink);margin:0 0 12px}

/* flip cards */
.gtem-flip{perspective:900px;background:none;border:0;padding:0;height:96px;text-align:left}
.gtem-flip-in{position:relative;display:block;width:100%;height:100%;transition:transform .5s;transform-style:preserve-3d}
.gtem-flip.on .gtem-flip-in{transform:rotateY(180deg)}
.gtem-flip-f,.gtem-flip-b{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:10px;border:1px solid var(--line);border-left:3px solid var(--red);padding:13px 15px;display:flex;flex-direction:column;justify-content:center;overflow:auto}
.gtem-flip-f{background:var(--panel2)}
.gtem-flip-f b{font-size:14px;font-weight:700}
.gtem-flip-f small{font-family:var(--mono);font-size:8.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);margin-top:5px}
.gtem-flip-b{background:var(--panel3);transform:rotateY(180deg);font-size:12.5px;line-height:1.5;color:var(--sub)}

/* case file */
.gtem-case{background:linear-gradient(135deg,var(--panel),var(--panel2))}
.gtem-case-tag{margin-left:auto;font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.gtem-case-rows{display:flex;flex-direction:column;gap:14px}
.gtem-case-row{display:grid;grid-template-columns:130px 1fr;gap:14px;align-items:baseline}
@media(max-width:640px){.gtem-case-row{grid-template-columns:1fr;gap:3px}}
.gtem-case-k{font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--red);font-weight:700;padding-top:2px}
.gtem-case-row p{font-size:14px;line-height:1.65;color:var(--sub);margin:0}
.gtem-case-lesson{margin-top:18px;padding:15px 17px;background:var(--red-soft);border-radius:11px;font-size:14.5px;line-height:1.6;color:var(--ink);font-weight:500}
.gtem-case-lb{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--red);font-weight:700;margin-bottom:6px}

/* quiz */
.gtem-qscore{margin-left:auto;font-family:var(--mono);font-weight:700;color:var(--red)}
.gtem-quiz{display:flex;flex-direction:column;gap:20px}
.gtem-q>b{display:block;font-size:14.5px;margin-bottom:10px;line-height:1.45}
.gtem-opts{display:flex;flex-direction:column;gap:8px}
.gtem-opt{display:flex;align-items:center;gap:11px;text-align:left;background:var(--panel2);border:1.5px solid var(--line);border-radius:10px;padding:11px 13px;font-size:13.5px;color:var(--sub)}
.gtem-opt:hover:not(:disabled){border-color:var(--hair);color:var(--ink)}
.gtem-opt.sel{border-color:var(--red);color:var(--ink)}
.gtem-opt.right{border-color:#3fae5a;background:rgba(63,174,90,.13);color:var(--ink)}
.gtem-opt.wrong{border-color:var(--red);background:var(--red-soft)}
.gtem-opt-m{font-family:var(--mono);font-size:11px;font-weight:700;width:21px;height:21px;border-radius:6px;background:var(--panel);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;flex:none}
.gtem-explain{font-size:12.5px;line-height:1.55;margin-top:9px;padding-left:2px}
.gtem-explain.ok{color:#5cbd76}.gtem-explain.no{color:var(--red)}
.gtem-quiz-foot{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:18px;font-size:13px;color:var(--sub)}

/* session foot */
.gtem-sess-foot{display:flex;gap:11px;margin-top:24px}
.gtem-navbtn{flex:1;background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:14px;font-size:13.5px;font-weight:600;color:var(--sub)}
.gtem-navbtn:hover:not(:disabled){border-color:var(--red);color:var(--ink)}
.gtem-navbtn:disabled{opacity:.4;cursor:default}
.gtem-navbtn.done{background:var(--grad);color:#fff;border-color:transparent}
.gtem-navbtn.done.is{background:#3fae5a;opacity:1}

/* visual stage — restyled for the console identity */
.v-stage{position:relative;background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:18px;text-align:center}
.v-stage-top{position:absolute;top:10px;right:10px;z-index:2}
.v-play{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:5px 11px}
.v-play span{font-size:8px}
.v-play:hover{border-color:var(--line2);color:var(--ink)}
.v-play.on{color:var(--red);border-color:var(--red-soft)}
/* global smooth easing on slider/toggle-driven SVG shapes (rAF elements opt out with .no-tween) */
.v-stage svg rect,.v-stage svg circle,.v-stage svg ellipse,.v-stage svg line,.v-stage svg path,.v-stage svg polygon,.v-stage svg polyline{transition:x .25s ease,y .25s ease,cx .25s ease,cy .25s ease,r .25s ease,rx .25s ease,ry .25s ease,width .25s ease,height .25s ease,opacity .25s ease,fill .25s ease,transform .25s ease}
.v-stage svg .no-tween{transition:none!important}
@media(prefers-reduced-motion:reduce){.v-stage svg *{transition:none!important}}
.v-svg{width:100%;max-width:460px;height:auto;display:block;margin:0 auto}
.v-cap{font-size:12.5px;line-height:1.55;color:var(--muted);margin-top:13px;max-width:560px;margin-left:auto;margin-right:auto}
.v-seg{display:inline-flex;gap:4px;background:var(--panel2);border:1px solid var(--border);border-radius:10px;padding:4px;margin-bottom:14px}
.v-seg button{background:none;border:1px solid transparent;border-radius:7px;padding:7px 14px;font-size:12.5px;color:var(--muted);font-weight:600}
.v-seg button.on{color:#fff}
.v-row{display:flex;gap:12px;margin-top:14px}
.v-fact{flex:1;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:12px}
.v-fact b{display:block;font-size:17px;font-weight:700}
.v-fact span{font-size:11px;color:var(--muted);line-height:1.35;display:block;margin-top:2px}
.v-compare{width:100%;font-size:12.5px}
.v-compare-h,.v-compare-r{display:grid;grid-template-columns:100px 1fr 1fr;gap:10px;padding:9px 10px;text-align:left}
.v-compare-h{font-family:var(--mono);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);border-bottom:1px solid var(--line)}
.v-compare-r{border-radius:8px;transition:background .12s}
.v-compare-r.hi{background:var(--panel)}
.v-compare-r .k{font-weight:700;color:var(--sub)}
.v-compare-r .mech{color:var(--muted)}
.v-compare-r .gtemc{color:var(--ink)}
.v-methods{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:14px}
@media(max-width:720px){.v-methods{grid-template-columns:repeat(3,1fr)}}
.v-method{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;background:var(--panel2);border:1.5px solid var(--line);border-radius:11px;padding:12px 6px 9px;color:var(--ink);transition:.12s}
.v-method:hover{border-color:var(--hair)}
.v-method.dim{opacity:.34}
.v-method .mi{font-size:20px}
.v-method b{font-family:var(--mono);font-size:12px}
.v-method small{font-size:9px;color:var(--muted);text-align:center;line-height:1.15}
.mdepth{font-family:var(--mono);font-size:7.5px;letter-spacing:.05em;text-transform:uppercase;padding:2px 5px;border-radius:4px;margin-top:3px}
.mdepth.surface{background:rgba(255,176,32,.16);color:#ffb020}
.mdepth.volumetric{background:var(--red-soft);color:var(--red)}
.v-methoddetail{background:var(--panel);border:1px solid;border-radius:11px;padding:18px}
.v-methoddetail .big{font-size:22px;font-weight:800}
.v-methoddetail p{font-size:13px;color:var(--sub);line-height:1.55;margin:8px 0}
.v-hunt{max-width:520px}
.v-win{margin-top:12px;font-size:13px;font-weight:600;text-align:center}
.v-chips{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;margin-bottom:14px}
.v-chip{background:var(--panel2);border:1.5px solid var(--line);border-radius:8px;padding:7px 12px;font-size:12px;font-weight:600;color:var(--muted)}
.v-chip:hover{border-color:var(--hair);color:var(--ink)}
.v-chip.on{color:var(--ink)}
.v-tagline{text-align:center;margin-top:12px;font-size:12.5px}
.v-slider{display:flex;align-items:center;gap:12px;margin-top:14px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:10px 14px}
.v-slider span{font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);flex:none}
.v-slider input{flex:1}
.v-slider b{font-family:var(--mono);font-size:13px;color:var(--red);min-width:34px;text-align:right}
.v-matrix{display:grid;grid-template-columns:150px 1fr;gap:14px;align-items:center;text-align:left}
@media(max-width:560px){.v-matrix{grid-template-columns:1fr}}
.v-mprops{display:flex;flex-direction:column;gap:8px}
.v-mprop{display:flex;align-items:center;gap:9px;font-size:12.5px;color:var(--muted)}
.v-mprop.yes{color:var(--ink);font-weight:600}
.v-mprop .dot{width:9px;height:9px;border-radius:50%;background:var(--line2);flex:none}
.v-mmethods{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.v-mmethod{background:var(--panel);border:1.5px solid var(--line);border-radius:9px;padding:9px 11px;opacity:.5}
.v-mmethod.on{opacity:1}
.v-mmethod b{font-family:var(--mono);font-size:13px}
.v-mmethod small{display:block;font-size:10px;color:var(--muted);margin:1px 0 3px}
.v-mmethod span{font-family:var(--mono);font-size:9px;letter-spacing:.04em}
.v-meter{flex:1;display:flex;gap:4px}
.v-meter i{flex:1;height:8px;border-radius:3px;background:var(--line2)}
.v-bars{display:flex;flex-direction:column;gap:10px;width:100%;max-width:340px;margin:0 auto}
.v-bar{display:grid;grid-template-columns:88px 1fr;gap:12px;align-items:center}
.v-bar span{font-size:11.5px;color:var(--muted);text-align:left}
.v-bar-track{display:flex;gap:4px}
.v-bar-track i{flex:1;height:9px;border-radius:3px;background:var(--line2)}
.v-flow{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center}
.v-flow-step{display:flex;align-items:center;gap:7px;background:var(--panel);border:1px solid var(--line);border-radius:9px;padding:8px 11px;font-size:12px;color:var(--ink);position:relative}
.v-flow-step span{font-family:var(--mono);font-size:10px;font-weight:700}
.v-flow-step em{position:absolute;right:-14px;color:var(--faint);font-style:normal}
.v-verdict{display:flex;align-items:center;gap:12px;justify-content:center;padding:22px;border:1.5px solid;border-radius:12px;background:var(--panel)}
.v-verdict-ic{font-size:26px;font-weight:800}
.v-verdict b{font-size:16px}
.v-steps{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:14px}
.v-step{display:flex;align-items:center;gap:6px;background:var(--panel2);border:1.5px solid var(--line);border-radius:8px;padding:6px 10px;font-size:11.5px;font-weight:600;color:var(--muted)}
.v-step b{font-family:var(--mono);font-size:10px;width:16px;height:16px;border-radius:5px;background:var(--panel);display:flex;align-items:center;justify-content:center}
.v-step.done{color:var(--sub)}
.v-step.done b{background:var(--red-soft);color:var(--red)}
.v-stepnav{display:flex;align-items:center;justify-content:space-between;margin-top:14px;font-family:var(--mono);font-size:12px;color:var(--muted)}
.v-navb{background:var(--panel2);border:1px solid var(--line);border-radius:9px;padding:9px 15px;font-size:12.5px;font-weight:600;color:var(--sub)}
.v-navb:disabled{opacity:.4;cursor:default}
.v-ph{border:1.5px dashed var(--hair);border-radius:12px;padding:28px;max-width:440px;margin:0 auto}
.v-ph-ic{font-family:var(--mono);font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--red)}
.v-ph b{display:block;font-size:16px;margin:9px 0 7px}
.v-ph p{font-size:12.5px;color:var(--muted);line-height:1.55}

/* mobile top bar + drawer */
.gtem-mbar{display:none;align-items:center;gap:12px;height:54px;padding:0 14px;background:var(--bg2);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:30}
.gtem-hamb{display:flex;flex-direction:column;justify-content:center;gap:4px;width:38px;height:38px;background:var(--panel);border:1px solid var(--border);border-radius:9px;padding:0 9px}
.gtem-hamb span{height:2px;background:var(--sub);border-radius:2px;display:block}
.gtem-mbar-brand{display:flex;align-items:center;gap:8px;background:none;border:0;color:var(--ink);font-size:15px;font-weight:700}
.gtem-mbar-brand .gtem-logo{font-size:16px}
.gtem-mbar-prog{margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--red);font-weight:700}
.gtem-backdrop{display:none;position:fixed;inset:0;z-index:40;background:rgba(0,0,0,.5);backdrop-filter:blur(2px)}

@media(max-width:880px){
  .gtem{grid-template-columns:1fr;grid-template-rows:auto 1fr}
  .gtem-mbar{display:flex}
  .gtem-backdrop{display:block}
  .gtem-rail{position:fixed;top:0;left:0;bottom:0;width:290px;max-width:86vw;z-index:50;transform:translateX(-100%);transition:transform .22s ease;box-shadow:0 0 60px rgba(0,0,0,.5)}
  .gtem-rail.open{transform:translateX(0)}
  .gtem-sesswrap{padding:24px 18px 80px;gap:0}
  .gtem-home-wrap{padding:22px 18px 70px}
  .gtem-sess-head h1{font-size:27px}
  .gtem-hero h1{font-size:34px}
  .gtem-hero-body{padding:24px 22px 26px}
  .gtem-card{padding:18px}
}
@media(max-width:560px){
  .v-compare-h,.v-compare-r{grid-template-columns:72px 1fr 1fr;gap:7px;padding:8px 6px;font-size:11.5px}
  .v-row{flex-direction:column;gap:8px}
  .v-methods{grid-template-columns:repeat(3,1fr)}
}
/* ── engine explorer + placeholder ── */
.ge-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px}
.ge-ctrl{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:14px;padding-top:14px;border-top:1px solid var(--line)}
.ge-thr{display:flex;align-items:center;gap:10px}
.ge-thr label{font-family:var(--mono);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.ge-thr input[type=range]{width:150px}
.ge-thr span{font-size:13px;font-weight:800;font-variant-numeric:tabular-nums;min-width:44px}
.ge-read{display:flex;gap:18px}
.ge-read div{text-align:center}
.ge-read b{display:block;font-size:17px;font-weight:800;font-variant-numeric:tabular-nums;line-height:1}
.ge-read span{font-family:var(--mono);font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.v-ph{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:34px 20px;gap:10px}
.v-ph-ring{width:56px;height:56px;border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center;font-size:22px;opacity:.9}
.v-ph-t{font-size:13px;font-weight:700;color:var(--ink);margin:0}
.v-ph-s{font-size:12px;color:var(--muted);max-width:340px;line-height:1.5;margin:0}
`;
