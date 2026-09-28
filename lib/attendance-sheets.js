"use client";

// Professor console — Google Sheets push (P5e), wired to the same writer
// endpoint the legacy dashboard uses. The writer URL + secret are read from the
// existing localStorage keys (argus_writer_url / argus_writer_secret), so a
// sheet you already connected keeps working with no re-setup.

const MON3 = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// The Google-Sheet writer worker from the legacy dashboard, ingested as the
// default so the push works out of the box (only the secret need be supplied).
export const LIVE_WORKER = "https://argus-attend.jhrishi7.workers.dev/";

// Matches the legacy tab naming exactly: "Daily Attendance for SEP-25".
export function sheetNameForDate(iso) {
  const [y, m] = iso.split("-").map(Number);
  return "Daily Attendance for " + MON3[m - 1] + "-" + String(y).slice(2);
}

export function getWriter() {
  try {
    return {
      url: (localStorage.getItem("argus_writer_url") || LIVE_WORKER).trim(),
      secret: (localStorage.getItem("argus_writer_secret") || "").trim(),
    };
  } catch { return { url: LIVE_WORKER, secret: "" }; }
}
export function setWriter(url, secret) {
  try {
    localStorage.setItem("argus_writer_url", (url || "").trim());
    localStorage.setItem("argus_writer_secret", (secret || "").trim());
  } catch { /* storage may be full/blocked */ }
}
export function writerConnected() {
  const w = getWriter();
  return !!(w.url && w.secret);
}

// present/late → P, od → OD, absent → A (legacy sheet has no 'late' column).
export function markLetter(status) {
  return status === "od" ? "OD" : status === "absent" ? "A" : "P";
}

export async function pushToSheet(day, roster, statusMap, { dryRun = false } = {}) {
  const { url, secret } = getWriter();
  if (!url || !secret) throw new Error("Connect the Google Sheet first — add the writer URL and secret in Settings.");
  const marks = roster.map((r) => ({ reg: String(r.reg_no), mark: markLetter(statusMap[r.id] || "present") }));
  const present = marks.filter((m) => m.mark === "P").length;
  const od = marks.filter((m) => m.mark === "OD").length;
  const absent = marks.filter((m) => m.mark === "A").length;
  const body = JSON.stringify({ secret, sheetName: sheetNameForDate(day), date: day, dryRun: !!dryRun, marks });
  const r = await fetch(url.replace(/\/$/, ""), {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // text/plain avoids CORS preflight (Apps Script)
    body,
  });
  const j = await r.json().catch(() => ({ ok: false, error: "Unexpected response from the sheet writer." }));
  if (!j.ok) throw new Error(j.error || "Sheet write failed.");
  return { ...j, present, absent, od, count: marks.length, sheetName: sheetNameForDate(day) };
}

// ── read: live attendance from the department Google Sheet (via the worker) ──
// The same worker the legacy dashboard reads: a plain CORS GET, no secret.
//   GET /            → current month
//   GET /?sheet=NAME → one month tab
//   GET /?all=1      → every month summed, day 1 → last marked date
function readerUrl() {
  return (getWriter().url || LIVE_WORKER).replace(/\/$/, "");
}
function normalizeLiveStudents(students) {
  return (Array.isArray(students) ? students : []).map((s) => {
    const present = +s.present || 0, od = +s.od || 0, absent = +s.absent || 0;
    const held = s.held != null ? +s.held : present + absent + od;
    const total = s.total != null ? +s.total : present + od;
    const pct = s.pct != null ? +s.pct : (held ? Math.round((total / held) * 1000) / 10 : 0);
    return { name: s.name, reg: s.reg, sno: s.sno, present, od, absent, held, total, pct };
  });
}

// Every month combined — each student's overall % since day 1.
export async function fetchLiveAll() {
  const r = await fetch(readerUrl() + "/?all=1", { cache: "no-store" });
  const j = await r.json().catch(() => ({ error: "Unexpected response from the sheet reader." }));
  if (j?.error) throw new Error(j.error + (j.detail ? " — " + j.detail : ""));
  return {
    students: normalizeLiveStudents(j.students),
    months: j.months || (j.sheetsUsed || []).length || 1,
    sheets: j.sheetsUsed || [],
    lastDate: j.lastDate || "",
    updated: j.updated || "",
  };
}

// One month tab (or the current month when sheet is omitted).
export async function fetchLiveMonth(sheet) {
  const q = sheet ? "/?sheet=" + encodeURIComponent(sheet) : "/";
  const r = await fetch(readerUrl() + q, { cache: "no-store" });
  const j = await r.json().catch(() => ({ error: "Unexpected response from the sheet reader." }));
  if (j?.error) throw new Error(j.error + (j.detail ? " — " + j.detail : ""));
  return {
    students: normalizeLiveStudents(j.students),
    availableSheets: (j.availableSheets || []).filter((n) => /attendance/i.test(n)),
    sheet: j.sheet || sheet || "",
    updated: j.updated || "",
    nDays: j.nDays, periods: j.periods, base: j.base,
  };
}

// ── WhatsApp defaulter notices ──
export function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return "91" + digits;      // India default, matches legacy wa.me/91
  return digits;
}
export function defaulterMessage(student, { threshold = 75, from, to } = {}) {
  return (
    `Dear ${student.full_name}, your attendance (${from || ""} to ${to || ""}) is ${student.pct}% ` +
    `(${student.present}/${student.marked}), below the required ${threshold}%. Please improve it and meet the faculty. — AERO-2025-28`
  );
}
export function whatsappLink(student, opts) {
  const phone = normalizePhone(student.phone);
  const text = encodeURIComponent(defaulterMessage(student, opts));
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
}
