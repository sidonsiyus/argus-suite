"use client";

/*
 * Attendance — native rebuild on Supabase. P5a/P5b: daily marking (with day
 * lock) and roster management. Analytics / exports / integrations arrive in
 * later sub-phases and mount as extra sub-tabs here.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getRoster, addStudent, getDayMeta, setDayLocked, getDayRecords, saveDay, clearDay,
  CATEGORIES, CAT_BY_KEY, REASONS, coarseStatus, catNeedsReason, catNeedsParent,
  dayKey, matchToken, importEmails,
} from "@/lib/attendance";
import { prettyDay, isMissingTable, fileToScaledDataURL } from "@/lib/professor";
import { pushToSheet, getWriter, setWriter } from "@/lib/attendance-sheets";
import { computeDayStats, attendanceMessage, mhCockpitDocx, getMhForm, setMhForm, MH_DEFAULTS } from "@/lib/attendance-report";
import { planImport } from "@/lib/attendance-import";
import { sendBulkEmails } from "@/lib/coordinator-mail";
import AttendanceAnalytics from "@/components/professor/AttendanceAnalytics";

export default function AttendanceTool({ nav } = {}) {
  const [view, setView] = useState("mark");
  // deep-link: jump to a sub-view when navigated here from the checklist
  useEffect(() => { if (nav?.view) setView(nav.view); }, [nav?.token]); // eslint-disable-line
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

  // Stable so children's effects don't re-run (and refetch, wiping entries) on
  // every parent render.
  const flagSetup = useCallback(() => setNeedsSetup(true), []);

  return (
    <div className="prof-panel att">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="prof-panel-h">
        <h2>Attendance</h2>
        <span className="prof-chip">Live</span>
        <div className="att-subnav">
          {[["mark", "Mark day"], ["roster", "Roster"], ["report", "Report"], ["analytics", "Analytics"]].map(([id, label]) => (
            <button key={id} className={"att-subtab" + (view === id ? " on" : "")} onClick={() => setView(id)}>{label}</button>
          ))}
        </div>
      </div>

      {needsSetup && (
        <div className="att-setup">
          <b>⚠ One-time setup needed.</b> The attendance tables aren't fully set up yet.
          Run <code>20260924_attendance.sql</code> and <code>20260924_attendance_detail.sql</code> in your sid-lms project, then reload.
        </div>
      )}
      {rosterErr && !needsSetup && <div className="att-err">{rosterErr}</div>}

      {view === "mark" && <MarkDay roster={roster} onNeedsSetup={flagSetup} />}
      {view === "roster" && <Roster roster={roster} loaded={loaded} onChanged={loadRoster} onNeedsSetup={flagSetup} />}
      {view === "report" && <ReportTab roster={roster} onNeedsSetup={flagSetup} />}
      {view === "analytics" && <AttendanceAnalytics roster={roster} />}
    </div>
  );
}

/* ── daily report: copyable message + MH COCKPIT document ── */
function ReportTab({ roster, onNeedsSetup }) {
  const [day, setDay] = useState(() => dayKey());
  const [recs, setRecs] = useState({});
  const [form, setForm] = useState(MH_DEFAULTS);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => { setForm(getMhForm()); }, []);
  useEffect(() => {
    (async () => {
      try { setRecs(await getDayRecords(day)); }
      catch (e) { if (isMissingTable(e)) onNeedsSetup?.(); }
    })();
  }, [day, onNeedsSetup]);

  const statusMap = useMemo(() => {
    const m = {}; roster.forEach((r) => (m[r.id] = recs[r.id] || "present")); return m;
  }, [roster, recs]);
  const stats = useMemo(() => computeDayStats(roster, statusMap), [roster, statusMap]);
  const message = useMemo(() => attendanceMessage(day, stats, { programme: form.programme }), [day, stats, form.programme]);

  function saveForm(patch) { const next = { ...form, ...patch }; setForm(next); setMhForm(next); }
  function copy() { navigator.clipboard?.writeText(message).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }
  function share() { window.open("https://wa.me/?text=" + encodeURIComponent(message), "_blank"); }
  async function downloadMh() {
    setMsg("Building MH COCKPIT document…");
    try { await mhCockpitDocx(day, roster, statusMap, form); setMsg("MH COCKPIT .docx downloaded."); }
    catch (e) { setMsg(e?.message || "Could not build document."); }
  }

  return (
    <div>
      <div className="att-bar">
        <label className="att-day">Day<input type="date" value={day} onChange={(e) => setDay(e.target.value || dayKey())} /></label>
        <button className="prof-btn ghost" onClick={() => setDay(dayKey())}>Today</button>
      </div>

      <div className="rep-grid">
        <section className="rep-msg">
          <div className="rep-h">Attendance message</div>
          <textarea className="rep-text" readOnly value={message} rows={7} />
          <div className="rep-actions">
            <button className="prof-btn primary" onClick={copy}>{copied ? "Copied ✓" : "Copy message"}</button>
            <button className="prof-btn ghost" onClick={share}>WhatsApp</button>
          </div>
        </section>

        <section className="rep-mh">
          <div className="rep-h">MH COCKPIT — daily submission</div>
          <div className="rep-form">
            {[["institution", "Institution / College"], ["programme", "Programme"], ["batch", "Year & Batch"], ["incharge", "Class In Charge"], ["coordinator", "Coordinator (sign-off)"], ["submissionTime", "Submission Time"]].map(([k, label]) => (
              <label key={k} className="rep-f">{label}
                <input value={form[k] || ""} onChange={(e) => saveForm({ [k]: e.target.value })} />
              </label>
            ))}
          </div>
          <div className="rep-summary">
            <span>Strength {stats.strength}</span><span className="p">Present {stats.present}</span>
            <span className="o">OD {stats.od}</span><span className="a">Absent {stats.absent}</span>
          </div>
          <button className="prof-btn primary" onClick={downloadMh}>⭳ Download MH COCKPIT .docx</button>
        </section>
      </div>

      <AbsenteeMailer day={day} roster={roster} recs={recs} form={form} />

      {msg && <div className="att-status">{msg}</div>}
    </div>
  );
}

