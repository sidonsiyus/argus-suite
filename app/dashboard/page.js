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
  { v: "informed", label: "AUTH", full: "Authorized (Informed)" },
  { v: "unauthorized", label: "UNAUTH", full: "Unauthorized" },
  { v: "groom", label: "GROOM", full: "Grooming" },
  { v: "od", label: "OD", full: "On Duty" },
  { v: "susp", label: "SUSP", full: "Suspended" },
];
const MH_CODE = { informed: "AUTH", unauthorized: "UNAUTH", groom: "GROOM", od: "OD", susp: "SUSP" };
const DEF_REMARK = (s) => s === "informed" ? "Prior notification given" : s === "od" ? "On official duty (counted present)" : s === "groom" ? "Grooming" : s === "susp" ? "Suspended" : "No prior notification";
const byName = (n) => ROSTER.find((r) => r.name === n) || null;
const today = () => { const n = new Date(); return new Date(n.getTime() - n.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
const DEFAULT_PARAMS = { pClass: "BscAero-IIA", pProg: "Bsc Aero - IIA", pStrength: "43", pLate: "0", pHalf: "0", pBy: "Class Coordinator", pTo: "Chief Executive Officer", pSub: "Prepared for the Office of the Chief Executive Officer" };
const NAV = [
  { id: "log", label: "Daily Log", glyph: "▤" },
  { id: "live", label: "Live Attendance", glyph: "◈" },
  { id: "report", label: "Report", glyph: "▦" },
  { id: "term", label: "Term Tracker", glyph: "◷" },
];

/* ═══════════════════════ component ═══════════════════════ */
export default function Dashboard() {
  const [locked, setLocked] = useState(true);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [pinBad, setPinBad] = useState(false);
  const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [dark, setDark] = useState(true);
  const [nav, setNav] = useState("log");
  const [toastMsg, setToastMsg] = useState("");
  const toastT = useRef(0);

  const [absentees, setAbsentees] = useState([]);
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [logDay, setLogDay] = useState(today());
  const [reportDate, setReportDate] = useState(today());
  const [loaded, setLoaded] = useState(false);

  const [fFilter, setFFilter] = useState("");
  const [fName, setFName] = useState("");
  const [fStatus, setFStatus] = useState("informed");
  const [fParent, setFParent] = useState("N");
  const [fReasonSel, setFReasonSel] = useState("");
  const [fReason, setFReason] = useState("");
  const parentTouched = useRef(false);

  const [clock, setClock] = useState({ d: "—", t: "—:—:—" });

  const toast = useCallback((m) => { setToastMsg(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToastMsg(""), 2400); }, []);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); if (s.absentees) setAbsentees(s.absentees); if (s.params) setParams({ ...DEFAULT_PARAMS, ...s.params }); if (s.logDay) setLogDay(s.logDay); if (s.params && s.params.pDate) setReportDate(s.params.pDate); } } catch (e) {}
    try { setDark(localStorage.getItem("argus_theme") !== "light"); } catch (e) {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { const prev = JSON.parse(localStorage.getItem(KEY) || "{}"); localStorage.setItem(KEY, JSON.stringify({ ...prev, absentees, params: { ...params, pDate: reportDate }, logDay, _ts: Date.now() })); } catch (e) {}
  }, [absentees, params, logDay, reportDate, loaded]);
  useEffect(() => { try { localStorage.setItem("argus_theme", dark ? "dark" : "light"); } catch (e) {} }, [dark]);

  useEffect(() => {
    const upd = () => { const n = new Date(); setClock({ d: n.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" }).toUpperCase(), t: n.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) }); };
    upd(); const id = setInterval(upd, 1000); return () => clearInterval(id);
  }, []);

  const scopeRef = useRef(null);
  useEffect(() => {
    if (!locked) return;
    const cv = scopeRef.current; if (!cv) return; const c = cv.getContext("2d");
    const blips = Array.from({ length: 9 }, (_, i) => ({ a: i * 0.698 + 0.4, r: 0.3 + ((i * 41) % 100) / 100 * 0.6, drift: (i % 3 - 1) * 0.00022 }));
    let raf = 0, t0 = performance.now(); const AC = dark ? "53,208,186" : "11,143,128";
    const frame = (now) => {
      const D = Math.min(devicePixelRatio || 1, 2), W = cv.clientWidth, H = cv.clientHeight;
      if (cv.width !== W * D) { cv.width = W * D; cv.height = H * D; }
      c.setTransform(D, 0, 0, D, 0, 0); c.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 3, t = (now - t0) / 1000, sweep = t * 1.1;
      c.strokeStyle = `rgba(${AC},.12)`; c.lineWidth = 1;
      for (let i = 1; i <= 4; i++) { c.beginPath(); c.arc(cx, cy, R * i / 4, 0, 7); c.stroke(); }
      c.strokeStyle = `rgba(${AC},.08)`;
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.beginPath(); c.moveTo(cx + Math.cos(a) * R * .18, cy + Math.sin(a) * R * .18); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke(); }
      c.save(); c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, sweep - 0.55, sweep); c.closePath();
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, `rgba(${AC},.3)`); g.addColorStop(1, `rgba(${AC},0)`); c.fillStyle = g; c.fill(); c.restore();
      c.strokeStyle = `rgba(${AC},.85)`; c.lineWidth = 1.2; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R); c.stroke();
      blips.forEach((b) => { b.a += b.drift; const bx = cx + Math.cos(b.a) * R * b.r, by = cy + Math.sin(b.a) * R * b.r; const d = ((sweep - b.a) % 6.283 + 6.283) % 6.283, f = Math.max(0, 1 - d / 2.4); c.fillStyle = `rgba(${AC},${0.1 + f * 0.85})`; c.beginPath(); c.arc(bx, by, 1.4 + f * 2, 0, 7); c.fill(); });
      c.fillStyle = `rgb(${AC})`; c.beginPath(); c.arc(cx, cy, 2, 0, 7); c.fill();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame); return () => cancelAnimationFrame(raf);
  }, [locked, dark]);
  useEffect(() => { if (locked) setTimeout(() => pinRefs[0].current && pinRefs[0].current.focus(), 300); }, [locked]);

  const onPin = (i, v) => {
    v = v.replace(/\D/g, "").slice(-1);
    const next = [...pin]; next[i] = v; setPin(next); setPinBad(false);
    if (v && i < 3) pinRefs[i + 1].current && pinRefs[i + 1].current.focus();
    if (next.every((x) => x)) { if (next.join("") === CODE) setTimeout(() => setLocked(false), 300); else { setPinBad(true); setTimeout(() => { setPin(["", "", "", ""]); setPinBad(false); pinRefs[0].current && pinRefs[0].current.focus(); }, 500); } }
  };
  const onPinKey = (i, e) => { if (e.key === "Backspace" && !pin[i] && i > 0) pinRefs[i - 1].current && pinRefs[i - 1].current.focus(); };

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
  const clearDay = () => { if (!absentees.length) return; if (!confirm("Clear today's log? Report parameters stay as they are.")) return; setAbsentees([]); toast("Log cleared"); };
  const onStatus = (v) => { setFStatus(v); if (!parentTouched.current) setFParent(v === "unauthorized" || v === "susp" ? "Y" : "N"); };

  if (!loaded) return <div className="dash" data-dtheme={dark ? "dark" : "light"}><style>{CSS}</style></div>;

  /* ── locked ── */
  if (locked) {
    return (
      <div className="dash" data-dtheme={dark ? "dark" : "light"}>
        <style>{CSS}</style>
        <div className="lock">
          <div className="lockgrid">
            <div className={"scope" + (pinBad ? " shake" : "")}><canvas ref={scopeRef} /><span className="scope-ring" /></div>
            <div className="lockmeta">
              <div className="lbrand">ARGUS</div>
              <div className="ltag">Attendance Command · secure terminal</div>
              <div className="pinwrap">
                {pin.map((v, i) => (
                  <input key={i} ref={pinRefs[i]} className={"pin" + (v ? " filled" : "") + (pinBad ? " bad" : "")} maxLength={1} inputMode="numeric" type="password"
                    value={v} onChange={(e) => onPin(i, e.target.value)} onKeyDown={(e) => onPinKey(i, e)} autoComplete="off" />
                ))}
              </div>
              <div className={"lockmsg" + (pinBad ? " bad" : "")}>{pinBad ? "◇ access denied" : "◇ enter 4-digit access code"}</div>
              <div className="sig">MADE FOR SID, BY SID</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cur = NAV.find((n) => n.id === nav) || NAV[0];

  return (
    <div className="dash" data-dtheme={dark ? "dark" : "light"}>
      <style>{CSS}</style>
      <div className="shell">
        {/* ── command rail ── */}
        <aside className="rail">
          <Link href="/" className="rail-brand" title="Back to ARGUS">
            <svg viewBox="0 0 32 32" width="22" height="22"><path d="M16 3 18.5 13.5 29 16l-10.5 2.5L16 29l-2.5-10.5L3 16l10.5-2.5z" fill="currentColor" /></svg>
            <span>ARGUS</span>
          </Link>
          <div className="rail-sub">Attendance Command</div>
          <nav className="rail-nav">
            {NAV.map((n) => (
              <button key={n.id} className={"rn" + (nav === n.id ? " on" : "")} onClick={() => setNav(n.id)}>
                <i>{n.glyph}</i><span>{n.label}</span>
              </button>
            ))}
          </nav>
          <div className="rail-foot">
            <div className="rail-att"><span>ATTENDANCE</span><b>{stats.pct}<i>%</i></b></div>
            <div className="rail-btns">
              <button onClick={() => setDark((d) => !d)} title="Theme">{dark ? "☾" : "◐"}</button>
              <button onClick={() => setLocked(true)} title="Lock">⏻</button>
            </div>
          </div>
        </aside>

        {/* ── main ── */}
        <main className="main">
          <div className="cmdbar">
            <div className="cb-title"><span className="cb-glyph">{cur.glyph}</span><h1>{cur.label}</h1><span className="cb-day">{nav === "report" ? reportDate : logDay}</span></div>
            <div className="cb-clock"><b>{clock.t}</b><span>{clock.d}</span></div>
          </div>

          {nav === "log" && (
            <div className="body">
              {/* instrument readout band */}
              <section className="instr">
                <div className="instr-lead">
                  <div className="big">{stats.pct}<i>%</i></div>
                  <div className="big-l">present<br /><b>{stats.present} / {stats.strength}</b></div>
                </div>
                <div className="instr-tape">
                  <div className="tape">
                    <span className="seg pres" style={{ flex: Math.max(stats.present - stats.od, 0.001) }} />
                    {stats.od > 0 && <span className="seg od" style={{ flex: stats.od }} />}
                    {stats.absent > 0 && <span className="seg abs" style={{ flex: stats.absent }} />}
                  </div>
                  <div className="ro-row">
                    <Readout k="strength" v={stats.strength} />
                    <Readout k="present" v={stats.present} tone="ok" />
                    <Readout k="absent" v={stats.absent} tone={stats.absent ? "bad" : ""} />
                    <Readout k="on duty" v={stats.od} tone="teal" />
                    <Readout k="informed" v={stats.informed} />
                    <Readout k="unauth" v={stats.unauth} tone={stats.unauth ? "bad" : ""} />
                  </div>
                </div>
              </section>

              <div className="grid2">
                {/* MARK */}
                <section className="panel">
                  <div className="p-h"><span className="p-k">MARK</span><h2>Log an absentee</h2></div>
                  <div className="fgrid">
                    <div className="f full">
                      <label>Student</label>
                      <input value={fFilter} onChange={(e) => setFFilter(e.target.value)} placeholder="Filter roster…" autoComplete="off" spellCheck={false} />
                      <select value={fName} onChange={(e) => setFName(e.target.value)}>
                        <option value="">— select —</option>
                        {nameOptions.map((r) => <option key={r.reg} value={r.name}>{String(r.n).padStart(2, "0")} · {r.name}</option>)}
                      </select>
                    </div>
                    <div className="f">
                      <label>Status</label>
                      <div className="segpick">
                        {STATUS.map((s) => <button key={s.v} className={"sp" + (fStatus === s.v ? " on" : "")} onClick={() => onStatus(s.v)} title={s.full}>{s.label}</button>)}
                      </div>
                    </div>
                    <div className="f">
                      <label>Parent contacted</label>
                      <div className="segpick two">
                        <button className={"sp" + (fParent === "N" ? " on" : "")} onClick={() => { parentTouched.current = true; setFParent("N"); }}>No</button>
                        <button className={"sp" + (fParent === "Y" ? " on" : "")} onClick={() => { parentTouched.current = true; setFParent("Y"); }}>Yes</button>
                      </div>
                    </div>
                    <div className="f full">
                      <label>Reason</label>
                      <select value={fReasonSel} onChange={(e) => setFReasonSel(e.target.value)}>
                        <option value="">— select a reason —</option>
                        {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                        <option value={OTHER}>{OTHER}</option>
                      </select>
                    </div>
                    {fReasonSel === OTHER && <div className="f full"><label>Specify</label><textarea value={fReason} onChange={(e) => setFReason(e.target.value)} placeholder="In your own words." /></div>}
                  </div>
                  {selContact && (
                    <div className="contact">
                      <span className="creg">{selContact.reg}</span>
                      {selContact.ph && <span className="cnum">☎ {selContact.ph}</span>}
                      {selContact.pa && <span className="cnum">◈ {selContact.pa}</span>}
                    </div>
                  )}
                  <button className="btn" onClick={addAbsentee}>Add to manifest <kbd>↵</kbd></button>
                </section>

                {/* MANIFEST */}
                <section className="panel">
                  <div className="p-h"><span className="p-k">MANIFEST</span><h2>Today · {absentees.length} logged</h2>{absentees.length > 0 && <button className="p-clear" onClick={clearDay}>clear</button>}</div>
                  <div className="manifest">
                    {absentees.length === 0 && <div className="empty"><span>◎</span>Full attendance — nobody logged.</div>}
                    {absentees.map((a, i) => (
                      <div key={i} className={"mrow " + a.status}>
                        <span className="mrow-i">{String(i + 1).padStart(2, "0")}</span>
                        <div className="mrow-body">
                          <div className="mrow-top"><b>{a.name}</b>{a.reg && <span className="mreg">{a.reg}</span>}</div>
                          <div className="mrow-sub"><span className={"mtag " + a.status}>{MH_CODE[a.status] || a.status}</span>{a.parent === "Y" && <span className="mtag ok">parent ✓</span>}{a.reason && <span className="mreason">{a.reason}</span>}</div>
                        </div>
                        <button className="mrow-x" onClick={() => delAbsentee(i)} title="Remove">✕</button>
                      </div>
                    ))}
                  </div>
                  <div className="p-foot"><a className="lnk" href="/argus-dashboard.html">Report · exports · scan → current dashboard ↗</a></div>
                </section>
              </div>
            </div>
          )}

          {nav !== "log" && (
            <div className="body">
              <section className="panel placeholder">
                <div className="p-h"><span className="p-k">SOON</span><h2>{cur.label}</h2></div>
                <p>This module is being ported into the new console next — it stays fully working on the current dashboard meanwhile.</p>
                <a className="btn line" href="/argus-dashboard.html">Open current dashboard ↗</a>
              </section>
            </div>
          )}
        </main>
      </div>
      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
}

function Readout({ k, v, tone }) {
  return <div className={"ro" + (tone ? " " + tone : "")}><span>{k}</span><b>{v}</b></div>;
}

/* ═══════════════════════ styles — ops console ═══════════════════════ */
const CSS = `
.dash{--paper:#eeece4;--paper2:#e5e2d8;--surf:#f8f7f1;--surf2:#f1efe7;--line:rgba(20,32,28,.12);--line2:rgba(20,32,28,.2);--ink:#141f1b;--soft:#33413b;--dim:#5e6a62;--faint:#93998f;--accent:#0b8f80;--accent2:#0a7568;--accent-w:rgba(11,143,128,.1);--gold:#b0741a;--red:#bb433c;--ok:#1c8a52;--console:#101a16;--console-ink:#eaf1ec;
  --sans:var(--font-sans),Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;--mono:var(--font-mono),"SF Mono",ui-monospace,Menlo,Consolas,monospace;
  position:fixed;inset:0;overflow:hidden;background:var(--paper);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased}
.dash[data-dtheme="dark"]{--paper:#080c0b;--paper2:#0b100e;--surf:#0f1613;--surf2:#0c1210;--line:rgba(150,180,170,.12);--line2:rgba(150,180,170,.22);--ink:#e9f1ec;--soft:#c3d0c9;--dim:#8a978f;--faint:#5f6d65;--accent:#35d0ba;--accent2:#26b5a2;--accent-w:rgba(53,208,186,.1);--gold:#dca648;--red:#e26a61;--ok:#4dc084;--console:#060a09;--console-ink:#dfeae5}
.dash *{box-sizing:border-box}
.dash button,.dash input,.dash select,.dash textarea{font-family:inherit}

/* ── lock ── */
.lock{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:radial-gradient(120% 120% at 50% 0%,var(--surf),var(--paper));z-index:50}
.lockgrid{display:flex;align-items:center;gap:34px;padding:30px}
.scope{position:relative;width:164px;height:164px;border-radius:50%;overflow:hidden;background:var(--console);border:1px solid var(--line2);flex:none}
.scope canvas{width:100%;height:100%;display:block}
.scope.shake{animation:sh .4s}@keyframes sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}
.lockmeta{display:flex;flex-direction:column;gap:12px}
.lbrand{font-size:30px;font-weight:800;letter-spacing:.34em;margin-left:.34em}
.ltag{font-family:var(--mono);font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--faint)}
.pinwrap{display:flex;gap:9px;margin-top:6px}
.pin{width:46px;height:54px;text-align:center;font-size:20px;font-family:var(--mono);color:var(--ink);background:var(--surf);border:1px solid var(--line2);border-radius:9px;outline:none;transition:.15s}
.pin.filled{border-color:var(--accent);background:var(--accent-w)}
.pin.bad{border-color:var(--red)}
.lockmsg{font-family:var(--mono);font-size:10px;letter-spacing:.12em;color:var(--dim);text-transform:uppercase}
.lockmsg.bad{color:var(--red)}
.sig{font-family:var(--mono);font-size:8px;letter-spacing:.32em;color:var(--faint);margin-top:8px}
@media(max-width:640px){.lockgrid{flex-direction:column;gap:22px}}

/* ── shell ── */
.shell{display:grid;grid-template-columns:224px 1fr;height:100%}
.rail{display:flex;flex-direction:column;background:var(--surf);border-right:1px solid var(--line);padding:20px 14px}
.rail-brand{display:flex;align-items:center;gap:9px;color:var(--gold);text-decoration:none;font-weight:800;font-size:15px;letter-spacing:.16em}
.rail-brand span{color:var(--ink)}
.rail-sub{font-family:var(--mono);font-size:8.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);margin:4px 0 22px 2px}
.rail-nav{display:flex;flex-direction:column;gap:3px}
.rn{display:flex;align-items:center;gap:11px;text-align:left;font-size:13px;color:var(--dim);background:transparent;border:0;border-radius:9px;padding:10px 11px;cursor:pointer;position:relative;transition:.14s}
.rn i{font-style:normal;font-size:13px;width:16px;text-align:center;color:var(--faint)}
.rn:hover{color:var(--ink);background:var(--surf2)}
.rn.on{color:var(--ink);background:var(--accent-w)}
.rn.on i{color:var(--accent)}
.rn.on:before{content:"";position:absolute;left:-14px;top:8px;bottom:8px;width:3px;border-radius:0 3px 3px 0;background:var(--accent)}
.rail-foot{margin-top:auto;padding-top:18px;border-top:1px solid var(--line)}
.rail-att{display:flex;flex-direction:column;gap:2px;padding:2px 4px 12px}
.rail-att span{font-family:var(--mono);font-size:8px;letter-spacing:.16em;color:var(--faint)}
.rail-att b{font-size:26px;font-weight:300;color:var(--ink);letter-spacing:-.01em}
.rail-att b i{font-style:normal;font-size:13px;color:var(--faint);margin-left:1px}
.rail-btns{display:flex;gap:8px}
.rail-btns button{flex:1;font-size:14px;color:var(--dim);background:var(--surf2);border:1px solid var(--line);border-radius:8px;padding:8px;cursor:pointer}
.rail-btns button:hover{color:var(--ink);border-color:var(--line2)}

/* ── main ── */
.main{overflow-y:auto;padding:0}
.cmdbar{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:16px;height:64px;padding:0 30px;background:color-mix(in srgb,var(--paper) 84%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.cb-title{display:flex;align-items:baseline;gap:12px}
.cb-glyph{color:var(--accent);font-size:14px}
.cb-title h1{font-size:17px;font-weight:600;letter-spacing:-.01em;margin:0}
.cb-day{font-family:var(--mono);font-size:11px;color:var(--faint)}
.cb-clock{margin-left:auto;text-align:right;font-family:var(--mono);line-height:1.15}
.cb-clock b{font-size:14px;font-weight:500;letter-spacing:.04em;color:var(--ink)}
.cb-clock span{display:block;font-size:8.5px;letter-spacing:.14em;color:var(--faint)}
.body{padding:26px 30px 60px;max-width:1180px}

/* ── instrument band ── */
.instr{display:grid;grid-template-columns:auto 1fr;gap:34px;align-items:center;background:var(--surf);border:1px solid var(--line);border-radius:14px;padding:24px 28px}
.instr-lead{display:flex;align-items:flex-end;gap:14px}
.big{font-size:74px;font-weight:200;line-height:.86;letter-spacing:-.03em;color:var(--ink)}
.big i{font-style:normal;font-size:26px;font-weight:300;color:var(--faint);margin-left:2px}
.big-l{font-family:var(--mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);padding-bottom:8px}
.big-l b{color:var(--soft);font-size:12px;letter-spacing:.02em}
.instr-tape{min-width:0}
.tape{display:flex;height:12px;border-radius:7px;overflow:hidden;background:var(--surf2);border:1px solid var(--line)}
.seg{display:block}
.seg.pres{background:var(--accent)}
.seg.od{background:color-mix(in srgb,var(--accent) 45%,var(--surf2))}
.seg.abs{background:var(--red)}
.ro-row{display:flex;margin-top:18px}
.ro{flex:1;display:flex;flex-direction:column;gap:3px;padding:0 16px;border-left:1px solid var(--line)}
.ro:first-child{padding-left:0;border-left:0}
.ro span{font-family:var(--mono);font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
.ro b{font-size:26px;font-weight:300;color:var(--ink);letter-spacing:-.01em}
.ro.ok b{color:var(--ok)}.ro.bad b{color:var(--red)}.ro.teal b{color:var(--accent)}

/* ── panels ── */
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px}
.panel{background:var(--surf);border:1px solid var(--line);border-radius:14px;padding:20px}
.p-h{display:flex;align-items:baseline;gap:11px;margin-bottom:16px}
.p-k{font-family:var(--mono);font-size:8.5px;letter-spacing:.18em;color:var(--accent);border:1px solid var(--accent);border-radius:5px;padding:3px 6px}
.p-h h2{font-size:14px;font-weight:600;margin:0;color:var(--ink)}
.p-clear{margin-left:auto;font-family:var(--mono);font-size:10px;color:var(--faint);background:0;border:0;cursor:pointer;text-transform:uppercase;letter-spacing:.1em}
.p-clear:hover{color:var(--red)}

.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.f{display:flex;flex-direction:column;gap:7px}
.f.full{grid-column:1 / -1}
.dash label{font-family:var(--mono);font-size:8.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--faint)}
.dash input,.dash select,.dash textarea{width:100%;font-size:13px;color:var(--ink);background:var(--surf2);border:1px solid var(--line);border-radius:9px;padding:10px 11px;outline:none;transition:.14s}
.dash input:focus,.dash select:focus,.dash textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-w)}
.dash textarea{min-height:60px;resize:vertical}
.namewrap{display:flex;flex-direction:column;gap:6px}
.segpick{display:flex;gap:4px;flex-wrap:wrap}
.segpick.two{gap:6px}
.sp{flex:1;font-family:var(--mono);font-size:10px;letter-spacing:.04em;color:var(--dim);background:var(--surf2);border:1px solid var(--line);border-radius:8px;padding:9px 4px;cursor:pointer;min-width:44px;transition:.12s}
.sp:hover{color:var(--ink);border-color:var(--line2)}
.sp.on{color:#fff;background:var(--accent);border-color:var(--accent)}
.dash[data-dtheme="dark"] .sp.on{color:#04100e}
.contact{display:flex;flex-wrap:wrap;gap:7px;margin:14px 0 0}
.creg{font-family:var(--mono);font-size:10.5px;color:var(--accent);border:1px solid var(--line);border-radius:6px;padding:4px 8px}
.cnum{font-family:var(--mono);font-size:10.5px;color:var(--dim);border:1px solid var(--line);border-radius:6px;padding:4px 8px}
.btn{width:100%;font-size:13px;font-weight:600;color:#fff;background:var(--accent);border:0;border-radius:10px;padding:12px;cursor:pointer;margin-top:16px;display:flex;align-items:center;justify-content:center;gap:8px}
.dash[data-dtheme="dark"] .btn{color:#04100e}
.btn:hover{background:var(--accent2)}
.btn kbd{font-family:var(--mono);font-size:11px;opacity:.7;border:1px solid currentColor;border-radius:4px;padding:0 4px}
.btn.line{background:transparent;color:var(--ink);border:1px solid var(--line2);margin-top:14px;display:inline-flex;width:auto;padding:10px 16px}
.btn.line:hover{border-color:var(--accent);color:var(--accent);background:transparent}

/* ── manifest ── */
.manifest{display:flex;flex-direction:column}
.empty{display:flex;align-items:center;gap:10px;font-family:var(--mono);font-size:11.5px;color:var(--faint);padding:18px 4px}
.empty span{font-size:16px;color:var(--accent)}
.mrow{display:flex;align-items:center;gap:12px;padding:11px 4px;border-top:1px solid var(--line)}
.mrow:first-child{border-top:0}
.mrow-i{font-family:var(--mono);font-size:11px;color:var(--faint);width:20px}
.mrow-body{flex:1;min-width:0}
.mrow-top{display:flex;align-items:baseline;gap:9px}
.mrow-top b{font-size:13.5px;color:var(--ink)}
.mreg{font-family:var(--mono);font-size:9.5px;color:var(--faint)}
.mrow-sub{display:flex;align-items:center;gap:8px;margin-top:3px;flex-wrap:wrap}
.mtag{font-family:var(--mono);font-size:8px;letter-spacing:.05em;padding:2px 6px;border-radius:4px;background:var(--surf2);border:1px solid var(--line);color:var(--soft)}
.mtag.od{color:var(--accent);border-color:var(--accent)}
.mtag.informed{color:var(--gold);border-color:color-mix(in srgb,var(--gold) 45%,transparent)}
.mtag.unauthorized,.mtag.susp{color:var(--red);border-color:color-mix(in srgb,var(--red) 45%,transparent)}
.mtag.ok{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 45%,transparent)}
.mreason{font-size:11px;color:var(--dim)}
.mrow-x{width:24px;height:24px;border-radius:6px;border:1px solid transparent;background:0;color:var(--faint);cursor:pointer;font-size:11px}
.mrow-x:hover{color:var(--red);border-color:var(--red)}
.mrow.informed{--edge:var(--gold)}.mrow.od{--edge:var(--accent)}.mrow.unauthorized,.mrow.susp{--edge:var(--red)}
.p-foot{margin-top:16px;padding-top:14px;border-top:1px solid var(--line)}
.lnk{font-family:var(--mono);font-size:10.5px;color:var(--dim);text-decoration:none}
.lnk:hover{color:var(--accent)}

.placeholder{max-width:560px}
.placeholder p{font-size:13px;line-height:1.65;color:var(--dim);margin:0 0 4px}

.toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);background:var(--console);color:var(--console-ink);font-family:var(--mono);font-size:12px;padding:11px 18px;border-radius:10px;z-index:60;box-shadow:0 14px 40px -14px rgba(0,0,0,.5)}

@media(max-width:1000px){.grid2{grid-template-columns:1fr}.instr{grid-template-columns:1fr;gap:20px}.ro b{font-size:22px}}
@media(max-width:760px){.shell{grid-template-columns:1fr}.rail{flex-direction:row;align-items:center;height:auto;padding:10px 14px;overflow-x:auto}.rail-sub,.rail-att{display:none}.rail-nav{flex-direction:row}.rn.on:before{display:none}.rail-foot{margin:0 0 0 auto;padding:0;border:0}.body{padding:18px}}
`;
