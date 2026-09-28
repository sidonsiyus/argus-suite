"use client";

// JARVIS agent (client side). Runs the tool-calling loop: ask the assistant
// route what to do, execute the tool against the existing Supabase data layers
// (RLS applies), feed the result back, repeat until JARVIS gives a final spoken
// reply. Mutations pause for confirmation unless that category is auto-approved.
import { supabase } from "@/lib/supabase";
import { getSchedule, saveSchedule, dayKey } from "@/lib/professor";
import { getTasks, setDone, addManual, setFixedDone, fixedTasks } from "@/lib/tasks";
import { fetchCoordinatorMail, sendCoordinatorReply } from "@/lib/coordinator-mail";
import { fetchLiveAll } from "@/lib/attendance-sheets";
import { getRoster, getDayRecords, saveDay, CATEGORIES, coarseStatus } from "@/lib/attendance";
import { TOOL_CATEGORY } from "@/lib/jarvis-tools-def";

async function authHeaders(extra) {
  let token = "";
  try { token = (await supabase.auth.getSession()).data?.session?.access_token || ""; } catch { /* ignore */ }
  return { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(extra || {}) };
}

async function postAssistant(messages, today) {
  const res = await fetch("/api/professor/assistant", {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ messages, today }),
  });
  let j = null; try { j = await res.json(); } catch { /* ignore */ }
  if (!res.ok) throw new Error(j?.detail ? `${j.error} (${j.detail})` : (j?.error || `Assistant error (${res.status})`));
  return j.message;
}

// ── schedule helpers ──
const ORDINALS = { first: 0, "1st": 0, one: 0, second: 1, "2nd": 1, two: 1, third: 2, "3rd": 2, three: 2, fourth: 3, fifth: 4 };
function matchIndex(entries, match) {
  const m = String(match || "").trim().toLowerCase();
  if (m === "last") return entries.length - 1;
  if (m in ORDINALS) return ORDINALS[m];
  return entries.findIndex((e) => (e.subject || "").toLowerCase().includes(m));
}

// ── attendance helpers ──
const CAT_ALIASES = {
  authorized: "auth", authorised: "auth", auth: "auth", informed: "auth",
  unauthorized: "unauth", unauthorised: "unauth", unauth: "unauth", absent: "unauth",
  od: "od", "on-duty": "od", "on duty": "od", onduty: "od",
  grooming: "groom", groom: "groom",
  suspended: "susp", suspension: "susp", susp: "susp",
};
function normalizeCat(c) { return CAT_ALIASES[String(c || "").trim().toLowerCase()] || "unauth"; }
function catLabel(k) { return (CATEGORIES.find((c) => c.k === k) || {}).label || k; }
function matchStudent(roster, q) {
  const s = String(q || "").trim().toLowerCase();
  if (!s) return { none: true };
  const digits = s.replace(/\D/g, "");
  let list = roster.filter((r) => (r.full_name || "").toLowerCase() === s);
  if (!list.length && digits) list = roster.filter((r) => String(r.reg_no || "").toLowerCase().endsWith(digits));
  if (!list.length) list = roster.filter((r) => (r.full_name || "").toLowerCase().includes(s));
  if (list.length === 1) return { student: list[0] };
  if (list.length > 1) return { many: list.slice(0, 6).map((r) => r.full_name) };
  return { none: true };
}