/* ── email today's absentees (auth / unauth / etc.) via the mailbox ── */
const AB_CATS = [
  { k: "auth", label: "Authorized" },
  { k: "unauth", label: "Unauthorized" },
  { k: "groom", label: "Grooming" },
  { k: "susp", label: "Suspended" },
];
const AB_STATUS_WORD = { auth: "Authorized (informed)", unauth: "Unauthorized", groom: "Grooming", susp: "Suspended" };
const AB_DEFAULT_SUBJECT = "Attendance Notice — {date}";
const AB_DEFAULT_BODY = `Dear {name},

Our records show that you were marked absent ({status}) on {date}{reasonClause}.

If you believe this is an error, please contact your class in-charge at the earliest. Kindly ensure your attendance is regularised.

Regards,
{incharge}
{institution}`;

function AbsenteeMailer({ day, roster, recs, form }) {
  const [cats, setCats] = useState({ auth: true, unauth: true, groom: false, susp: false });
  const [subject, setSubject] = useState(AB_DEFAULT_SUBJECT);
  const [bodyTpl, setBodyTpl] = useState(AB_DEFAULT_BODY);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [err, setErr] = useState("");

  const dateLabel = prettyDay(day);
  const recipients = useMemo(() => {
    const out = [];
    roster.forEach((r) => {
      const cat = recs[r.id]?.cat;
      if (!cat || !cats[cat]) return;
      out.push({ id: r.id, name: r.full_name, email: (r.email || "").trim(), status: AB_STATUS_WORD[cat] || "Absent", reason: recs[r.id]?.reason || "" });
    });
    return out;
  }, [roster, recs, cats]);
  const withEmail = recipients.filter((r) => r.email);
  const missing = recipients.filter((r) => !r.email);

  function build(r) {
    const ctx = {
      name: r.name, status: r.status, date: dateLabel,
      reason: r.reason || "",
      reasonClause: r.reason ? ` for the reason: ${r.reason}` : "",
      incharge: form?.incharge || "Class In-charge",
      institution: form?.institution || "",
    };
    const fill = (t) => String(t).replace(/\{(\w+)\}/g, (_, k) => (k in ctx ? ctx[k] : `{${k}}`));
    return { to: r.email, subject: fill(subject).trim() || "Attendance Notice", text: fill(bodyTpl) };
  }

  async function doSend() {
    setConfirming(false); setBusy(true); setErr(""); setResult(null);
    setProgress({ done: 0, total: withEmail.length });
    try {
      const res = await sendBulkEmails(withEmail.map(build), (done, total) => setProgress({ done, total }));
      setResult(res);
    } catch (e) { setErr(e?.message || "Could not send."); }
    finally { setBusy(false); }
  }

  const preview = withEmail[0] ? build(withEmail[0]) : null;

  return (
    <section className="ab-mail">
      <style dangerouslySetInnerHTML={{ __html: AB_CSS }} />
      <div className="rep-h">Email absentees</div>
      <p className="ab-lead">Emails today's absentees from your mailbox ({prettyDay(day)}). Pick which categories to include.</p>

      <div className="ab-cats">
        {AB_CATS.map((c) => {
          const n = roster.filter((r) => recs[r.id]?.cat === c.k).length;
          return (
            <label key={c.k} className={"ab-cat" + (cats[c.k] ? " on" : "") + (n ? "" : " empty")}>
              <input type="checkbox" checked={!!cats[c.k]} disabled={!n} onChange={(e) => setCats((s) => ({ ...s, [c.k]: e.target.checked }))} />
              {c.label} <span className="ab-n">{n}</span>
            </label>
          );
        })}
      </div>

      <div className="ab-fields">
        <label className="ab-f">Subject
          <input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label className="ab-f">Message <span className="ab-hint">placeholders: {"{name} {status} {date} {reason} {incharge} {institution}"}</span>
          <textarea value={bodyTpl} onChange={(e) => setBodyTpl(e.target.value)} rows={8} />
        </label>
      </div>

      <div className="ab-count">
        <b>{withEmail.length}</b> will be emailed
        {missing.length > 0 && <span className="ab-missing"> · {missing.length} skipped (no email on file): {missing.slice(0, 6).map((m) => m.name).join(", ")}{missing.length > 6 ? "…" : ""}</span>}
      </div>
      {preview && (
        <details className="ab-preview"><summary>Preview first email ({preview.to})</summary>
          <div className="ab-prev-subj">{preview.subject}</div>
          <pre className="ab-prev-body">{preview.text}</pre>
        </details>
      )}

      {err && <div className="att-err">{err}</div>}
      {progress && busy && <div className="att-status">Sending… {progress.done}/{progress.total}</div>}
      {result && <div className="att-status">Sent {result.sent}/{result.total}.{result.failed?.length ? ` ${result.failed.length} failed.` : " ✓"}</div>}

      {!confirming ? (
        <button className="prof-btn primary" disabled={busy || !withEmail.length} onClick={() => { setResult(null); setConfirming(true); }}>
          ✉ Email {withEmail.length} absentee{withEmail.length === 1 ? "" : "s"}
        </button>
      ) : (
        <div className="ab-confirm">
          <span>Send this email to <b>{withEmail.length}</b> student{withEmail.length === 1 ? "" : "s"}? This can't be unsent.</span>
          <div className="ab-confirm-btns">
            <button className="prof-btn ghost" onClick={() => setConfirming(false)}>Cancel</button>
            <button className="prof-btn primary" onClick={doSend}>Yes, send</button>
          </div>
        </div>
      )}
    </section>
  );
}

