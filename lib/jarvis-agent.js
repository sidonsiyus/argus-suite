"use client";

// JARVIS agent (client side). Runs the tool-calling loop: ask the assistant
// route what to do, execute the tool against the existing Supabase data layers
// (RLS applies), feed the result back, repeat until JARVIS gives a final spoken
// reply. Mutations pause for confirmation unless that category is auto-approved.
import { supabase } from "@/lib/supabase";
import { getSchedule, saveSchedule, dayKey } from "@/lib/professor";
import { getTasks, setDone, addManual, setFixedDone, fixedTasks } from "@/lib/tasks";
import { fetchCoordinatorMail, sendCoordinatorReply } from "@/lib/coordinator-mail";
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

// ── tool executors ──
async function executeTool(name, args) {
  const day = dayKey();
  switch (name) {
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