// ── tool executors ──
async function executeTool(name, args) {
  const day = dayKey();
  switch (name) {
    case "get_overview": {
      const [sched, tasks, recs, roster, mail] = await Promise.all([
        getSchedule(day), getTasks(day), getDayRecords(day), getRoster(), fetchCoordinatorMail().catch(() => ({})),
      ]);
      const classes = (sched?.entries || []).filter((e) => e.subject || e.time);
      const defs = fixedTasks();
      const byKey = Object.fromEntries(tasks.filter((r) => r.fixed_key).map((r) => [r.fixed_key, r]));
      const doneFixed = defs.filter((d) => byKey[d.fixed_key]?.done).length;
      const manual = tasks.filter((r) => r.kind === "manual");
      const doneTasks = doneFixed + manual.filter((m) => m.done).length;
      const totalTasks = defs.length + manual.length;
      const absent = roster.filter((r) => recs[r.id] && coarseStatus(recs[r.id].cat) !== "present").length;
      return {
        classes: classes.map((e) => ({ subject: e.subject, time: e.time, group: e.group })),
        classCount: classes.length,
        checklist: { done: doneTasks, total: totalTasks },
        attendance: { strength: roster.length, absent, present: roster.length - absent },
        coordinator: mail?.configured === false ? { configured: false } : { pending: mail?.pending || 0, total: mail?.total || 0 },
      };
    }
    case "get_attendance": {
      const [roster, recs] = await Promise.all([getRoster(), getDayRecords(day)]);
      const absent = roster
        .filter((r) => recs[r.id] && coarseStatus(recs[r.id].cat) !== "present")
        .map((r) => ({ name: r.full_name, category: catLabel(recs[r.id].cat), reason: recs[r.id].reason || "" }));
      return { date: day, strength: roster.length, absent, absentCount: absent.length, present: roster.length - absent.length };
    }
    case "mark_absentee": {
      const roster = await getRoster();
      const m = matchStudent(roster, args.student);
      if (m.none) return { error: `No student matching "${args.student}".` };
      if (m.many) return { needsClarification: true, matches: m.many, message: "Which student — please be specific." };
      const cat = normalizeCat(args.category);
      await saveDay(day, { [m.student.id]: { cat, reason: args.reason || "", parent: !!args.parent } });
      return { ok: true, student: m.student.full_name, category: catLabel(cat) };
    }
    case "mark_present": {
      const roster = await getRoster();
      const m = matchStudent(roster, args.student);
      if (m.none) return { error: `No student matching "${args.student}".` };
      if (m.many) return { needsClarification: true, matches: m.many };
      await saveDay(day, { [m.student.id]: { cat: "present", reason: "", parent: false } });
      return { ok: true, student: m.student.full_name, category: "Present" };
    }
    case "get_schedule": {
      const rec = await getSchedule(day);
      const classes = (rec?.entries || []).map((e, i) => ({ n: i + 1, subject: e.subject, time: e.time, room: e.room, group: e.group }));
      return { classes };
    }
    case "add_class": {
      const rec = await getSchedule(day);
      const entries = (rec?.entries || []).slice();
      entries.push({ time: args.time || "", subject: args.subject || "", room: args.room || "", group: args.group || "" });
      await saveSchedule(day, entries, "jarvis");
      return { ok: true, added: args.subject };
    }
    case "update_class": {
      const rec = await getSchedule(day);
      const entries = (rec?.entries || []).slice();
      const idx = matchIndex(entries, args.match);
      if (idx < 0 || idx >= entries.length) return { error: `No class matching "${args.match}".` };
      const cur = { ...entries[idx] };
      ["subject", "time", "room", "group"].forEach((k) => { if (args[k] != null && args[k] !== "") cur[k] = args[k]; });
      entries[idx] = cur;
      await saveSchedule(day, entries, "jarvis");
      return { ok: true, updated: cur.subject };
    }
    case "remove_class": {
      const rec = await getSchedule(day);
      const entries = (rec?.entries || []).slice();
      const idx = matchIndex(entries, args.match);
      if (idx < 0 || idx >= entries.length) return { error: `No class matching "${args.match}".` };
      const removed = entries[idx].subject;
      entries.splice(idx, 1);
      await saveSchedule(day, entries, "jarvis");
      return { ok: true, removed };
    }
    case "get_checklist": {
      const rows = await getTasks(day);
      const defs = fixedTasks();
      const byKey = Object.fromEntries(rows.filter((r) => r.fixed_key).map((r) => [r.fixed_key, r]));
      const fixed = defs.map((d) => ({ title: d.title, done: !!byKey[d.fixed_key]?.done, deadline: d.deadline }));
      const manual = rows.filter((r) => r.kind === "manual").map((m) => ({ title: m.title, done: !!m.done, deadline: m.deadline }));
      return { tasks: [...fixed, ...manual] };
    }
    case "toggle_task": {
      const title = String(args.title || "").toLowerCase();
      const def = fixedTasks().find((d) => d.title.toLowerCase().includes(title) || title.includes(d.fixed_key));
      if (def) { await setFixedDone(day, def, !!args.done); return { ok: true, title: def.title, done: !!args.done }; }
      const rows = await getTasks(day);
      const m = rows.find((r) => r.kind === "manual" && (r.title || "").toLowerCase().includes(title));
      if (m) { await setDone(m.id, !!args.done); return { ok: true, title: m.title, done: !!args.done }; }
      return { error: `No task matching "${args.title}".` };
    }
    case "add_task": {
      await addManual(day, { title: args.title, deadline: args.deadline || "" });
      return { ok: true, added: args.title };
    }
    case "get_overall_attendance": {
      const d = await fetchLiveAll();
      const students = d.students || [];
      const totHeld = students.reduce((s, a) => s + (a.held || 0), 0);
      const totAtt = students.reduce((s, a) => s + (a.total || 0), 0);
      const overall = totHeld ? Math.round((totAtt / totHeld) * 1000) / 10 : 0;
      const thr = Number(args.below) || 0;
      const below = thr
        ? students.filter((s) => s.pct < thr).sort((a, b) => a.pct - b.pct).map((s) => ({ name: s.name, reg: s.reg, pct: s.pct }))
        : undefined;
      return { overall, students: students.length, months: d.months, lastDate: d.lastDate, ...(thr ? { threshold: thr, belowCount: below.length, below: below.slice(0, 20) } : {}) };
    }
    case "get_student_attendance": {
      const d = await fetchLiveAll();
      const m = matchStudent(d.students.map((s) => ({ full_name: s.name, reg_no: s.reg, _s: s })), args.student);
      if (m.none) return { error: `No student matching "${args.student}" in the sheet.` };
      if (m.many) return { needsClarification: true, matches: m.many };
      const s = m.student._s;
      return { name: s.name, reg: s.reg, pct: s.pct, attended: s.total, held: s.held };
    }
    case "get_coordinator_emails": {
      const d = await fetchCoordinatorMail();
      if (d.configured === false) return { configured: false, message: "The mailbox isn't connected." };
      return {
        pending: d.pending, total: d.total,
        emails: (d.messages || []).map((m) => ({ uid: m.uid, subject: m.subject, from: m.from?.name || m.from?.address, answered: m.answered })),
      };
    }
    case "send_coordinator_reply": {
      const d = await fetchCoordinatorMail();
      const em = (d.messages || []).find((m) => String(m.uid) === String(args.uid));
      const subject = em?.subject || "";
      await sendCoordinatorReply({ uid: args.uid, subject, text: args.text });
      return { ok: true, subject };
    }
    default:
      return { error: `Unknown tool ${name}.` };
  }
}