const AB_CSS = `
.ab-mail{margin-top:22px;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px}
.ab-lead{font-size:13px;color:var(--ink-soft);margin:4px 0 14px}
.ab-cats{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.ab-cat{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:var(--ink);background:var(--panel-2);border:1px solid var(--line);border-radius:20px;padding:7px 12px;cursor:pointer}
.ab-cat.on{border-color:var(--accent);color:var(--accent);background:var(--accent-soft)}
.ab-cat.empty{opacity:.45;cursor:default}
.ab-cat input{accent-color:var(--accent)}
.ab-n{font-family:var(--mono);font-size:11px;color:var(--dim);background:var(--panel);border-radius:10px;padding:1px 7px}
.ab-fields{display:flex;flex-direction:column;gap:12px;margin-bottom:12px}
.ab-f{display:flex;flex-direction:column;gap:6px;font-family:var(--mono);font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--dim)}
.ab-hint{text-transform:none;letter-spacing:0;color:var(--faint);font-size:10.5px}
.ab-f input,.ab-f textarea{font-family:var(--sans);font-size:13.5px;text-transform:none;letter-spacing:0;color:var(--ink);background:var(--panel-2);border:1px solid var(--line);border-radius:9px;padding:10px 11px;outline:none;resize:vertical}
.ab-f input:focus,.ab-f textarea:focus{border-color:var(--accent)}
.ab-count{font-size:13px;color:var(--ink-soft);margin-bottom:10px}
.ab-missing{color:var(--gold)}
.ab-preview{margin-bottom:12px;font-size:12.5px}
.ab-preview summary{cursor:pointer;color:var(--accent);font-weight:600}
.ab-prev-subj{font-weight:700;margin:8px 0 4px;font-size:13px}
.ab-prev-body{white-space:pre-wrap;font-family:var(--sans);font-size:13px;color:var(--ink-soft);background:var(--panel-2);border:1px solid var(--line);border-radius:9px;padding:10px;margin:0}
.ab-confirm{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;background:var(--accent-soft);border:1px solid var(--accent);border-radius:10px;padding:12px 14px;font-size:13.5px}
.ab-confirm-btns{display:flex;gap:8px}
`;

