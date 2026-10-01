// Checklist deadline reminders — pure logic (no React, no network), so it can be
// tested against any clock.
//
// Deadlines in the checklist are free text:
//   "before 3:00 PM"   → due by that time          → alert "soon" (lead minutes early) and "due"
//   "after 2.15"       → MIRA: do it once class ends → alert "due" at that time
//   "5pm", "by 4:30"   → manual tasks, treated as "before"
// Anything without a recognisable time is simply never reminded.
import { fixedTasks, miraClasses } from "@/lib/tasks";

// Parse the first clock time found in `str`.
// Returns { kind: "before" | "after", minutes } (minutes since midnight) or null.
export function parseDeadline(str) {
  const s = String(str || "").trim();
  if (!s) return null;
  const m = s.match(/(\d{1,2})(?:[:.](\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?/i);
  if (!m) return null;
  let h = +m[1];
  const min = m[2] != null ? +m[2] : 0;
  if (h > 24 || min > 59) return null;
  const mer = (m[3] || "").toLowerCase().replace(/\./g, "");
  if (mer === "pm") { if (h < 12) h += 12; }
  else if (mer === "am") { if (h === 12) h = 0; }
  else if (h >= 1 && h <= 7) h += 12; // no am/pm: afternoon hours (1–7) read as PM, like the timetable
  if (h === 24) h = 0;
  return { kind: /^\s*after\b/i.test(s) ? "after" : "before", minutes: h * 60 + min };
}

const at = (day, minutes) => {
  const [y, mo, d] = day.split("-").map(Number);
  return new Date(y, mo - 1, d, Math.floor(minutes / 60), minutes % 60, 0, 0);
};
const label = (minutes) => {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

// The tasks that can be reminded about today, from the same sources the checklist
// shows: the fixed daily tasks, one MIRA step per class, the live coordinator-email
// row, and manual tasks. `rows` are the saved task rows for the day.
export function buildReminderTasks({ rows = [], schedule = [], coordinator = null }) {
  const byKey = Object.fromEntries(rows.filter((r) => r.fixed_key).map((r) => [r.fixed_key, r]));
  const tasks = [];

  fixedTasks().forEach((d) => tasks.push({ key: d.fixed_key, title: d.title, deadline: d.deadline, done: !!byKey[d.fixed_key]?.done, goto: d.goto, gotoSub: d.gotoSub, link: d.link }));

  miraClasses(schedule).forEach((c) => tasks.push({
    key: c.key, title: `MIRA — ${c.subject}`, deadline: `after ${c.endLabel}`, done: !!byKey[c.key]?.done, link: "https://exploremira.com",
  }));

  if (coordinator && coordinator.configured) {
    tasks.push({ key: "coord", title: "Reply to coordinator emails", deadline: "before 3:00 PM", done: (coordinator.pending || 0) === 0, goto: "coordinator" });
  }

  rows.filter((r) => r.kind === "manual").forEach((r) => tasks.push({ key: `m:${r.id}`, title: r.title, deadline: r.deadline || "", done: !!r.done }));
  return tasks;
}

/**
 * Which reminders should fire right now?
 *   tasks    — from buildReminderTasks
 *   now      — Date
 *   day      — "YYYY-MM-DD" the deadlines belong to
 *   leadMin  — minutes before a "before" deadline to warn (default 30)
 *   fired    — Set of alert ids already shown
 *   graceMin — an alert only fires if its moment passed less than this long ago, so
 *              reopening the console at 5 PM doesn't replay the morning's alerts
 * Returns [{ id, key, kind: "soon" | "due", title, deadlineLabel, text, minsLeft, task }].
 */
export function computeAlerts({ tasks, now, day, leadMin = 30, fired = new Set(), graceMin = 10 }) {
  const out = [];
  const nowMs = now.getTime();
  const grace = graceMin * 60000;
  const lead = Math.max(1, +leadMin || 30);

  tasks.forEach((t) => {
    if (t.done) return;
    const p = parseDeadline(t.deadline);
    if (!p) return;
    const due = at(day, p.minutes);
    const dueMs = due.getTime();
    const dl = label(p.minutes);

    if (p.kind === "before") {
      const soonMs = dueMs - lead * 60000;
      const id = `${day}|${t.key}|soon`;
      if (nowMs >= soonMs && nowMs < dueMs && !fired.has(id)) {
        const minsLeft = Math.max(1, Math.ceil((dueMs - nowMs) / 60000));
        out.push({ id, key: t.key, kind: "soon", title: t.title, deadlineLabel: dl, minsLeft, text: `${t.title} is due in ${minsLeft} minute${minsLeft === 1 ? "" : "s"} (by ${dl}).`, task: t });
      }
    }
    const dueId = `${day}|${t.key}|due`;
    if (nowMs >= dueMs && nowMs - dueMs <= grace && !fired.has(dueId)) {
      out.push({
        id: dueId, key: t.key, kind: "due", title: t.title, deadlineLabel: dl, minsLeft: 0,
        text: p.kind === "after" ? `${t.title} — class has ended, it's time to update it.` : `${t.title} is due now (${dl}).`,
        task: t,
      });
    }
  });
  return out;
}

// How FRIDAY refers to a task aloud (the checklist titles are imperatives like
// "Update faculty deliverables", which don't read well inside a sentence).
function spokenName(task) {
  const k = String(task?.key || "");
  if (k === "deliverables") return "the faculty deliverables";
  if (k === "campus") return "the campus reporting document";
  if (k === "attendance_msg") return "the attendance report message";
  if (k === "coord") return "your coordinator replies";
  if (k.startsWith("mira:")) return `the MIRA update for ${String(task.title || "").replace(/^MIRA — /, "")}`;
  return `“${String(task?.title || "this task").replace(/\s*\([^)]*\)\s*$/, "")}”`;
}

// What FRIDAY says aloud for an alert.
export function spokenReminder(a) {
  const name = spokenName(a.task || { title: a.title });
  if (a.kind === "soon") return `Boss, the deadline for ${name} is in ${a.minsLeft} minute${a.minsLeft === 1 ? "" : "s"}.`;
  if (a.task?.deadline && /^after/i.test(a.task.deadline)) return `Boss, that class has ended. Time for ${name}.`;
  return `Boss, the deadline for ${name} is now.`;
}

const joinNames = (names) => (names.length <= 1 ? names[0] || "" : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`);
const mins = (n) => `${n} minute${n === 1 ? "" : "s"}`;

// What FRIDAY says for a batch of alerts that fire together — one sentence per kind
// of alert rather than "Boss, …" repeated for each.
export function spokenBatch(alerts) {
  if (!alerts.length) return "";
  if (alerts.length === 1) return alerts[0].spoken || spokenReminder(alerts[0]);

  const custom = alerts.filter((a) => a.spoken).map((a) => a.spoken);
  const plain = alerts.filter((a) => !a.spoken);
  const parts = [];

  // upcoming deadlines, grouped by how long they have left
  const soon = plain.filter((a) => a.kind === "soon");
  const byMins = new Map();
  soon.forEach((a) => byMins.set(a.minsLeft, [...(byMins.get(a.minsLeft) || []), a]));
  byMins.forEach((group, n) => {
    const names = group.map((a) => spokenName(a.task || { title: a.title }));
    parts.push(names.length > 1 ? `${joinNames(names)} are due in ${mins(n)}` : `the deadline for ${names[0]} is in ${mins(n)}`);
  });

  // deadlines that are now
  const due = plain.filter((a) => a.kind === "due" && !/^after/i.test(a.task?.deadline || ""));
  if (due.length) {
    const names = due.map((a) => spokenName(a.task || { title: a.title }));
    parts.push(names.length > 1 ? `${joinNames(names)} are due now` : `the deadline for ${names[0]} is now`);
  }
  // classes that just ended (MIRA)
  const ended = plain.filter((a) => a.kind === "due" && /^after/i.test(a.task?.deadline || ""));
  if (ended.length) {
    const names = ended.map((a) => spokenName(a.task || { title: a.title }));
    parts.push(`${ended.length > 1 ? "those classes have" : "that class has"} ended, so it's time for ${joinNames(names)}`);
  }

  const first = parts.length ? [`Boss, ${parts[0].charAt(0).toLowerCase() + parts[0].slice(1)}`, ...parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1))] : [];
  return [...first, ...custom].join(". ") + ".";
}
