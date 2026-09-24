"use client";

/*
 * Attendance — native rebuild on Supabase. P5a/P5b: daily marking (with day
 * lock) and roster management. Analytics / exports / integrations arrive in
 * later sub-phases and mount as extra sub-tabs here.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getRoster, addStudent, getDayMeta, setDayLocked, getDayRecords, saveDay, clearDay,
  STATUSES, STATUS_LABEL, dayKey,
} from "@/lib/attendance";
import { prettyDay, isMissingTable } from "@/lib/professor";
import AttendanceAnalytics from "@/components/professor/AttendanceAnalytics";

const ST_ORDER = ["present", "absent", "late", "od"];

export default function AttendanceTool() {
  const [view, setView] = useState("mark");
  const [roster, setRoster] = useState([]);
  const [rosterErr, setRosterErr] = useState("");
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadRoster = useCallback(async () => {
    try { setRoster(await getRoster()); setRosterErr(""); }
    catch (e) { setRosterErr(e?.message || "Could not load roster."); }
    finally { setLoaded(true); }
  }, []);
  useEffect(() => { loadRoster(); }, [loadRoster]);

  return (
    <div className="prof-panel att">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="prof-panel-h">
        <h2>Attendance</h2>
        <span className="prof-chip">Live</span>
        <div className="att-subnav">
          {[["mark", "Mark day"], ["roster", "Roster"], ["analytics", "Analytics"]].map(([id, label]) => (
            <button key={id} className={"att-subtab" + (view === id ? " on" : "")} onClick={() => setView(id)}>{label}</button>
          ))}
        </div>
      </div>

      {needsSetup && (
        <div className="att-setup">
          <b>⚠ One-time setup needed.</b> The attendance tables aren't in Supabase yet.
          Run <code>supabase/migrations/20260924_attendance.sql</code> in your sid-lms project, then reload.
        </div>
      )}
      {rosterErr && !needsSetup && <div className="att-err">{rosterErr}</div>}

      {view === "mark" && <MarkDay roster={roster} onNeedsSetup={() => setNeedsSetup(true)} />}
      {view === "roster" && <Roster roster={roster} loaded={loaded} onChanged={loadRoster} onNeedsSetup={() => setNeedsSetup(true)} />}
      {view === "analytics" && <AttendanceAnalytics roster={roster} />}
    </div>
  );
}

/* ── daily marking ── */
function MarkDay({ roster, onNeedsSetup }) {
  const [day, setDay] = useState(() => dayKey());
  const [status, setStatus] = useState({});   // { student_id: status }
  const [locked, setLocked] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (d) => {
    setLoading(true); setMsg("");
    try {
      const [meta, recs] = await Promise.all([getDayMeta(d), getDayRecords(d)]);
      setLocked(!!meta?.locked);
      setStatus(recs);
    } catch (e) {
      if (isMissingTable(e)) onNeedsSetup?.();
      else setMsg(e?.message || "Could not load the day.");
    } finally { setLoading(false); }
  }, [onNeedsSetup]);
  useEffect(() => { load(day); }, [day, load]);

  const statusOf = (id) => status[id] || "present"; // unmarked defaults to present
  function setOne(id, st) { if (!locked) setStatus((s) => ({ ...s, [id]: st })); }
  function markAll(st) { if (locked) return; const m = {}; roster.forEach((r) => (m[r.id] = st)); setStatus(m); }

  const counts = useMemo(() => {
    const c = { present: 0, absent: 0, late: 0, od: 0 };
    roster.forEach((r) => { c[statusOf(r.id)]++; });
    return c;
  }, [roster, status]); // eslint-disable-line

  async function save() {
    setBusy(true); setMsg("");
    try {
      const full = {}; roster.forEach((r) => (full[r.id] = statusOf(r.id)));
      const n = await saveDay(day, full);
      setMsg(`Saved ${n} students for ${prettyDay(day)}.`);
    } catch (e) { setMsg(e?.message || "Save failed."); }
    finally { setBusy(false); }
  }
  async function toggleLock() {
    setBusy(true);
    try { await setDayLocked(day, !locked); setLocked(!locked); setMsg(!locked ? "Day locked." : "Day unlocked."); }
    catch (e) { setMsg(e?.message || "Lock failed."); }
    finally { setBusy(false); }
  }
  async function wipe() {
    if (!confirm(`Clear all attendance for ${prettyDay(day)}?`)) return;
    setBusy(true);
    try { await clearDay(day); setStatus({}); setMsg("Day cleared."); }
    catch (e) { setMsg(e?.message || "Clear failed."); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <div className="att-bar">
        <label className="att-day">Day
          <input type="date" value={day} onChange={(e) => setDay(e.target.value || dayKey())} />
        </label>
        <button className="prof-btn ghost" onClick={() => setDay(dayKey())}>Today</button>
        <div className="att-bar-spacer" />
        <button className="prof-btn ghost" onClick={() => markAll("present")} disabled={locked}>All present</button>
        <button className="prof-btn ghost" onClick={() => markAll("absent")} disabled={locked}>All absent</button>
        <button className={"prof-btn ghost" + (locked ? " att-locked" : "")} onClick={toggleLock} disabled={busy}>{locked ? "🔒 Locked" : "Lock day"}</button>
      </div>

      <div className="att-tally">
        <span className="att-pill p">{counts.present} present</span>
        <span className="att-pill a">{counts.absent} absent</span>
        {counts.late > 0 && <span className="att-pill l">{counts.late} late</span>}
        {counts.od > 0 && <span className="att-pill o">{counts.od} OD</span>}
        <span className="att-pct">{roster.length ? Math.round(((counts.present + counts.late + counts.od) / roster.length) * 100) : 0}% present</span>
      </div>

      {loading ? (
        <div className="att-empty">Loading…</div>
      ) : roster.length === 0 ? (
        <div className="att-empty">No students in the roster yet — add them in the Roster tab.</div>
      ) : (
        <div className="att-roll">
          {roster.map((s) => {
            const st = statusOf(s.id);
            return (
              <div key={s.id} className={"att-row st-" + st}>
                <span className="att-sno">{s.sno}</span>
                <span className="att-name">{s.full_name}<em>{s.reg_no}</em></span>
                <div className="att-seg">
                  {ST_ORDER.map((k) => (
                    <button key={k} className={"att-seg-b sb-" + k + (st === k ? " on" : "")} onClick={() => setOne(s.id, k)} disabled={locked} title={STATUS_LABEL[k]}>
                      {k === "present" ? "P" : k === "absent" ? "A" : k === "late" ? "L" : "OD"}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="att-foot">
        <button className="prof-btn ghost" onClick={wipe} disabled={busy || locked}>Clear day</button>
        <div className="att-bar-spacer" />
        <button className="prof-btn primary" onClick={save} disabled={busy || locked || !roster.length}>{busy ? "Saving…" : "Save attendance"}</button>
      </div>
      {msg && <div className="att-status">{msg}</div>}
    </div>
  );
}

/* ── roster management ── */
function Roster({ roster, loaded, onChanged, onNeedsSetup }) {
  const [name, setName] = useState("");
  const [reg, setReg] = useState("");
  const [sno, setSno] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function add(e) {
    e.preventDefault();
    if (!name.trim() || !reg.trim()) { setMsg("Name and reg number are required."); return; }
    setBusy(true); setMsg("");
    try {
      const nextSno = sno || (roster.reduce((m, r) => Math.max(m, r.sno || 0), 0) + 1);
      await addStudent({ full_name: name, reg_no: reg, sno: nextSno, phone });
      setName(""); setReg(""); setSno(""); setPhone("");
      onChanged?.(); setMsg("Student added.");
    } catch (e2) {
      if (isMissingTable(e2)) onNeedsSetup?.();
      else setMsg(e2?.message || "Could not add student.");
    } finally { setBusy(false); }
  }

  return (
    <div>
      <form className="att-newstu" onSubmit={add}>
        <input placeholder="S.No" className="att-in sno" value={sno} onChange={(e) => setSno(e.target.value)} />
        <input placeholder="Full name" className="att-in" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Reg number" className="att-in" value={reg} onChange={(e) => setReg(e.target.value)} />
        <input placeholder="Phone (opt.)" className="att-in" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button className="prof-btn primary" type="submit" disabled={busy}>Add</button>
      </form>
      {msg && <div className="att-status">{msg}</div>}

      {!loaded ? <div className="att-empty">Loading…</div> : (
        <div className="att-rlist">
          <div className="att-rrow head"><span>#</span><span>Name</span><span>Reg</span><span>Phone</span></div>
          {roster.map((s) => (
            <div className="att-rrow" key={s.id}>
              <span>{s.sno}</span>
              <span className="att-rname">{s.full_name}</span>
              <span className="att-mono">{s.reg_no}</span>
              <span className="att-mono">{s.phone || "—"}</span>
            </div>
          ))}
          {roster.length === 0 && <div className="att-empty">No students yet.</div>}
        </div>
      )}
    </div>
  );
}

const CSS = `
.att-subnav{margin-left:auto;display:flex;gap:4px}
.att-subtab{font-family:var(--sans);font-size:12.5px;font-weight:600;color:var(--dim);background:transparent;border:1px solid transparent;border-radius:8px;padding:6px 11px;cursor:pointer}
.att-subtab:hover{color:var(--ink);background:var(--fill-weak)}
.att-subtab.on{color:var(--accent);background:var(--accent-soft);border-color:var(--accent)}
.att-setup{font-size:13px;line-height:1.5;color:var(--ink-soft);background:var(--accent-soft);border:1px solid var(--accent);border-radius:10px;padding:12px 14px;margin-bottom:14px}
.att-setup code{font-family:var(--mono);font-size:11.5px;background:var(--fill-weak);padding:1px 5px;border-radius:4px}
.att-err{font-family:var(--mono);font-size:12px;color:var(--red);margin-bottom:12px}
.att-bar{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.att-day{display:flex;flex-direction:column;gap:5px;font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim)}
.att-day input{font-family:var(--sans);font-size:14px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line-2);border-radius:9px;padding:8px 10px}
.att-bar-spacer{flex:1}
.att-locked{color:var(--gold)!important;border-color:var(--gold)!important}
.att-tally{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.att-pill{font-family:var(--mono);font-size:11px;border-radius:20px;padding:4px 11px;border:1px solid var(--line)}
.att-pill.p{color:var(--green);border-color:rgba(31,143,86,.4)}
.att-pill.a{color:var(--red);border-color:rgba(192,70,63,.4)}
.att-pill.l{color:var(--gold);border-color:rgba(185,121,26,.4)}
.att-pill.o{color:var(--accent);border-color:var(--accent)}
.att-pct{margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--dim)}
.att-roll{display:flex;flex-direction:column;gap:6px;max-height:520px;overflow:auto;padding-right:4px}
.att-row{display:flex;align-items:center;gap:12px;background:var(--panel-2);border:1px solid var(--line);border-radius:10px;padding:8px 12px}
.att-row.st-absent{border-color:rgba(192,70,63,.35)}
.att-sno{font-family:var(--mono);font-size:11px;color:var(--faint);width:26px;text-align:right;flex:none}
.att-name{flex:1;min-width:0;font-size:14px;font-weight:600;display:flex;flex-direction:column;line-height:1.25}
.att-name em{font-style:normal;font-family:var(--mono);font-size:10.5px;color:var(--dim);font-weight:400}
.att-seg{display:flex;gap:3px;flex:none}
.att-seg-b{font-family:var(--mono);font-size:11px;font-weight:700;width:34px;height:30px;border-radius:7px;border:1px solid var(--line);background:var(--panel);color:var(--dim);cursor:pointer;transition:.12s}
.att-seg-b:disabled{cursor:default;opacity:.75}
.att-seg-b.sb-present.on{background:var(--green);border-color:var(--green);color:#fff}
.att-seg-b.sb-absent.on{background:var(--red);border-color:var(--red);color:#fff}
.att-seg-b.sb-late.on{background:var(--gold);border-color:var(--gold);color:#fff}
.att-seg-b.sb-od.on{background:var(--accent);border-color:var(--accent);color:#fff}
.att-foot{display:flex;align-items:center;gap:10px;margin-top:16px}
.att-status{margin-top:12px;font-family:var(--mono);font-size:12px;color:var(--dim);background:var(--fill-weak);border-radius:8px;padding:9px 12px}
.att-empty{font-family:var(--mono);font-size:12px;color:var(--faint);padding:18px 2px}
.att-newstu{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.att-in{font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line);border-radius:8px;padding:9px 11px;flex:1;min-width:120px}
.att-in.sno{max-width:70px;flex:none}
.att-in:focus{border-color:var(--accent);outline:none}
.att-rlist{display:flex;flex-direction:column;gap:2px;max-height:520px;overflow:auto}
.att-rrow{display:grid;grid-template-columns:34px 1fr 160px 130px;gap:10px;align-items:center;padding:8px 10px;border-radius:8px}
.att-rrow:nth-child(odd){background:var(--fill-weak)}
.att-rrow.head{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);background:transparent}
.att-rname{font-size:13.5px;font-weight:600}
.att-mono{font-family:var(--mono);font-size:11.5px;color:var(--dim)}
@media(max-width:640px){.att-rrow{grid-template-columns:28px 1fr 100px}.att-rrow span:nth-child(4){display:none}.att-name em{display:none}}
`;