/* ── daily marking: everyone present by default; you add absentees ── */
function MarkDay({ roster, onNeedsSetup }) {
  const [day, setDay] = useState(() => dayKey());
  const [abs, setAbs] = useState({});   // { student_id: { cat, reason, parent } } — absentees only
  const [locked, setLocked] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pushing, setPushing] = useState(false);
  const [showCfg, setShowCfg] = useState(false);
  const [wUrl, setWUrl] = useState("");
  const [wSec, setWSec] = useState("");
  const [scanning, setScanning] = useState(false);
  const scanRef = useRef(null);
  const filterRef = useRef(null);
  // add-absentee picker
  const [filter, setFilter] = useState("");
  const [pickId, setPickId] = useState("");
  const [pickCat, setPickCat] = useState("unauth");
  const [pickReason, setPickReason] = useState("");
  const [pickParent, setPickParent] = useState(false);
  const loadSeq = useRef(0);
  useEffect(() => { const w = getWriter(); setWUrl(w.url); setWSec(w.secret); }, []);

  const load = useCallback(async (d) => {
    const seq = ++loadSeq.current;   // only the newest load may apply its result
    setLoading(true); setMsg("");
    try {
      const [meta, recs] = await Promise.all([getDayMeta(d), getDayRecords(d)]);
      if (seq !== loadSeq.current) return;   // a newer load started — ignore stale data
      setLocked(!!meta?.locked);
      const a = {}; Object.entries(recs).forEach(([id, e]) => { if (e.cat && e.cat !== "present") a[id] = e; });
      setAbs(a);
    } catch (e) {
      if (seq !== loadSeq.current) return;
      if (isMissingTable(e)) onNeedsSetup?.();
      else setMsg(e?.message || "Could not load the day.");
    } finally { if (seq === loadSeq.current) setLoading(false); }
  }, [onNeedsSetup]);
  useEffect(() => { load(day); }, [day, load]);

  const available = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return roster.filter((r) => !abs[r.id] && (!q || r.full_name.toLowerCase().includes(q) || String(r.sno).includes(q) || String(r.reg_no).toLowerCase().includes(q)));
  }, [roster, abs, filter]);
  const absList = useMemo(() => roster.filter((r) => abs[r.id]).map((r) => ({ ...r, ...abs[r.id] })), [roster, abs]);

  const odCount = absList.filter((e) => e.cat === "od").length;
  const absentCount = absList.filter((e) => coarseStatus(e.cat) === "absent").length;
  const presentCount = roster.length - odCount - absentCount;

  // Who "+ Add" will add: an explicit dropdown pick, else the top typed match.
  const candidate = pickId || (filter.trim() && available.length ? available[0].id : "");
  const candidateName = candidate ? (roster.find((r) => r.id === candidate)?.full_name || "") : "";

  function addAbsentee(idArg) {
    const id = idArg || candidate;
    if (locked || !id || abs[id]) return;
    setAbs((s) => ({ ...s, [id]: { cat: pickCat, reason: catNeedsReason(pickCat) ? pickReason : "", parent: catNeedsParent(pickCat) ? pickParent : false } }));
    setPickId(""); setPickReason(""); setPickParent(false); setFilter(""); // keep pickCat for fast repeat entry
    setTimeout(() => filterRef.current?.focus(), 0); // keep the keyboard flow going
  }
  function onFilterKey(e) {
    if (e.key === "Escape") { setFilter(""); setPickId(""); return; }
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (candidate) addAbsentee(candidate);
  }
  // focus the find box when the mark view opens
  useEffect(() => { if (!loading && roster.length) filterRef.current?.focus(); }, [loading, roster.length]);
  // ⌘/Ctrl+S saves; always calls the latest save via a ref
  const saveRef = useRef(null);
  async function save() {
    if (locked || busy || !roster.length) return;
    setBusy(true); setMsg("");
    try { const n = await saveDay(day, fullEntries()); setMsg(`Saved ${n} students for ${prettyDay(day)} — ${presentCount} present, ${absentCount} absent, ${odCount} OD.`); }
    catch (e) { setMsg(e?.message || "Save failed."); }
    finally { setBusy(false); }
  }
  saveRef.current = save;
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); saveRef.current?.(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  function updateAbs(id, patch) {
    if (locked) return;
    setAbs((s) => {
      const next = { ...s[id], ...patch };
      if (patch.cat) { if (!catNeedsReason(patch.cat)) next.reason = ""; if (!catNeedsParent(patch.cat)) next.parent = false; }
      return { ...s, [id]: next };
    });
  }
  function removeAbs(id) { if (!locked) setAbs((s) => { const n = { ...s }; delete n[id]; return n; }); }
  function clearAll() { if (!locked) setAbs({}); }

  function fullEntries() { const full = {}; roster.forEach((r) => (full[r.id] = abs[r.id] || { cat: "present", reason: "", parent: false })); return full; }
  const coarseMap = () => { const m = {}; roster.forEach((r) => (m[r.id] = coarseStatus(abs[r.id]?.cat || "present"))); return m; };

  async function toggleLock() {
    setBusy(true);
    try { await setDayLocked(day, !locked); setLocked(!locked); setMsg(!locked ? "Day locked." : "Day unlocked."); }
    catch (e) { setMsg(e?.message || "Lock failed."); }
    finally { setBusy(false); }
  }
  async function wipe() {
    if (!confirm(`Clear all attendance for ${prettyDay(day)}?`)) return;
    setBusy(true);
    try { await clearDay(day); setAbs({}); setMsg("Day cleared."); }
    catch (e) { setMsg(e?.message || "Clear failed."); }
    finally { setBusy(false); }
  }
  async function push(dryRun) {
    setPushing(true); setMsg(dryRun ? "Checking the sheet…" : "Writing to Google Sheet…");
    try {
      const res = await pushToSheet(day, roster, coarseMap(), { dryRun });
      setMsg(`${dryRun ? "Dry run OK — " : "Pushed ✓ "}${res.sheetName}: ${res.present}P · ${res.absent}A · ${res.od}OD (${res.count} students)`);
    } catch (e) { setMsg(e?.message || "Sheet push failed."); }
    finally { setPushing(false); }
  }
  function saveWriter() { setWriter(wUrl, wSec); setShowCfg(false); setMsg("Google Sheet writer saved."); }
  async function onScan(e) {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file || locked) return;
    setScanning(true); setMsg("Reading the list…");
    try {
      const dataUrl = await fileToScaledDataURL(file);
      const r = await fetch("/api/professor/attendance-ocr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: dataUrl }) });
      const d = await r.json();
      if (d?.error === "ocr_unconfigured") { setMsg("OCR isn't configured (OPENROUTER_API_KEY missing)."); return; }
      const tokens = d?.tokens || [];
      if (!tokens.length) { setMsg("Couldn't read any names/numbers — try a clearer photo, or add manually."); return; }
      const next = { ...abs }; let matched = 0; const unmatched = [];
      tokens.forEach((tok) => { const s = matchToken(tok, roster); if (s) { if (!next[s.id]) next[s.id] = { cat: "unauth", reason: "", parent: false }; matched++; } else unmatched.push(tok); });
      setAbs(next);
      setMsg(`Scan: added ${matched} absentees from ${tokens.length} entries.` + (unmatched.length ? ` Unmatched: ${unmatched.slice(0, 6).join(", ")}${unmatched.length > 6 ? "…" : ""}. Set categories & Save.` : " Set categories, then Save."));
    } catch (err) { setMsg(err?.message || "Scan failed."); }
    finally { setScanning(false); }
  }

  const ABSENT_CATS = CATEGORIES.filter((c) => c.k !== "present");

  return (
    <div>
      <div className="att-bar">
        <label className="att-day">Day
          <input type="date" value={day} onChange={(e) => setDay(e.target.value || dayKey())} />
        </label>
        <button className="prof-btn ghost" onClick={() => setDay(dayKey())}>Today</button>
        <div className="att-bar-spacer" />
        <input ref={scanRef} type="file" accept="image/*" hidden onChange={onScan} />
        <button className="prof-btn ghost" onClick={() => scanRef.current?.click()} disabled={locked || scanning || !roster.length}>{scanning ? "Scanning…" : "📷 Scan list"}</button>
        <button className="prof-btn ghost" onClick={clearAll} disabled={locked || !absList.length}>All present</button>
        <button className={"prof-btn ghost" + (locked ? " att-locked" : "")} onClick={toggleLock} disabled={busy}>{locked ? "🔒 Locked" : "Lock day"}</button>
      </div>

      <div className="att-kbd">⌨ Type a name → <kbd>Enter</kbd> adds · <kbd>Esc</kbd> clears · <kbd>⌘</kbd><kbd>S</kbd> saves</div>
      <div className="att-tally">
        <span className="att-pill p">{presentCount} present</span>
        <span className="att-pill a">{absentCount} absent</span>
        {odCount > 0 && <span className="att-pill o">{odCount} OD</span>}
        <span className="att-pct">{roster.length ? Math.round(((presentCount + odCount) / roster.length) * 100) : 0}% present · {roster.length} on roll</span>
      </div>

      {loading ? (
        <div className="att-empty">Loading…</div>
      ) : roster.length === 0 ? (
        <div className="att-empty">No students in the roster yet — add them in the Roster tab.</div>
      ) : (
        <>
          {/* add-absentee bar */}
          {!locked && (
            <div className="att-add">
              <input ref={filterRef} className="att-in" placeholder="Find student…  (Enter to add · Esc to clear)" value={filter} onChange={(e) => setFilter(e.target.value)} onKeyDown={onFilterKey} />
              <select className="att-in" value={pickId} onChange={(e) => setPickId(e.target.value)}>
                <option value="">{available.length ? "— select student —" : "all marked"}</option>
                {available.map((r) => <option key={r.id} value={r.id}>{r.sno}. {r.full_name}</option>)}
              </select>
              <select className="att-cat" value={pickCat} onChange={(e) => setPickCat(e.target.value)}>
                {ABSENT_CATS.map((c) => <option key={c.k} value={c.k}>{c.short}</option>)}
              </select>
              {catNeedsReason(pickCat) && (
                <select className="att-reason" value={pickReason} onChange={(e) => setPickReason(e.target.value)}>
                  <option value="">— reason —</option>
                  {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              )}
              {catNeedsParent(pickCat) && (
                <select className="att-parent" value={pickParent ? "Y" : "N"} onChange={(e) => setPickParent(e.target.value === "Y")}>
                  <option value="N">Parent: N</option><option value="Y">Parent: Y</option>
                </select>
              )}
              <button className="prof-btn primary" onClick={() => addAbsentee()} disabled={!candidate}>
                {candidateName ? `+ Add ${candidateName.split(" ")[0]}` : "+ Add"}
              </button>
            </div>
          )}

          {/* absentees list */}
          {absList.length === 0 ? (
            <div className="att-empty">Everyone present. Add absentees above, or 📷 scan the list.</div>
          ) : (
            <div className="att-roll">
              <div className="att-roll-h">Absentees ({absList.length})</div>
              {absList.map((s) => (
                <div key={s.id} className={"att-row st-" + coarseStatus(s.cat)}>
                  <span className="att-sno">{s.sno}</span>
                  <span className="att-name">{s.full_name}<em>{s.reg_no}</em></span>
                  <select className={"att-cat cat-" + s.cat} value={s.cat} onChange={(e) => updateAbs(s.id, { cat: e.target.value })} disabled={locked}>
                    {ABSENT_CATS.map((c) => <option key={c.k} value={c.k}>{c.short}</option>)}
                  </select>
                  {catNeedsReason(s.cat) && (
                    <select className="att-reason" value={s.reason || ""} onChange={(e) => updateAbs(s.id, { reason: e.target.value })} disabled={locked}>
                      <option value="">— reason —</option>
                      {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  )}
                  {catNeedsParent(s.cat) && (
                    <select className="att-parent" value={s.parent ? "Y" : "N"} onChange={(e) => updateAbs(s.id, { parent: e.target.value === "Y" })} disabled={locked} title="Parent contacted?">
                      <option value="N">Parent: N</option><option value="Y">Parent: Y</option>
                    </select>
                  )}
                  {!locked && <button className="att-x" onClick={() => removeAbs(s.id)} title="Mark present">✕</button>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="att-foot">
        <button className="prof-btn ghost" onClick={wipe} disabled={busy || locked}>Clear day</button>
        <button className="prof-btn ghost" onClick={() => push(false)} disabled={pushing || !roster.length}>⤴ Push to Sheet</button>
        <button className="prof-btn ghost" onClick={() => push(true)} disabled={pushing || !roster.length}>Dry run</button>
        <button className="prof-btn ghost" onClick={() => setShowCfg((v) => !v)} title="Google Sheet settings">⚙</button>
        <div className="att-bar-spacer" />
        <button className="prof-btn primary" onClick={save} disabled={busy || locked || !roster.length}>{busy ? "Saving…" : "Save attendance"}</button>
      </div>

      {showCfg && (
        <div className="att-cfg">
          <div className="att-cfg-h">Google Sheet writer — pre-filled with your dashboard's endpoint; add the secret if the push asks for it.</div>
          <input className="att-in" placeholder="Writer URL (…/exec)" value={wUrl} onChange={(e) => setWUrl(e.target.value)} />
          <input className="att-in" placeholder="Secret" value={wSec} onChange={(e) => setWSec(e.target.value)} />
          <button className="prof-btn primary" onClick={saveWriter}>Save</button>
        </div>
      )}
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
  const [imp, setImp] = useState({ busy: false, msg: "" });
  const impRef = useRef(null);
  const [emailText, setEmailText] = useState("");
  const [emailImp, setEmailImp] = useState({ busy: false, msg: "" });

  async function onImportEmails() {
    if (!emailText.trim()) return;
    if (!roster.length) { setEmailImp({ busy: false, msg: "Add the roster students first, then import emails." }); return; }
    setEmailImp({ busy: true, msg: "Saving emails…" });
    try {
      const { updated, unmatched, total } = await importEmails(emailText, roster);
      setEmailImp({ busy: false, msg: `Saved ${updated}/${total} emails.` + (unmatched.length ? ` ${unmatched.length} reg no(s) not in the roster: ${unmatched.slice(0, 6).join(", ")}${unmatched.length > 6 ? "…" : ""}.` : "") });
      setEmailText("");
      onChanged?.();
    } catch (e) {
      if (isMissingTable(e)) onNeedsSetup?.();
      else setEmailImp({ busy: false, msg: e?.message || "Could not save emails." });
    }
  }

  async function onImport(e) {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    if (!roster.length) { setImp({ busy: false, msg: "Add the roster students first, then import." }); return; }
    setImp({ busy: true, msg: "Reading backup…" });
    try {
      const data = JSON.parse(await file.text());
      const { days, unmatched } = planImport(data, roster);
      if (!days.length) { setImp({ busy: false, msg: "No days found in that backup file." }); return; }
      let done = 0;
      for (const d of days) { await saveDay(d.day, d.entries); done++; setImp({ busy: true, msg: `Importing ${done}/${days.length} days…` }); }
      setImp({ busy: false, msg: `Imported ${days.length} days (${days[0].day} → ${days[days.length - 1].day}).` + (unmatched.length ? ` ${unmatched.length} name(s) not matched to the roster: ${unmatched.slice(0, 8).join(", ")}${unmatched.length > 8 ? "…" : ""}.` : "") });
      onChanged?.();
    } catch (err) { setImp({ busy: false, msg: err?.message || "Import failed — is it the ARGUS backup JSON?" }); }
  }

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

      <div className="att-import">
        <div>
          <b>Import legacy backup</b>
          <p>Load your old ARGUS dashboard's <code>backup .json</code> — every day (present + absentees, with reasons) is imported into the roster above.</p>
        </div>
        <input ref={impRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
        <button className="prof-btn ghost" onClick={() => impRef.current?.click()} disabled={imp.busy}>{imp.busy ? "Importing…" : "⭳ Import backup"}</button>
      </div>
      {imp.msg && <div className="att-status">{imp.msg}</div>}

      <div className="att-import" style={{ alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b>Import student emails</b>
          <p>Paste your roster export (reg number + email per student). Emails are matched by reg number and saved to the roster — used for the <i>Email absentees</i> action in Report.</p>
          <textarea
            placeholder="Paste roster text here (names, reg numbers, emails)…"
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            rows={4}
            style={{ width: "100%", boxSizing: "border-box", marginTop: 8, fontFamily: "var(--sans)", fontSize: 13, color: "var(--ink)", background: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: 9, padding: "9px 10px", outline: "none", resize: "vertical" }}
          />
        </div>
        <button className="prof-btn ghost" onClick={onImportEmails} disabled={emailImp.busy || !emailText.trim()}>{emailImp.busy ? "Saving…" : "Save emails"}</button>
      </div>
      {emailImp.msg && <div className="att-status">{emailImp.msg}</div>}

      {!loaded ? <div className="att-empty">Loading…</div> : (
        <div className="att-rlist">
          <div className="att-rrow head"><span>#</span><span>Name</span><span>Reg</span><span>Phone</span></div>
          {roster.map((s) => (
            <div className="att-rrow" key={s.id}>
              <span>{s.sno}</span>
              <span className="att-rname">{s.full_name}
                {s.email && <em style={{ display: "block", fontStyle: "normal", fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)" }}>{s.email}</em>}
              </span>
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
.att-kbd{font-family:var(--mono);font-size:10.5px;color:var(--faint);margin-bottom:10px}
.att-kbd kbd{font-family:var(--mono);font-size:10px;background:var(--fill-weak);border:1px solid var(--line);border-radius:4px;padding:1px 5px;margin:0 1px}
.att-tally{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.att-pill{font-family:var(--mono);font-size:11px;border-radius:20px;padding:4px 11px;border:1px solid var(--line)}
.att-pill.p{color:var(--green);border-color:rgba(31,143,86,.4)}
.att-pill.a{color:var(--red);border-color:rgba(192,70,63,.4)}
.att-pill.l{color:var(--gold);border-color:rgba(185,121,26,.4)}
.att-pill.o{color:var(--accent);border-color:var(--accent)}
.att-pct{margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--dim)}
.att-roll{display:flex;flex-direction:column;gap:6px;max-height:520px;overflow:auto;padding-right:4px}
.att-roll-h{font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);margin:2px 0 2px 2px}
.att-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:var(--panel-2);border:1px solid var(--line);border-radius:10px;padding:8px 12px}
.att-row.st-absent{border-color:rgba(192,70,63,.35)}
.att-row.st-od{border-color:rgba(14,143,128,.35)}
.att-sno{font-family:var(--mono);font-size:11px;color:var(--faint);width:26px;text-align:right;flex:none}
.att-name{flex:1;min-width:150px;font-size:14px;font-weight:600;display:flex;flex-direction:column;line-height:1.25}
.att-name em{font-style:normal;font-family:var(--mono);font-size:10.5px;color:var(--dim);font-weight:400}
.att-cat,.att-reason,.att-parent{font-family:var(--sans);font-size:12.5px;color:var(--ink);background:var(--panel);border:1px solid var(--line-2);border-radius:8px;padding:7px 9px;cursor:pointer}
.att-cat{flex:none;width:96px;font-weight:700;font-family:var(--mono);font-size:11.5px}
.att-cat.cat-present{color:var(--green)}
.att-cat.cat-unauth,.att-cat.cat-groom,.att-cat.cat-susp{color:var(--red)}
.att-cat.cat-auth{color:var(--gold)}
.att-cat.cat-od{color:var(--accent)}
.att-reason{flex:1;min-width:180px}
.att-parent{flex:none;width:104px;font-family:var(--mono);font-size:11px}
.att-cat:disabled,.att-reason:disabled,.att-parent:disabled{opacity:.7;cursor:default}
.att-add{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px;padding:12px;background:var(--panel-2);border:1px solid var(--line);border-radius:11px}
.att-add .att-in{flex:1;min-width:150px}
.att-add .att-cat{width:110px}
.att-x{flex:none;border:1px solid var(--line);background:transparent;color:var(--faint);border-radius:8px;width:30px;height:30px;cursor:pointer}
.att-x:hover{color:var(--green);border-color:var(--green)}
.att-foot{display:flex;align-items:center;gap:10px;margin-top:16px}
.att-status{margin-top:12px;font-family:var(--mono);font-size:12px;color:var(--dim);background:var(--fill-weak);border-radius:8px;padding:9px 12px}
.att-cfg{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:12px;padding:12px;background:var(--panel-2);border:1px solid var(--line);border-radius:10px}
.att-cfg-h{flex-basis:100%;font-size:12px;color:var(--dim);margin-bottom:2px}
.att-subtab.lock{color:var(--gold)}
.att-lockwrap{text-align:center;padding:40px 20px}
.att-lock-ic{font-size:34px;margin-bottom:6px}
.att-lockwrap h2{font-family:var(--serif);font-size:22px;font-weight:800;margin:0 0 4px}
.att-lockwrap p{font-size:14px;color:var(--dim);margin:0 0 18px}
.att-lock-form{display:inline-flex;gap:8px}
.att-lock-form input{font-family:var(--mono);font-size:20px;letter-spacing:.3em;text-align:center;width:130px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line-2);border-radius:10px;padding:10px}
.att-lock-form input:focus{border-color:var(--accent);outline:none}
.rep-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.rep-h{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-bottom:8px}
.rep-text{width:100%;font-family:var(--mono);font-size:13px;line-height:1.6;color:var(--ink);background:var(--panel-2);border:1px solid var(--line);border-radius:10px;padding:12px;resize:vertical}
.rep-actions{display:flex;gap:8px;margin-top:10px}
.rep-form{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
.rep-f{display:flex;flex-direction:column;gap:4px;font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim)}
.rep-f input{font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line);border-radius:8px;padding:8px 10px}
.rep-f input:focus{border-color:var(--accent);outline:none}
.rep-summary{display:flex;gap:10px;flex-wrap:wrap;font-family:var(--mono);font-size:12px;color:var(--dim);margin-bottom:12px}
.rep-summary .p{color:var(--green)}.rep-summary .a{color:var(--red)}.rep-summary .o{color:var(--accent)}
@media(max-width:720px){.rep-grid{grid-template-columns:1fr}}
.att-empty{font-family:var(--mono);font-size:12px;color:var(--faint);padding:18px 2px}
.att-import{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin:14px 0;padding:12px 14px;background:var(--panel-2);border:1px dashed var(--line-2);border-radius:11px}
.att-import b{font-size:13.5px}
.att-import p{font-size:12px;color:var(--dim);margin:3px 0 0;max-width:52ch;line-height:1.5}
.att-import code{font-family:var(--mono);font-size:11px}
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
