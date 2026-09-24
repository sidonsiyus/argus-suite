"use client";

// Professor console — attendance daily report: the copyable message and the
// MH COCKPIT daily-attendance-submission DOCX, ported from the legacy dashboard.
import { coarseStatus, CAT_BY_KEY } from "@/lib/attendance";

const pad2 = (n) => String(n).padStart(2, "0");

export const MH_DEFAULTS = {
  institution: "VISTAS",
  programme: "B.Sc Aeronautical Science",
  batch: "II Year - A",
  incharge: "SIDDARTH J",
  coordinator: "SIDDARTH J",
  submissionTime: "12:30 PM",
};

export function getMhForm() {
  try { return { ...MH_DEFAULTS, ...(JSON.parse(localStorage.getItem("mh_form") || "{}")) }; }
  catch { return { ...MH_DEFAULTS }; }
}
export function setMhForm(form) {
  try { localStorage.setItem("mh_form", JSON.stringify(form)); } catch { /* ignore */ }
}

// Counts from a day's entries map { student_id: { cat, reason, parent } }
// (a plain cat string is also accepted). Returns both conventions:
//  - message: present (plain, excl. OD) / od / absent (non-OD)
//  - MH doc: totalPresent (incl. OD) / totalAbsent (non-OD) + per-category counts
export function computeDayStats(roster, entriesMap) {
  const byCat = { present: 0, auth: 0, unauth: 0, groom: 0, od: 0, susp: 0 };
  const nonPresent = [], absentees = [];
  roster.forEach((r) => {
    const e = entriesMap[r.id];
    const cat = (typeof e === "string" ? e : e?.cat) || "present";
    byCat[cat] = (byCat[cat] || 0) + 1;
    if (cat === "present") return;
    const reason = (e && e.reason) || "";
    const parent = !!(e && e.parent);
    const rec = { ...r, cat, category: CAT_BY_KEY[cat]?.short || cat.toUpperCase(), reason, parent,
      remark: cat === "od" ? "On official duty (counted present)" : "" };
    nonPresent.push(rec);
    if (cat !== "od") absentees.push(rec);
  });
  const strength = roster.length;
  const od = byCat.od;
  const absent = byCat.auth + byCat.unauth + byCat.groom + byCat.susp; // non-OD
  const present = strength - od - absent;   // plain present (message convention)
  const totalPresent = strength - absent;   // MH convention (OD counted present)
  return { strength, byCat, od, absent, present, totalPresent, totalAbsent: absent, nonPresent, absentees };
}

// The copyable attendance message (legacy format).
export function attendanceMessage(day, stats, { programme } = {}) {
  const [y, m, d] = day.split("-");
  return [
    `Program Name:  ${programme || MH_DEFAULTS.programme}`,
    `• Date ${d}-${m}-${y}`,
    `• Student Strength: ${stats.strength}`,
    `• Present: ${pad2(stats.present)}`,
    `• OD (On Duty) : ${pad2(stats.od)}`,
    `• Absent: ${pad2(stats.absent)}`,
  ].join("\n");
}

function ddmonyyyy(day) {
  const [y, m, d] = day.split("-");
  return `${d}-${m}-${y}`;
}

