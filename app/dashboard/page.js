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
const LIVE_WORKER = "https://argus-attend.jhrishi7.workers.dev/";
const MON3 = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const THR = { det: 75, cond: 65 };
const sheetNameForDate = (iso) => { const [y, m] = iso.split("-").map(Number); return "Daily Attendance for " + MON3[m - 1] + "-" + String(y).slice(2); };
const ddMon = (iso) => { const [y, m, d] = iso.split("-").map(Number); return d + "-" + MONT[m - 1]; };

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

  // live attendance (read) + sheet writer
  const [live, setLive] = useState({ status: "idle", data: null, sheet: "", sort: "pct", search: "", updated: "" });
  const [writer, setWriter] = useState({ url: "", secret: "" });
  const [wOpen, setWOpen] = useState(false);

  const toast = useCallback((m) => { setToastMsg(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToastMsg(""), 2400); }, []);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); if (s.absentees) setAbsentees(s.absentees); if (s.params) setParams({ ...DEFAULT_PARAMS, ...s.params }); if (s.logDay) setLogDay(s.logDay); if (s.params && s.params.pDate) setReportDate(s.params.pDate); } } catch (e) {}
    try { setDark(localStorage.getItem("argus_theme") !== "light"); } catch (e) {}
    try { setWriter({ url: localStorage.getItem("argus_writer_url") || "", secret: localStorage.getItem("argus_writer_secret") || "" }); } catch (e) {}
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

  /* ── live attendance (worker read) ── */
  const loadLive = useCallback(async (sheetName) => {
    setLive((L) => ({ ...L, status: "loading" }));
    try {
      const q = sheetName ? "?sheet=" + encodeURIComponent(sheetName) : "";
      const r = await fetch(LIVE_WORKER + q, { cache: "no-store" });
      const j = await r.json();
      if (j.error) throw new Error(j.error + (j.detail ? " — " + j.detail : ""));
      setLive((L) => ({ ...L, status: "ok", data: j, sheet: j.sheet || sheetName || "", updated: j.updated ? new Date(j.updated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "" }));
    } catch (e) { setLive((L) => ({ ...L, status: "error", err: String(e.message || e) })); }
  }, []);
  useEffect(() => { if (nav === "live" && live.status === "idle") loadLive(); }, [nav, live.status, loadLive]);

  /* ── sheet write-back ── */
  const writerUrl = () => (writer.url || LIVE_WORKER).replace(/\/$/, "");
  const writerOn = () => !!(writer.secret && writerUrl());
  const saveWriter = () => { try { localStorage.setItem("argus_writer_url", writer.url); localStorage.setItem("argus_writer_secret", writer.secret); } catch (e) {} setWOpen(false); toast(writerOn() ? "Sheet writer connected" : "Enter the WRITE_SECRET"); };
  const buildSheetMarks = () => {
    const iso = reportDate || today();
    const absByReg = {}, absByName = {};
    absentees.forEach((a) => { const mk = a.status === "od" ? "OD" : "A"; if (a.reg) absByReg[String(a.reg)] = mk; if (a.name) absByName[a.name.trim().toLowerCase()] = mk; });
    const marks = []; let present = 0, absent = 0, od = 0;
    ROSTER.forEach((r) => { const mk = absByReg[String(r.reg)] || absByName[(r.name || "").trim().toLowerCase()] || "P"; if (mk === "P") present++; else if (mk === "OD") od++; else absent++; marks.push({ reg: String(r.reg), mark: mk }); });
    const rosterRegs = new Set(ROSTER.map((r) => String(r.reg))), rosterNames = new Set(ROSTER.map((r) => (r.name || "").trim().toLowerCase()));
    const extra = absentees.filter((a) => (!a.reg || !rosterRegs.has(String(a.reg))) && !rosterNames.has((a.name || "").trim().toLowerCase())).map((a) => a.name);
    return { iso, sheetName: sheetNameForDate(iso), marks, present, absent, od, extra };
  };
  const pushToSheet = async (dryRun) => {
    if (!writerOn()) { toast("Connect the Google Sheet writer first"); setWOpen(true); return; }
    const m = buildSheetMarks();
    if (!dryRun) {
      const msg = "Push attendance to your Google Sheet?\n\nTab:  " + m.sheetName + "\nDate: " + ddMon(m.iso) +
        "\n\n" + m.present + " present · " + m.absent + " absent · " + m.od + " OD   (" + m.marks.length + " students)" +
        (m.extra.length ? ("\n\n⚠ " + m.extra.length + " logged absentee(s) not on the roster will be skipped:\n" + m.extra.join(", ")) : "") +
        "\n\nThis overwrites ONLY this day’s 5 period columns. Continue?";
      if (!confirm(msg)) return;
    }
    toast(dryRun ? "Checking the sheet…" : "Writing to Google Sheet…");
    try {
      const r = await fetch(writerUrl(), { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ secret: writer.secret, sheetName: m.sheetName, date: m.iso, dryRun: !!dryRun, marks: m.marks }) });
      const j = await r.json();
      if (!j.ok) { alert("Sheet " + (dryRun ? "check" : "write") + " failed:\n\n" + (j.error || "unknown error")); toast("Sheet " + (dryRun ? "check" : "write") + " failed"); return; }
      alert((dryRun ? "DRY RUN — nothing was written.\n\n" : "Done — Google Sheet updated. ✓\n\n") +
        "Tab:  " + j.sheet + "\nColumn: " + (j.dateColumn || "?") + "  (" + (j.date || ddMon(m.iso)) + ")\n" +
        "Marked: " + j.wrote + " students  —  " + j.present + " P · " + j.absent + " A · " + j.od + " OD" +
        ((j.unmatched && j.unmatched.length) ? ("\n\nReg not found in the sheet (skipped): " + j.unmatched.join(", ")) : ""));
      toast(dryRun ? "Dry run complete" : "Google Sheet updated ✓");
    } catch (e) { alert("Couldn’t reach the attendance worker.\n\n" + String(e.message || e)); toast("Sheet write error"); }
  };

  const liveRows = useMemo(() => {
    const d = live.data; if (!d || !Array.isArray(d.students)) return [];
    let arr = d.students.slice();
    const q = live.search.trim().toLowerCase();
    if (q) arr = arr.filter((s) => s.name.toLowerCase().includes(q) || String(s.reg).includes(q));
    if (live.sort === "pct") arr.sort((a, b) => b.pct - a.pct);
    else if (live.sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
    else if (live.sort === "sno") arr.sort((a, b) => a.sno - b.sno);
    else if (live.sort === "low") arr = arr.filter((s) => s.pct < THR.det).sort((a, b) => a.pct - b.pct);
    return arr;
  }, [live.data, live.sort, live.search]);

  if (!loaded) return <div className="dash" data-dtheme={dark ? "dark" : "light"}><style>{CSS}</style></div>;

  /* ── locked ── */
  if (locked) {
    return (
      <div className="dash" data-dtheme={dark ? "dark" : "light"}>
        <style>{CSS}</style>
        <div className="lock">
          <div className="lock-grid" />
          <div className="lock-glow" />
          <div className={"lock-inner" + (pinBad ? " shake" : "")}>
            <div className="lock-scope"><canvas ref={scopeRef} /></div>
            <div className="lock-brand"><span className="lb-mark">✦</span>ARGUS</div>
            <div className="lock-tag">Attendance Command Terminal</div>
            <div className="pinwrap">
              {pin.map((v, i) => (
                <input key={i} ref={pinRefs[i]} className={"pin" + (v ? " filled" : "") + (pinBad ? " bad" : "")} maxLength={1} inputMode="numeric" type="password"
                  value={v} onChange={(e) => onPin(i, e.target.value)} onKeyDown={(e) => onPinKey(i, e)} autoComplete="off" />
              ))}
            </div>
            <div className={"lockmsg" + (pinBad ? " bad" : "")}><i className="lm-dot" />{pinBad ? "ACCESS DENIED — re-enter code" : "ENTER 4-DIGIT ACCESS CODE"}</div>
          </div>
          <div className="lock-foot">
            <span className="lf-l"><i className="lf-dot" />SECURE · {ROSTER.length} ON ROLL</span>
            <span className="lf-c">{clock.d} · {clock.t}</span>
            <span className="lf-r">MADE FOR SID, BY SID</span>
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
                  <div className="p-foot sheetfoot">
                    <div className="sf-row">
                      <button className="btn sm" onClick={() => pushToSheet(false)}>⤴ Push to Google Sheet</button>
                      <button className="btn sm line" onClick={() => pushToSheet(true)}>Dry run</button>
                      <button className={"sf-gear" + (writerOn() ? " on" : "")} onClick={() => setWOpen((o) => !o)} title="Sheet writer secret">⚙</button>
                    </div>
                    {wOpen && (
                      <div className="sf-set">
                        <input type="password" placeholder="WRITE_SECRET (matches the worker)" value={writer.secret} onChange={(e) => setWriter((w) => ({ ...w, secret: e.target.value }))} />
                        <button className="btn sm" onClick={saveWriter}>Save</button>
                      </div>
                    )}
                    <div className="sf-note">Writes {reportDate}’s P/A/OD into your department sheet · Dry run checks first · <a className="lnk" href="/argus-dashboard.html">exports · scan ↗</a></div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {nav === "live" && (
            <div className="body">
              <section className="live-bar">
                <div className={"live-src " + live.status}><span className="ls-dot" />
                  {live.status === "loading" && "acquiring feed…"}
                  {live.status === "error" && ("feed error" + (live.err ? " — " + live.err : ""))}
                  {live.status === "ok" && ("Live · Google Sheet" + (live.updated ? " · synced " + live.updated : ""))}
                  {live.status === "idle" && "starting…"}
                </div>
                {live.data && Array.isArray(live.data.availableSheets) && (
                  <select className="live-sheet" value={live.sheet} onChange={(e) => loadLive(e.target.value)}>
                    {live.data.availableSheets.filter((n) => /attendance/i.test(n)).map((n) => <option key={n} value={n}>{n.replace(/daily attendance for /i, "").trim()}</option>)}
                  </select>
                )}
                <input className="live-search" placeholder="search name / reg…" value={live.search} onChange={(e) => setLive((L) => ({ ...L, search: e.target.value }))} />
                <div className="live-sort">
                  {[["pct", "%"], ["name", "A–Z"], ["sno", "roll"], ["low", "at-risk"]].map(([k, l]) => (
                    <button key={k} className={live.sort === k ? "on" : ""} onClick={() => setLive((L) => ({ ...L, sort: k }))}>{l}</button>
                  ))}
                </div>
                <button className="live-refresh" onClick={() => loadLive(live.sheet)} title="Refresh">↻</button>
              </section>

              {live.data && (
                <section className="instr live-summary">
                  <Readout k="students" v={(live.data.summary && live.data.summary.count) || 0} />
                  <Readout k="avg %" v={(live.data.summary && live.data.summary.avgPct) || 0} tone="teal" />
                  <Readout k="below 75%" v={(live.data.summary && live.data.summary.below75) || 0} tone={(live.data.summary && live.data.summary.below75) ? "bad" : ""} />
                  <Readout k="days" v={live.data.nDays || 0} />
                  <Readout k="periods" v={live.data.periods || 5} />
                  <Readout k="base" v={live.data.base || 0} />
                </section>
              )}

              <section className="live-list">
                {live.status === "loading" && <div className="live-empty">Loading live attendance…</div>}
                {live.status === "error" && <div className="live-empty err">Couldn’t load — {live.err}</div>}
                {live.status === "ok" && liveRows.length === 0 && <div className="live-empty">No students match.</div>}
                {live.status === "ok" && liveRows.map((s) => {
                  const low = s.pct < THR.det, cls = s.pct < THR.det ? "low" : s.pct < THR.det + 10 ? "mid" : "hi", w = Math.min(100, s.pct);
                  return (
                    <div key={s.reg} className={"lr" + (low ? " low" : "")}>
                      <span className="lr-n">{String(s.sno).padStart(2, "0")}</span>
                      <div className="lr-mid">
                        <div className="lr-name"><b>{s.name}</b><span className="lr-reg">{s.reg}</span>{low && <span className="lr-flag">below {THR.det}%</span>}</div>
                        <div className="lr-track"><i className={cls} style={{ width: w + "%" }} /></div>
                      </div>
                      <div className="lr-split"><span className="p">{s.present}P</span><span className="o">{s.od}OD</span><span className="a">{s.absent}A</span><span className="tot">{s.total}/{s.base}</span></div>
                      <div className={"lr-pct " + cls}>{s.pct}<i>%</i></div>
                    </div>
                  );
                })}
              </section>
            </div>
          )}

          {(nav === "report" || nav === "term") && (
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

.dash{--paper:#eceadf;--paper2:#e2dfd2;--surf:#f9f8f2;--surf2:#f0eee4;--line:rgba(18,42,36,.11);--line2:rgba(18,42,36,.19);--ink:#0f1f1a;--soft:#2b3d36;--dim:#556860;--faint:#8a968c;--accent:#0c8f7d;--accent2:#0a6f60;--accent-w:rgba(12,143,125,.11);--gold:#a3670f;--red:#bf4038;--ok:#188a4e;--console:#0d1714;--console-ink:#eaf1ec;
  --sans:var(--font-sans),Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;--mono:var(--font-mono),"SF Mono",ui-monospace,Menlo,Consolas,monospace;
  position:fixed;inset:0;overflow:hidden;background:var(--paper);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased}
.dash[data-dtheme="dark"]{--paper:#060b0a;--paper2:#0a100e;--surf:#0d1512;--surf2:#0a110f;--line:rgba(90,210,185,.13);--line2:rgba(90,210,185,.24);--ink:#e9f4ef;--soft:#bdccc5;--dim:#84958c;--faint:#57675f;--accent:#37e0c8;--accent2:#22c4ad;--accent-w:rgba(55,224,200,.1);--gold:#ffbe5c;--red:#ff6f66;--ok:#4fd18a;--console:#040807;--console-ink:#e9f4ef}
.dash *{box-sizing:border-box}
.dash button,.dash input,.dash select,.dash textarea{font-family:inherit}
.dash .lock{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--paper);z-index:50;overflow:hidden}
.dash .lock-grid{position:absolute;inset:0;background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:44px 44px;opacity:.5;mask-image:radial-gradient(120% 90% at 50% 45%,#000,transparent 78%);-webkit-mask-image:radial-gradient(120% 90% at 50% 45%,#000,transparent 78%)}
.dash .lock-glow{position:absolute;left:50%;top:38%;width:640px;height:640px;transform:translate(-50%,-50%);background:radial-gradient(circle,var(--accent-w),transparent 62%);pointer-events:none}
.dash .lock-inner{position:relative;display:flex;flex-direction:column;align-items:center;gap:16px}
.dash .lock-inner.shake{animation:sh .4s}
@keyframes sh{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}
.dash .lock-scope{position:relative;width:190px;height:190px;border-radius:50%;overflow:hidden;background:var(--console);border:1px solid var(--line2);box-shadow:0 0 0 8px color-mix(in srgb,var(--accent) 6%,transparent),0 30px 80px -30px var(--accent)}
.dash .lock-scope canvas{width:100%;height:100%;display:block}
.dash .lock-brand{display:flex;align-items:center;gap:12px;font-size:38px;font-weight:800;letter-spacing:.36em;margin:6px 0 0 .36em;color:var(--ink)}
.dash .lb-mark{color:var(--accent);font-size:22px;letter-spacing:0;filter:drop-shadow(0 0 10px var(--accent))}
.dash .lock-tag{font-family:var(--mono);font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:var(--faint)}
.dash .pinwrap{display:flex;gap:11px;margin-top:12px}
.dash .pin{width:52px;height:62px;text-align:center;font-size:22px;font-family:var(--mono);color:var(--ink);background:var(--surf);border:1px solid var(--line2);border-radius:11px;outline:none;transition:.15s}
.dash .pin.filled{border-color:var(--accent);background:var(--accent-w);box-shadow:0 0 18px -4px var(--accent)}
.dash .pin.bad{border-color:var(--red)}
.dash .pin:focus{border-color:var(--accent)}
.dash .lockmsg{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:10px;letter-spacing:.16em;color:var(--dim);text-transform:uppercase;margin-top:6px}
.dash .lm-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:blink 1.4s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
.dash .lockmsg.bad{color:var(--red)}
.dash .lockmsg.bad .lm-dot{background:var(--red)}
.dash .lock-foot{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 26px;border-top:1px solid var(--line);font-family:var(--mono);font-size:9px;letter-spacing:.14em;color:var(--faint);text-transform:uppercase;background:color-mix(in srgb,var(--surf) 60%,transparent)}
.dash .lf-l{display:flex;align-items:center;gap:8px}
.dash .lf-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px var(--accent)}
.dash .lf-c{color:var(--dim)}
@media(max-width:640px){.dash .lock-brand{font-size:30px}.dash .lf-r{display:none}}
.dash .shell{display:grid;grid-template-columns:224px 1fr;height:100%;width:100%;padding:0;margin:0}
.dash .rail{display:flex;flex-direction:column;background:var(--surf);border-right:1px solid var(--line);padding:20px 14px}
.dash .rail-brand{display:flex;align-items:center;gap:9px;color:var(--gold);text-decoration:none;font-weight:800;font-size:15px;letter-spacing:.16em}
.dash .rail-brand span{color:var(--ink)}
.dash .rail-sub{font-family:var(--mono);font-size:8.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);margin:4px 0 22px 2px}
.dash .rail-nav{display:flex;flex-direction:column;gap:3px}
.dash .rn{display:flex;align-items:center;gap:11px;text-align:left;font-size:13px;color:var(--dim);background:transparent;border:0;border-radius:9px;padding:10px 11px;cursor:pointer;position:relative;transition:.14s}
.dash .rn i{font-style:normal;font-size:13px;width:16px;text-align:center;color:var(--faint)}
.dash .rn:hover{color:var(--ink);background:var(--surf2)}
.dash .rn.on{color:var(--ink);background:var(--accent-w)}
.dash .rn.on i{color:var(--accent)}
.dash .rn.on:before{content:"";position:absolute;left:-14px;top:8px;bottom:8px;width:3px;border-radius:0 3px 3px 0;background:var(--accent)}
.dash .rail-foot{margin-top:auto;padding-top:18px;border-top:1px solid var(--line)}
.dash .rail-att{display:flex;flex-direction:column;gap:2px;padding:2px 4px 12px}
.dash .rail-att span{font-family:var(--mono);font-size:8px;letter-spacing:.16em;color:var(--faint)}
.dash .rail-att b{font-size:26px;font-weight:300;color:var(--ink);letter-spacing:-.01em}
.dash .rail-att b i{font-style:normal;font-size:13px;color:var(--faint);margin-left:1px}
.dash .rail-btns{display:flex;gap:8px}
.dash .rail-btns button{flex:1;font-size:14px;color:var(--dim);background:var(--surf2);border:1px solid var(--line);border-radius:8px;padding:8px;cursor:pointer}
.dash .rail-btns button:hover{color:var(--ink);border-color:var(--line2)}
.dash .main{overflow-y:auto;padding:0}
.dash .cmdbar{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:16px;height:64px;padding:0 30px;background:color-mix(in srgb,var(--paper) 84%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.dash .cb-title{display:flex;align-items:baseline;gap:12px}
.dash .cb-glyph{color:var(--accent);font-size:14px}
.dash .cb-title h1{font-size:17px;font-weight:600;letter-spacing:-.01em;margin:0}
.dash .cb-day{font-family:var(--mono);font-size:11px;color:var(--faint)}
.dash .cb-clock{margin-left:auto;text-align:right;font-family:var(--mono);line-height:1.15}
.dash .cb-clock b{font-size:14px;font-weight:500;letter-spacing:.04em;color:var(--ink)}
.dash .cb-clock span{display:block;font-size:8.5px;letter-spacing:.14em;color:var(--faint)}
.dash .body{padding:26px 34px 60px}
.dash .instr{display:grid;grid-template-columns:auto 1fr;gap:34px;align-items:center;background:var(--surf);border:1px solid var(--line);border-radius:14px;padding:24px 28px}
.dash .instr-lead{display:flex;align-items:flex-end;gap:14px}
.dash .big{font-size:74px;font-weight:200;line-height:.86;letter-spacing:-.03em;color:var(--ink)}
.dash .big i{font-style:normal;font-size:26px;font-weight:300;color:var(--faint);margin-left:2px}
.dash .big-l{font-family:var(--mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);padding-bottom:8px}
.dash .big-l b{color:var(--soft);font-size:12px;letter-spacing:.02em}
.dash .instr-tape{min-width:0}
.dash .tape{display:flex;height:12px;border-radius:7px;overflow:hidden;background:var(--surf2);border:1px solid var(--line)}
.dash .seg{display:block}
.dash .seg.pres{background:var(--accent)}
.dash .seg.od{background:color-mix(in srgb,var(--accent) 45%,var(--surf2))}
.dash .seg.abs{background:var(--red)}
.dash .ro-row{display:flex;margin-top:18px}
.dash .ro{flex:1;display:flex;flex-direction:column;gap:3px;padding:0 16px;border-left:1px solid var(--line)}
.dash .ro:first-child{padding-left:0;border-left:0}
.dash .ro span{font-family:var(--mono);font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
.dash .ro b{font-size:26px;font-weight:300;color:var(--ink);letter-spacing:-.01em}
.dash .ro.ok b{color:var(--ok)}
.dash .ro.bad b{color:var(--red)}
.dash .ro.teal b{color:var(--accent)}
.dash .grid2{display:grid;grid-template-columns:minmax(400px,480px) 1fr;gap:18px;margin-top:18px}
.dash .panel{background:var(--surf);border:1px solid var(--line);border-radius:14px;padding:20px}
.dash .p-h{display:flex;align-items:baseline;gap:11px;margin-bottom:16px}
.dash .p-k{font-family:var(--mono);font-size:8.5px;letter-spacing:.18em;color:var(--accent);border:1px solid var(--accent);border-radius:5px;padding:3px 6px}
.dash .p-h h2{font-size:14px;font-weight:600;margin:0;color:var(--ink)}
.dash .p-clear{margin-left:auto;font-family:var(--mono);font-size:10px;color:var(--faint);background:0;border:0;cursor:pointer;text-transform:uppercase;letter-spacing:.1em}
.dash .p-clear:hover{color:var(--red)}
.dash .fgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.dash .f{display:flex;flex-direction:column;gap:7px}
.dash .f.full{grid-column:1 / -1}
.dash label{font-family:var(--mono);font-size:8.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--faint)}
.dash input,.dash select,.dash textarea{width:100%;font-size:13px;color:var(--ink);background:var(--surf2);border:1px solid var(--line);border-radius:9px;padding:10px 11px;outline:none;transition:.14s}
.dash input:focus,.dash select:focus,.dash textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-w)}
.dash textarea{min-height:60px;resize:vertical}
.dash .namewrap{display:flex;flex-direction:column;gap:6px}
.dash .segpick{display:flex;gap:4px;flex-wrap:wrap}
.dash .segpick.two{gap:6px}
.dash .sp{flex:1;font-family:var(--mono);font-size:10px;letter-spacing:.04em;color:var(--dim);background:var(--surf2);border:1px solid var(--line);border-radius:8px;padding:9px 4px;cursor:pointer;min-width:44px;transition:.12s}
.dash .sp:hover{color:var(--ink);border-color:var(--line2)}
.dash .sp.on{color:#fff;background:var(--accent);border-color:var(--accent)}
.dash[data-dtheme="dark"] .sp.on{color:#04100e}
.dash .contact{display:flex;flex-wrap:wrap;gap:7px;margin:14px 0 0}
.dash .creg{font-family:var(--mono);font-size:10.5px;color:var(--accent);border:1px solid var(--line);border-radius:6px;padding:4px 8px}
.dash .cnum{font-family:var(--mono);font-size:10.5px;color:var(--dim);border:1px solid var(--line);border-radius:6px;padding:4px 8px}
.dash .btn{width:100%;font-size:13px;font-weight:600;color:#fff;background:var(--accent);border:0;border-radius:10px;padding:12px;cursor:pointer;margin-top:16px;display:flex;align-items:center;justify-content:center;gap:8px}
.dash[data-dtheme="dark"] .btn{color:#04100e}
.dash .btn:hover{background:var(--accent2)}
.dash .btn kbd{font-family:var(--mono);font-size:11px;opacity:.7;border:1px solid currentColor;border-radius:4px;padding:0 4px}
.dash .btn.line{background:transparent;color:var(--ink);border:1px solid var(--line2);margin-top:14px;display:inline-flex;width:auto;padding:10px 16px}
.dash .btn.line:hover{border-color:var(--accent);color:var(--accent);background:transparent}
.dash .manifest{display:flex;flex-direction:column}
.dash .empty{display:flex;align-items:center;gap:10px;font-family:var(--mono);font-size:11.5px;color:var(--faint);padding:18px 4px}
.dash .empty span{font-size:16px;color:var(--accent)}
.dash .mrow{display:flex;align-items:center;gap:12px;padding:11px 4px;border-top:1px solid var(--line)}
.dash .mrow:first-child{border-top:0}
.dash .mrow-i{font-family:var(--mono);font-size:11px;color:var(--faint);width:20px}
.dash .mrow-body{flex:1;min-width:0}
.dash .mrow-top{display:flex;align-items:baseline;gap:9px}
.dash .mrow-top b{font-size:13.5px;color:var(--ink)}
.dash .mreg{font-family:var(--mono);font-size:9.5px;color:var(--faint)}
.dash .mrow-sub{display:flex;align-items:center;gap:8px;margin-top:3px;flex-wrap:wrap}
.dash .mtag{font-family:var(--mono);font-size:8px;letter-spacing:.05em;padding:2px 6px;border-radius:4px;background:var(--surf2);border:1px solid var(--line);color:var(--soft)}
.dash .mtag.od{color:var(--accent);border-color:var(--accent)}
.dash .mtag.informed{color:var(--gold);border-color:color-mix(in srgb,var(--gold) 45%,transparent)}
.dash .mtag.unauthorized,.dash .mtag.susp{color:var(--red);border-color:color-mix(in srgb,var(--red) 45%,transparent)}
.dash .mtag.ok{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 45%,transparent)}
.dash .mreason{font-size:11px;color:var(--dim)}
.dash .mrow-x{width:24px;height:24px;border-radius:6px;border:1px solid transparent;background:0;color:var(--faint);cursor:pointer;font-size:11px}
.dash .mrow-x:hover{color:var(--red);border-color:var(--red)}
.dash .mrow.informed{--edge:var(--gold)}
.dash .mrow.od{--edge:var(--accent)}
.dash .mrow.unauthorized,.dash .mrow.susp{--edge:var(--red)}
.dash .p-foot{margin-top:16px;padding-top:14px;border-top:1px solid var(--line)}
.dash .lnk{font-family:var(--mono);font-size:10.5px;color:var(--dim);text-decoration:none}
.dash .lnk:hover{color:var(--accent)}
.dash .placeholder{max-width:560px}
.dash .placeholder p{font-size:13px;line-height:1.65;color:var(--dim);margin:0 0 4px}
.dash .sheetfoot{display:flex;flex-direction:column;gap:9px}
.dash .sf-row{display:flex;gap:8px;align-items:center}
.dash .btn.sm{width:auto;margin:0;padding:9px 12px;font-size:11.5px;border-radius:9px}
.dash .sf-gear{width:36px;height:36px;flex:none;border:1px solid var(--line);background:var(--surf2);border-radius:9px;color:var(--dim);cursor:pointer}
.dash .sf-gear.on{color:var(--accent);border-color:var(--accent)}
.dash .sf-set{display:flex;gap:8px}
.dash .sf-set input{flex:1}
.dash .sf-note{font-family:var(--mono);font-size:9.5px;letter-spacing:.02em;color:var(--faint);line-height:1.5}
.dash .sf-note a{color:var(--dim);text-decoration:none}
.dash .sf-note a:hover{color:var(--accent)}
.dash .live-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;background:var(--surf);border:1px solid var(--line);border-radius:12px;padding:12px 16px;margin-bottom:16px}
.dash .live-src{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11px;color:var(--dim)}
.dash .ls-dot{width:8px;height:8px;border-radius:50%;background:var(--faint)}
.dash .live-src.ok .ls-dot{background:var(--accent);box-shadow:0 0 8px var(--accent)}
.dash .live-src.loading .ls-dot{background:var(--gold)}
.dash .live-src.error .ls-dot{background:var(--red)}
.dash .live-sheet{width:auto;min-width:120px}
.dash .live-search{flex:1;min-width:150px}
.dash .live-sort{display:flex;gap:4px;background:var(--surf2);border:1px solid var(--line);border-radius:9px;padding:3px}
.dash .live-sort button{font-family:var(--mono);font-size:10px;color:var(--dim);background:0;border:0;border-radius:6px;padding:6px 10px;cursor:pointer}
.dash .live-sort button.on{color:#fff;background:var(--accent)}
.dash[data-dtheme="dark"] .live-sort button.on{color:#04100e}
.dash .live-refresh{width:38px;height:38px;flex:none;border:1px solid var(--line);background:var(--surf2);border-radius:9px;color:var(--dim);cursor:pointer;font-size:15px}
.dash .live-refresh:hover{color:var(--accent);border-color:var(--accent)}
.dash .instr.live-summary{display:flex;grid-template-columns:none;gap:0;padding:18px 24px;margin-bottom:16px}
.dash .instr.live-summary .ro{flex:1}
.dash .live-list{display:flex;flex-direction:column;background:var(--surf);border:1px solid var(--line);border-radius:12px;padding:8px 18px}
.dash .live-empty{font-family:var(--mono);font-size:11.5px;color:var(--faint);padding:20px 4px}
.dash .live-empty.err{color:var(--red)}
.dash .lr{display:grid;grid-template-columns:30px 1fr auto auto;align-items:center;gap:16px;padding:12px 4px;border-top:1px solid var(--line)}
.dash .lr:first-child{border-top:0}
.dash .lr-n{font-family:var(--mono);font-size:11px;color:var(--faint)}
.dash .lr-mid{min-width:0}
.dash .lr-name{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap}
.dash .lr-name b{font-size:13.5px;color:var(--ink)}
.dash .lr-reg{font-family:var(--mono);font-size:9.5px;color:var(--faint)}
.dash .lr-flag{font-family:var(--mono);font-size:8px;letter-spacing:.05em;color:var(--red);border:1px solid color-mix(in srgb,var(--red) 45%,transparent);border-radius:4px;padding:1px 5px}
.dash .lr-track{height:5px;border-radius:3px;background:var(--surf2);margin-top:7px;overflow:hidden;max-width:340px}
.dash .lr-track i{display:block;height:100%;border-radius:3px;background:var(--accent)}
.dash .lr-track i.mid{background:var(--gold)}
.dash .lr-track i.low{background:var(--red)}
.dash .lr-split{display:flex;gap:9px;font-family:var(--mono);font-size:10px;color:var(--dim)}
.dash .lr-split .p{color:var(--ok)}
.dash .lr-split .o{color:var(--accent)}
.dash .lr-split .a{color:var(--red)}
.dash .lr-split .tot{color:var(--faint)}
.dash .lr-pct{font-size:22px;font-weight:300;color:var(--ink);min-width:58px;text-align:right}
.dash .lr-pct i{font-style:normal;font-size:11px;color:var(--faint)}
.dash .lr-pct.low{color:var(--red)}
.dash .lr-pct.mid{color:var(--gold)}
.dash .lr.low{background:color-mix(in srgb,var(--red) 5%,transparent)}
@media(max-width:820px){
.dash .lr{grid-template-columns:24px 1fr auto;gap:10px}
.dash .lr-split{display:none}}
.dash .toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);background:var(--console);color:var(--console-ink);font-family:var(--mono);font-size:12px;padding:11px 18px;border-radius:10px;z-index:60;box-shadow:0 14px 40px -14px rgba(0,0,0,.5)}
@media(max-width:1000px){
.dash .grid2{grid-template-columns:1fr}
.dash .instr{grid-template-columns:1fr;gap:20px}
.dash .ro b{font-size:22px}}
@media(max-width:760px){
.dash .shell{grid-template-columns:1fr}
.dash .rail{flex-direction:row;align-items:center;height:auto;padding:10px 14px;overflow-x:auto}
.dash .rail-sub,.dash .rail-att{display:none}
.dash .rail-nav{flex-direction:row}
.dash .rn.on:before{display:none}
.dash .rail-foot{margin:0 0 0 auto;padding:0;border:0}
.dash .body{padding:18px}}

`;
