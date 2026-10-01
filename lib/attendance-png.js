"use client";

/*
 * A shareable PNG of the class attendance — one poster-style image listing every
 * student with attended/recorded periods and a colour-coded percentage, for
 * posting to the class group. Drawn straight onto a canvas (no chart library).
 * Used for both the all-time ("since day 1") and the single-month views.
 */
import { downloadBlob } from "@/lib/attendance-export";

const W = 1400;           // logical width (rendered at 2x for sharpness)
const PAD = 56;
const GAP = 44;
const ROW_H = 44;

const C = {
  ink: "#0f172a", sub: "#475569", muted: "#8693a6", line: "#e5e9f0", stripe: "#f5f7fa", track: "#e6eaf1",
  green: "#17935a", amber: "#d98a0b", red: "#d0393b",
  head1: "#0b1324", head2: "#16294a", accent: "#5eead4", headSub: "#a9b8d0",
};

function tone(pct, thr) {
  if (pct == null) return C.muted;
  if (pct >= thr) return C.green;
  if (pct >= thr - 10) return C.amber;
  return C.red;
}
const fmtPct = (p) => (p == null ? "—" : p.toFixed(1) + "%");

function fit(ctx, text, maxW) {
  const t = String(text ?? "");
  if (ctx.measureText(t).width <= maxW) return t;
  let s = t;
  while (s.length > 1 && ctx.measureText(s + "…").width > maxW) s = s.slice(0, -1);
  return s.trimEnd() + "…";
}

// Draw `text` at the largest of `sizes` that fits maxW; ellipsize only as a last resort.
function fitText(ctx, text, family, weight, sizes, maxW) {
  for (const px of sizes) {
    ctx.font = `${weight} ${px}px ${family}`;
    if (ctx.measureText(text).width <= maxW) return text;
  }
  return fit(ctx, text, maxW); // ctx.font is left at the smallest size
}

function pill(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
}

/**
 * opts: {
 *   title, subtitle, eyebrow?,
 *   students: [{ sno, name, total, held, pct }]   // already in the order to print
 *   threshold = 75,
 *   stats?: [[label, value], …]                    // small blocks under the header
 *   basisNote?, generatedLabel?
 * }
 * Resolves to a PNG Blob.
 */
