"use client";

/*
 * Daily checklist rail — the four fixed daily deliverables (with smart
 * deadlines) plus manual tasks, persisted per day. Sits beside the console.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { dayKey, prettyDay, isMissingTable } from "@/lib/professor";
import { fixedTasks, getTasks, setFixedDone, addManual, setDone, deleteTask } from "@/lib/tasks";

export default function ChecklistRail({ schedule, onGoto }) {
  const day = dayKey();
  const [rows, setRows] = useState([]);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDue, setNewDue] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try { setRows(await getTasks(day)); setNeedsSetup(false); setErr(""); }
    catch (e) { if (isMissingTable(e)) setNeedsSetup(true); else setErr(e?.message || "Could not load tasks."); }
  }, [day]);
  useEffect(() => { load(); }, [load]);

  const defs = useMemo(() => fixedTasks(schedule), [schedule]);
  const byKey = useMemo(() => Object.fromEntries(rows.filter((r) => r.fixed_key).map((r) => [r.fixed_key, r])), [rows]);
  const manual = rows.filter((r) => r.kind === "manual");

  const doneCount = defs.filter((d) => byKey[d.fixed_key]?.done).length + manual.filter((m) => m.done).length;
  const total = defs.length + manual.length;

  async function toggleFixed(def) {
    if (needsSetup) return;
    const cur = byKey[def.fixed_key]?.done || false;
    setBusy(true);
    try { await setFixedDone(day, def, !cur); await load(); }
    catch (e) { setErr(e?.message || "Update failed."); }
    finally { setBusy(false); }
  }
  async function toggleManual(m) {
    try { await setDone(m.id, !m.done); await load(); } catch (e) { setErr(e?.message || "Update failed."); }
  }
  async function add(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setBusy(true);
    try { await addManual(day, { title: newTitle, deadline: newDue }); setNewTitle(""); setNewDue(""); await load(); }
    catch (e2) { setErr(e2?.message || "Could not add task."); }
    finally { setBusy(false); }
  }
  async function remove(m) { try { await deleteTask(m.id); await load(); } catch (e) { setErr(e?.message || "Delete failed."); } }

  return (
    <aside className="prof-rail">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="cl-head">
        <div>
          <div className="cl-title">Today's checklist</div>
          <div className="cl-sub">{prettyDay(day)}</div>
        </div>
        <div className="cl-count">{doneCount}<span>/{total}</span></div>
      </div>

      {needsSetup && (
        <div className="cl-setup">Run <code>20260925_tasks.sql</code> in Supabase to enable the checklist.</div>
      )}
      {err && !needsSetup && <div className="cl-err">{err}</div>}

      <div className="cl-list">
        {defs.map((d) => {
          const row = byKey[d.fixed_key];
          const done = !!row?.done;
          return (
            <div key={d.fixed_key} className={"cl-item" + (done ? " done" : "")}>
              <button className="cl-check" onClick={() => toggleFixed(d)} disabled={busy} aria-pressed={done}>{done ? "✓" : ""}</button>
              <div className="cl-body">
                <div className="cl-t">{d.title}</div>
                <div className="cl-meta">
                  {d.deadline && <span className="cl-due">⏱ {d.deadline}</span>}
                  {d.link && <a className="cl-link" href={d.link} target="_blank" rel="noopener noreferrer">open ↗</a>}
                  {d.goto && <button className="cl-link btn" onClick={() => onGoto?.(d.goto)}>go →</button>}
                </div>
              </div>
            </div>
          );
        })}

        {manual.map((m) => (
          <div key={m.id} className={"cl-item" + (m.done ? " done" : "")}>
            <button className="cl-check" onClick={() => toggleManual(m)} aria-pressed={m.done}>{m.done ? "✓" : ""}</button>
            <div className="cl-body">
              <div className="cl-t">{m.title}</div>
              {m.deadline && <div className="cl-meta"><span className="cl-due">⏱ {m.deadline}</span></div>}
            </div>
            <button className="cl-x" onClick={() => remove(m)} title="Delete">✕</button>
          </div>
        ))}
      </div>

      <form className="cl-add" onSubmit={add}>
        <input placeholder="Add a task…" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        <input className="cl-due-in" placeholder="Due (opt.)" value={newDue} onChange={(e) => setNewDue(e.target.value)} />
        <button className="cl-addbtn" type="submit" disabled={busy || !newTitle.trim()}>+</button>
      </form>
    </aside>
  );
}

const CSS = `
.prof-rail{width:300px;flex:none;align-self:flex-start;position:sticky;top:16px;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:16px;box-shadow:var(--shadow-sm)}
.cl-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px}
.cl-title{font-family:var(--serif);font-size:16px;font-weight:800}
.cl-sub{font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;color:var(--dim);margin-top:2px}
.cl-count{font-family:var(--serif);font-size:22px;font-weight:800;color:var(--accent);line-height:1}
.cl-count span{font-size:13px;color:var(--faint)}
.cl-setup{font-size:12px;color:var(--ink-soft);background:var(--accent-soft);border:1px solid var(--accent);border-radius:9px;padding:9px 10px;margin-bottom:10px}
.cl-setup code{font-family:var(--mono);font-size:11px}
.cl-err{font-family:var(--mono);font-size:11px;color:var(--red);margin-bottom:8px}
.cl-list{display:flex;flex-direction:column;gap:8px}
.cl-item{display:flex;gap:10px;align-items:flex-start;padding:9px 10px;background:var(--panel-2);border:1px solid var(--line);border-radius:11px}
.cl-item.done{opacity:.6}
.cl-item.done .cl-t{text-decoration:line-through;color:var(--dim)}
.cl-check{flex:none;width:22px;height:22px;border-radius:7px;border:1.5px solid var(--line-2);background:var(--panel);color:#fff;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s}
.cl-item.done .cl-check{background:var(--green);border-color:var(--green)}
.cl-check:hover{border-color:var(--accent)}
.cl-body{flex:1;min-width:0}
.cl-t{font-size:13px;font-weight:600;line-height:1.3}
.cl-meta{display:flex;align-items:center;gap:10px;margin-top:5px;flex-wrap:wrap}
.cl-due{font-family:var(--mono);font-size:10px;color:var(--gold)}
.cl-link{font-family:var(--sans);font-size:11px;font-weight:600;color:var(--accent);text-decoration:none;background:none;border:none;padding:0;cursor:pointer}
.cl-link:hover{text-decoration:underline}
.cl-x{flex:none;border:none;background:none;color:var(--faint);cursor:pointer;font-size:12px;padding:2px}
.cl-x:hover{color:var(--red)}
.cl-add{display:flex;gap:6px;margin-top:12px}
.cl-add input{flex:1;min-width:0;font-family:var(--sans);font-size:12.5px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line);border-radius:8px;padding:8px 9px;outline:none}
.cl-add input:focus{border-color:var(--accent)}
.cl-due-in{max-width:78px;flex:none}
.cl-addbtn{flex:none;width:34px;border:none;border-radius:8px;background:var(--accent);color:#fff;font-size:18px;font-weight:700;cursor:pointer}
.cl-addbtn:disabled{opacity:.5;cursor:default}
@media(max-width:960px){.prof-rail{width:100%;position:static}}
`;
