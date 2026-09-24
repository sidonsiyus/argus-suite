"use client";

// Professor console — attendance exports (P5d): CSV, DOCX (monthly register +
// defaulter letters), print-to-PDF, and a PNG of the distribution chart.
// docx is dynamically imported so it doesn't bloat the initial bundle.
import { STATUS_LABEL } from "@/lib/attendance";

const LETTER = { present: "P", absent: "A", late: "L", od: "OD" };

export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a);
  a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function csvCell(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Pivot records → { days:[...], matrix:{ [studentId]: { [day]: status } } }
export function pivot(records) {
  const days = [...new Set(records.map((r) => r.day))].sort();
  const matrix = {};
  records.forEach((r) => { (matrix[r.student_id] ||= {})[r.day] = r.status; });
  return { days, matrix };
}

function rollup(roster, records) {
  const agg = {};
  records.forEach((r) => {
    const a = (agg[r.student_id] ||= { marked: 0, present: 0 });
    a.marked++; if (r.status !== "absent") a.present++;
  });
  return roster.map((s) => {
    const a = agg[s.id] || { marked: 0, present: 0 };
    const pct = a.marked ? Math.round((a.present / a.marked) * 100) : null;
    return { ...s, present: a.present, marked: a.marked, pct };
  });
}

// ── CSV: full register matrix ──
export function registerCSV(roster, records, { from, to } = {}) {
  const { days, matrix } = pivot(records);
  const head = ["S.No", "Name", "Reg No", ...days, "Present", "Marked", "%"];
  const lines = [head.map(csvCell).join(",")];
  rollup(roster, records).forEach((s) => {
    const cells = [s.sno, s.full_name, s.reg_no];
    days.forEach((d) => cells.push(matrix[s.id]?.[d] ? LETTER[matrix[s.id][d]] : ""));
    cells.push(s.present, s.marked, s.pct == null ? "" : s.pct);
    lines.push(cells.map(csvCell).join(","));
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  downloadBlob(`attendance_${from || "range"}_${to || ""}.csv`, blob);
}

// ── DOCX: monthly register ──
export async function registerDocx(roster, records, { from, to, title = "Attendance Register" } = {}) {
  const docx = await import("docx");
  const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, AlignmentType } = docx;
  const { days, matrix } = pivot(records);
  const rolled = rollup(roster, records);

  const hcell = (t) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 16 })] })] });
  const cell = (t) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(t ?? ""), size: 16 })], alignment: AlignmentType.CENTER })] });

  const header = new TableRow({ tableHeader: true, children: [hcell("#"), hcell("Name"), ...days.map((d) => hcell(d.slice(5))), hcell("P"), hcell("Tot"), hcell("%")] });
  const rows = rolled.map((s) =>
    new TableRow({ children: [cell(s.sno), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.full_name, size: 16 })] })] }),
      ...days.map((d) => cell(matrix[s.id]?.[d] ? LETTER[matrix[s.id][d]] : "·")), cell(s.present), cell(s.marked), cell(s.pct == null ? "" : s.pct + "%")] })
  );

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ children: [new TextRun({ text: `Cohort AERO-2025-28 · ${from || ""} to ${to || ""}`, italics: true, size: 18 })] }),
        new Paragraph({ children: [new TextRun({ text: "P present · A absent · L late · OD on-duty", size: 16, color: "888888" })] }),
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [header, ...rows] }),
      ],
    }],
  });
  const blob = await Packer.toBlob(doc);
  downloadBlob(`attendance_register_${from || "range"}.docx`, blob);
}

