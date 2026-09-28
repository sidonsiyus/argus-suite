"use client";

/*
 * Attendance analytics (P5c) — per-student attendance % over a date range,
 * defaulter detection, class rollups, and a lightweight distribution chart.
 * No chart library: inline SVG keeps the console bundle small.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { getRangeRecords, isPresentish } from "@/lib/attendance";
import { dayKey, isMissingTable } from "@/lib/professor";
import { registerCSV, registerDocx, defaulterLettersDocx, printRegister, distributionPng } from "@/lib/attendance-export";
import { whatsappLink, fetchLiveAll, fetchLiveMonth } from "@/lib/attendance-sheets";
import { sendBulkEmails } from "@/lib/coordinator-mail";

function monthStart() {
  const d = new Date(); return dayKey(new Date(d.getFullYear(), d.getMonth(), 1));
}

export default function AttendanceAnalytics({ roster }) {
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(() => dayKey());
  const [threshold, setThreshold] = useState(75);
  const [records, setRecords] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState("pct"); // pct | sno | name
  const [source, setSource] = useState("console"); // console | sheet

  const load = useCallback(async () => {
    setLoading(true); setMsg("");
    try { setRecords(await getRangeRecords(from, to)); }
    catch (e) { if (isMissingTable(e)) setMsg("Run the attendance migration first."); else setMsg(e?.message || "Could not load."); }
    finally { setLoading(false); }
  }, [from, to]);
  useEffect(() => { load(); }, [load]);

  // per-student rollup
  const rows = useMemo(() => {
    const byStu = {};
    records.forEach((r) => {
      const s = (byStu[r.student_id] ||= { marked: 0, present: 0 });
      s.marked++; if (isPresentish(r.status)) s.present++;
    });
    const list = roster.map((s) => {
      const agg = byStu[s.id] || { marked: 0, present: 0 };
      const pct = agg.marked ? Math.round((agg.present / agg.marked) * 100) : null;
      return { ...s, marked: agg.marked, present: agg.present, absent: agg.marked - agg.present, pct };
    });
    const cmp = { pct: (a, b) => (a.pct ?? 999) - (b.pct ?? 999), sno: (a, b) => a.sno - b.sno, name: (a, b) => a.full_name.localeCompare(b.full_name) };
    return list.sort(cmp[sortKey]);
  }, [records, roster, sortKey]);

  const daysCovered = useMemo(() => new Set(records.map((r) => r.day)).size, [records]);
  const withData = rows.filter((r) => r.pct != null);
  const classAvg = withData.length ? Math.round(withData.reduce((s, r) => s + r.pct, 0) / withData.length) : 0;
  const defaulters = withData.filter((r) => r.pct < threshold);

  // distribution buckets for the chart
  const buckets = useMemo(() => {
    const edges = [0, 50, 60, 70, 75, 85, 100];
    const labels = ["<50", "50–59", "60–69", "70–74", "75–84", "85–100"];
    const counts = new Array(labels.length).fill(0);
    withData.forEach((r) => {
      for (let i = labels.length - 1; i >= 0; i--) { if (r.pct >= edges[i]) { counts[i]++; break; } }
    });
    return labels.map((l, i) => ({ l, n: counts[i] }));
  }, [withData]);
  const maxBucket = Math.max(1, ...buckets.map((b) => b.n));

  return (
    <div>
      <div className="an-src-toggle">
        <button className={"an-src" + (source === "console" ? " on" : "")} onClick={() => setSource("console")}>Console data</button>
        <button className={"an-src" + (source === "sheet" ? " on" : "")} onClick={() => setSource("sheet")}>Department sheet · from day 1</button>
      </div>

      {source === "sheet" ? <LiveSheet threshold={threshold} roster={roster} /> : (
      <>
      <div className="an-bar">
        <label className="an-f">From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="an-f">To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        <label className="an-f">Min %<input type="number" min={0} max={100} value={threshold} onChange={(e) => setThreshold(+e.target.value || 0)} className="an-th" /></label>
        <div className="an-bar-spacer" />
        <label className="an-f">Sort
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
            <option value="pct">Lowest %</option><option value="sno">S.No</option><option value="name">Name</option>
          </select>
        </label>
      </div>

      {msg && <div className="att-status">{msg}</div>}

      <div className="an-exports">
        <span className="an-exp-label">Export</span>
        <button className="prof-btn ghost" onClick={() => registerCSV(roster, records, { from, to })} disabled={!records.length}>CSV</button>
        <button className="prof-btn ghost" onClick={() => registerDocx(roster, records, { from, to })} disabled={!records.length}>DOCX register</button>
        <button className="prof-btn ghost" onClick={() => defaulterLettersDocx(defaulters, { threshold, from, to })} disabled={!defaulters.length}>Defaulter letters ({defaulters.length})</button>
        <button className="prof-btn ghost" onClick={() => printRegister(roster, records, { from, to })} disabled={!records.length}>Print / PDF</button>
        <button className="prof-btn ghost" onClick={() => distributionPng(buckets, { from, to })} disabled={!withData.length}>PNG chart</button>
      </div>

      <div className="an-cards">
        <div className="an-card"><div className="an-n">{classAvg}%</div><div className="an-l">Class average</div></div>
        <div className="an-card"><div className="an-n">{daysCovered}</div><div className="an-l">Days marked</div></div>
        <div className="an-card"><div className={"an-n" + (defaulters.length ? " warn" : "")}>{defaulters.length}</div><div className="an-l">Defaulters &lt;{threshold}%</div></div>
        <div className="an-card"><div className="an-n">{withData.length}/{roster.length}</div><div className="an-l">With data</div></div>
      </div>

      {defaulters.length > 0 && (
        <div className="an-notify">
          <span className="an-exp-label">Notify defaulters</span>
          {defaulters.map((d) => (
            <a key={d.id} className="an-wa" href={whatsappLink(d, { threshold, from, to })} target="_blank" rel="noopener noreferrer" title={`WhatsApp ${d.full_name}`}>
              {d.full_name.split(" ")[0]} · {d.pct}% ↗
            </a>
          ))}
        </div>
      )}

      {/* distribution chart */}
      <div className="an-chart">
        {buckets.map((b) => (
          <div className="an-col" key={b.l}>
            <div className="an-bar-wrap"><div className="an-bar-fill" style={{ height: `${(b.n / maxBucket) * 100}%` }}>{b.n > 0 && <span>{b.n}</span>}</div></div>
            <div className="an-col-l">{b.l}</div>
          </div>
        ))}
      </div>

      {loading ? <div className="att-empty">Loading…</div> : (
        <div className="an-table">
          <div className="an-row head"><span>#</span><span>Name</span><span>Present</span><span>Marked</span><span>%</span></div>
          {rows.map((r) => (
            <div className={"an-row" + (r.pct != null && r.pct < threshold ? " def" : "")} key={r.id}>
              <span className="att-mono">{r.sno}</span>
              <span className="an-name">{r.full_name}</span>
              <span className="att-mono">{r.present}</span>
              <span className="att-mono">{r.marked}</span>
              <span className="an-pct">{r.pct == null ? "—" : r.pct + "%"}</span>
            </div>
          ))}
        </div>
      )}
      </>
      )}

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </div>
  );
}

