"use client";

// Professor console — daily checklist data layer (Supabase, faculty-only RLS).
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { LIVE_WORKER } from "@/lib/attendance-sheets";

// Parse "01.30-2.15" → the last class's end time as a display string, and a
// comparable 24h number so we can pick the latest class of the day.
function endInfo(timeStr) {
  const end = String(timeStr || "").split("-").pop().trim();
  if (!end) return null;
  const m = end.match(/(\d{1,2})[.:](\d{2})/);
  if (!m) return { label: end, mins: 0 };
  let h = +m[1]; const min = +m[2];
  if (h >= 1 && h <= 7) h += 12; // afternoon classes (1–7 → 13–19)
  return { label: end, mins: h * 60 + min };
}

// MIRA is per-class: one step per class in today's schedule, ordered by end
// time, so the deadline advances to the next class as each is ticked off.
// Keys are stable by sorted order (mira:0, mira:1, …). Empty when no schedule.
export function miraClasses(scheduleEntries) {
  const arr = (scheduleEntries || [])
    .map((e) => { const info = endInfo(e.time); return info ? { subject: (e.subject || "Class").trim(), endLabel: info.label, endMins: info.mins } : null; })
    .filter(Boolean)
    .sort((a, b) => a.endMins - b.endMins);
  return arr.map((c, i) => ({ ...c, key: `mira:${i}` }));
}

// The three fixed daily tasks that aren't per-class (MIRA is handled separately).
export function fixedTasks() {
  return [
    { fixed_key: "deliverables", title: "Update faculty deliverables (Google Sheet)", link: LIVE_WORKER, deadline: "before 3:00 PM" },
    { fixed_key: "campus", title: "Update campus reporting document (MH COCKPIT)", goto: "attendance", deadline: "before 12:30 PM" },
    { fixed_key: "attendance_msg", title: "Send today's attendance report message", goto: "attendance", deadline: "before 3:00 PM" },
  ];
}

export async function getTasks(day) {
  if (!supabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from("tasks")
    .select("id, day, kind, fixed_key, title, link, deadline, done, sort, created_at")
    .eq("day", day)
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

// Toggle a fixed task's done-state (creates the row on first toggle).
export async function setFixedDone(day, def, done) {
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("tasks").upsert(
    { day, kind: "fixed", fixed_key: def.fixed_key, title: def.title, link: def.link || null, deadline: def.deadline || null, done, created_by: auth?.user?.id ?? null },
    { onConflict: "day,fixed_key" }
  );
  if (error) throw error;
}

export async function addManual(day, { title, deadline }) {
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("tasks")
    .insert({ day, kind: "manual", title: (title || "").trim(), deadline: (deadline || "").trim() || null, done: false, sort: 100, created_by: auth?.user?.id ?? null })
    .select().single();
  if (error) throw error;
  return data;
}

export async function setDone(id, done) {
  const { error } = await supabase.from("tasks").update({ done }).eq("id", id);
  if (error) throw error;
}

export async function deleteTask(id) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}
