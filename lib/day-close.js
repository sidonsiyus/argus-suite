"use client";

/*
 * Day close — the end-of-day routine in one flow:
 *   1. push the day to the Google Sheet
 *   2. email the absentees
 *   3. email the attendance digest to the coordinator
 *   4. tick "Send today's attendance report message" on the checklist
 *   5. lock the day so it can't drift from what was sent
 * Every step is optional and independent (one failing never blocks the others,
 * except ticking the checklist, which needs the digest to have gone out). What ran
 * is remembered per day so a second run warns instead of double-emailing.
 */
import { getRoster, getDayRecords, getDayMeta, setDayLocked, coarseStatus } from "@/lib/attendance";
import { pushToSheet, writerConnected, sheetNameForDate } from "@/lib/attendance-sheets";
import { computeDayStats, attendanceMessage, getMhForm } from "@/lib/attendance-report";
import { sendBulkEmails, sendEmail, fetchCoordinatorMail } from "@/lib/coordinator-mail";
import { getTasks, setFixedDone, fixedTasks } from "@/lib/tasks";
import { buildAbsenteeItems } from "@/lib/absentee-mail";
import { prettyDay } from "@/lib/professor";

const RUN_KEY = (day) => `dayclose_v1_${day}`;
const DONE_STATUSES = new Set(["done"]);

export function readRunRecord(day) {
  try { return JSON.parse(localStorage.getItem(RUN_KEY(day)) || "null"); } catch { return null; }
}
function writeRunRecord(day, rec) {
  try { localStorage.setItem(RUN_KEY(day), JSON.stringify(rec)); } catch { /* storage unavailable */ }
}

const pad2 = (n) => String(n).padStart(2, "0");
const ddmmyyyy = (day) => { const [y, m, d] = day.split("-"); return `${d}-${m}-${y}`; };

// The coordinator email: today's attendance in the usual format, plus who was
// absent (with category and reason) and who was on duty.
export function digestEmail({ day, roster, recs, form = {} }) {
  const stats = computeDayStats(roster, recs);
  const lines = [attendanceMessage(day, stats, { programme: form.programme })];

  if (stats.absentees.length) {
    lines.push("", `Absent (${pad2(stats.absentees.length)}):`);
    stats.absentees.forEach((a) => lines.push(`  • ${a.full_name} — ${a.category}${a.reason ? ` — ${a.reason}` : ""}`));
  } else {
    lines.push("", "No absentees today.");
  }
  const od = stats.nonPresent.filter((a) => a.cat === "od");
  if (od.length) {
    lines.push("", `On duty (${pad2(od.length)}):`);
    od.forEach((a) => lines.push(`  • ${a.full_name}${a.reason ? ` — ${a.reason}` : ""}`));
  }
  return {
    subject: `Attendance — ${ddmmyyyy(day)}${form.programme ? ` · ${form.programme}` : ""}`,
    text: lines.join("\n"),
    stats,
  };
}

// Everything the dialog needs to show for a day, and which steps are possible.
export async function loadDayCloseState(day) {
  const [roster, recs, meta] = await Promise.all([getRoster(), getDayRecords(day), getDayMeta(day).catch(() => null)]);

  // Mark-day saves a row for every student (present by default), so "any rows" = the day was saved.
  const saved = Object.keys(recs).length > 0;
  const form = getMhForm();

  let coordinator = null, mailConfigured = false;
  try {
    const d = await fetchCoordinatorMail();
    mailConfigured = d.configured !== false && !d.error;
    coordinator = d.coordinator || null;
  } catch { /* mail unreachable → mail steps unavailable */ }

  let digestAlreadyTicked = false;
  try {
    const rows = await getTasks(day);
    digestAlreadyTicked = !!rows.find((r) => r.fixed_key === "attendance_msg")?.done;
  } catch { /* tasks table missing → can't tick, not fatal */ }

  return {
    day, dayLabel: prettyDay(day), roster, recs, form, saved,
    locked: !!meta?.locked,
    stats: computeDayStats(roster, recs),
    mailConfigured, coordinator,
    sheetReady: writerConnected(),
    sheetName: sheetNameForDate(day),
    digestAlreadyTicked,
    previous: readRunRecord(day),
  };
}