// A short human description of a pending mutation (for the confirm card + speech).
export function describeAction(name, args) {
  switch (name) {
    case "add_class": return `Add ${args.subject || "a class"}${args.time ? ` at ${args.time}` : ""}${args.group ? ` with ${args.group}` : ""}${args.room ? `, room ${args.room}` : ""} to today's schedule.`;
    case "update_class": return `Update the "${args.match}" class${args.subject ? ` → ${args.subject}` : ""}${args.time ? `, ${args.time}` : ""}${args.room ? `, room ${args.room}` : ""}.`;
    case "remove_class": return `Remove the "${args.match}" class from today's schedule.`;
    case "toggle_task": return `${args.done ? "Tick" : "Untick"} the task "${args.title}".`;
    case "add_task": return `Add the task "${args.title}"${args.deadline ? ` (${args.deadline})` : ""} to today's checklist.`;
    case "mark_absentee": return `Mark ${args.student} absent (${args.category})${args.reason ? ` — ${args.reason}` : ""} for today.`;
    case "mark_present": return `Mark ${args.student} present for today.`;
    case "send_coordinator_reply": return `Send this reply to the coordinator:\n\n"${args.text}"`;
    default: return name;
  }
}

const toolMsg = (id, obj) => ({ role: "tool", tool_call_id: id, content: JSON.stringify(obj) });

// Run one user turn to completion. `confirm(action) => Promise<boolean>` gates
// mutations; `onEvent` streams status for the UI. Returns { reply, history }.
export async function runJarvis({ userText, history = [], settings = {}, today = dayKey(), confirm, onEvent }) {
  const messages = [...history, { role: "user", content: userText }];
  let reply = "";
  for (let step = 0; step < 6; step++) {
    onEvent?.({ type: "thinking" });
    const msg = await postAssistant(messages, today);
    messages.push(msg);
    const calls = msg.tool_calls || [];
    if (!calls.length) { reply = msg.content || ""; break; }

    for (const call of calls) {
      const name = call.function?.name;
      let args = {};
      try { args = JSON.parse(call.function?.arguments || "{}"); } catch { /* keep {} */ }
      onEvent?.({ type: "tool", name, args });

      const cat = TOOL_CATEGORY[name];
      if (cat) {
        const auto = !!settings[cat];
        const action = { name, category: cat, description: describeAction(name, args), args, auto };
        const ok = confirm ? await confirm(action) : auto;
        if (!ok) { onEvent?.({ type: "declined", name }); messages.push(toolMsg(call.id, { declined: true, message: "The user declined this action." })); continue; }
      }

      let result;
      try { result = await executeTool(name, args); }
      catch (e) { result = { error: e?.message || "Action failed." }; }
      onEvent?.({ type: "result", name, result });
      messages.push(toolMsg(call.id, result));
    }
  }
  // Cap stored history so context doesn't grow without bound.
  const trimmed = messages.slice(-24);
  return { reply, history: trimmed };
}