/* ── live, read-only attendance from the department Google Sheet (day 1 → now) ── */
function LiveSheet({ threshold = 75, roster = [] }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);        // all-time { students, months, sheets, lastDate, updated }
  const [months, setMonths] = useState([]);       // available month tabs
  const [view, setView] = useState("all");        // "all" | a sheet name
  const [monthData, setMonthData] = useState(null);
  const [sortKey, setSortKey] = useState("pct");  // pct | sno | name
  const [thr, setThr] = useState(threshold);      // below-% cutoff for defaulters

  const loadAll = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const d = await fetchLiveAll();
      setData(d);
      setMonths(d.sheets || []);
    } catch (e) { setErr(e?.message || "Could not reach the attendance sheet."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  const loadMonth = useCallback(async (sheet) => {
    setView(sheet); setMonthData(null);
    if (sheet === "all") return;
    setLoading(true); setErr("");
    try { setMonthData(await fetchLiveMonth(sheet)); }
    catch (e) { setErr(e?.message || "Could not load that month."); }
    finally { setLoading(false); }
  }, []);

  const active = view === "all" ? data : monthData;
  const students = active?.students || [];

  const rows = useMemo(() => {
    const list = students.slice();
    const cmp = {
      pct: (a, b) => a.pct - b.pct,
      sno: (a, b) => (+a.sno || 0) - (+b.sno || 0),
      name: (a, b) => String(a.name).localeCompare(String(b.name)),
    };
    return list.sort(cmp[sortKey]);
  }, [students, sortKey]);

  const totHeld = students.reduce((s, a) => s + (a.held || 0), 0);
  const totAtt = students.reduce((s, a) => s + (a.total || 0), 0);
  const overall = totHeld ? Math.round((totAtt / totHeld) * 1000) / 10 : 0;
  const defaulters = useMemo(() => students.filter((a) => a.pct < thr).sort((a, b) => a.pct - b.pct), [students, thr]);
  const below = defaulters.length;
  const periodLabel = view === "all" ? "since 1 July 2026" : view.replace(/daily attendance for /i, "").trim();

  return (
    <div>
      <div className="an-bar">
        <label className="an-f">Period
          <select value={view} onChange={(e) => loadMonth(e.target.value)}>
            <option value="all">All months · from day 1</option>
            {months.map((m) => <option key={m} value={m}>{m.replace(/daily attendance for /i, "").trim()}</option>)}
          </select>
        </label>
        <label className="an-f">Sort
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
            <option value="pct">Lowest %</option><option value="sno">S.No</option><option value="name">Name</option>
          </select>
        </label>
        <label className="an-f">Below %<input type="number" min={0} max={100} value={thr} onChange={(e) => setThr(+e.target.value || 0)} className="an-th" /></label>
        <div className="an-bar-spacer" />
        <button className="prof-btn ghost" onClick={loadAll} disabled={loading}>{loading ? "Loading…" : "↻ Refresh"}</button>
      </div>

      {err && <div className="att-err">{err}</div>}

      <div className="an-cards">
        <div className="an-card"><div className="an-n">{overall}%</div><div className="an-l">Overall · since day 1</div></div>
        <div className="an-card"><div className="an-n">{students.length}</div><div className="an-l">Students</div></div>
        <div className="an-card"><div className={"an-n" + (below ? " warn" : "")}>{below}</div><div className="an-l">Below {thr}%</div></div>
        <div className="an-card"><div className="an-n">{view === "all" ? (data?.months || 0) : 1}</div><div className="an-l">{view === "all" ? "Months summed" : "Month"}</div></div>
      </div>

      {defaulters.length > 0 && <DefaulterMailer defaulters={defaulters} roster={roster} threshold={thr} period={periodLabel} />}

      {loading && !students.length ? <div className="att-empty">Reading the department sheet…</div> : (
        <div className="an-table">
          <div className="an-row sheet head"><span>#</span><span>Name</span><span>Reg</span><span>Attended</span><span>%</span></div>
          {rows.map((r, i) => (
            <div className={"an-row sheet" + (r.pct < threshold ? " def" : "")} key={(r.reg || r.sno || i) + ""}>
              <span className="att-mono">{r.sno ?? ""}</span>
              <span className="an-name">{r.name}</span>
              <span className="att-mono">{r.reg ?? ""}</span>
              <span className="att-mono">{r.total}/{r.held}</span>
              <span className="an-pct">{r.pct}%</span>
            </div>
          ))}
          {!rows.length && !loading && <div className="att-empty">No data returned from the sheet.</div>}
        </div>
      )}

      <div className="an-src-note">
        Read-only, live from the department attendance Google Sheet · OD counts as present · overall % = periods attended ÷ periods held, from day 1 to the last marked date.
        {data?.lastDate ? ` Last marked: ${data.lastDate}.` : ""}{data?.sheets?.length ? ` Sheets: ${data.sheets.join(" · ")}.` : ""}
      </div>
    </div>
  );
}

/* ── email the students below the cutoff (roster emails + signature) ── */
const DM_DEFAULT_SUBJECT = "Attendance Shortage Notice — Action Required";
const DM_DEFAULT_BODY = `Dear {name},

Your attendance is {pct}%, which is below the required 75%.

If it is not improved, you will not be permitted to write any examination. If your attendance is lower still, you will also be required to pay a condonation fee.

Please improve your attendance immediately and meet the faculty.`;

function DefaulterMailer({ defaulters, roster, threshold, period }) {
  const [subject, setSubject] = useState(DM_DEFAULT_SUBJECT);
  const [bodyTpl, setBodyTpl] = useState(DM_DEFAULT_BODY);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [err, setErr] = useState("");

  const byReg = useMemo(() => {
    const m = {}; (roster || []).forEach((r) => { if (r.reg_no) m[String(r.reg_no).trim()] = r; }); return m;
  }, [roster]);
  const recipients = useMemo(() => defaulters.map((d) => {
    const r = byReg[String(d.reg).trim()] || {};
    return { name: d.name, reg: d.reg, pct: d.pct, attended: d.total, held: d.held, email: (r.email || "").trim() };
  }), [defaulters, byReg]);
  const withEmail = recipients.filter((r) => r.email);
  const missing = recipients.filter((r) => !r.email);

  function build(r) {
    const ctx = { name: r.name, pct: r.pct, attended: r.attended, held: r.held, threshold, period };
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
    <section className="dm">
      <div className="dm-h">Email students below {threshold}% <span className="dm-period">· {period}</span></div>
      <div className="dm-fields">
        <label className="an-f wide">Subject<input value={subject} onChange={(e) => setSubject(e.target.value)} /></label>
        <label className="an-f wide">Message <span className="dm-hint">placeholders: {"{name} {pct} {attended} {held} {threshold} {period}"}</span>
          <textarea value={bodyTpl} onChange={(e) => setBodyTpl(e.target.value)} rows={7} />
        </label>
      </div>
      <div className="dm-signote">✎ Your MH Cockpit signature is added automatically.</div>
      <div className="dm-count">
        <b>{withEmail.length}</b> will be emailed
        {missing.length > 0 && <span className="dm-missing"> · {missing.length} skipped (no email on file): {missing.slice(0, 6).map((m) => m.name).join(", ")}{missing.length > 6 ? "…" : ""}</span>}
      </div>
      {preview && (
        <details className="dm-preview"><summary>Preview first email ({preview.to})</summary>
          <div className="dm-prev-subj">{preview.subject}</div>
          <pre className="dm-prev-body">{preview.text}</pre>
        </details>
      )}
      {err && <div className="att-err">{err}</div>}
      {progress && busy && <div className="att-status">Sending… {progress.done}/{progress.total}</div>}
      {result && <div className="att-status">Sent {result.sent}/{result.total}.{result.failed?.length ? ` ${result.failed.length} failed.` : " ✓"}</div>}
      {!confirming ? (
        <button className="prof-btn primary" disabled={busy || !withEmail.length} onClick={() => { setResult(null); setConfirming(true); }}>
          ✉ Email {withEmail.length} student{withEmail.length === 1 ? "" : "s"}
        </button>
      ) : (
        <div className="dm-confirm">
          <span>Send this notice to <b>{withEmail.length}</b> student{withEmail.length === 1 ? "" : "s"}? This can't be unsent.</span>
          <div className="dm-confirm-btns">
            <button className="prof-btn ghost" onClick={() => setConfirming(false)}>Cancel</button>
            <button className="prof-btn primary" onClick={doSend}>Yes, send</button>
          </div>
        </div>
      )}
    </section>
  );
}

const CSS = `
.dm{margin-top:18px;background:var(--panel-2);border:1px solid var(--line);border-radius:14px;padding:16px}
.dm-h{font-family:var(--serif);font-size:16px;font-weight:800;margin-bottom:12px}
.dm-period{font-family:var(--mono);font-size:11px;font-weight:500;color:var(--dim)}
.dm-fields{display:flex;flex-direction:column;gap:12px;margin-bottom:10px}
.an-f.wide{width:100%}
.an-f.wide input,.dm-fields textarea{width:100%;box-sizing:border-box;font-family:var(--sans);font-size:13.5px;text-transform:none;letter-spacing:0;color:var(--ink);background:var(--panel);border:1px solid var(--line);border-radius:9px;padding:10px 11px;outline:none;resize:vertical}
.an-f.wide input:focus,.dm-fields textarea:focus{border-color:var(--accent)}
.dm-hint{text-transform:none;letter-spacing:0;color:var(--faint);font-size:10.5px}
.dm-signote{font-size:12px;color:var(--dim);background:var(--panel);border:1px dashed var(--line-2);border-radius:9px;padding:8px 11px;margin-bottom:10px}
.dm-count{font-size:13px;color:var(--ink-soft);margin-bottom:10px}
.dm-missing{color:var(--gold)}
.dm-preview{margin-bottom:12px;font-size:12.5px}
.dm-preview summary{cursor:pointer;color:var(--accent);font-weight:600}
.dm-prev-subj{font-weight:700;margin:8px 0 4px;font-size:13px}
.dm-prev-body{white-space:pre-wrap;font-family:var(--sans);font-size:13px;color:var(--ink-soft);background:var(--panel);border:1px solid var(--line);border-radius:9px;padding:10px;margin:0}
.dm-confirm{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;background:var(--accent-soft);border:1px solid var(--accent);border-radius:10px;padding:12px 14px;font-size:13.5px}
.dm-confirm-btns{display:flex;gap:8px}
.an-src-toggle{display:inline-flex;gap:2px;background:var(--panel-2);border:1px solid var(--line);border-radius:11px;padding:3px;margin-bottom:16px}
.an-src{font-family:var(--sans);font-size:12.5px;font-weight:600;color:var(--dim);background:transparent;border:none;border-radius:8px;padding:8px 14px;cursor:pointer;transition:.15s}
.an-src:hover{color:var(--ink)}
.an-src.on{color:#fff;background:var(--accent)}
.an-src-note{font-family:var(--mono);font-size:10.5px;line-height:1.6;color:var(--faint);margin-top:14px;padding-top:12px;border-top:1px solid var(--line)}
.an-row.sheet{grid-template-columns:34px 1fr 92px 84px 60px}
@media(max-width:640px){.an-row.sheet{grid-template-columns:28px 1fr 60px}.an-row.sheet span:nth-child(3),.an-row.sheet span:nth-child(4){display:none}}
.an-bar{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.an-f{display:flex;flex-direction:column;gap:5px;font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
.an-f input,.an-f select{font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line-2);border-radius:8px;padding:7px 9px}
.an-th{width:64px}
.an-bar-spacer{flex:1}
.an-exports{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--line)}
.an-exp-label{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}
.an-notify{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:16px}
.an-wa{font-family:var(--sans);font-size:12px;font-weight:600;color:#1f8f56;text-decoration:none;border:1px solid rgba(31,143,86,.4);border-radius:20px;padding:4px 11px}
.an-wa:hover{background:rgba(31,143,86,.1)}
.an-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
.an-card{background:var(--panel-2);border:1px solid var(--line);border-radius:12px;padding:14px}
.an-n{font-family:var(--serif);font-size:26px;font-weight:800;line-height:1}
.an-n.warn{color:var(--red)}
.an-l{font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);margin-top:6px}
.an-chart{display:flex;align-items:flex-end;gap:10px;height:130px;padding:10px 4px 0;margin-bottom:18px;border-bottom:1px solid var(--line)}
.an-col{flex:1;display:flex;flex-direction:column;align-items:center;height:100%}
.an-bar-wrap{flex:1;width:100%;display:flex;align-items:flex-end;justify-content:center}
.an-bar-fill{width:70%;background:var(--accent);border-radius:6px 6px 0 0;min-height:2px;position:relative;display:flex;align-items:flex-start;justify-content:center;transition:height .3s ease}
.an-bar-fill span{position:absolute;top:-16px;font-family:var(--mono);font-size:10px;color:var(--dim)}
.an-col-l{font-family:var(--mono);font-size:9.5px;color:var(--faint);margin-top:6px}
.an-table{display:flex;flex-direction:column;gap:1px;max-height:460px;overflow:auto}
.an-row{display:grid;grid-template-columns:34px 1fr 74px 74px 60px;gap:8px;align-items:center;padding:8px 10px;border-radius:7px}
.an-row:nth-child(even){background:var(--fill-weak)}
.an-row.head{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);background:transparent}
.an-row.def{background:rgba(192,70,63,.08)}
.an-name{font-size:13.5px;font-weight:600}
.an-pct{font-family:var(--mono);font-weight:700}
.an-row.def .an-pct{color:var(--red)}
@media(max-width:640px){.an-cards{grid-template-columns:repeat(2,1fr)}.an-row{grid-template-columns:28px 1fr 50px}.an-row span:nth-child(3),.an-row span:nth-child(4){display:none}}
`;
