"use client";

// Professor console — attendance data layer (Supabase, faculty-only via RLS).
// Roster is the shared public.students table (AERO-2025-28 cohort), so it's the
// same roster the Marks grid and MENTOR OS use.
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { dayKey } from "@/lib/professor";

export const ATT_COHORT_CODE = "AERO-2025-28";
export const STATUSES = ["present", "absent", "late", "od"];
export const STATUS_LABEL = { present: "Present", absent: "Absent", late: "Late", od: "On-duty" };

let _cohortId = null;
async function cohortId() {
  if (_cohortId) return _cohortId;
  const { data, error } = await supabase.from("cohorts").select("id").eq("code", ATT_COHORT_CODE).maybeSingle();
  if (error) throw error;
  _cohortId = data?.id || null;
  return _cohortId;
}

// ── roster ──
export async function getRoster() {
  if (!supabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from("students")
    .select("id, sno, full_name, reg_no, phone, is_active, cohorts!inner(code)")
    .eq("cohorts.code", ATT_COHORT_CODE)
    .order("sno", { ascending: true });
  if (error) throw error;
  return (data || []).map(({ cohorts, ...s }) => s);
}

export async function addStudent({ full_name, reg_no, sno, phone }) {
  const cid = await cohortId();
  if (!cid) throw new Error(`Cohort ${ATT_COHORT_CODE} not found.`);
  const row = {
    full_name: (full_name || "").trim(),
    reg_no: (reg_no || "").trim(),
    sno: Number.isFinite(+sno) ? +sno : 0,
    phone: (phone || "").trim() || null,
    cohort_id: cid,
    is_active: true,
  };
  const { data, error } = await supabase.from("students").insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function updateStudent(id, patch) {
  const { error } = await supabase.from("students").update(patch).eq("id", id);
  if (error) throw error;
}

// ── day metadata (lock) ──
export async function getDayMeta(day) {
  const { data, error } = await supabase.from("attendance_days").select("day, locked, note, updated_at").eq("day", day).maybeSingle();
  if (error) throw error;
  return data;
}

export async function setDayLocked(day, locked) {
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("attendance_days").upsert(
    { day, locked, updated_by: auth?.user?.id ?? null, updated_at: new Date().toISOString() },
    { onConflict: "day" }
  );
  if (error) throw error;
}

// ── day records ──
// Returns a map { student_id: status } for the given day.
export async function getDayRecords(day) {
  const { data, error } = await supabase.from("attendance_records").select("student_id, status").eq("day", day);
  if (error) throw error;
  const map = {};
  (data || []).forEach((r) => { map[r.student_id] = r.status; });
  return map;
}

// Upsert one record per student for the day. statusMap: { student_id: status }.
export async function saveDay(day, statusMap) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id ?? null;
  const nowIso = new Date().toISOString();
  const rows = Object.entries(statusMap)
    .filter(([, st]) => STATUSES.includes(st))
    .map(([student_id, status]) => ({ student_id, day, status, marked_by: uid, updated_at: nowIso }));
  if (!rows.length) return 0;
  const { error } = await supabase.from("attendance_records").upsert(rows, { onConflict: "student_id,day" });
  if (error) throw error;
  return rows.length;
}

export async function clearDay(day) {
  const { error } = await supabase.from("attendance_records").delete().eq("day", day);
  if (error) throw error;
}

// ── ranged reads (analytics) ──
// All records between two YYYY-MM-DD days (inclusive), for per-student rollups.
export async function getRangeRecords(fromDay, toDay) {
  const { data, error } = await supabase
    .from("attendance_records")
    .select("student_id, day, status")
    .gte("day", fromDay)
    .lte("day", toDay)
    .order("day", { ascending: true });
  if (error) throw error;
  return data || [];
}

export function isPresentish(status) {
  return status === "present" || status === "late" || status === "od";
}

// Match an OCR'd token (reg number, roll/S.No, or name) to a roster student.
export function matchToken(token, roster) {
  const t = String(token || "").trim().toLowerCase();
  if (!t) return null;
  let m = roster.find((r) => String(r.reg_no || "").toLowerCase() === t);
  if (m) return m;
  const digits = t.replace(/\D/g, "");
  if (digits) {
    m = roster.find((r) => String(r.sno) === digits); if (m) return m;
    m = roster.find((r) => String(r.reg_no || "").toLowerCase().endsWith(digits)); if (m) return m;
  }
  if (t.replace(/[^a-z]/g, "").length >= 3) {
    m = roster.find((r) => (r.full_name || "").toLowerCase().includes(t)); if (m) return m;
  }
  return null;
}

// Convenience: today's key (re-export so callers need one import).
export { dayKey };
