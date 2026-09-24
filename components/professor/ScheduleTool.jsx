"use client";

/*
 * Schedule tool — set the class timetable for a day, by uploading a photo of
 * the timetable (AI OCR) or typing it in. Saved to Supabase; the dashboard
 * greeting reads back today's schedule.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  dayKey, prettyDay, getSchedule, saveSchedule, deleteSchedule,
  emptyRow, fileToScaledDataURL,
} from "@/lib/professor";

export default function ScheduleTool({ onSaved }) {
  const [day, setDay] = useState(() => dayKey());
  const [rows, setRows] = useState([emptyRow()]);
  const [status, setStatus] = useState("");   // idle status line
  const [busy, setBusy] = useState(false);    // saving
  const [ocr, setOcr] = useState(false);      // reading image
  const [loaded, setLoaded] = useState(false);
  const fileRef = useRef(null);

  const load = useCallback(async (d) => {
    setLoaded(false); setStatus("");
    try {
      const rec = await getSchedule(d);
      const entries = rec?.entries?.length ? rec.entries : [emptyRow()];
      setRows(entries.map((e) => ({ ...emptyRow(), ...e })));
      setStatus(rec ? `Loaded ${rec.entries?.length || 0} classes (saved ${new Date(rec.updated_at).toLocaleString()}).` : "No schedule saved for this day yet.");
    } catch (e) {
      setStatus(e?.message || "Could not load — is the schedules table set up?");
      setRows([emptyRow()]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { load(day); }, [day, load]);

  function setCell(i, key, val) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));
  }
  const addRow = () => setRows((r) => [...r, emptyRow()]);
  const delRow = (i) => setRows((r) => (r.length > 1 ? r.filter((_, idx) => idx !== i) : [emptyRow()]));

  async function onImage(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const weekday = (() => { try { return new Date(day + "T00:00:00").toLocaleDateString(undefined, { weekday: "long" }); } catch { return ""; } })();
    setOcr(true); setStatus(`Reading timetable for ${weekday || "the day"}…`);
    try {
      const dataUrl = await fileToScaledDataURL(file, 1900, 0.85); // higher res for dense grids
      const r = await fetch("/api/professor/schedule-ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Department monitoring grid → pull only Siddharth's own periods.
        body: JSON.stringify({ image: dataUrl, weekday, instructor: "Siddharth", subjects: ["NDT", "GTEM", "Mentoring Hour"] }),
      });
      const d = await r.json();
      if (d?.error === "ocr_unconfigured") { setStatus("AI OCR isn't configured (OPENROUTER_API_KEY missing) — type the schedule instead."); return; }
      const entries = d?.entries || [];
      if (!entries.length) {
        if (d?.error) setStatus(`OCR error (${d.error}${d.detail ? ": " + d.detail : ""}). Try again, or type it in.`);
        else if (d?.raw) setStatus(`Couldn't read ${weekday}'s classes. The model said: "${d.raw}". Try a clearer/cropped photo, or type it in.`);
        else setStatus(`No classes found for ${weekday}. If it's a weekly grid, make sure ${weekday} is clearly visible — or type it in.`);
        return;
      }
      // merge into any non-empty rows the user already had
      const existing = rows.filter((x) => x.subject || x.time);
      setRows([...existing, ...entries.map((x) => ({ ...emptyRow(), ...x }))].slice(0, 24));
      setStatus(`Read ${entries.length} classes for ${weekday} — review and edit below, then Save.`);
    } catch (err) {
      setStatus(err?.message || "Image read failed.");
    } finally {
      setOcr(false);
    }
  }

  async function save() {
    setBusy(true); setStatus("Saving…");
    try {
      const saved = await saveSchedule(day, rows, "manual");
      setStatus(`Saved ${saved.length} classes for ${prettyDay(day)}.`);
      if (day === dayKey()) onSaved?.();
    } catch (e) {
      setStatus(e?.message || "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function clearDay() {
    if (!confirm("Clear the saved schedule for this day?")) return;
    setBusy(true);
    try {
      await deleteSchedule(day);
      setRows([emptyRow()]);
      setStatus("Cleared.");
      if (day === dayKey()) onSaved?.();
    } catch (e) { setStatus(e?.message || "Clear failed."); }
    finally { setBusy(false); }
  }

  return (
    <div className="prof-panel sched">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="prof-panel-h">
        <h2>Class Schedule</h2>
        <span className="prof-chip">Live</span>
      </div>

      <div className="sched-bar">
        <label className="sched-day">Day
          <input type="date" value={day} onChange={(e) => setDay(e.target.value || dayKey())} />
        </label>
        <div className="sched-bar-actions">
          <button className="prof-btn ghost" onClick={() => fileRef.current?.click()} disabled={ocr}>
            {ocr ? "Reading…" : "📷 Upload timetable image"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onImage} />
          <button className="prof-btn ghost" onClick={() => setDay(dayKey())}>Today</button>
        </div>
      </div>

      <p className="sched-hint">{prettyDay(day)} — upload a photo of your timetable to auto-fill, or type each class below.</p>

      <div className="sched-grid" role="table">
        <div className="sched-row sched-head" role="row">
          <span>Time</span><span>Subject</span><span>Room</span><span>Class / group</span><span />
        </div>
        {rows.map((row, i) => (
          <div className="sched-row" role="row" key={i}>
            <input placeholder="09:00–09:50" value={row.time} onChange={(e) => setCell(i, "time", e.target.value)} />
            <input placeholder="Gas Turbine Engine Module" value={row.subject} onChange={(e) => setCell(i, "subject", e.target.value)} />
            <input placeholder="Lab 2" value={row.room} onChange={(e) => setCell(i, "room", e.target.value)} />
            <input placeholder="Aero IIA" value={row.group} onChange={(e) => setCell(i, "group", e.target.value)} />
            <button className="sched-del" title="Remove" onClick={() => delRow(i)}>✕</button>
          </div>
        ))}
      </div>

      <div className="sched-foot">
        <button className="prof-btn ghost" onClick={addRow}>+ Add class</button>
        <div className="sched-foot-spacer" />
        <button className="prof-btn ghost" onClick={clearDay} disabled={busy || !loaded}>Clear day</button>
        <button className="prof-btn primary" onClick={save} disabled={busy || !loaded}>{busy ? "Saving…" : "Save schedule"}</button>
      </div>

      {status && <div className="sched-status">{status}</div>}
    </div>
  );
}

const CSS = `
.sched-bar{display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px;margin-bottom:6px}
.sched-day{display:flex;flex-direction:column;gap:6px;font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim)}
.sched-day input{font-family:var(--sans);font-size:14px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line-2);border-radius:9px;padding:8px 10px}
.sched-bar-actions{display:flex;gap:8px;margin-left:auto;flex-wrap:wrap}
.sched-hint{font-size:13px;color:var(--dim);margin:2px 0 14px}
.sched-grid{display:flex;flex-direction:column;gap:8px}
.sched-row{display:grid;grid-template-columns:130px 1fr 110px 130px 32px;gap:8px;align-items:center}
.sched-head{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}
.sched-head span{padding-left:2px}
.sched-row input{font-family:var(--sans);font-size:13.5px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line);border-radius:8px;padding:9px 10px;outline:none;width:100%}
.sched-row input:focus{border-color:var(--accent)}
.sched-del{border:1px solid var(--line);background:transparent;color:var(--faint);border-radius:8px;height:34px;cursor:pointer;font-size:12px}
.sched-del:hover{color:var(--red);border-color:var(--red)}
.sched-foot{display:flex;align-items:center;gap:10px;margin-top:16px}
.sched-foot-spacer{flex:1}
.sched-status{margin-top:14px;font-family:var(--mono);font-size:12px;color:var(--dim);background:var(--fill-weak);border-radius:8px;padding:9px 12px}
@media(max-width:640px){.sched-row{grid-template-columns:1fr 1fr;grid-auto-rows:auto}.sched-head{display:none}.sched-del{grid-column:2;justify-self:end}}
`;