// MH COCKPIT — Daily Attendance Submission Form (.docx).
function longDate(day) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// MH COCKPIT — Daily Attendance Submission Form (.docx), matching the exact
// 5-section template (A Submission Details, B Absent Students, C Totals, D
// Special Notes, E Sign-off). OD is counted as present.
export async function mhCockpitDocx(day, roster, entriesMap, form) {
  const stats = computeDayStats(roster, entriesMap);
  const f = { ...MH_DEFAULTS, ...(form || {}) };
  const docx = await import("docx");
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ShadingType, BorderStyle } = docx;
  const FONT = "Times New Roman", SZ = 24;
  const bd = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
  const borders = { top: bd, bottom: bd, left: bd, right: bd, insideHorizontal: bd, insideVertical: bd };
  const tr = (t, o = {}) => new TextRun({ text: String(t ?? ""), bold: !!o.b, italics: !!o.i, color: o.color || "000000", size: o.size || SZ, font: FONT });
  const cell = (runs, o = {}) => new TableCell({
    width: { size: o.w || 2000, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: "auto" } : undefined,
    children: [new Paragraph({ alignment: o.center ? AlignmentType.CENTER : AlignmentType.LEFT, children: Array.isArray(runs) ? runs : [runs] })],
  });
  const hcell = (t, w) => cell(tr(t, { b: true, color: "FFFFFF" }), { fill: "1F3864", w, center: true });
  const kvRow = (k1, v1, k2, v2) => new TableRow({ children: [
    cell(tr(k1, { b: true }), { fill: "D6E4F0", w: 2340 }), cell(tr(v1), { w: 2340 }),
    cell(tr(k2, { b: true }), { fill: "D6E4F0", w: 2340 }), cell(tr(v2), { w: 2340 }),
  ] });
  const H = (t) => new Paragraph({ spacing: { before: 260, after: 90 }, children: [tr(t, { b: true, color: "2E75B6" })] });
  const note = (t, color) => new Paragraph({ spacing: { after: 80 }, children: [tr(t, { color: color || "444444", size: 20 })] });
  const fullDate = longDate(day);

  // SECTION A
  const sectionA = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders, rows: [
    kvRow("Institution / College Name:", f.institution, "Date (DD/MM/YYYY):", fullDate),
    kvRow("Programme:", f.programme, "Year & Batch:", f.batch),
    kvRow("Class In Charge Name:", f.incharge, "Submission Time:", f.submissionTime),
    kvRow("Total Students on Roll:", String(stats.strength), "Total Present / Absent:", `${stats.totalPresent} / ${stats.totalAbsent}`),
  ] });

  // SECTION B — absent students (OD included, counted present)
  const bHeader = new TableRow({ tableHeader: true, children: [
    hcell("S.No", 700), hcell("Student Full Name", 3200), hcell("Absence Type", 1500),
    hcell("Reason for Absence", 3000), hcell("Parent Contacted? (Y/N)", 1500), hcell("Remarks / Additional Notes", 3000),
  ] });
  const bRows = stats.nonPresent.length
    ? stats.nonPresent.map((s, i) => new TableRow({ children: [
        cell(tr(i + 1), { center: true, w: 700 }), cell(tr(s.full_name), { w: 3200 }), cell(tr(s.category), { center: true, w: 1500 }),
        cell(tr(s.reason), { w: 3000 }), cell(tr(s.parent ? "Y" : "N"), { center: true, w: 1500 }), cell(tr(s.remark), { w: 3000 }),
      ] }))
    : [new TableRow({ children: [cell(tr("—", { color: "888888" }), { center: true, w: 700 }), cell(tr("No absentees — full attendance", { color: "888888" }), { w: 3200 }), cell(tr("")), cell(tr("")), cell(tr("")), cell(tr(""))] })];
  const sectionB = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders, rows: [bHeader, ...bRows] });

  // SECTION C — totals verification
  const c = stats.byCat;
  const sectionC = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders, rows: [
    new TableRow({ tableHeader: true, children: ["Total on Roll", "Total Present", "Total Absent", "AUTH", "UNAUTH", "GROOM", "OD", "SUSP"].map((t) => hcell(t, 1170)) }),
    new TableRow({ children: [stats.strength, stats.totalPresent, stats.totalAbsent, c.auth, c.unauth, c.groom, c.od, c.susp].map((v) => cell(tr(v), { center: true, w: 1170 })) }),
  ] });
  const check = stats.totalPresent + stats.totalAbsent === stats.strength;

  // SECTION D — special notes (blank rows)
  const sectionD = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders, rows: [
    new TableRow({ tableHeader: true, children: [hcell("S.No", 900), hcell("Note / Observation", 8400)] }),
    ...[1, 2, 3].map((n) => new TableRow({ children: [cell(tr(n), { center: true, w: 900 }), cell(tr(""), { w: 8400 })] })),
  ] });

  // SECTION E — coordinator sign-off
  const sectionE = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders, rows: [
    new TableRow({ tableHeader: true, children: [hcell("Coordinator Name", 3120), hcell("Signature", 3120), hcell("Date & Time of Submission", 3120)] }),
    new TableRow({ children: [cell(tr(f.coordinator), { center: true, w: 3120 }), cell(tr(f.coordinator), { center: true, w: 3120 }), cell(tr(`${fullDate}  ${f.submissionTime}`), { center: true, w: 3120 })] }),
  ] });

  const doc = new Document({ sections: [{ children: [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [tr("MH COCKPIT — DAILY ATTENDANCE SUBMISSION FORM", { b: true, size: 30 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [tr("For Class In Charges & CPL Instructors · Submit by 12:30 PM daily", { i: true, color: "555555", size: 20 })] }),
    H("SECTION A — SUBMISSION DETAILS"), sectionA,
    H("SECTION B — ABSENT STUDENTS"),
    note("Absence Type Codes:  AUTH = Authorized · UNAUTH = Unauthorized · GROOM = Grooming · OD = On Duty · SUSP = Suspended", "555555"),
    sectionB,
    H("SECTION C — TOTALS VERIFICATION"),
    note("Before submitting, check: Total Present + Total Absent = Total Students on Roll", "555555"),
    sectionC,
    new Paragraph({ spacing: { before: 80 }, children: [tr(check ? "✓ Present + Absent = Total on Roll" : "⚠ Totals do not add up — review before submitting", { color: check ? "1F8F56" : "C0463F" })] }),
    H("SECTION D — SPECIAL NOTES (If Any)"),
    note("For anything needing Quality Department attention — welfare concerns, suspension confirmations, multi-day absences, students mentioning leaving the programme, etc.", "555555"),
    sectionD,
    H("SECTION E — COORDINATOR SIGN-OFF"), sectionE,
  ] }] });

  const blob = await Packer.toBlob(doc);
  const cls = (f.batch || "class").replace(/[^A-Za-z0-9]+/g, "_");
  const [yy, mm, dd] = day.split("-");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `BSC_AERO_IIA ${dd}-${mm}-${String(yy).slice(2)}.docx`; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
