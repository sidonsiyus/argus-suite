"use client";

// Professor console — attendance daily report: the copyable message and the
// MH COCKPIT daily-attendance-submission DOCX, ported from the legacy dashboard.
import { isPresentish } from "@/lib/attendance";

const pad2 = (n) => String(n).padStart(2, "0");

export const MH_DEFAULTS = {
  institution: "MH Cockpit Aviation Academy",
  programme: "B.Sc Aeronautical Science",
  batch: "II Year - A",
  incharge: "Class Coordinator",
  coordinator: "Class Coordinator",
};

export function getMhForm() {
  try { return { ...MH_DEFAULTS, ...(JSON.parse(localStorage.getItem("mh_form") || "{}")) }; }
  catch { return { ...MH_DEFAULTS }; }
}
export function setMhForm(form) {
  try { localStorage.setItem("mh_form", JSON.stringify(form)); } catch { /* ignore */ }
}

// Counts from a day's status map. Late counts as present (matches legacy P/A/OD).
export function computeDayStats(roster, statusMap) {
  let present = 0, od = 0, absent = 0;
  const absentees = [];
  roster.forEach((r) => {
    const st = statusMap[r.id] || "present";
    if (st === "od") od++;
    else if (st === "absent") { absent++; absentees.push({ ...r, status: "absent" }); }
    else present++; // present or late
  });
  return { strength: roster.length, present, od, absent, absentees };
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
export async function mhCockpitDocx(day, roster, statusMap, form) {
  const stats = computeDayStats(roster, statusMap);
  const f = { ...MH_DEFAULTS, ...(form || {}) };
  const docx = await import("docx");
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ShadingType, BorderStyle, HeadingLevel } = docx;
  const FONT = "Times New Roman", SZ = 24;
  const bd = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
  const borders = { top: bd, bottom: bd, left: bd, right: bd, insideHorizontal: bd, insideVertical: bd };
  const tr = (t, o = {}) => new TextRun({ text: String(t ?? ""), bold: !!o.b, color: o.color || "000000", size: o.size || SZ, font: FONT });
  const cell = (runs, o = {}) => new TableCell({
    width: { size: o.w || 2000, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: "auto" } : undefined,
    children: [new Paragraph({ alignment: o.center ? AlignmentType.CENTER : AlignmentType.LEFT, children: Array.isArray(runs) ? runs : [runs] })],
  });
  const hcell = (t, w) => cell(tr(t, { b: true, color: "FFFFFF" }), { fill: "1F3864", w, center: true });
  const kv = (k, v) => new TableRow({ children: [cell(tr(k, { b: true }), { fill: "D6E4F0", w: 2600 }), cell(tr(v), { w: 6400 })] });

  const infoTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders, rows: [
    kv("Institution / College", f.institution),
    kv("Programme", f.programme),
    kv("Year & Batch", f.batch),
    kv("Date", ddmonyyyy(day)),
    kv("Class In Charge", f.incharge),
    kv("Coordinator (sign-off)", f.coordinator),
  ] });

  const summaryTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders, rows: [
    new TableRow({ tableHeader: true, children: [hcell("Student Strength", 2600), hcell("Present", 2200), hcell("OD (On Duty)", 2200), hcell("Absent", 2200)] }),
    new TableRow({ children: [cell(tr(stats.strength), { center: true, w: 2600 }), cell(tr(stats.present), { center: true, w: 2200 }), cell(tr(stats.od), { center: true, w: 2200 }), cell(tr(stats.absent), { center: true, w: 2200 })] }),
  ] });

  const absRows = stats.absentees.length
    ? stats.absentees.map((s, i) => new TableRow({ children: [
        cell(tr(i + 1), { center: true, w: 900 }), cell(tr(s.full_name), { w: 5200 }), cell(tr(s.reg_no), { center: true, w: 3000 }),
      ] }))
    : [new TableRow({ children: [cell(tr("—", { color: "888888" }), { center: true, w: 900 }), cell(tr("No absentees", { color: "888888" }), { w: 5200 }), cell(tr(""), { w: 3000 })] })];
  const absTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders, rows: [
    new TableRow({ tableHeader: true, children: [hcell("S.No", 900), hcell("Name of Absentee", 5200), hcell("Register Number", 3000)] }),
    ...absRows,
  ] });

  const H = (t) => new Paragraph({ spacing: { before: 240, after: 90 }, children: [tr(t, { b: true, color: "2E75B6" })] });
  const doc = new Document({ sections: [{ children: [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [tr("MH COCKPIT — DAILY ATTENDANCE SUBMISSION FORM", { b: true, size: 30 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [tr(f.institution, { color: "555555" })] }),
    H("Class Details"), infoTable,
    H("Attendance Summary"), summaryTable,
    H("Absentees"), absTable,
    new Paragraph({ spacing: { before: 300 }, children: [tr(`Submitted by: ${f.coordinator}`, { b: true })] }),
    new Paragraph({ children: [tr(`Generated ${new Date().toLocaleString()}`, { color: "888888", size: 18 })] }),
  ] }] });

  const blob = await Packer.toBlob(doc);
  const cls = (f.batch || "class").replace(/[^A-Za-z0-9]+/g, "_");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `MH_COCKPIT_${cls}_${day}.docx`; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