// Run the chosen steps. `pick` = { sheet, absentees, digest, tick, lock }, `cats` = absentee categories.
// `onStep(key, patch)` streams progress. Returns { results, at }.
export async function runDayClose({ state, pick, cats, onStep = () => {} }) {
  const { day, roster, recs, form } = state;
  const results = {};
  const set = (key, patch) => { results[key] = { ...(results[key] || {}), ...patch }; onStep(key, results[key]); };
  const skip = (key, why) => set(key, { status: "skipped", detail: why });

  // 1) Google Sheet
  if (!pick.sheet) skip("sheet", "not selected");
  else {
    set("sheet", { status: "running" });
    try {
      const statusMap = {};
      roster.forEach((r) => { statusMap[r.id] = coarseStatus(recs[r.id]?.cat || "present"); });
      const res = await pushToSheet(day, roster, statusMap);
      set("sheet", { status: "done", detail: `${res.sheetName}: ${res.present}P · ${res.absent}A · ${res.od}OD` });
    } catch (e) { set("sheet", { status: "failed", detail: e?.message || "Sheet push failed." }); }
  }

  // 2) Absentee emails
  if (!pick.absentees) skip("absentees", "not selected");
  else {
    const built = buildAbsenteeItems({ roster, recs, cats, dateLabel: state.dayLabel, form });
    if (!built.items.length) skip("absentees", "no one to email");
    else {
      set("absentees", { status: "running" });
      try {
        const res = await sendBulkEmails(built.items);
        const ok = res.sent === res.total;
        set("absentees", {
          status: ok ? "done" : res.sent ? "partial" : "failed",
          detail: `${res.sent}/${res.total} sent${built.missing.length ? ` · ${built.missing.length} had no email` : ""}${res.failed?.length ? ` · ${res.failed.length} failed` : ""}`,
        });
      } catch (e) { set("absentees", { status: "failed", detail: e?.message || "Could not send." }); }
    }
  }

  // 3) Coordinator digest
  if (!pick.digest) skip("digest", "not selected");
  else if (!state.coordinator) skip("digest", "no coordinator address");
  else {
    set("digest", { status: "running" });
    try {
      const d = digestEmail({ day, roster, recs, form });
      await sendEmail({ to: state.coordinator, subject: d.subject, text: d.text });
      set("digest", { status: "done", detail: `sent to ${state.coordinator}` });
    } catch (e) { set("digest", { status: "failed", detail: e?.message || "Could not send." }); }
  }

  // 4) Checklist tick — only when the digest actually went out (or was already ticked)
  if (!pick.tick) skip("tick", "not selected");
  else if (!DONE_STATUSES.has(results.digest?.status) && !state.digestAlreadyTicked) skip("tick", "the digest wasn't sent");
  else {
    set("tick", { status: "running" });
    try {
      const def = fixedTasks().find((d) => d.fixed_key === "attendance_msg");
      await setFixedDone(day, def, true);
      set("tick", { status: "done", detail: "checklist ticked" });
    } catch (e) { set("tick", { status: "failed", detail: e?.message || "Could not tick the checklist." }); }
  }

  // 5) Lock the day
  if (!pick.lock) skip("lock", "not selected");
  else if (state.locked) skip("lock", "already locked");
  else {
    set("lock", { status: "running" });
    try { await setDayLocked(day, true); set("lock", { status: "done", detail: "day locked" }); }
    catch (e) { set("lock", { status: "failed", detail: e?.message || "Could not lock the day." }); }
  }

  const at = new Date().toISOString();
  writeRunRecord(day, { at, results });
  return { results, at };
}

