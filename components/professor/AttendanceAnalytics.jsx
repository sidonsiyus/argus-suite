"use client";

/*
 * Attendance analytics (P5c) — per-student attendance % over a date range,
 * defaulter detection, class rollups, and a lightweight distribution chart.
 * No chart library: inline SVG keeps the console bundle small.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { getRangeRecords, isPresentish } from "@/lib/attendance";
import { dayKey, isMissingTable } from "@/lib/professor";

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

      <div className="an-cards">
        <div className="an-card"><div className="an-n">{classAvg}%</div><div className="an-l">Class average</div></div>
        <div className="an-card"><div className="an-n">{daysCovered}</div><div className="an-l">Days marked</div></div>
        <div className="an-card"><div className={"an-n" + (defaulters.length ? " warn" : "")}>{defaulters.length}</div><div className="an-l">Defaulters &lt;{threshold}%</div></div>
        <div className="an-card"><div className="an-n">{withData.length}/{roster.length}</div><div className="an-l">With data</div></div>
      </div>

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

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </div>
  );
}

const CSS = `
.an-bar{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.an-f{display:flex;flex-direction:column;gap:5px;font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
.an-f input,.an-f select{font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line-2);border-radius:8px;padding:7px 9px}
.an-th{width:64px}
.an-bar-spacer{flex:1}
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