export async function renderAttendancePng(opts) {
  const { title, subtitle = "", eyebrow = "CLASS ATTENDANCE", students = [], threshold = 75, stats = [], basisNote = "", generatedLabel = "" } = opts;
  if (!students.length) throw new Error("There's no attendance data to put in the image.");
  try { await document.fonts?.ready; } catch { /* fonts API unavailable */ }

  const family = (typeof getComputedStyle === "function" && getComputedStyle(document.body).fontFamily) || "system-ui, sans-serif";
  const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

  const scored = students.filter((s) => s.pct != null && s.held > 0);
  const totAtt = scored.reduce((n, s) => n + s.total, 0);
  const totHeld = scored.reduce((n, s) => n + s.held, 0);
  const overall = totHeld ? Math.round((totAtt / totHeld) * 1000) / 10 : null;

  const perCol = Math.ceil(students.length / 2);
  const headH = 232, statsH = stats.length ? 92 : 20, legendH = 56, tableHeadH = 40, footH = 92;
  const H = headH + statsH + legendH + tableHeadH + perCol * ROW_H + footH;
  const scale = 2;

  const canvas = document.createElement("canvas");
  canvas.width = W * scale; canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.textBaseline = "alphabetic";

  // page
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);

  // header band
  const g = ctx.createLinearGradient(0, 0, W, headH);
  g.addColorStop(0, C.head1); g.addColorStop(1, C.head2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, headH);
  ctx.fillStyle = C.accent; ctx.fillRect(0, headH - 5, W, 5);

  ctx.fillStyle = C.accent; ctx.font = `700 15px ${family}`;
  ctx.letterSpacing = "3px"; ctx.fillText(eyebrow, PAD, 64); ctx.letterSpacing = "0px";
  ctx.fillStyle = "#ffffff"; ctx.font = `800 46px ${family}`;
  ctx.fillText(fit(ctx, title, W - PAD * 2 - 330), PAD, 122);
  ctx.fillStyle = C.headSub; ctx.font = `500 20px ${family}`;
  ctx.fillText(fit(ctx, subtitle, W - PAD * 2 - 330), PAD, 160);

  // big overall figure (right)
  ctx.textAlign = "right";
  ctx.fillStyle = "#ffffff"; ctx.font = `800 84px ${family}`;
  ctx.fillText(fmtPct(overall), W - PAD, 128);
  ctx.fillStyle = C.headSub; ctx.font = `600 16px ${family}`;
  ctx.letterSpacing = "2px"; ctx.fillText("CLASS OVERALL", W - PAD, 160); ctx.letterSpacing = "0px";
  ctx.textAlign = "left";

  // stat blocks
  let y = headH;
  if (stats.length) {
    const bw = (W - PAD * 2 - GAP * (stats.length - 1)) / stats.length;
    stats.forEach(([label, value], i) => {
      const x = PAD + i * (bw + GAP);
      ctx.fillStyle = C.ink;
      ctx.fillText(fitText(ctx, String(value), family, 800, [30, 26, 23, 20], bw - 8), x, y + 52);
      ctx.fillStyle = C.muted; ctx.font = `600 13px ${family}`; ctx.letterSpacing = "1.5px";
      ctx.fillText(String(label).toUpperCase(), x, y + 74); ctx.letterSpacing = "0px";
    });
  }
  y += statsH;

  // legend
  const legend = [[C.green, `${threshold}% and above`], [C.amber, `${threshold - 10}–${threshold - 1}%`], [C.red, `below ${threshold - 10}%`]];
  let lx = PAD;
  ctx.font = `600 15px ${family}`;
  legend.forEach(([col, label]) => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(lx + 7, y + 22, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.sub; ctx.fillText(label, lx + 22, y + 28);
    lx += 22 + ctx.measureText(label).width + 34;
  });
  y += legendH;

  // table (two columns, filled top-to-bottom)
  const colW = (W - PAD * 2 - GAP) / 2;
  for (let c = 0; c < 2; c++) {
    const x0 = PAD + c * (colW + GAP);
    ctx.fillStyle = C.muted; ctx.font = `700 12px ${family}`; ctx.letterSpacing = "1.5px";
    ctx.fillText("#", x0, y + 24);
    ctx.fillText("STUDENT", x0 + 44, y + 24);
    ctx.textAlign = "right";
    ctx.fillText("ATTENDED", x0 + 392, y + 24);
    ctx.fillText("%", x0 + colW, y + 24);
    ctx.textAlign = "left"; ctx.letterSpacing = "0px";
    ctx.fillStyle = C.line; ctx.fillRect(x0, y + tableHeadH - 4, colW, 2);
  }
  y += tableHeadH;

  students.forEach((s, i) => {
    const c = i < perCol ? 0 : 1, r = c === 0 ? i : i - perCol;
    const x0 = PAD + c * (colW + GAP), ry = y + r * ROW_H;
    if (r % 2 === 0) { ctx.fillStyle = C.stripe; ctx.fillRect(x0 - 10, ry, colW + 20, ROW_H); }
    const mid = ry + ROW_H / 2;
    const col = tone(s.pct, threshold);

    ctx.fillStyle = C.muted; ctx.font = `600 15px ${mono}`;
    ctx.fillText(String(s.sno ?? i + 1), x0, mid + 5);

    ctx.fillStyle = C.ink;
    ctx.fillText(fitText(ctx, s.name, family, 600, [18, 17, 16, 15], 276), x0 + 44, mid + 6);

    ctx.fillStyle = C.sub; ctx.font = `500 14px ${mono}`; ctx.textAlign = "right";
    ctx.fillText(s.held > 0 ? `${s.total}/${s.held}` : "—", x0 + 392, mid + 5);

    // bar
    const bx = x0 + 410, bw = colW - 410 - 84;
    pill(ctx, bx, mid - 5, bw, 10, 5, C.track);
    if (s.pct != null) pill(ctx, bx, mid - 5, Math.max(10, bw * Math.min(100, s.pct) / 100), 10, 5, col);

    ctx.fillStyle = col; ctx.font = `800 19px ${family}`;
    ctx.fillText(fmtPct(s.pct), x0 + colW, mid + 7);
    ctx.textAlign = "left";
  });

  // footer
  const fy = H - footH + 28;
  ctx.fillStyle = C.line; ctx.fillRect(PAD, fy - 16, W - PAD * 2, 2);
  ctx.fillStyle = C.sub; ctx.font = `500 14px ${family}`;
  if (basisNote) ctx.fillText(fit(ctx, basisNote, W - PAD * 2), PAD, fy + 14);
  ctx.fillStyle = C.muted; ctx.font = `500 13px ${family}`;
  if (generatedLabel) ctx.fillText(fit(ctx, generatedLabel, W - PAD * 2), PAD, fy + 40);

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not create the image."))), "image/png");
  });
}

export async function downloadAttendancePng(filename, opts) {
  const blob = await renderAttendancePng(opts);
  downloadBlob(filename, blob);
  return blob;
}