// ── DOCX: defaulter letters (one per student below threshold) ──
export async function defaulterLettersDocx(defaulters, { threshold = 75, from, to } = {}) {
  const docx = await import("docx");
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;
  const today = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

  const children = [];
  defaulters.forEach((s, i) => {
    if (i > 0) children.push(new Paragraph({ children: [new TextRun({ text: "", break: 1 })], pageBreakBefore: true }));
    children.push(
      new Paragraph({ text: "Shortage of Attendance — Notice", heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ children: [new TextRun({ text: today, size: 18 })], alignment: AlignmentType.RIGHT }),
      new Paragraph({ children: [new TextRun({ text: `To: ${s.full_name} (${s.reg_no})`, bold: true, size: 20 })] }),
      new Paragraph({ children: [new TextRun({ text: "Cohort: B.Sc Aviation — AERO-2025-28", size: 18 })] }),
      new Paragraph({ children: [new TextRun({ text: "", size: 8 })] }),
      new Paragraph({ children: [new TextRun({ text:
        `This is to formally notify you that your attendance for the period ${from || ""} to ${to || ""} stands at ` +
        `${s.pct}% (${s.present} of ${s.marked} sessions), which is below the required minimum of ${threshold}%.`, size: 20 })] }),
      new Paragraph({ children: [new TextRun({ text:
        "You are advised to improve your attendance immediately. Continued shortage may result in your being detained from " +
        "examinations as per institutional regulations. Please meet the undersigned to explain the reasons for your absence.", size: 20 })] }),
      new Paragraph({ children: [new TextRun({ text: "", size: 12 })] }),
      new Paragraph({ children: [new TextRun({ text: "Faculty in-charge", size: 20 })] }),
    );
  });
  const doc = new Document({ sections: [{ children: children.length ? children : [new Paragraph("No defaulters in this range.")] }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(`defaulter_letters_${from || "range"}.docx`, blob);
}

// ── Print-to-PDF: opens a print-styled register in a new window ──
export function printRegister(roster, records, { from, to } = {}) {
  const { days, matrix } = pivot(records);
  const rolled = rollup(roster, records);
  const th = ["#", "Name", "Reg", ...days.map((d) => d.slice(5)), "P", "Tot", "%"];
  const rows = rolled.map((s) =>
    `<tr><td>${s.sno}</td><td class="l">${s.full_name}</td><td>${s.reg_no}</td>` +
    days.map((d) => `<td>${matrix[s.id]?.[d] ? LETTER[matrix[s.id][d]] : "·"}</td>`).join("") +
    `<td>${s.present}</td><td>${s.marked}</td><td>${s.pct == null ? "" : s.pct + "%"}</td></tr>`
  ).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Attendance Register</title>
    <style>body{font-family:Arial,sans-serif;margin:24px;color:#111}h1{font-size:18px;margin:0 0 4px}
    .sub{color:#666;font-size:12px;margin-bottom:14px}table{border-collapse:collapse;width:100%;font-size:10px}
    th,td{border:1px solid #ccc;padding:3px 5px;text-align:center}td.l{text-align:left;white-space:nowrap}
    thead{background:#f0f0f0}@media print{@page{size:landscape;margin:12mm}}</style></head>
    <body><h1>Attendance Register — AERO-2025-28</h1><div class="sub">${from || ""} to ${to || ""} · P present · A absent · L late · OD on-duty</div>
    <table><thead><tr>${th.map((t) => `<th>${t}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>
    <script>window.onload=()=>{window.print()}</script></body></html>`;
  const w = window.open("", "_blank");
  if (!w) { alert("Allow pop-ups to print the register."); return; }
  w.document.write(html); w.document.close();
}

// ── PNG: distribution chart ──
export function distributionPng(buckets, { from, to } = {}) {
  const W = 640, H = 360, pad = 46;
  const max = Math.max(1, ...buckets.map((b) => b.n));
  const bw = (W - pad * 2) / buckets.length;
  const bars = buckets.map((b, i) => {
    const h = (b.n / max) * (H - pad * 2);
    const x = pad + i * bw + bw * 0.16, y = H - pad - h, w = bw * 0.68;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#0e8f80"/>` +
      `<text x="${x + w / 2}" y="${y - 6}" font-size="13" fill="#333" text-anchor="middle">${b.n}</text>` +
      `<text x="${x + w / 2}" y="${H - pad + 16}" font-size="11" fill="#666" text-anchor="middle">${b.l}</text>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>` +
    `<text x="${pad}" y="26" font-size="15" fill="#111" font-family="Arial">Attendance distribution — ${from || ""} to ${to || ""}</text>` +
    `<line x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" stroke="#ccc"/>${bars}</svg>`;
  const img = new Image();
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  img.onload = () => {
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    c.getContext("2d").drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    c.toBlob((b) => b && downloadBlob(`attendance_chart_${from || "range"}.png`, b), "image/png");
  };
  img.src = url;
}
