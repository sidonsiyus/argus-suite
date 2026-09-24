"use client";

/*
 * Marks — per-subject grid: each student (AERO-2025-28 roster) against CAT-1,
 * CAT-2, Model and End-Semester, with editable max marks per subject, plus
 * per-assessment analytics. Faculty-only via RLS.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getRoster } from "@/lib/attendance";
import { isMissingTable } from "@/lib/professor";
import {
  ASSESSMENTS, PASS_FRACTION, listSubjects, createSubject, updateSubject, deleteSubject, getMarks, saveMarks,
} from "@/lib/marks";

export default function MarksTool() {
  const [roster, setRoster] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sel, setSel] = useState(null);          // selected subject id
  const [marks, setMarks] = useState({});        // { student_id: { cat1,cat2,model,end_sem } } (string values)
  const [needsSetup, setNeedsSetup] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [view, setView] = useState("grid");      // grid | analytics
  const loadSeq = useRef(0);

  const loadBase = useCallback(async () => {
    try {
      const [r, subs] = await Promise.all([getRoster(), listSubjects()]);
      setRoster(r); setSubjects(subs);
      setSel((cur) => cur || subs[0]?.id || null);
      setNeedsSetup(false);
    } catch (e) { if (isMissingTable(e)) setNeedsSetup(true); else setStatus(e?.message || "Could not load."); }
  }, []);
  useEffect(() => { loadBase(); }, [loadBase]);

  const loadMarks = useCallback(async (subjectId) => {
    if (!subjectId) { setMarks({}); return; }
    const seq = ++loadSeq.current;
    try {
      const m = await getMarks(subjectId);
      if (seq !== loadSeq.current) return;
      const asStr = {};
      Object.entries(m).forEach(([id, v]) => { asStr[id] = {
        cat1: v.cat1 ?? "", cat2: v.cat2 ?? "", model: v.model ?? "", end_sem: v.end_sem ?? "" }; });
      setMarks(asStr);
    } catch (e) { if (isMissingTable(e)) setNeedsSetup(true); else setStatus(e?.message || "Could not load marks."); }
  }, []);
  useEffect(() => { loadMarks(sel); }, [sel, loadMarks]);

  const subject = subjects.find((s) => s.id === sel);
  const valOf = (id, k) => marks[id]?.[k] ?? "";
  function setCell(id, k, v) { setMarks((s) => ({ ...s, [id]: { ...(s[id] || {}), [k]: v } })); }

  async function save() {
    if (!sel) return;
    setBusy(true); setStatus("Saving…");
    try { const n = await saveMarks(sel, marks); setStatus(`Saved marks for ${n} students in ${subject?.name}.`); }
    catch (e) { setStatus(e?.message || "Save failed."); }
    finally { setBusy(false); }
  }

  // ── analytics ──
  const analytics = useMemo(() => {
    if (!subject) return null;
    const per = ASSESSMENTS.map((a) => {
      const max = subject[a.maxKey] || 0;
      const scores = roster.map((r) => valOf(r.id, a.k)).filter((v) => v !== "" && v != null).map(Number).filter((n) => !Number.isNaN(n));
      const n = scores.length;
      const avg = n ? scores.reduce((x, y) => x + y, 0) / n : null;
      const pass = scores.filter((v) => v >= max * PASS_FRACTION).length;
      const top = n ? Math.max(...scores) : null;
      return { ...a, max, n, avg, pass, fail: n - pass, top };
    });
    return per;
  }, [subject, roster, marks]); // eslint-disable-line

  const perStudent = useMemo(() => {
    if (!subject) return [];
    const totalMax = ASSESSMENTS.reduce((s, a) => s + (subject[a.maxKey] || 0), 0);
    return roster.map((r) => {
      let got = 0, has = false;
      ASSESSMENTS.forEach((a) => { const v = valOf(r.id, a.k); if (v !== "" && v != null && !Number.isNaN(+v)) { got += +v; has = true; } });
      return { ...r, total: has ? got : null, totalMax, pct: has && totalMax ? Math.round((got / totalMax) * 100) : null };
    });
  }, [subject, roster, marks]); // eslint-disable-line

  if (needsSetup) {
    return (
      <div className="prof-panel">
        <div className="prof-panel-h"><h2>Marks</h2><span className="prof-chip">Setup</span></div>
        <div className="mk-setup"><b>⚠ One-time setup needed.</b> Run <code>supabase/migrations/20260925_marks.sql</code> in your sid-lms project, then reload.</div>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </div>
    );
  }

  return (
    <div className="prof-panel">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="prof-panel-h">
        <h2>Marks</h2>
        <span className="prof-chip">Live</span>
        <div className="att-subnav">
          <button className={"att-subtab" + (view === "grid" ? " on" : "")} onClick={() => setView("grid")}>Enter</button>
          <button className={"att-subtab" + (view === "analytics" ? " on" : "")} onClick={() => setView("analytics")}>Analytics</button>
        </div>
      </div>

      <div className="mk-bar">
        <select className="att-in" value={sel || ""} onChange={(e) => setSel(e.target.value || null)}>
          <option value="">{subjects.length ? "— select subject —" : "no subjects yet"}</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button className="prof-btn ghost" onClick={() => setShowManage((v) => !v)}>{showManage ? "Close" : "Manage subjects"}</button>
      </div>

      {showManage && <ManageSubjects subjects={subjects} onChanged={loadBase} onSelect={setSel} />}
      {status && <div className="att-status">{status}</div>}

      {!subject ? (
        <div className="att-empty">Create or select a subject to enter marks.</div>
      ) : view === "grid" ? (
        <>
          <div className="mk-grid">
            <div className="mk-row head">
              <span>#</span><span className="mk-name">Name</span>
              {ASSESSMENTS.map((a) => <span key={a.k} className="mk-cell">{a.label}<em>/{subject[a.maxKey]}</em></span>)}
            </div>
            {roster.map((r) => (
              <div className="mk-row" key={r.id}>
                <span className="att-mono">{r.sno}</span>
                <span className="mk-name">{r.full_name}</span>
                {ASSESSMENTS.map((a) => {
                  const v = valOf(r.id, a.k);
                  const over = v !== "" && +v > (subject[a.maxKey] || 0);
                  return (
                    <input key={a.k} className={"mk-in" + (over ? " over" : "")} type="number" inputMode="numeric" min="0" max={subject[a.maxKey]}
                      value={v} onChange={(e) => setCell(r.id, a.k, e.target.value)} />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="att-foot">
            <div className="att-bar-spacer" />
            <button className="prof-btn primary" onClick={save} disabled={busy || !roster.length}>{busy ? "Saving…" : "Save marks"}</button>
          </div>
        </>
      ) : (
        <MarksAnalytics subject={subject} analytics={analytics} perStudent={perStudent} />
      )}
    </div>
  );
}

/* ── subject management ── */
function ManageSubjects({ subjects, onChanged, onSelect }) {
  const [name, setName] = useState("");
  const [maxes, setMaxes] = useState({ cat1_max: 50, cat2_max: 50, model_max: 100, end_sem_max: 100 });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function add(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true); setMsg("");
    try { const s = await createSubject({ name, ...maxes }); setName(""); onChanged?.(); onSelect?.(s.id); setMsg(`Added ${s.name}.`); }
    catch (e2) { setMsg(e2?.message || "Could not add subject."); }
    finally { setBusy(false); }
  }
  async function saveMax(s, key, v) { try { await updateSubject(s.id, { [key]: v }); onChanged?.(); } catch (e) { setMsg(e?.message || "Update failed."); } }
  async function remove(s) { if (!confirm(`Delete subject “${s.name}” and its marks?`)) return; try { await deleteSubject(s.id); onChanged?.(); } catch (e) { setMsg(e?.message || "Delete failed."); } }

  return (
    <div className="mk-manage">
      <form className="mk-newsub" onSubmit={add}>
        <input className="att-in" placeholder="New subject (e.g. NDT)" value={name} onChange={(e) => setName(e.target.value)} />
        {ASSESSMENTS.map((a) => (
          <label key={a.k} className="mk-maxf">{a.label}
            <input type="number" min="1" value={maxes[a.maxKey]} onChange={(e) => setMaxes((m) => ({ ...m, [a.maxKey]: +e.target.value || 0 }))} />
          </label>
        ))}
        <button className="prof-btn primary" type="submit" disabled={busy}>Add</button>
      </form>
      {msg && <div className="att-status">{msg}</div>}
      {subjects.length > 0 && (
        <div className="mk-sublist">
          {subjects.map((s) => (
            <div className="mk-subrow" key={s.id}>
              <b>{s.name}</b>
              {ASSESSMENTS.map((a) => (
                <label key={a.k} className="mk-maxf sm">{a.label}
                  <input type="number" min="1" defaultValue={s[a.maxKey]} onBlur={(e) => saveMax(s, a.maxKey, +e.target.value || 0)} />
                </label>
              ))}
              <button className="att-x" onClick={() => remove(s)} title="Delete subject">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── analytics ── */
function MarksAnalytics({ subject, analytics, perStudent }) {
  const withData = perStudent.filter((r) => r.pct != null);
  const classAvg = withData.length ? Math.round(withData.reduce((s, r) => s + r.pct, 0) / withData.length) : 0;
  const ranked = [...withData].sort((a, b) => b.pct - a.pct);
  return (
    <div>
      <div className="mk-cards">
        {analytics.map((a) => (
          <div className="mk-card" key={a.k}>
            <div className="mk-card-h">{a.label}<em>/{a.max}</em></div>
            <div className="mk-card-avg">{a.avg == null ? "—" : a.avg.toFixed(1)}<small>avg</small></div>
            <div className="mk-card-meta">
              <span className="ok">{a.pass} pass</span>
              <span className="no">{a.fail} fail</span>
              <span>top {a.top ?? "—"}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mk-overall">
        <span><b>{classAvg}%</b> class average</span>
        {ranked[0] && <span>Topper: <b>{ranked[0].full_name}</b> ({ranked[0].pct}%)</span>}
        <span>{withData.length}/{perStudent.length} with marks</span>
      </div>

      <div className="mk-grid an">
        <div className="mk-row an-row head">
          <span>#</span><span className="mk-name">Name</span>
          <span className="mk-cell">Total</span><span className="mk-cell">/Max</span><span className="mk-cell">%</span>
        </div>
        {[...perStudent].sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1)).map((r) => (
          <div className={"mk-row an-row" + (r.pct != null && r.pct < PASS_FRACTION * 100 ? " def" : "")} key={r.id}>
            <span className="att-mono">{r.sno}</span>
            <span className="mk-name">{r.full_name}</span>
            <span className="mk-cell att-mono">{r.total == null ? "—" : r.total}</span>
            <span className="mk-cell att-mono">{r.totalMax}</span>
            <span className="mk-cell mk-pct">{r.pct == null ? "—" : r.pct + "%"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CSS = `
.att-in{font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line);border-radius:8px;padding:9px 11px;flex:1;min-width:120px}
.att-in:focus{border-color:var(--accent);outline:none}
.att-mono{font-family:var(--mono);font-size:11.5px;color:var(--dim)}
.att-subnav{margin-left:auto;display:flex;gap:4px}
.att-subtab{font-family:var(--sans);font-size:12.5px;font-weight:600;color:var(--dim);background:transparent;border:1px solid transparent;border-radius:8px;padding:6px 11px;cursor:pointer}
.att-subtab:hover{color:var(--ink);background:var(--fill-weak)}
.att-subtab.on{color:var(--accent);background:var(--accent-soft);border-color:var(--accent)}
.att-status{margin-top:12px;font-family:var(--mono);font-size:12px;color:var(--dim);background:var(--fill-weak);border-radius:8px;padding:9px 12px}
.att-empty{font-family:var(--mono);font-size:12px;color:var(--faint);padding:18px 2px}
.att-foot{display:flex;align-items:center;gap:10px;margin-top:16px}
.att-bar-spacer{flex:1}
.att-x{flex:none;border:1px solid var(--line);background:transparent;color:var(--faint);border-radius:8px;width:30px;height:30px;cursor:pointer}
.att-x:hover{color:var(--red);border-color:var(--red)}
.mk-setup{font-size:13px;line-height:1.5;color:var(--ink-soft);background:var(--accent-soft);border:1px solid var(--accent);border-radius:10px;padding:12px 14px}
.mk-setup code{font-family:var(--mono);font-size:11.5px;background:var(--fill-weak);padding:1px 5px;border-radius:4px}
.mk-bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px}
.mk-bar .att-in{max-width:280px}
.mk-manage{background:var(--panel-2);border:1px solid var(--line);border-radius:11px;padding:14px;margin-bottom:14px}
.mk-newsub{display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap}
.mk-maxf{display:flex;flex-direction:column;gap:4px;font-family:var(--mono);font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim)}
.mk-maxf input{width:64px;font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--panel);border:1px solid var(--line-2);border-radius:8px;padding:7px 8px}
.mk-maxf.sm input{width:56px}
.mk-sublist{display:flex;flex-direction:column;gap:8px;margin-top:12px}
.mk-subrow{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;padding-top:10px;border-top:1px solid var(--line)}
.mk-subrow b{min-width:90px;font-size:14px}
.mk-grid{display:flex;flex-direction:column;gap:3px;max-height:560px;overflow:auto}
.mk-row{display:grid;grid-template-columns:34px 1fr 76px 76px 76px 76px;gap:8px;align-items:center;padding:5px 8px;border-radius:7px}
.mk-row:nth-child(even){background:var(--fill-weak)}
.mk-row.head{font-family:var(--mono);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);background:transparent}
.mk-row.def{background:rgba(192,70,63,.08)}
.mk-name{font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mk-cell{text-align:center;font-size:12.5px}
.mk-cell em{font-style:normal;color:var(--faint);font-size:9px;margin-left:2px}
.mk-in{width:100%;text-align:center;font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--panel);border:1px solid var(--line);border-radius:7px;padding:6px 4px;outline:none}
.mk-in:focus{border-color:var(--accent)}
.mk-in.over{border-color:var(--red);color:var(--red)}
.mk-row.an-row{grid-template-columns:34px 1fr 90px 90px 70px}
.mk-pct{font-family:var(--mono);font-weight:700}
.mk-row.def .mk-pct{color:var(--red)}
.mk-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}
.mk-card{background:var(--panel-2);border:1px solid var(--line);border-radius:12px;padding:14px}
.mk-card-h{font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
.mk-card-h em{font-style:normal;color:var(--faint)}
.mk-card-avg{font-family:var(--serif);font-size:26px;font-weight:800;margin:6px 0 4px}
.mk-card-avg small{font-family:var(--mono);font-size:10px;font-weight:400;color:var(--dim);margin-left:5px}
.mk-card-meta{display:flex;gap:8px;font-family:var(--mono);font-size:10.5px;color:var(--dim)}
.mk-card-meta .ok{color:var(--green)}.mk-card-meta .no{color:var(--red)}
.mk-overall{display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--ink-soft);background:var(--fill-weak);border-radius:9px;padding:10px 14px;margin-bottom:14px}
@media(max-width:640px){.mk-cards{grid-template-columns:repeat(2,1fr)}.mk-row{grid-template-columns:28px 1fr 54px 54px 54px 54px}.mk-name{font-size:12px}}
`;
