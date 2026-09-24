"use client";

// Professor console — client-side data helpers (Supabase, RLS-protected).
// Faculty-only access is enforced by row-level security, matching lib/lms.js.
import { supabase, supabaseConfigured } from "@/lib/supabase";

// Local calendar day as YYYY-MM-DD (en-CA yields that format in any locale).
export function dayKey(d = new Date()) {
  return d.toLocaleDateString("en-CA");
}

export function prettyDay(key) {
  if (!key) return "";
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

const EMPTY_ROW = { time: "", subject: "", room: "", group: "" };
export const emptyRow = () => ({ ...EMPTY_ROW });

// ── schedules ──
export async function getSchedule(day) {
  if (!supabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from("schedules")
    .select("day, entries, source, updated_at")
    .eq("day", day)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveSchedule(day, entries, source = "manual") {
  if (!supabaseConfigured || !supabase) throw new Error("Supabase not configured.");
  const clean = (entries || [])
    .map((e) => ({
      time: (e.time || "").trim(),
      subject: (e.subject || "").trim(),
      room: (e.room || "").trim(),
      group: (e.group || "").trim(),
    }))
    .filter((e) => e.subject || e.time);
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("schedules").upsert(
    { day, entries: clean, source, updated_by: auth?.user?.id ?? null, updated_at: new Date().toISOString() },
    { onConflict: "day" }
  );
  if (error) throw error;
  return clean;
}

export async function deleteSchedule(day) {
  if (!supabaseConfigured || !supabase) return;
  await supabase.from("schedules").delete().eq("day", day);
}

// A spoken/readable summary of a day's schedule.
export function scheduleToText(entries, { name } = {}) {
  const list = (entries || []).filter((e) => e.subject || e.time);
  const who = name ? `Professor ${name}` : "Professor";
  if (!list.length) return "";
  const parts = list.map((e) => {
    const t = e.time ? `at ${e.time}` : "";
    const where = e.room ? ` in ${e.room}` : "";
    const grp = e.group ? ` for ${e.group}` : "";
    return `${e.subject || "a class"} ${t}${grp}${where}`.replace(/\s+/g, " ").trim();
  });
  const count = list.length;
  return `${who}, you have ${count} ${count === 1 ? "class" : "classes"} today: ${parts.join("; ")}.`;
}

// True when an error is PostgREST "table not found" (migration not run yet or
// schema cache stale), so callers can show setup guidance instead of a raw error.
export function isMissingTable(e) {
  if (!e) return false;
  if (e.code === "PGRST205" || e.code === "42P01") return true;
  return /schema cache|could not find the table|does not exist|relation .* does not exist/i.test(
    e.message || e.error_description || ""
  );
}

// ── ticker items ──
// Public read (RLS allows anyone to see active, in-window items).
export async function getActiveTickerItems() {
  if (!supabaseConfigured || !supabase) return [];
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("ticker_items")
    .select("id, message, href, priority, active, starts_at, expires_at, created_at")
    .eq("active", true)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data || []).filter(
    (it) => (!it.starts_at || it.starts_at <= nowIso) && (!it.expires_at || it.expires_at > nowIso)
  );
}

// Faculty read (everything, including inactive/expired) for the manager.
export async function listTickerItems() {
  if (!supabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from("ticker_items")
    .select("id, message, href, priority, active, starts_at, expires_at, created_at")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addTickerItem({ message, href, priority, active, expires_at }) {
  if (!supabaseConfigured || !supabase) throw new Error("Supabase not configured.");
  const { data: auth } = await supabase.auth.getUser();
  const row = {
    message: (message || "").trim(),
    href: (href || "").trim() || null,
    priority: Number.isFinite(+priority) ? +priority : 0,
    active: active !== false,
    expires_at: expires_at || null,
    created_by: auth?.user?.id ?? null,
  };
  const { data, error } = await supabase.from("ticker_items").insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function updateTickerItem(id, patch) {
  if (!supabaseConfigured || !supabase) throw new Error("Supabase not configured.");
  const { error } = await supabase.from("ticker_items").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteTickerItem(id) {
  if (!supabaseConfigured || !supabase) throw new Error("Supabase not configured.");
  const { error } = await supabase.from("ticker_items").delete().eq("id", id);
  if (error) throw error;
}

// Downscale an image File to a JPEG data-URL that fits comfortably under the
// OCR route's size cap, so photos from a phone don't get rejected.
export function fileToScaledDataURL(file, maxDim = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const scale = Math.min(1, maxDim / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read image.")); };
    img.src = url;
  });
}
