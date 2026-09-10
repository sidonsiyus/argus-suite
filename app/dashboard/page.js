"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Link from "next/link";

/* ═══════════════════════ data (from the working dashboard) ═══════════════════════ */
const CODE = "2000";
const KEY = "argus_dash_v1";
const ROSTER = [
  { n: 1, reg: "25153101", name: "ABINAYA S", ph: "8072876279", pa: "8680090096" },
  { n: 2, reg: "25153102", name: "ADHITYA K", ph: "9933265007", pa: "8972266792" },
  { n: 3, reg: "25153103", name: "AKSHAYA G", ph: "7708513049", pa: "9952098145" },
  { n: 4, reg: "25153104", name: "ALBERT JANA J", ph: "6385048665", pa: "9715909230" },
  { n: 5, reg: "25153105", name: "ANJANA M V", ph: "8590581370", pa: "9995301555" },
  { n: 6, reg: "25153107", name: "BHAKTHI G NICHANI", ph: "7498681254", pa: "9884295032" },
  { n: 7, reg: "25153109", name: "DURGA M", ph: "8778483677", pa: "8056553583" },
  { n: 8, reg: "25153110", name: "FAKRUDIN T DHARWAD", ph: "8792664302", pa: "9449964302" },
  { n: 9, reg: "25153111", name: "FASNA .V .SHIHAB", ph: "9778742751", pa: "7736182904" },
  { n: 10, reg: "25153112", name: "GAYATHRI G", ph: "9080700557", pa: "9092235349" },
  { n: 11, reg: "25153113", name: "GOKUL LIWA S", ph: "8903766167", pa: "9444278467" },
  { n: 12, reg: "25153114", name: "GUNGUN TAMBOLI", ph: "7999117247", pa: "9827174212" },
  { n: 13, reg: "25153115", name: "HANA FATHIMA K M", ph: "9037461476", pa: "9847228278" },
  { n: 14, reg: "25153116", name: "JEEVAN NISANTH K", ph: "9790796655", pa: "9952913747" },
  { n: 15, reg: "25153117", name: "JOYEL FELIX H", ph: "9385577978", pa: "8608871978" },
  { n: 16, reg: "25153118", name: "KANISHKA S", ph: "9342796598", pa: "8973454199" },
  { n: 17, reg: "25153119", name: "KEVIN FRANCIS C R", ph: "9500676947", pa: "9962083779" },
  { n: 18, reg: "25153120", name: "MATHUMITHA M", ph: "7200490407", pa: "9840863113" },
  { n: 19, reg: "25153121", name: "MITHUNESH S", ph: "7092670206", pa: "9842133206" },
  { n: 20, reg: "25153122", name: "MOHAMED SAMEE J", ph: "8838407130", pa: "8122855336" },
  { n: 21, reg: "25153123", name: "M ROSHNI", ph: "9025896571", pa: "8903689497" },
  { n: 22, reg: "25153124", name: "MUNAFARSHARIF S", ph: "7358201099", pa: "9487760676" },
  { n: 23, reg: "25153125", name: "NITHIN R", ph: "9342532240", pa: "9750939432" },
  { n: 24, reg: "25153126", name: "NIVIN M", ph: "9344836769", pa: "" },
  { n: 25, reg: "25153127", name: "RAKESH S", ph: "9360065409", pa: "9790093016" },
  { n: 26, reg: "25153128", name: "RAKSHA NIVASINI", ph: "7845789191", pa: "7845779192" },
  { n: 27, reg: "25153129", name: "RINO M REJI", ph: "9846723677", pa: "9495114423" },
  { n: 28, reg: "25153130", name: "ROSHAN JERALD", ph: "9902053328", pa: "9884176971" },
  { n: 29, reg: "25153131", name: "SAISARAN S", ph: "7397305143", pa: "9789763664" },
  { n: 30, reg: "25153132", name: "SAI VISHNU A", ph: "", pa: "" },
  { n: 31, reg: "25153133", name: "S MANASSEH PAUL", ph: "9390586304", pa: "9676904233" },
  { n: 32, reg: "25153134", name: "SRADHA MANOJ", ph: "8304905130", pa: "8848449418" },
  { n: 33, reg: "25153135", name: "SYED AHAMED M N", ph: "7092525845", pa: "7845540490" },
  { n: 34, reg: "25153136", name: "VENKATESAN S", ph: "7200024383", pa: "" },
  { n: 35, reg: "25153137", name: "VIJAY S", ph: "8088622672", pa: "9448009403" },
  { n: 36, reg: "25153138", name: "VUPPU BHAVASRI", ph: "7981936455", pa: "8639544767" },
  { n: 37, reg: "25153139", name: "YESWANTHSIVA R", ph: "8939211275", pa: "9080614843" },
  { n: 38, reg: "25153140", name: "LENA FATAHIMA BASHEER", ph: "7510882066", pa: "8606898494" },
  { n: 39, reg: "25153141", name: "MOHAMMED FAIZUDEEN S", ph: "8838977579", pa: "9940286374" },
  { n: 40, reg: "25153142", name: "NISHAANTH S U", ph: "9345441709", pa: "9841959003" },
  { n: 41, reg: "25153143", name: "SABARINATHAN R", ph: "9025741421", pa: "9445169918" },
  { n: 42, reg: "25153144", name: "DIBYAJYOTHI SUMAN BARMAN", ph: "9832617362", pa: "9832617362" },
  { n: 43, reg: "23153145", name: "MOHANNED", ph: "8589868801", pa: "7356568890" },
];
const REASONS = [
  "Medical Reason (Self)", "Medical Emergency (Family Member)", "Family Function",
  "Bereavement / Death in the Family", "Personal Emergency", "Educational Loan / Bank Visit",
  "Internship / Industrial Training Submission", "Official University / Government Work",
  "Travel Due to Personal Reasons", "Attending Competitive Examination / Interview",
  "Passport / Visa / Document Verification", "Court / Legal Proceedings",
  "Public Transport / Vehicle Breakdown", "Weather / Natural Calamity",
  "Participation in Sports / Cultural / NCC / NSS Event", "Academic Project / Research Work",
  "Placement Drive / Campus Recruitment", "Mental Health / Stress-Related Reason",
  "Religious Observance", "Grooming", "RNR (Ringing No Response)",
];
const OTHER = "Other (Please Specify)";
const STATUS = [
  { v: "informed", label: "AUTH — Authorized (Informed)" },
  { v: "unauthorized", label: "UNAUTH — Unauthorized" },
  { v: "groom", label: "GROOM — Grooming" },
  { v: "od", label: "OD — On Duty" },
  { v: "susp", label: "SUSP — Suspended" },
];
const MH_CODE = { informed: "AUTH", unauthorized: "UNAUTH", groom: "GROOM", od: "OD", susp: "SUSP" };
const DEF_REMARK = (s) => s === "informed" ? "Prior notification given" : s === "od" ? "On official duty (counted present)" : s === "groom" ? "Grooming" : s === "susp" ? "Suspended" : "No prior notification";
const byName = (n) => ROSTER.find((r) => r.name === n) || null;
const today = () => { const n = new Date(); return new Date(n.getTime() - n.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
const DEFAULT_PARAMS = { pClass: "BscAero-IIA", pProg: "Bsc Aero - IIA", pStrength: "43", pLate: "0", pHalf: "0", pBy: "Class Coordinator", pTo: "Chief Executive Officer", pSub: "Prepared for the Office of the Chief Executive Officer" };

/* ═══════════════════════ component ═══════════════════════ */
export default function Dashboard() {
  const [locked, setLocked] = useState(true);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [pinBad, setPinBad] = useState(false);
  const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [dark, setDark] = useState(true);

  const [tab, setTab] = useState("command");     // command | live
  const [sec, setSec] = useState("log");         // log | report | term
  const [toastMsg, setToastMsg] = useState("");
  const toastT = useRef(0);

  // data model (persisted)
  const [absentees, setAbsentees] = useState([]);
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [logDay, setLogDay] = useState(today());
  const [reportDate, setReportDate] = useState(today());
  const [loaded, setLoaded] = useState(false);

  // log form
  const [fFilter, setFFilter] = useState("");
  const [fName, setFName] = useState("");
  const [fStatus, setFStatus] = useState("informed");
  const [fParent, setFParent] = useState("N");
  const [fReasonSel, setFReasonSel] = useState("");
  const [fReason, setFReason] = useState("");
  const parentTouched = useRef(false);

  const [clock, setClock] = useState({ d: "—", t: "—" });

  const toast = useCallback((m) => { setToastMsg(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToastMsg(""), 2400); }, []);

  /* ── load / persist ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const s = JSON.parse(raw); if (s.absentees) setAbsentees(s.absentees); if (s.params) setParams({ ...DEFAULT_PARAMS, ...s.params }); if (s.logDay) setLogDay(s.logDay); if (s.params && s.params.pDate) setReportDate(s.params.pDate); }
    } catch (e) {}
    try { setDark(localStorage.getItem("argus_theme") !== "light"); } catch (e) {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      const prev = JSON.parse(localStorage.getItem(KEY) || "{}");
      const s = { ...prev, absentees, params: { ...params, pDate: reportDate }, logDay, _ts: Date.now() };
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch (e) {}
  }, [absentees, params, logDay, reportDate, loaded]);
  useEffect(() => { try { localStorage.setItem("argus_theme", dark ? "dark" : "light"); } catch (e) {} }, [dark]);

  /* ── clock ── */
  useEffect(() => {
    const upd = () => { const n = new Date(); setClock({ d: n.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" }).toUpperCase(), t: n.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) }); };
    upd(); const id = setInterval(upd, 1000); return () => clearInterval(id);
  }, []);

  /* ── lock: radar canvas ── */
  const scopeRef = useRef(null);
  useEffect(() => {
    if (!locked) return;
    const cv = scopeRef.current; if (!cv) return; const c = cv.getContext("2d");
    const blips = Array.from({ length: 9 }, (_, i) => ({ a: i * 0.698 + 0.4, r: 0.3 + ((i * 41) % 100) / 100 * 0.6, drift: (i % 3 - 1) * 0.00022 }));
    let raf = 0, t0 = performance.now(); const AC = dark ? "55,224,200" : "14,143,128";
    const frame = (now) => {
      const D = Math.min(devicePixelRatio || 1, 2), W = cv.clientWidth, H = cv.clientHeight;
      if (cv.width !== W * D) { cv.width = W * D; cv.height = H * D; }
      c.setTransform(D, 0, 0, D, 0, 0); c.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 4, t = (now - t0) / 1000, sweep = t * 1.15;
      c.strokeStyle = `rgba(${AC},.13)`; c.lineWidth = 1;
      for (let i = 1; i <= 4; i++) { c.beginPath(); c.arc(cx, cy, R * i / 4, 0, 7); c.stroke(); }
      c.strokeStyle = `rgba(${AC},.09)`;
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.beginPath(); c.moveTo(cx + Math.cos(a) * R * .18, cy + Math.sin(a) * R * .18); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke(); }
      c.save(); c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, sweep - 0.62, sweep); c.closePath();
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, `rgba(${AC},.34)`); g.addColorStop(1, `rgba(${AC},0)`); c.fillStyle = g; c.fill(); c.restore();
      c.strokeStyle = `rgba(${AC},.9)`; c.lineWidth = 1.4; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R); c.stroke();
      blips.forEach((b) => { b.a += b.drift; const bx = cx + Math.cos(b.a) * R * b.r, by = cy + Math.sin(b.a) * R * b.r; const d = ((sweep - b.a) % 6.283 + 6.283) % 6.283, f = Math.max(0, 1 - d / 2.4); c.fillStyle = `rgba(${AC},${0.1 + f * 0.9})`; c.beginPath(); c.arc(bx, by, 1.5 + f * 2.2, 0, 7); c.fill(); });
      c.fillStyle = `rgb(${AC})`; c.beginPath(); c.arc(cx, cy, 2.4, 0, 7); c.fill();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame); return () => cancelAnimationFrame(raf);
  }, [locked, dark]);

  useEffect(() => { if (locked) setTimeout(() => pinRefs[0].current && pinRefs[0].current.focus(), 300); }, [locked]);

  const onPin = (i, v) => {
    v = v.replace(/\D/g, "").slice(-1);
    const next = [...pin]; next[i] = v; setPin(next); setPinBad(false);
    if (v && i < 3) pinRefs[i + 1].current && pinRefs[i + 1].current.focus();
    if (next.every((x) => x)) {
      if (next.join("") === CODE) setTimeout(() => setLocked(false), 300);
      else { setPinBad(true); setTimeout(() => { setPin(["", "", "", ""]); setPinBad(false); pinRefs[0].current && pinRefs[0].current.focus(); }, 500); }
    }
  };
  const onPinKey = (i, e) => { if (e.key === "Backspace" && !pin[i] && i > 0) pinRefs[i - 1].current && pinRefs[i - 1].current.focus(); };

  /* ── attendance math ── */
  const stats = useMemo(() => {
    const strength = +params.pStrength || ROSTER.length;
    const absN = absentees.filter((a) => a.status !== "od").length;
    const od = absentees.filter((a) => a.status === "od").length;
    const present = Math.max(0, strength - absN);
    const informed = absentees.filter((a) => a.status === "informed").length;
    const unauth = absentees.filter((a) => a.status === "unauthorized" || a.status === "susp").length;
    const pct = strength ? Math.round((present / strength) * 100) : 0;
    return { strength, present, absent: absN, od, informed, unauth, pct };
  }, [absentees, params.pStrength]);

  /* ── log actions ── */
  const nameOptions = useMemo(() => {
    const q = fFilter.trim().toLowerCase();
    const logged = new Set(absentees.map((a) => a.name.trim().toLowerCase()));
    return ROSTER.filter((r) => !logged.has(r.name.toLowerCase()) && (!q || r.name.toLowerCase().includes(q) || String(r.n).padStart(2, "0").includes(q)));
  }, [fFilter, absentees]);
  const selContact = byName(fName);

  const addAbsentee = () => {
    const name = fName.trim();
    if (!name) { toast("Select a student"); return; }
    if (absentees.some((a) => a.name.trim().toLowerCase() === name.toLowerCase())) { toast(name + " is already in today's log"); return; }
    const r = byName(name);
    const reason = fReasonSel === OTHER ? (fReason.trim() || "") : (fReasonSel || "");
    const parent = fParent || ((fStatus === "unauthorized" || fStatus === "susp") ? "Y" : "N");
    setAbsentees((prev) => [...prev, { name, status: fStatus, reason, parent, remark: DEF_REMARK(fStatus), reg: r ? r.reg : "", ph: r ? r.ph : "", pa: r ? r.pa : "" }]);
    setLogDay((d) => d || today());
    setFName(""); setFFilter(""); setFReasonSel(""); setFReason(""); setFStatus("informed"); setFParent("N"); parentTouched.current = false;
    toast(name + " logged");
  };
  const delAbsentee = (i) => setAbsentees((prev) => prev.filter((_, k) => k !== i));
  const clearDay = () => { if (!absentees.length) return; if (!confirm("Clear today's log? The report parameters stay as they are.")) return; setAbsentees([]); toast("Log cleared"); };
  const onStatus = (v) => { setFStatus(v); if (!parentTouched.current) setFParent(v === "unauthorized" || v === "susp" ? "Y" : "N"); };

  const setParam = (k, v) => setParams((p) => ({ ...p, [k]: v }));

  if (!loaded) return <div className="dash" data-dtheme={dark ? "dark" : "light"}><style>{CSS}</style></div>;

  return (
    <div className={"dash" + (locked ? " locked" : "")} data-dtheme={dark ? "dark" : "light"}>
      <style>{CSS}</style>

      {/* ══ LOCK ══ */}
      {locked && (
        <div className="lock">
          <div className={"lockbox" + (pinBad ? " shake" : "")}>
            <div className="scope"><canvas ref={scopeRef} /></div>
            <div className="lbrand">ARGUS</div>
            <div className="ltag">Dashboard · Attendance Command</div>
            <div className="pinwrap">
              {pin.map((v, i) => (
                <input key={i} ref={pinRefs[i]} className={"pin" + (v ? " filled" : "")} maxLength={1} inputMode="numeric" type="password"
                  value={v} onChange={(e) => onPin(i, e.target.value)} onKeyDown={(e) => onPinKey(i, e)} autoComplete="off" />
              ))}
            </div>
            <div className={"lockmsg" + (pinBad ? " bad" : "")}>{pinBad ? "Access denied" : "Enter access code"}</div>
            <div className="sig">MADE FOR SID, BY SID</div>
          </div>
        </div>
      )}

      {/* ══ APP ══ */}
      {!locked && (
        <div className="app">
          <header className="dhead">
            <Link href="/" className="hlogo" title="Back to ARGUS">
              <svg viewBox="0 0 32 32" width="26" height="26"><circle cx="16" cy="16" r="12.5" fill="none" stroke="currentColor" strokeWidth="1" opacity=".38" /><circle cx="16" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth=".8" opacity=".2" /><path d="M16 3 18.5 13.5 29 16l-10.5 2.5L16 29l-2.5-10.5L3 16l10.5-2.5z" fill="currentColor" /></svg>
            </Link>
            <div className="hbrand"><b>ARGUS</b><span>Attendance Command</span></div>
            <div className="hspacer" />
            <div className="clock"><b>{clock.d}</b><span>{clock.t}</span></div>
            <button className="ghost" onClick={() => setDark((d) => !d)} title="Toggle theme">{dark ? "☾" : "◐"} Theme</button>
            <button className="ghost" onClick={() => setLocked(true)}>Lock</button>
          </header>

          <div className="tabbar">
            <button className={"tabbtn" + (tab === "command" ? " on" : "")} onClick={() => setTab("command")}><span className="tdot" />Command</button>
            <button className={"tabbtn" + (tab === "live" ? " on" : "")} onClick={() => setTab("live")}><span className="tdot" />Live Attendance</button>
          </div>

          {tab === "command" && (
            <div className="view">
              {/* status header */}
              <div className="cmd-status">
                <div className="gauge-wrap">
                  <svg className="gauge" viewBox="0 0 120 120">
                    <circle className="g-track" cx="60" cy="60" r="52" />
                    <circle className="g-arc" cx="60" cy="60" r="52" style={{ strokeDasharray: 2 * Math.PI * 52, strokeDashoffset: 2 * Math.PI * 52 * (1 - stats.pct / 100) }} />
                  </svg>
                  <div className="g-val"><b>{stats.pct}</b><span>% present</span></div>
                </div>
                <div className="g-side">
                  <div className="cmd-tiles">
                    <div className="gtile g"><b>{stats.present}</b><span>Present</span></div>
                    <div className="gtile r"><b>{stats.absent}</b><span>Absent</span></div>
                    <div className="gtile t"><b>{stats.od}</b><span>On Duty</span></div>
                    <div className="gtile"><b>{stats.informed}</b><span>Informed</span></div>
                    <div className="gtile r"><b>{stats.unauth}</b><span>Unauthorized</span></div>
                  </div>
                  <div className="cmd-watch"><span className="wlabel">Class</span><span>{params.pProg} · strength {stats.strength}</span></div>
                </div>
              </div>

              {/* section nav */}
              <div className="cmd-nav">
                <button className={"cmd-navbtn" + (sec === "log" ? " on" : "")} onClick={() => setSec("log")}>Log<span className="nc">{absentees.length}</span></button>
                <button className={"cmd-navbtn" + (sec === "report" ? " on" : "")} onClick={() => setSec("report")}>Report</button>
                <button className={"cmd-navbtn" + (sec === "term" ? " on" : "")} onClick={() => setSec("term")}>Term</button>
              </div>

              {sec === "log" && (
                <div className="cmd-work">
                  <div className="cmd-col">
                    <div className="card2">
                      <div className="c2h"><span className="dot" /><h3>Mark an absentee</h3></div>
                      <div className="row r-name">
                        <div>
                          <label>Student name</label>
                          <div className="namewrap">
                            <input value={fFilter} onChange={(e) => setFFilter(e.target.value)} placeholder="Type to filter the list…" autoComplete="off" spellCheck={false} />
                            <select value={fName} onChange={(e) => setFName(e.target.value)}>
                              <option value="">— Select a student —</option>
                              {nameOptions.map((r) => <option key={r.reg} value={r.name}>{String(r.n).padStart(2, "0")} · {r.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label>Status</label>
                          <select value={fStatus} onChange={(e) => onStatus(e.target.value)}>{STATUS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}</select>
                        </div>
                        <div>
                          <label>Parent contacted?</label>
                          <select value={fParent} onChange={(e) => { parentTouched.current = true; setFParent(e.target.value); }}>
                            <option value="N">N — Not contacted</option><option value="Y">Y — Contacted</option>
                          </select>
                        </div>
                      </div>
                      <div className="row">
                        <div><label>Reason for absence (remarks)</label>
                          <select value={fReasonSel} onChange={(e) => setFReasonSel(e.target.value)}>
                            <option value="">— Select a reason —</option>
                            {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                            <option value={OTHER}>{OTHER}</option>
                          </select>
                        </div>
                      </div>
                      {fReasonSel === OTHER && (
                        <div className="row"><div><label>Specify the reason</label>
                          <textarea value={fReason} onChange={(e) => setFReason(e.target.value)} placeholder="Type the reason in your own words." /></div></div>
                      )}
                      {selContact && (
                        <div className="contact">
                          <span className="creg">{selContact.reg}</span>
                          {selContact.ph && <span className="cnum">☎ {selContact.ph}</span>}
                          {selContact.pa && <span className="cnum">◈ {selContact.pa}</span>}
                        </div>
                      )}
                      <button className="btn" onClick={addAbsentee}>Add to today's log ↵</button>
                    </div>

                    <div className="card2">
                      <div className="c2h"><span className="dot" /><h3>Today's log</h3><span className="c2sub">{absentees.length} logged · {logDay}</span></div>
                      <div className="loglist">
                        {absentees.length === 0 && <div className="empty">Nobody logged yet — full attendance.</div>}
                        {absentees.map((a, i) => (
                          <div key={i} className={"logrow " + a.status}>
                            <div className="lr-main">
                              <b>{a.name}</b>
                              <span className={"tag " + a.status}>{MH_CODE[a.status] || a.status}</span>
                              {a.parent === "Y" && <span className="tag paren">parent ✓</span>}
                            </div>
                            {a.reason && <div className="lr-reason">{a.reason}</div>}
                            <button className="lr-del" onClick={() => delAbsentee(i)} title="Remove">✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="cmd-col">
                    <div className="card2 slice-note">
                      <div className="c2h"><span className="dot" /><h3>Report preview & exports</h3></div>
                      <p className="muted">The live MH-Cockpit preview, <b>.docx</b> / PDF export, register scan (OCR), and “message parents” are being ported in the next slice — they still work on the current dashboard.</p>
                      <div className="acts">
                        <a className="btn line" href="/argus-dashboard.html">Open current dashboard ↗</a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sec === "report" && <SlicePlaceholder title="Report" />}
              {sec === "term" && <SlicePlaceholder title="Term tracker" />}
            </div>
          )}

          {tab === "live" && <SlicePlaceholder title="Live Attendance" full />}
        </div>
      )}

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
}

function SlicePlaceholder({ title, full }) {
  return (
    <div className={"view" + (full ? " full" : "")}>
      <div className="card2 slice-note" style={{ maxWidth: 620, margin: "20px auto" }}>
        <div className="c2h"><span className="dot" /><h3>{title}</h3></div>
        <p className="muted">This section is being ported to the new design next. It’s fully working on the current dashboard in the meantime.</p>
        <div className="acts"><a className="btn line" href="/argus-dashboard.html">Open current dashboard ↗</a></div>
      </div>
    </div>
  );
}

/* ═══════════════════════ styles (landing-page design language) ═══════════════════════ */
const CSS = `
.dash{--bg:#f1efe8;--bg2:#e8e5da;--panel:#fbfaf5;--panel2:#f3f1e9;--line:rgba(22,34,30,.13);--line2:rgba(22,34,30,.22);--ink:#16221e;--soft:#26332e;--dim:#5a655d;--faint:#8a9289;--accent:#0e8f80;--accent-soft:#d8ece7;--gold:#b9791a;--red:#c0463f;--green:#1f8f56;--console:#14201c;--console-ink:#eef3ef;
  --sans:var(--font-sans),Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;--mono:var(--font-mono),"SF Mono",ui-monospace,Menlo,Consolas,monospace;
  position:fixed;inset:0;overflow:auto;background:var(--bg);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased}
.dash[data-dtheme="dark"]{--bg:#0a0f0e;--bg2:#0e1614;--panel:#111a17;--panel2:#0e1613;--line:rgba(150,180,170,.14);--line2:rgba(150,180,170,.26);--ink:#e9f1ec;--soft:#cdd8d2;--dim:#93a49b;--faint:#6f7f77;--accent:#37d3bd;--accent-soft:#12312b;--gold:#e0a94a;--red:#e2685f;--green:#4bbf82;--console:#0c1512;--console-ink:#dfeae5}
.dash *{box-sizing:border-box}
.dash button{font-family:var(--sans)}

/* lock */
.lock{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:var(--bg);z-index:50}
.lockbox{display:flex;flex-direction:column;align-items:center;gap:14px;padding:30px}
.lockbox.shake{animation:sh .4s}@keyframes sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
.scope{width:150px;height:150px;border-radius:50%;overflow:hidden;border:1px solid var(--line2);background:var(--console)}
.scope canvas{width:100%;height:100%;display:block}
.lbrand{font-size:26px;font-weight:800;letter-spacing:.32em;color:var(--ink);margin-left:.32em}
.ltag{font-family:var(--mono);font-size:10px;letter-spacing:.18em;color:var(--faint);text-transform:uppercase}
.pinwrap{display:flex;gap:10px;margin-top:6px}
.pin{width:48px;height:56px;text-align:center;font-size:22px;font-family:var(--mono);color:var(--ink);background:var(--panel);border:1px solid var(--line2);border-radius:12px;outline:none}
.pin.filled{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-soft)}
.lockmsg{font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;color:var(--dim)}
.lockmsg.bad{color:var(--red)}
.sig{font-family:var(--mono);font-size:8px;letter-spacing:.3em;color:var(--faint);margin-top:10px}

/* app chrome */
.app{max-width:1240px;margin:0 auto;padding:0 20px 60px}
.dhead{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:14px;height:60px;background:color-mix(in srgb,var(--bg) 82%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.hlogo{color:var(--gold);display:flex}
.hbrand{display:flex;flex-direction:column;line-height:1.1}
.hbrand b{font-size:14px;font-weight:800;letter-spacing:.18em}
.hbrand span{font-size:9px;letter-spacing:.14em;color:var(--faint);text-transform:uppercase;font-family:var(--mono)}
.hspacer{flex:1}
.clock{text-align:right;font-family:var(--mono);line-height:1.2}
.clock b{font-size:11px;letter-spacing:.06em;color:var(--soft)}
.clock span{display:block;font-size:12px;color:var(--ink)}
.ghost{font-family:var(--mono);font-size:11px;letter-spacing:.04em;color:var(--dim);background:transparent;border:1px solid var(--line);border-radius:9px;padding:8px 12px;cursor:pointer}
.ghost:hover{color:var(--ink);border-color:var(--line2)}

.tabbar{display:flex;gap:4px;padding:14px 0 4px}
.tabbtn{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:12px;letter-spacing:.05em;color:var(--dim);background:transparent;border:0;border-bottom:2px solid transparent;padding:10px 14px;cursor:pointer}
.tabbtn .tdot{width:6px;height:6px;border-radius:50%;background:var(--line2)}
.tabbtn.on{color:var(--ink);border-bottom-color:var(--accent)}
.tabbtn.on .tdot{background:var(--accent);box-shadow:0 0 8px var(--accent)}

.view{padding-top:18px}
.view.full{min-height:50vh}

/* status header */
.cmd-status{display:grid;grid-template-columns:auto 1fr;gap:26px;align-items:center;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:22px 24px;box-shadow:0 1px 2px rgba(22,34,30,.04)}
.gauge-wrap{position:relative;width:132px;height:132px}
.gauge{width:132px;height:132px;transform:rotate(-90deg)}
.g-track{fill:none;stroke:var(--line);stroke-width:9}
.g-arc{fill:none;stroke:var(--accent);stroke-width:9;stroke-linecap:round;transition:stroke-dashoffset .6s ease}
.g-val{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.g-val b{font-size:34px;font-weight:800;color:var(--ink);line-height:1}
.g-val span{font-family:var(--mono);font-size:9px;letter-spacing:.12em;color:var(--faint);text-transform:uppercase}
.cmd-tiles{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.gtile{background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:12px 10px;text-align:center}
.gtile b{display:block;font-size:22px;font-weight:800;color:var(--ink)}
.gtile span{font-family:var(--mono);font-size:8.5px;letter-spacing:.08em;color:var(--faint);text-transform:uppercase}
.gtile.g b{color:var(--green)}.gtile.r b{color:var(--red)}.gtile.t b{color:var(--accent)}
.cmd-watch{display:flex;align-items:center;gap:10px;margin-top:14px;font-family:var(--mono);font-size:11px;color:var(--dim)}
.wlabel{font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);border:1px solid var(--line);border-radius:6px;padding:3px 7px}

/* section nav */
.cmd-nav{display:flex;gap:6px;margin:20px 0 4px}
.cmd-navbtn{font-family:var(--mono);font-size:11.5px;letter-spacing:.06em;color:var(--dim);background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:9px 16px;cursor:pointer;display:flex;align-items:center;gap:8px}
.cmd-navbtn.on{color:var(--ink);border-color:var(--accent);background:var(--accent-soft)}
.cmd-navbtn .nc{font-size:9px;color:#fff;background:var(--accent);border-radius:8px;padding:1px 6px;min-width:16px;text-align:center}

/* work grid */
.cmd-work{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:16px}
.cmd-col{display:flex;flex-direction:column;gap:18px}
.card2{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px;box-shadow:0 1px 2px rgba(22,34,30,.04)}
.c2h{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.c2h .dot{width:7px;height:7px;border-radius:50%;background:var(--accent)}
.c2h h3{font-size:14px;font-weight:700;color:var(--ink);margin:0}
.c2sub{margin-left:auto;font-family:var(--mono);font-size:10px;color:var(--faint)}
.row{margin-bottom:12px}
.row.r-name{display:grid;grid-template-columns:1.4fr 1fr .9fr;gap:10px}
.dash label{display:block;font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-bottom:6px}
.dash input,.dash select,.dash textarea{width:100%;font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:10px 11px;outline:none}
.dash input:focus,.dash select:focus,.dash textarea:focus{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-soft)}
.dash textarea{min-height:64px;resize:vertical}
.namewrap{display:flex;flex-direction:column;gap:6px}
.contact{display:flex;flex-wrap:wrap;gap:8px;margin:2px 0 12px}
.creg{font-family:var(--mono);font-size:11px;color:var(--accent);border:1px solid var(--line);border-radius:6px;padding:3px 8px}
.cnum{font-family:var(--mono);font-size:11px;color:var(--dim);border:1px solid var(--line);border-radius:6px;padding:3px 8px}
.btn{width:100%;font-family:var(--sans);font-size:13px;font-weight:600;color:#fff;background:var(--accent);border:0;border-radius:11px;padding:12px;cursor:pointer;margin-top:4px}
.btn:hover{filter:brightness(1.06)}
.btn.line{background:transparent;color:var(--ink);border:1px solid var(--line2)}
.btn.line:hover{border-color:var(--accent);color:var(--accent)}
.acts{display:flex;gap:10px;margin-top:12px}

.loglist{display:flex;flex-direction:column;gap:8px}
.empty{font-family:var(--mono);font-size:11px;color:var(--faint);padding:10px 2px}
.logrow{position:relative;background:var(--panel2);border:1px solid var(--line);border-left:3px solid var(--red);border-radius:11px;padding:10px 34px 10px 12px}
.logrow.informed{border-left-color:var(--gold)}.logrow.od{border-left-color:var(--accent)}.logrow.unauthorized,.logrow.susp{border-left-color:var(--red)}
.lr-main{display:flex;align-items:center;gap:8px}
.lr-main b{font-size:13px;color:var(--ink)}
.tag{font-family:var(--mono);font-size:8px;letter-spacing:.06em;padding:2px 6px;border-radius:5px;background:var(--line);color:var(--soft)}
.tag.od{background:var(--accent-soft);color:var(--accent)}.tag.informed{background:rgba(185,121,26,.14);color:var(--gold)}.tag.unauthorized,.tag.susp{background:rgba(192,70,63,.14);color:var(--red)}
.tag.paren{background:rgba(31,143,86,.14);color:var(--green)}
.lr-reason{font-size:11.5px;color:var(--dim);margin-top:4px}
.lr-del{position:absolute;right:8px;top:8px;width:22px;height:22px;border-radius:6px;border:1px solid var(--line);background:transparent;color:var(--faint);cursor:pointer;font-size:11px}
.lr-del:hover{color:var(--red);border-color:var(--red)}

.slice-note .muted{font-size:12.5px;line-height:1.6;color:var(--dim)}
.muted{color:var(--dim)}
.toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);background:var(--console);color:var(--console-ink);font-family:var(--mono);font-size:12px;padding:11px 18px;border-radius:11px;z-index:60;box-shadow:0 10px 30px -10px rgba(0,0,0,.4)}
@media(max-width:900px){.cmd-work{grid-template-columns:1fr}.row.r-name{grid-template-columns:1fr}.cmd-status{grid-template-columns:1fr;justify-items:center;text-align:center}.cmd-tiles{grid-template-columns:repeat(3,1fr)}}
`;
