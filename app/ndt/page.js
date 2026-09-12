"use client";
/* NDT Learning Bay — React rewrite of the NDT inspection bay.
 * Inspection-console identity (warm-dark + safety red + hazard stripes),
 * Inter type, deep per-session content. 5 units × 9 sessions = 45.
 * Old public/ndt-inspection-bay.html stays as the fallback until verified. */
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { UNITS, ALL_SESSIONS, SESSION_COUNT, COURSE } from "../../lib/ndt/curriculum";
import { DETAIL } from "../../lib/ndt/content";
import { QUIZ } from "../../lib/ndt/assessments";
import { VIDEOS } from "../../lib/ndt/videos";
import { Visual } from "./visuals";

const KEY = "ndt_bay_v1";
const yt = (q) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q + " NDT explained");

export default function NdtBay() {
  const [dark, setDark] = useState(true);
  const [openUnit, setOpenUnit] = useState(1);
  const [cur, setCur] = useState("1.1");
  const [done, setDone] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(KEY) || "{}"); if (s.done) setDone(s.done); if (s.dark != null) setDark(s.dark); if (s.cur) setCur(s.cur); } catch (e) {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (!loaded) return; try { localStorage.setItem(KEY, JSON.stringify({ done, dark, cur })); } catch (e) {} }, [done, dark, cur, loaded]);
  useEffect(() => { if (mainRef.current) mainRef.current.scrollTop = 0; }, [cur]);

  const session = useMemo(() => ALL_SESSIONS.find((s) => s.id === cur), [cur]);
  const idx = useMemo(() => ALL_SESSIONS.findIndex((s) => s.id === cur), [cur]);
  const doneCount = Object.values(done).filter(Boolean).length;
  const pct = Math.round((doneCount / SESSION_COUNT) * 100);
  const unitProgress = (u) => u.sessions.filter((s) => done[s.id]).length;

  const go = useCallback((id) => { setCur(id); setNavOpen(false); const s = ALL_SESSIONS.find((x) => x.id === id); if (s) setOpenUnit(s.unitId); }, []);
  const goHome = () => { setCur("home"); setNavOpen(false); };
  const markDone = (id) => setDone((d) => ({ ...d, [id]: true }));
  const prev = () => idx > 0 && go(ALL_SESSIONS[idx - 1].id);
  const next = () => idx < ALL_SESSIONS.length - 1 && go(ALL_SESSIONS[idx + 1].id);

  return (
    <div className="ndt" data-theme={dark ? "dark" : "light"}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ndt-scan" style={{ width: pct + "%" }} />
      {/* ── mobile top bar ── */}
      <div className="ndt-mbar">
        <button className="ndt-hamb" onClick={() => setNavOpen(true)} aria-label="Open menu"><span /><span /><span /></button>
        <button className="ndt-mbar-brand" onClick={goHome}><span className="ndt-logo">◆</span>NDT Learning</button>
        <span className="ndt-mbar-prog">{doneCount}/{SESSION_COUNT}</span>
      </div>
      {navOpen && <div className="ndt-backdrop" onClick={() => setNavOpen(false)} />}
      {/* ── rail ── */}
      <aside className={"ndt-rail" + (navOpen ? " open" : "")}>
        <button className="ndt-brand" onClick={goHome}>
          <span className="ndt-logo">◆</span>
          <span className="ndt-brandtx"><small>Inspection Bay · {COURSE.code}</small><b>NDT Learning</b></span>
        </button>
        <div className="ndt-prog">
          <div className="ndt-prog-top"><span>Certification progress</span><b>{doneCount}/{SESSION_COUNT}</b></div>
          <div className="ndt-bar"><i style={{ width: pct + "%" }} /></div>
        </div>
        <nav className="ndt-nav">
          <button className={"ndt-home" + (cur === "home" ? " on" : "")} onClick={goHome}><span className="ndt-home-ic">◎</span>Overview</button>
          {UNITS.map((u) => {
            const open = openUnit === u.id, up = unitProgress(u);
            return (
              <div key={u.id} className="ndt-unit">
                <button className={"ndt-unit-h" + (open ? " open" : "")} onClick={() => setOpenUnit(open ? 0 : u.id)}>
                  <span className="uc">{u.code}</span>
                  <span className="ut">{u.title}<small>{up}/9 · {u.tag}</small></span>
                  <span className="uchev">{open ? "▾" : "▸"}</span>
                </button>
                {open && (
                  <div className="ndt-sessions">
                    {u.sessions.map((s) => (
                      <button key={s.id} className={"ndt-sess" + (cur === s.id ? " on" : "")} onClick={() => go(s.id)}>
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
        <button className="ndt-theme" onClick={() => setDark((d) => !d)}>{dark ? "☾  Dark" : "☀  Light"}</button>
      </aside>

      {/* ── main ── */}
      <main className="ndt-main" ref={mainRef}>
        {cur === "home" ? <Home go={go} done={done} /> : session ? (
          <SessionView key={session.id} session={session} done={!!done[session.id]}
            onDone={() => markDone(session.id)} onPrev={prev} onNext={next}
            hasPrev={idx > 0} hasNext={idx < ALL_SESSIONS.length - 1} />
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
        <div className="ndt-hero-stripe" />
        <div className="ndt-hero-body">
          <span className="ndt-eyebrow"><i className="led" />{COURSE.program} · {COURSE.code}</span>
          <h1>Find the flaw.<br /><span className="g">Keep the part flying.</span></h1>
          <p>Non-Destructive Testing inspects an aircraft component for hidden defects without ever taking it apart. Walk {SESSION_COUNT} in-depth sessions across five methods — each with a hands-on interactive, curated video, detailed lesson and a knowledge check — on the way to Certified Inspector.</p>
          <div className="ndt-hero-cta">
            <button className="ndt-btn" onClick={() => go(doneCount ? nextUndone(done) : "1.1")}>{doneCount ? "Resume learning" : "Begin Unit I"} →</button>
            <span className="ndt-hero-stat"><b>{doneCount}</b> / {SESSION_COUNT} sessions complete</span>
          </div>
        </div>
      </div>
      <div className="ndt-sec-eyebrow">The five methods · 45 sessions</div>
      <div className="ndt-unitcards">
        {UNITS.map((u) => {
          const up = u.sessions.filter((s) => done[s.id]).length;
          return (
            <button key={u.id} className="ndt-uc" onClick={() => go(u.sessions[0].id)}>
              <div className="ndt-uc-top"><span className="ndt-uc-code">UNIT {u.code}</span><span className="ndt-uc-icon">{u.icon}</span></div>
              <b>{u.title}</b>
              <small>{u.blurb}</small>
              <div className="ndt-uc-foot"><span className="ndt-uc-tag">{u.tag} · 9 sessions</span><span className="ndt-uc-prog">{up}/9</span></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
function nextUndone(done) { const s = ALL_SESSIONS.find((x) => !done[x.id]); return s ? s.id : "1.1"; }

/* ── one session ── */
function SessionView({ session, done, onDone, onPrev, onNext, hasPrev, hasNext }) {
  const videos = VIDEOS[session.id] || [];
  const quiz = QUIZ[session.id] || [];
  const detail = DETAIL[session.id];
  const a = session.accent;
  return (
    <article className="ndt-session" style={{ "--uc": session.accent, "--uc2": session.accent2 }}>
      <header className="ndt-sess-head">
        <span className="ndt-sess-crumb">Unit {session.unitCode} · {session.unitTitle}<b>· {session.method}</b></span>
        <h1>{session.title}</h1>
        <p className="ndt-lead">{detail?.overview || session.summary}</p>
        <div className="ndt-meta"><span className="ndt-chip red">{session.method}</span><span className="ndt-chip">Session {session.n} of 9</span><span className="ndt-chip">Unit {session.unitCode}</span></div>
      </header>

      {/* interactive */}
      <section className="ndt-card ndt-console">
        <div className="ndt-card-h"><span className="ndt-k">Interactive</span><h2>Explore it</h2></div>
        <Visual session={session} accent="#f0454a" accent2="#ff8f52" />
      </section>

      {/* detailed lesson */}
      {detail ? (
        <section className="ndt-card ndt-lesson">
          <div className="ndt-card-h stripe"><span className="ndt-k">Lesson</span><h2>In detail</h2></div>
          {detail.sections.map((s, i) => (
            <div key={i} className="ndt-lsec">
              <h3><span className="ndt-lsec-n">{String(i + 1).padStart(2, "0")}</span>{s.h}</h3>
              <p>{s.p}</p>
              {s.list && <ul className="ndt-llist">{s.list.map((li, j) => <li key={j}>{li}</li>)}</ul>}
            </div>
          ))}
        </section>
      ) : (
        <section className="ndt-card">
          <div className="ndt-card-h stripe"><span className="ndt-k">Lesson</span><h2>Teaching points</h2></div>
          <div className="ndt-points">
            {session.points.map((p, i) => (
              <div key={i} className="ndt-point"><span className="ndt-point-n">{i + 1}</span><div><b>{p.t}</b><p>{p.d}</p></div></div>
            ))}
          </div>
        </section>
      )}

      {/* video(s) */}
      <section className="ndt-card">
        <div className="ndt-card-h"><span className="ndt-k">Watch</span><h2>Video{videos.length > 1 ? "s" : ""}</h2></div>
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
          <a className="ndt-vid-soon" href={yt(session.title)} target="_blank" rel="noopener noreferrer">
            <span className="pl">▶</span><span>Curated video coming — <b>search “{session.title}” on YouTube</b> ↗</span>
          </a>
        )}
      </section>

      {/* key terms */}
      {detail?.keyTerms && (
        <section className="ndt-card">
          <div className="ndt-card-h"><span className="ndt-k">Glossary</span><h2>Key terms</h2></div>
          <div className="ndt-terms">
            {detail.keyTerms.map((t, i) => (<div key={i} className="ndt-term"><b>{t.t}</b><p>{t.d}</p></div>))}
          </div>
        </section>
      )}

      {/* applications */}
      {detail?.applications && (
        <section className="ndt-card">
          <div className="ndt-card-h"><span className="ndt-k">In service</span><h2>Aviation applications</h2></div>
          <ul className="ndt-apps">{detail.applications.map((x, i) => <li key={i}><span className="ndt-app-m">✈</span>{x}</li>)}</ul>
        </section>
      )}

      {/* takeaways */}
      {detail?.takeaways && (
        <section className="ndt-card ndt-takeaways">
          <div className="ndt-card-h stripe"><span className="ndt-k">Remember</span><h2>Key takeaways</h2></div>
          <ul>{detail.takeaways.map((x, i) => <li key={i}><span className="tk">✓</span>{x}</li>)}</ul>
        </section>
      )}

      {/* quiz */}
      {quiz.length > 0 && <Quiz key={session.id} quiz={quiz} onPass={onDone} />}

      {/* footer nav */}
      <div className="ndt-sess-foot">
        <button className="ndt-navbtn" onClick={onPrev} disabled={!hasPrev}>← Previous</button>
        <button className={"ndt-navbtn done" + (done ? " is" : "")} onClick={onDone} disabled={done}>{done ? "✓ Completed" : "Mark complete"}</button>
        <button className="ndt-navbtn" onClick={onNext} disabled={!hasNext}>Next →</button>
      </div>
    </article>
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
    <section className="ndt-card">
      <div className="ndt-card-h"><span className="ndt-k">Check</span><h2>Knowledge check</h2>{checked && <span className="ndt-qscore">{score}/{quiz.length}</span>}</div>
      <div className="ndt-quiz">
        {quiz.map((q, i) => (
          <div key={i} className="ndt-q">
            <b>{i + 1}. {q.q}</b>
            <div className="ndt-opts">
              {q.options.map((o, j) => {
                const sel = ans[i] === j, right = checked && j === q.answer, wrong = checked && sel && j !== q.answer;
                return (
                  <button key={j} className={"ndt-opt" + (sel ? " sel" : "") + (right ? " right" : "") + (wrong ? " wrong" : "")}
                    onClick={() => !checked && setAns((a) => ({ ...a, [i]: j }))} disabled={checked}>
                    <span className="ndt-opt-m">{String.fromCharCode(65 + j)}</span>{o}
                  </button>
                );
              })}
            </div>
            {checked && <p className={"ndt-explain" + (ans[i] === q.answer ? " ok" : " no")}>{ans[i] === q.answer ? "✓ " : "✗ "}{q.explain}</p>}
          </div>
        ))}
      </div>
      {!checked ? (
        <button className="ndt-btn sm" onClick={() => setChecked(true)} disabled={!all}>Check answers</button>
      ) : (
        <div className="ndt-quiz-foot">
          <span>{score === quiz.length ? "Perfect — session marked complete." : `${score}/${quiz.length} correct. Review the explanations and retry.`}</span>
          <button className="ndt-btn sm ghost" onClick={() => { setAns({}); setChecked(false); }}>Retry</button>
        </div>
      )}
    </section>
  );
}

const CSS = `
.ndt{--font:var(--font-sans),Inter,system-ui,sans-serif;--mono:var(--font-mono),ui-monospace,monospace;
  --bg:#16100e;--bg2:#1e1613;--panel:#211a16;--panel2:#29201b;--panel3:#31261f;
  --ink:#f4eee9;--sub:#c8b9af;--muted:#8f8078;--faint:#5f544d;
  --border:#3a2e29;--line:#2c221e;--hair:#463831;
  --red:#f0454a;--red-deep:#b0141d;--red-soft:rgba(240,69,74,.13);
  --grad:linear-gradient(120deg,#f0454a,#b0141d);
  --amber:linear-gradient(120deg,#ffb020,#e0630f);
  --stripe:repeating-linear-gradient(-45deg,#f0454a 0 9px,#1a1310 9px 18px);
  --shadow:0 24px 60px -30px rgba(0,0,0,.7);
  position:fixed;inset:0;display:grid;grid-template-columns:300px 1fr;font-family:var(--font);
  background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;overflow:hidden}
.ndt[data-theme="light"]{--bg:#eceae6;--bg2:#f5f3ef;--panel:#ffffff;--panel2:#f4f1ec;--panel3:#ece8e2;
  --ink:#1a1512;--sub:#42372f;--muted:#7c6f66;--faint:#a99e94;--border:#ddd6ce;--line:#e8e2da;--hair:#cfc7bd;
  --red:#d21f26;--red-deep:#9a0f16;--red-soft:rgba(210,31,38,.08);--grad:linear-gradient(120deg,#e11d2a,#a10f18);
  --stripe:repeating-linear-gradient(-45deg,#d21f26 0 9px,#f0d9d5 9px 18px);--shadow:0 20px 50px -30px rgba(90,20,20,.28)}
.ndt *{box-sizing:border-box}
.ndt button{font-family:inherit;cursor:pointer}
.ndt ::selection{background:var(--red);color:#fff}
.ndt-scan{position:fixed;top:0;left:0;height:2px;z-index:50;background:var(--grad);box-shadow:0 0 10px var(--red);transition:width .5s}

/* ── rail ── */
.ndt-rail{display:flex;flex-direction:column;background:linear-gradient(180deg,var(--bg2),var(--bg));border-right:1px solid var(--border);min-height:0}
.ndt-brand{position:relative;display:flex;align-items:center;gap:12px;padding:20px 20px 16px;background:none;border:0;text-align:left;color:var(--ink)}
.ndt-brand::after{content:"";position:absolute;left:20px;right:20px;bottom:0;height:2px;background:var(--stripe);opacity:.8;border-radius:2px}
.ndt-logo{font-size:20px;color:var(--red);filter:drop-shadow(0 0 8px var(--red-soft))}
.ndt-brandtx small{display:block;font-family:var(--mono);font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--red);font-weight:700}
.ndt-brandtx b{display:block;font-size:16px;font-weight:700;letter-spacing:-.01em;margin-top:2px}
.ndt-prog{padding:16px 20px 14px}
.ndt-prog-top{display:flex;justify-content:space-between;font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:7px}
.ndt-prog-top b{color:var(--ink)}
.ndt-bar{height:6px;border-radius:4px;background:var(--panel2);overflow:hidden;border:1px solid var(--line)}
.ndt-bar i{display:block;height:100%;background:var(--grad);border-radius:4px;transition:width .5s;box-shadow:0 0 8px var(--red-soft)}
.ndt-nav{flex:1;overflow-y:auto;padding:6px 12px 12px}
.ndt-home{width:100%;display:flex;align-items:center;gap:9px;text-align:left;background:none;border:1px solid transparent;color:var(--sub);font-size:13.5px;font-weight:600;padding:10px 11px;border-radius:10px}
.ndt-home-ic{color:var(--muted)}
.ndt-home:hover{background:var(--panel);color:var(--ink)}
.ndt-home.on{background:var(--panel);border-color:var(--hair);color:var(--ink)}
.ndt-home.on .ndt-home-ic{color:var(--red)}
.ndt-unit{margin-top:3px}
.ndt-unit-h{position:relative;width:100%;display:flex;align-items:center;gap:10px;background:none;border:1px solid transparent;padding:9px 11px;border-radius:10px;text-align:left;color:var(--ink)}
.ndt-unit-h:hover{background:var(--panel)}
.ndt-unit-h.open{background:var(--panel);border-color:var(--hair)}
.uc{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:-.02em;min-width:30px;height:30px;padding:0 6px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:var(--panel2);border:1px solid var(--hair);color:var(--muted);flex:none}
.ndt-unit-h.open .uc{background:var(--grad);color:#fff;border-color:transparent}
.ut{flex:1;font-size:13px;font-weight:600;line-height:1.25}
.ut small{display:block;font-family:var(--mono);font-size:8.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);font-weight:500;margin-top:2px}
.uchev{color:var(--faint);font-size:10px}
.ndt-sessions{padding:3px 0 5px 10px;margin:2px 0 2px 14px;border-left:1px solid var(--line)}
.ndt-sess{position:relative;width:100%;display:flex;align-items:center;gap:10px;background:none;border:0;padding:7px 10px;border-radius:8px;text-align:left;color:var(--sub);font-size:12px;margin-top:1px}
.ndt-sess:hover{background:var(--panel);color:var(--ink)}
.ndt-sess.on{background:var(--panel);color:var(--ink);font-weight:600}
.ndt-sess.on::before{content:"";position:absolute;left:-11px;top:6px;bottom:6px;width:3px;background:var(--red);border-radius:0 3px 3px 0;box-shadow:0 0 8px var(--red)}
.sn{font-family:var(--mono);font-size:10px;width:18px;height:18px;flex:none;display:flex;align-items:center;justify-content:center;border-radius:5px;background:var(--panel2);border:1px solid var(--line);color:var(--muted)}
.sn.ok{background:var(--red-soft);border-color:transparent;color:var(--red)}
.st{line-height:1.25}
.ndt-theme{margin:8px 14px 16px;background:var(--panel2);border:1px solid var(--border);border-radius:10px;padding:10px;font-size:12px;color:var(--sub);font-family:var(--mono);letter-spacing:.04em}
.ndt-theme:hover{border-color:var(--red);color:var(--ink)}

/* ── main ── */
.ndt-main{overflow-y:auto;min-height:0;background:radial-gradient(1000px 520px at 100% -8%,var(--red-soft),transparent 55%)}

/* home */
.ndt-home-wrap{max-width:1060px;margin:0 auto;padding:40px 42px 80px}
.ndt-hero{border:1px solid var(--border);border-radius:18px;overflow:hidden;background:linear-gradient(135deg,var(--panel),var(--bg2));box-shadow:var(--shadow)}
.ndt-hero-stripe{height:8px;background:var(--stripe)}
.ndt-hero-body{padding:34px 38px 36px}
.ndt-eyebrow{display:inline-flex;align-items:center;gap:9px;font-family:var(--mono);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--red);font-weight:700}
.ndt-eyebrow .led{width:8px;height:8px;border-radius:50%;background:var(--red);box-shadow:0 0 8px var(--red);animation:ndtblink 1.6s infinite}
@keyframes ndtblink{50%{opacity:.35}}
.ndt-hero h1{font-size:46px;line-height:1.04;font-weight:800;letter-spacing:-.025em;margin:14px 0 16px}
.ndt-hero h1 .g{color:var(--red)}
.ndt-hero p{max-width:660px;font-size:15px;line-height:1.7;color:var(--sub)}
.ndt-hero-cta{display:flex;align-items:center;gap:18px;margin-top:24px;flex-wrap:wrap}
.ndt-btn{background:var(--grad);color:#fff;border:0;border-radius:11px;padding:13px 24px;font-size:14px;font-weight:700;box-shadow:0 10px 24px -12px var(--red)}
.ndt-btn:hover{filter:brightness(1.06)}
.ndt-btn.sm{padding:10px 18px;font-size:13px}
.ndt-btn.ghost{background:transparent;border:1px solid var(--border);color:var(--sub);box-shadow:none}
.ndt-hero-stat{font-family:var(--mono);font-size:12px;color:var(--muted)}
.ndt-hero-stat b{color:var(--ink)}
.ndt-sec-eyebrow{font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin:34px 0 14px;padding-left:2px}
.ndt-unitcards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.ndt-uc{position:relative;text-align:left;background:var(--panel);border:1px solid var(--border);border-radius:15px;padding:18px 20px 16px;overflow:hidden;color:var(--ink);transition:transform .15s,border-color .15s,box-shadow .15s}
.ndt-uc::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;background:var(--stripe);opacity:.85}
.ndt-uc:hover{transform:translateY(-3px);border-color:var(--red);box-shadow:0 16px 36px -18px var(--red)}
.ndt-uc-top{display:flex;align-items:center;justify-content:space-between;margin-top:6px}
.ndt-uc-code{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.1em;color:var(--red)}
.ndt-uc-icon{font-size:22px;color:var(--muted)}
.ndt-uc b{display:block;font-size:18px;font-weight:700;margin:10px 0 7px;letter-spacing:-.01em}
.ndt-uc small{display:block;font-size:12.5px;line-height:1.55;color:var(--muted);min-height:56px}
.ndt-uc-foot{display:flex;align-items:center;justify-content:space-between;margin-top:14px}
.ndt-uc-tag{font-family:var(--mono);font-size:8.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}
.ndt-uc-prog{font-family:var(--mono);font-size:11px;color:var(--sub);font-weight:600}

/* session */
.ndt-session{max-width:820px;margin:0 auto;padding:38px 42px 90px}
.ndt-sess-head{margin-bottom:24px}
.ndt-sess-crumb{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.ndt-sess-crumb b{color:var(--red);margin-left:5px;font-weight:700}
.ndt-sess-head h1{font-size:34px;font-weight:800;letter-spacing:-.025em;margin:10px 0 14px;line-height:1.08}
.ndt-lead{font-size:16px;line-height:1.7;color:var(--sub);max-width:720px}
.ndt-meta{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
.ndt-chip{font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:var(--panel);border:1px solid var(--border);padding:6px 11px;border-radius:7px}
.ndt-chip.red{color:var(--red);border-color:var(--red-soft);background:var(--red-soft)}
.ndt-card{background:var(--panel);border:1px solid var(--border);border-radius:16px;padding:24px;margin-top:18px;box-shadow:var(--shadow)}
.ndt-card-h{display:flex;align-items:center;gap:11px;margin-bottom:18px;position:relative}
.ndt-card-h.stripe{padding-left:14px}
.ndt-card-h.stripe::before{content:"";position:absolute;left:0;top:2px;bottom:2px;width:4px;background:var(--stripe);border-radius:2px}
.ndt-k{font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--red);font-weight:700}
.ndt-card-h h2{font-size:17px;font-weight:700;letter-spacing:-.01em}
.ndt-console{background:linear-gradient(135deg,var(--panel),var(--panel2))}

/* detailed lesson */
.ndt-lsec{padding:18px 0;border-top:1px solid var(--line)}
.ndt-lsec:first-of-type{padding-top:4px;border-top:0}
.ndt-lsec h3{display:flex;align-items:baseline;gap:11px;font-size:17px;font-weight:700;letter-spacing:-.01em;margin-bottom:10px;line-height:1.3}
.ndt-lsec-n{font-family:var(--mono);font-size:12px;font-weight:700;color:var(--red);flex:none}
.ndt-lsec p{font-size:14.5px;line-height:1.75;color:var(--sub)}
.ndt-llist{margin:12px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:7px}
.ndt-llist li{position:relative;padding-left:20px;font-size:13.5px;line-height:1.55;color:var(--sub)}
.ndt-llist li::before{content:"▸";position:absolute;left:2px;color:var(--red)}

/* teaching points (fallback) */
.ndt-points{display:flex;flex-direction:column;gap:14px}
.ndt-point{display:flex;gap:14px}
.ndt-point-n{flex:none;width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:12px;font-weight:700;background:var(--red-soft);color:var(--red)}
.ndt-point b{font-size:14.5px;font-weight:700}
.ndt-point p{font-size:13.5px;color:var(--sub);line-height:1.6;margin-top:3px}

/* video */
.ndt-videos{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:720px){.ndt-videos{grid-template-columns:1fr}}
.ndt-vid-frame{position:relative;padding-top:56.25%;border-radius:11px;overflow:hidden;background:#000;border:1px solid var(--border)}
.ndt-vid-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.ndt-vid-t{display:block;font-size:12.5px;color:var(--sub);margin-top:8px}
.ndt-vid-soon{display:flex;align-items:center;gap:13px;border:1.5px dashed var(--hair);border-radius:12px;padding:18px;color:var(--sub);text-decoration:none;font-size:13.5px}
.ndt-vid-soon:hover{border-color:var(--red)}
.ndt-vid-soon .pl{font-size:20px;color:var(--red)}
.ndt-vid-soon b{color:var(--ink)}

/* key terms */
.ndt-terms{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:640px){.ndt-terms{grid-template-columns:1fr}}
.ndt-term{background:var(--panel2);border:1px solid var(--line);border-left:3px solid var(--red);border-radius:9px;padding:13px 15px}
.ndt-term b{font-size:13.5px;font-weight:700}
.ndt-term p{font-size:12.5px;line-height:1.55;color:var(--muted);margin-top:4px}

/* applications */
.ndt-apps{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px}
.ndt-apps li{display:flex;gap:12px;align-items:flex-start;font-size:14px;line-height:1.55;color:var(--sub)}
.ndt-app-m{flex:none;width:26px;height:26px;border-radius:8px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;font-size:12px}

/* takeaways */
.ndt-takeaways{background:linear-gradient(135deg,var(--panel),var(--panel2))}
.ndt-takeaways ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:11px}
.ndt-takeaways li{display:flex;gap:12px;align-items:flex-start;font-size:14.5px;line-height:1.6;color:var(--ink);font-weight:500}
.ndt-takeaways .tk{flex:none;width:22px;height:22px;border-radius:6px;background:var(--grad);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;margin-top:1px}

/* quiz */
.ndt-qscore{margin-left:auto;font-family:var(--mono);font-weight:700;color:var(--red)}
.ndt-quiz{display:flex;flex-direction:column;gap:20px}
.ndt-q>b{display:block;font-size:14.5px;margin-bottom:10px;line-height:1.45}
.ndt-opts{display:flex;flex-direction:column;gap:8px}
.ndt-opt{display:flex;align-items:center;gap:11px;text-align:left;background:var(--panel2);border:1.5px solid var(--line);border-radius:10px;padding:11px 13px;font-size:13.5px;color:var(--sub)}
.ndt-opt:hover:not(:disabled){border-color:var(--hair);color:var(--ink)}
.ndt-opt.sel{border-color:var(--red);color:var(--ink)}
.ndt-opt.right{border-color:#3fae5a;background:rgba(63,174,90,.13);color:var(--ink)}
.ndt-opt.wrong{border-color:var(--red);background:var(--red-soft)}
.ndt-opt-m{font-family:var(--mono);font-size:11px;font-weight:700;width:21px;height:21px;border-radius:6px;background:var(--panel);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;flex:none}
.ndt-explain{font-size:12.5px;line-height:1.55;margin-top:9px;padding-left:2px}
.ndt-explain.ok{color:#5cbd76}.ndt-explain.no{color:var(--red)}
.ndt-quiz-foot{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:18px;font-size:13px;color:var(--sub)}

/* session foot */
.ndt-sess-foot{display:flex;gap:11px;margin-top:24px}
.ndt-navbtn{flex:1;background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:14px;font-size:13.5px;font-weight:600;color:var(--sub)}
.ndt-navbtn:hover:not(:disabled){border-color:var(--red);color:var(--ink)}
.ndt-navbtn:disabled{opacity:.4;cursor:default}
.ndt-navbtn.done{background:var(--grad);color:#fff;border-color:transparent}
.ndt-navbtn.done.is{background:#3fae5a;opacity:1}

/* visual stage — restyled for the console identity */
.v-stage{background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:18px;text-align:center}
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
.v-compare-r .ndt{color:var(--ink)}
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
.v-ph{border:1.5px dashed var(--hair);border-radius:12px;padding:28px;max-width:440px;margin:0 auto}
.v-ph-ic{font-family:var(--mono);font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--red)}
.v-ph b{display:block;font-size:16px;margin:9px 0 7px}
.v-ph p{font-size:12.5px;color:var(--muted);line-height:1.55}

/* mobile top bar + drawer */
.ndt-mbar{display:none;align-items:center;gap:12px;height:54px;padding:0 14px;background:var(--bg2);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:30}
.ndt-hamb{display:flex;flex-direction:column;justify-content:center;gap:4px;width:38px;height:38px;background:var(--panel);border:1px solid var(--border);border-radius:9px;padding:0 9px}
.ndt-hamb span{height:2px;background:var(--sub);border-radius:2px;display:block}
.ndt-mbar-brand{display:flex;align-items:center;gap:8px;background:none;border:0;color:var(--ink);font-size:15px;font-weight:700}
.ndt-mbar-brand .ndt-logo{font-size:16px}
.ndt-mbar-prog{margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--red);font-weight:700}
.ndt-backdrop{display:none;position:fixed;inset:0;z-index:40;background:rgba(0,0,0,.5);backdrop-filter:blur(2px)}

@media(max-width:880px){
  .ndt{grid-template-columns:1fr;grid-template-rows:auto 1fr}
  .ndt-mbar{display:flex}
  .ndt-backdrop{display:block}
  .ndt-rail{position:fixed;top:0;left:0;bottom:0;width:290px;max-width:86vw;z-index:50;transform:translateX(-100%);transition:transform .22s ease;box-shadow:0 0 60px rgba(0,0,0,.5)}
  .ndt-rail.open{transform:translateX(0)}
  .ndt-session{padding:24px 18px 80px}
  .ndt-home-wrap{padding:22px 18px 70px}
  .ndt-sess-head h1{font-size:27px}
  .ndt-hero h1{font-size:34px}
  .ndt-hero-body{padding:24px 22px 26px}
  .ndt-card{padding:18px}
}
@media(max-width:560px){
  .v-compare-h,.v-compare-r{grid-template-columns:72px 1fr 1fr;gap:7px;padding:8px 6px;font-size:11.5px}
  .v-row{flex-direction:column;gap:8px}
  .v-methods{grid-template-columns:repeat(3,1fr)}
}
`;
