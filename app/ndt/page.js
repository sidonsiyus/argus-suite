"use client";
/* NDT Learning Bay — React rewrite of the NDT inspection bay.
 * Visual, interactive, session-based learning: 5 units × 9 sessions = 45.
 * Each session = a bespoke interactive visual + curated video(s) + teaching
 * points + objectives + a knowledge check, with localStorage progress.
 * Old public/ndt-inspection-bay.html stays as the fallback until verified. */
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { UNITS, ALL_SESSIONS, SESSION_COUNT, COURSE } from "../../lib/ndt/curriculum";
import { QUIZ } from "../../lib/ndt/assessments";
import { VIDEOS } from "../../lib/ndt/videos";
import { Visual } from "./visuals";

const KEY = "ndt_bay_v1";
const yt = (q) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q + " NDT explained");

export default function NdtBay() {
  const [dark, setDark] = useState(true);
  const [openUnit, setOpenUnit] = useState(1);
  const [cur, setCur] = useState("1.1"); // current session id, or "home"
  const [done, setDone] = useState({}); // { "1.1": true }
  const [loaded, setLoaded] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(KEY) || "{}"); if (s.done) setDone(s.done); if (s.dark != null) setDark(s.dark); if (s.cur) { setCur(s.cur); } } catch (e) {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (!loaded) return; try { localStorage.setItem(KEY, JSON.stringify({ done, dark, cur })); } catch (e) {} }, [done, dark, cur, loaded]);
  useEffect(() => { if (mainRef.current) mainRef.current.scrollTop = 0; }, [cur]);

  const session = useMemo(() => ALL_SESSIONS.find((s) => s.id === cur), [cur]);
  const idx = useMemo(() => ALL_SESSIONS.findIndex((s) => s.id === cur), [cur]);
  const doneCount = Object.values(done).filter(Boolean).length;
  const pct = Math.round((doneCount / SESSION_COUNT) * 100);
  const unitProgress = (u) => u.sessions.filter((s) => done[s.id]).length;

  const go = useCallback((id) => { setCur(id); const s = ALL_SESSIONS.find((x) => x.id === id); if (s) setOpenUnit(s.unitId); }, []);
  const markDone = (id) => setDone((d) => ({ ...d, [id]: true }));
  const prev = () => idx > 0 && go(ALL_SESSIONS[idx - 1].id);
  const next = () => idx < ALL_SESSIONS.length - 1 && go(ALL_SESSIONS[idx + 1].id);

  return (
    <div className={"ndt" + (dark ? " dark" : "")} data-theme={dark ? "dark" : "light"}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {/* ── rail ── */}
      <aside className="ndt-rail">
        <button className="ndt-brand" onClick={() => setCur("home")}>
          <span className="ndt-logo">◆</span>
          <span className="ndt-brandtx"><b>NDT Bay</b><small>{COURSE.code} · Learning</small></span>
        </button>
        <div className="ndt-prog">
          <div className="ndt-prog-top"><span>Progress</span><b>{doneCount}/{SESSION_COUNT}</b></div>
          <div className="ndt-bar"><i style={{ width: pct + "%" }} /></div>
        </div>
        <nav className="ndt-nav">
          <button className={"ndt-home" + (cur === "home" ? " on" : "")} onClick={() => setCur("home")}>◎ Overview</button>
          {UNITS.map((u) => {
            const open = openUnit === u.id, up = unitProgress(u);
            return (
              <div key={u.id} className="ndt-unit">
                <button className={"ndt-unit-h" + (open ? " open" : "")} onClick={() => setOpenUnit(open ? 0 : u.id)}>
                  <span className="uc" style={{ background: u.accent + "22", color: u.accent }}>{u.code}</span>
                  <span className="ut">{u.title}<small>{up}/9 · {u.tag}</small></span>
                  <span className="uchev">{open ? "▾" : "▸"}</span>
                </button>
                {open && (
                  <div className="ndt-sessions">
                    {u.sessions.map((s) => (
                      <button key={s.id} className={"ndt-sess" + (cur === s.id ? " on" : "")} onClick={() => go(s.id)}
                        style={cur === s.id ? { borderColor: u.accent, background: u.accent + "14" } : undefined}>
                        <span className="sn" style={{ color: done[s.id] ? u.accent : undefined }}>{done[s.id] ? "✓" : s.n}</span>
                        <span className="st">{s.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <button className="ndt-theme" onClick={() => setDark((d) => !d)}>{dark ? "☾ Dark" : "☀ Light"}</button>
      </aside>

      {/* ── main ── */}
      <main className="ndt-main" ref={mainRef}>
        {cur === "home" ? <Home go={go} done={done} /> : session ? (
          <SessionView key={session.id} session={session} done={!!done[session.id]}
            onDone={() => markDone(session.id)} onPrev={prev} onNext={next}
            hasPrev={idx > 0} hasNext={idx < ALL_SESSIONS.length - 1} idx={idx} />
        ) : null}
      </main>
    </div>
  );
}

/* ── overview / home ── */
function Home({ go, done }) {
  const doneCount = Object.values(done).filter(Boolean).length;
  return (
    <div className="ndt-home-wrap">
      <div className="ndt-hero">
        <span className="ndt-eyebrow">{COURSE.program} · {COURSE.code}</span>
        <h1>Find the flaw.<br /><span className="grad">Keep the part flying.</span></h1>
        <p>Non-Destructive Testing inspects an aircraft component for hidden defects without ever taking it apart. Walk {SESSION_COUNT} interactive sessions across five methods — each with a hands-on visual, a curated video and a quick check.</p>
        <div className="ndt-hero-cta">
          <button className="ndt-btn" onClick={() => go(doneCount ? nextUndone(done) : "1.1")}>{doneCount ? "Resume learning" : "Start Unit I"} →</button>
          <span className="ndt-hero-stat">{doneCount}/{SESSION_COUNT} complete</span>
        </div>
      </div>
      <div className="ndt-unitcards">
        {UNITS.map((u) => (
          <button key={u.id} className="ndt-uc" onClick={() => go(u.sessions[0].id)} style={{ "--uc": u.accent, "--uc2": u.accent2 }}>
            <span className="ndt-uc-code">{u.code}</span>
            <span className="ndt-uc-icon">{u.icon}</span>
            <b>{u.title}</b>
            <small>{u.blurb}</small>
            <span className="ndt-uc-tag">{u.tag} · 9 sessions</span>
          </button>
        ))}
      </div>
    </div>
  );
}
function nextUndone(done) { const s = ALL_SESSIONS.find((x) => !done[x.id]); return s ? s.id : "1.1"; }

/* ── one session ── */
function SessionView({ session, done, onDone, onPrev, onNext, hasPrev, hasNext, idx }) {
  const videos = VIDEOS[session.id] || [];
  const quiz = QUIZ[session.id] || [];
  const a = session.accent;
  return (
    <div className="ndt-session" style={{ "--uc": session.accent, "--uc2": session.accent2 }}>
      <div className="ndt-sess-head">
        <span className="ndt-sess-crumb">Unit {session.unitCode} · {session.unitTitle} <b style={{ color: a }}>· {session.method}</b></span>
        <h1>{session.title}</h1>
        <p className="ndt-sess-sum">{session.summary}</p>
      </div>

      {/* the star: bespoke interactive visual */}
      <section className="ndt-card ndt-visual">
        <div className="ndt-card-h"><span className="ndt-k" style={{ color: a }}>INTERACTIVE</span><h2>Explore it</h2></div>
        <Visual session={session} accent={session.accent} accent2={session.accent2} />
      </section>

      {/* video(s) */}
      <section className="ndt-card">
        <div className="ndt-card-h"><span className="ndt-k" style={{ color: a }}>WATCH</span><h2>Video{videos.length > 1 ? "s" : ""}</h2></div>
        {videos.length ? (
          <div className="ndt-videos">
            {videos.map((v) => (
              <div key={v.id} className="ndt-vid">
                <div className="ndt-vid-frame"><iframe src={`https://www.youtube.com/embed/${v.id}`} title={v.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
                <span className="ndt-vid-t">{v.title}</span>
              </div>
            ))}
          </div>
        ) : (
          <a className="ndt-vid-soon" href={yt(session.title)} target="_blank" rel="noopener noreferrer" style={{ borderColor: a + "44" }}>
            <span className="pl" style={{ color: a }}>▶</span>
            <span>Curated video coming — <b>search “{session.title}” on YouTube</b> ↗</span>
          </a>
        )}
      </section>

      {/* teaching points */}
      <section className="ndt-card">
        <div className="ndt-card-h"><span className="ndt-k" style={{ color: a }}>LEARN</span><h2>Teaching points</h2></div>
        <div className="ndt-points">
          {session.points.map((p, i) => (
            <div key={i} className="ndt-point"><span className="ndt-point-n" style={{ background: a + "1e", color: a }}>{i + 1}</span><div><b>{p.t}</b><p>{p.d}</p></div></div>
          ))}
        </div>
      </section>

      {/* quiz */}
      {quiz.length > 0 && <Quiz key={session.id} quiz={quiz} accent={a} onPass={onDone} />}

      {/* footer nav */}
      <div className="ndt-sess-foot">
        <button className="ndt-navbtn" onClick={onPrev} disabled={!hasPrev}>← Previous</button>
        <button className="ndt-navbtn done" onClick={onDone} disabled={done}>{done ? "✓ Completed" : "Mark complete"}</button>
        <button className="ndt-navbtn" onClick={onNext} disabled={!hasNext}>Next →</button>
      </div>
    </div>
  );
}

/* ── knowledge check ── */
function Quiz({ quiz, accent, onPass }) {
  const [ans, setAns] = useState({});
  const [checked, setChecked] = useState(false);
  const score = quiz.reduce((n, q, i) => n + (ans[i] === q.answer ? 1 : 0), 0);
  const all = Object.keys(ans).length === quiz.length;
  useEffect(() => { if (checked && score === quiz.length) onPass?.(); }, [checked]); // eslint-disable-line
  return (
    <section className="ndt-card">
      <div className="ndt-card-h"><span className="ndt-k" style={{ color: accent }}>CHECK</span><h2>Knowledge check</h2>{checked && <span className="ndt-score" style={{ color: accent }}>{score}/{quiz.length}</span>}</div>
      <div className="ndt-quiz">
        {quiz.map((q, i) => (
          <div key={i} className="ndt-q">
            <b>{i + 1}. {q.q}</b>
            <div className="ndt-opts">
              {q.options.map((o, j) => {
                const sel = ans[i] === j, right = checked && j === q.answer, wrong = checked && sel && j !== q.answer;
                return (
                  <button key={j} className={"ndt-opt" + (sel ? " sel" : "") + (right ? " right" : "") + (wrong ? " wrong" : "")}
                    onClick={() => !checked && setAns((a) => ({ ...a, [i]: j }))} disabled={checked}
                    style={sel && !checked ? { borderColor: accent } : undefined}>
                    <span className="ndt-opt-m">{String.fromCharCode(65 + j)}</span>{o}
                  </button>
                );
              })}
            </div>
            {checked && <p className="ndt-explain">{ans[i] === q.answer ? "✓ " : "✗ "}{q.explain}</p>}
          </div>
        ))}
      </div>
      {!checked ? (
        <button className="ndt-btn sm" onClick={() => setChecked(true)} disabled={!all} style={{ background: accent }}>Check answers</button>
      ) : (
        <div className="ndt-quiz-foot">
          <span>{score === quiz.length ? "Perfect — session marked complete." : `${score}/${quiz.length}. Review the explanations and retry.`}</span>
          <button className="ndt-btn sm ghost" onClick={() => { setAns({}); setChecked(false); }}>Retry</button>
        </div>
      )}
    </section>
  );
}

const CSS = `
.ndt{--font:var(--font-sans),Inter,system-ui,sans-serif;--mono:var(--font-mono),ui-monospace,monospace;
  --bg:#f6f7f9;--panel:#ffffff;--panel2:#f1f3f6;--line:#e3e7ec;--line2:#d3d9e0;--ink:#141922;--soft:#3c4655;--dim:#697588;--faint:#9aa6b5;
  position:fixed;inset:0;display:grid;grid-template-columns:290px 1fr;font-family:var(--font);background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;overflow:hidden}
.ndt.dark{--bg:#0c0f14;--panel:#141920;--panel2:#1b2129;--line:#232b35;--line2:#2f3945;--ink:#eef2f7;--soft:#c2ccd8;--dim:#8b97a6;--faint:#5e6a79}
.ndt *{box-sizing:border-box}
.ndt button{font-family:inherit;cursor:pointer}

/* rail */
.ndt-rail{display:flex;flex-direction:column;background:var(--panel);border-right:1px solid var(--line);min-height:0}
.ndt-brand{display:flex;align-items:center;gap:11px;padding:18px 18px 14px;background:none;border:0;text-align:left;color:var(--ink)}
.ndt-logo{font-size:22px;color:#f59e0b}
.ndt-brandtx b{display:block;font-size:16px;font-weight:700;letter-spacing:-.01em}
.ndt-brandtx small{font-family:var(--mono);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
.ndt-prog{padding:0 18px 14px}
.ndt-prog-top{display:flex;justify-content:space-between;font-size:11px;color:var(--dim);margin-bottom:6px}
.ndt-prog-top b{color:var(--ink)}
.ndt-bar{height:6px;border-radius:4px;background:var(--panel2);overflow:hidden}
.ndt-bar i{display:block;height:100%;background:linear-gradient(90deg,#f59e0b,#fbbf24);border-radius:4px;transition:width .4s}
.ndt-nav{flex:1;overflow-y:auto;padding:6px 10px 10px}
.ndt-home{width:100%;text-align:left;background:none;border:0;color:var(--soft);font-size:13px;font-weight:600;padding:9px 10px;border-radius:9px}
.ndt-home:hover{background:var(--panel2)}.ndt-home.on{background:var(--panel2);color:var(--ink)}
.ndt-unit{margin-top:3px}
.ndt-unit-h{width:100%;display:flex;align-items:center;gap:9px;background:none;border:0;padding:8px 10px;border-radius:9px;text-align:left;color:var(--ink)}
.ndt-unit-h:hover{background:var(--panel2)}
.uc{font-family:var(--mono);font-size:10px;font-weight:700;width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:7px;flex:none}
.ut{flex:1;font-size:12.5px;font-weight:600;line-height:1.25}
.ut small{display:block;font-family:var(--mono);font-size:8.5px;letter-spacing:.06em;color:var(--faint);font-weight:500;margin-top:1px}
.uchev{color:var(--faint);font-size:10px}
.ndt-sessions{padding:2px 0 4px 8px;margin-left:20px;border-left:1px solid var(--line)}
.ndt-sess{width:100%;display:flex;align-items:center;gap:9px;background:none;border:1px solid transparent;padding:6px 9px;border-radius:8px;text-align:left;color:var(--soft);font-size:12px;margin-top:1px}
.ndt-sess:hover{background:var(--panel2)}
.ndt-sess.on{color:var(--ink);font-weight:600}
.sn{font-family:var(--mono);font-size:10px;width:16px;height:16px;flex:none;display:flex;align-items:center;justify-content:center;border-radius:5px;background:var(--panel2);color:var(--dim)}
.st{line-height:1.2}
.ndt-theme{margin:8px 12px 14px;background:var(--panel2);border:1px solid var(--line);border-radius:9px;padding:9px;font-size:12px;color:var(--soft)}

/* main */
.ndt-main{overflow-y:auto;min-height:0}
.ndt-home-wrap{max-width:1000px;margin:0 auto;padding:46px 40px 70px}
.ndt-hero{margin-bottom:38px}
.ndt-eyebrow{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#f59e0b}
.ndt-hero h1{font-size:44px;line-height:1.05;font-weight:800;letter-spacing:-.02em;margin:12px 0 14px}
.grad{background:linear-gradient(90deg,#f59e0b,#ef4444);-webkit-background-clip:text;background-clip:text;color:transparent}
.ndt-hero p{max-width:640px;font-size:15px;line-height:1.65;color:var(--dim)}
.ndt-hero-cta{display:flex;align-items:center;gap:16px;margin-top:22px}
.ndt-btn{background:#f59e0b;color:#1a1200;border:0;border-radius:11px;padding:13px 22px;font-size:14px;font-weight:700}
.ndt-btn.sm{padding:9px 16px;font-size:13px;color:#fff}
.ndt-btn.ghost{background:transparent;border:1px solid var(--line2);color:var(--soft)}
.ndt-hero-stat{font-family:var(--mono);font-size:12px;color:var(--dim)}
.ndt-unitcards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.ndt-uc{position:relative;text-align:left;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px 20px 18px;overflow:hidden;color:var(--ink);transition:transform .15s,border-color .15s,box-shadow .15s}
.ndt-uc::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;background:linear-gradient(90deg,var(--uc),var(--uc2))}
.ndt-uc:hover{transform:translateY(-3px);border-color:var(--uc);box-shadow:0 12px 30px -14px var(--uc)}
.ndt-uc-code{font-family:var(--mono);font-size:11px;font-weight:700;color:var(--uc)}
.ndt-uc-icon{position:absolute;top:16px;right:18px;font-size:26px;color:var(--uc);opacity:.5}
.ndt-uc b{display:block;font-size:18px;font-weight:700;margin:8px 0 6px;letter-spacing:-.01em}
.ndt-uc small{display:block;font-size:12.5px;line-height:1.55;color:var(--dim);min-height:56px}
.ndt-uc-tag{display:inline-block;margin-top:12px;font-family:var(--mono);font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}

/* session */
.ndt-session{max-width:860px;margin:0 auto;padding:38px 40px 80px}
.ndt-sess-head{margin-bottom:22px}
.ndt-sess-crumb{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim)}
.ndt-sess-head h1{font-size:32px;font-weight:800;letter-spacing:-.02em;margin:8px 0 10px;line-height:1.08}
.ndt-sess-sum{font-size:15px;line-height:1.65;color:var(--dim);max-width:680px}
.ndt-card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:22px;margin-top:18px}
.ndt-card-h{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.ndt-k{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em}
.ndt-card-h h2{font-size:16px;font-weight:700;letter-spacing:-.01em}
.ndt-score{margin-left:auto;font-family:var(--mono);font-weight:700}

/* visual stage */
.v-stage{background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:16px;text-align:center}
.v-svg{width:100%;max-width:460px;height:auto;display:block;margin:0 auto}
.v-cap{font-size:12.5px;line-height:1.5;color:var(--dim);margin-top:12px;max-width:560px;margin-left:auto;margin-right:auto}
.v-seg{display:inline-flex;gap:4px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:4px;margin-bottom:14px}
.v-seg button{background:none;border:1px solid transparent;border-radius:7px;padding:7px 13px;font-size:12.5px;color:var(--dim);font-weight:600}
.v-seg button.on{color:#fff}
.v-row{display:flex;gap:12px;margin-top:14px}
.v-fact{flex:1;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:11px}
.v-fact b{display:block;font-size:17px;font-weight:700}
.v-fact span{font-size:11px;color:var(--dim);line-height:1.35;display:block;margin-top:2px}
.v-compare{width:100%;font-size:12.5px}
.v-compare-h,.v-compare-r{display:grid;grid-template-columns:100px 1fr 1fr;gap:10px;padding:9px 10px;text-align:left}
.v-compare-h{font-family:var(--mono);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);border-bottom:1px solid var(--line)}
.v-compare-r{border-radius:8px;transition:background .12s}
.v-compare-r.hi{background:var(--panel)}
.v-compare-r .k{font-weight:700;color:var(--soft)}
.v-compare-r .mech{color:var(--dim)}
.v-compare-r .ndt{color:var(--ink)}
.v-methods{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:14px}
@media(max-width:720px){.v-methods{grid-template-columns:repeat(3,1fr)}}
.v-method{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;background:var(--panel2);border:1.5px solid var(--line);border-radius:11px;padding:12px 6px 9px;color:var(--ink);transition:.12s}
.v-method:hover{border-color:var(--line2)}
.v-method.dim{opacity:.32}
.v-method .mi{font-size:20px}
.v-method b{font-family:var(--mono);font-size:12px}
.v-method small{font-size:9px;color:var(--dim);text-align:center;line-height:1.15}
.mdepth{font-family:var(--mono);font-size:7.5px;letter-spacing:.05em;text-transform:uppercase;padding:2px 5px;border-radius:4px;margin-top:3px}
.mdepth.surface{background:#3b82f622;color:#3b82f6}
.mdepth.volumetric{background:#8b5cf622;color:#8b5cf6}
.ndt.dark .mdepth.surface{color:#93c5fd}.ndt.dark .mdepth.volumetric{color:#c4b5fd}
.v-methoddetail{background:var(--panel);border:1px solid;border-radius:11px;padding:16px}
.v-methoddetail .big{font-size:22px;font-weight:800}
.v-methoddetail p{font-size:13px;color:var(--dim);line-height:1.55;margin:8px 0}
.v-hunt{max-width:520px}
.v-win{margin-top:12px;font-size:13px;font-weight:600;text-align:center}
.v-ph{border:1.5px dashed;border-radius:12px;padding:26px;max-width:420px;margin:0 auto}
.v-ph-ic{font-family:var(--mono);font-size:13px;letter-spacing:.1em;text-transform:uppercase}
.v-ph b{display:block;font-size:16px;margin:8px 0 6px}
.v-ph p{font-size:12.5px;color:var(--dim);line-height:1.55}

/* video */
.ndt-videos{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:720px){.ndt-videos{grid-template-columns:1fr}}
.ndt-vid-frame{position:relative;padding-top:56.25%;border-radius:10px;overflow:hidden;background:#000}
.ndt-vid-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.ndt-vid-t{display:block;font-size:12px;color:var(--dim);margin-top:7px}
.ndt-vid-soon{display:flex;align-items:center;gap:12px;border:1.5px dashed;border-radius:11px;padding:16px;color:var(--soft);text-decoration:none;font-size:13px}
.ndt-vid-soon .pl{font-size:20px}
.ndt-vid-soon b{color:var(--ink)}

/* points */
.ndt-points{display:flex;flex-direction:column;gap:12px}
.ndt-point{display:flex;gap:13px}
.ndt-point-n{flex:none;width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:12px;font-weight:700}
.ndt-point b{font-size:14px;font-weight:700}
.ndt-point p{font-size:13px;color:var(--dim);line-height:1.55;margin-top:3px}

/* quiz */
.ndt-quiz{display:flex;flex-direction:column;gap:18px}
.ndt-q>b{display:block;font-size:14px;margin-bottom:9px;line-height:1.4}
.ndt-opts{display:flex;flex-direction:column;gap:7px}
.ndt-opt{display:flex;align-items:center;gap:10px;text-align:left;background:var(--panel2);border:1.5px solid var(--line);border-radius:9px;padding:10px 12px;font-size:13px;color:var(--soft)}
.ndt-opt:hover:not(:disabled){border-color:var(--line2)}
.ndt-opt.sel{color:var(--ink)}
.ndt-opt.right{border-color:#16a34a;background:#16a34a18;color:var(--ink)}
.ndt-opt.wrong{border-color:#dc2626;background:#dc262618}
.ndt-opt-m{font-family:var(--mono);font-size:11px;font-weight:700;width:20px;height:20px;border-radius:5px;background:var(--panel);display:flex;align-items:center;justify-content:center;flex:none}
.ndt-explain{font-size:12px;color:var(--dim);line-height:1.5;margin-top:8px;padding-left:2px}
.ndt-quiz-foot{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:16px;font-size:13px;color:var(--dim)}

/* session foot */
.ndt-sess-foot{display:flex;gap:10px;margin-top:22px}
.ndt-navbtn{flex:1;background:var(--panel);border:1px solid var(--line);border-radius:11px;padding:13px;font-size:13px;font-weight:600;color:var(--soft)}
.ndt-navbtn:hover:not(:disabled){border-color:var(--line2);color:var(--ink)}
.ndt-navbtn:disabled{opacity:.4;cursor:default}
.ndt-navbtn.done{background:#f59e0b;color:#1a1200;border-color:#f59e0b}
.ndt-navbtn.done:disabled{background:#16a34a;border-color:#16a34a;color:#fff;opacity:1}

@media(max-width:860px){.ndt{grid-template-columns:1fr}.ndt-rail{display:none}}
`;
