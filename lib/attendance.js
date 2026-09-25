"use client";

// Professor console — attendance data layer (Supabase, faculty-only via RLS).
// Roster is the shared public.students table (AERO-2025-28 cohort), so it's the
// same roster the Marks grid and MENTOR OS use.
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { dayKey } from "@/lib/professor";

export const ATT_COHORT_CODE = "AERO-2025-28";
export const STATUSES = ["present", "absent", "late", "od"];
export const STATUS_LABEL = { present: "Present", absent: "Absent", late: "Late", od: "On-duty" };

// Fine per-student categories (legacy model). status is the coarse roll-up.
export const CATEGORIES = [
  { k: "present", label: "Present", short: "P", status: "present" },
  { k: "auth", label: "AUTH — Authorized (Informed)", short: "AUTH", status: "absent", reason: true, parent: true },
  { k: "unauth", label: "UNAUTH — Unauthorized", short: "UNAUTH", status: "absent" },
  { k: "groom", label: "GROOM — Grooming", short: "GROOM", status: "absent" },
  { k: "od", label: "OD — On Duty", short: "OD", status: "od", reason: true },
  { k: "susp", label: "SUSP — Suspended", short: "SUSP", status: "absent" },
];
export const CAT_BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.k, c]));
export function coarseStatus(cat) { return CAT_BY_KEY[cat]?.status || "present"; }
export function catNeedsReason(cat) { return !!CAT_BY_KEY[cat]?.reason; }
export function catNeedsParent(cat) { return !!CAT_BY_KEY[cat]?.parent; }

// Reasons for absence / OD — imported verbatim from the legacy dashboard.
export const REASONS = [
  "Medical Reason (Self)",
  "Medical Emergency (Family Member)",
  "Family Function",
  "Bereavement / Death in the Family",
  "Personal Emergency",
  "Educational Loan / Bank Visit",
  "Internship / Industrial Training Submission",
  "Official University / Government Work",
  "Travel Due to Personal Reasons",
  "Attending Competitive Examination / Interview",
  "Passport / Visa / Document Verification",
  "Court / Legal Proceedings",
  "Public Transport / Vehicle Breakdown",
  "Weather / Natural Calamity",
  "Participation in Sports / Cultural / NCC / NSS Event",
  "Academic Project / Research Work",
  "Placement Drive / Campus Recruitment",
  "Mental Health / Stress-Related Reason",
  "Religious Observance",
  "Grooming",
  "RNR (Ringing No Response)",
];

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
    .select("id, sno, full_name, reg_no, phone, email, is_active, cohorts!inner(code)")
    .eq("cohorts.code", ATT_COHORT_CODE)
    .order("sno", { ascending: true });
  if (error) throw error;
  return (data || []).map(({ cohorts, ...s }) => s);
}

// Parse pasted roster text into { reg, email } pairs. Tolerant of the exported
// layout where a reg number line precedes an email line within each block.
export function parseRosterEmails(text) {
  const lines = String(text || "").split(/\r?\n/);
  const emailRe = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const regRe = /\b\d{5,}\b/;
  const pairs = [];
  let lastReg = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const em = line.match(emailRe);
    if (em) {
      const here = line.match(regRe);
      const reg = here ? here[0] : lastReg;
      if (reg) pairs.push({ reg: String(reg), email: em[0].toLowerCase() });
      lastReg = null;
    } else if (/^\d{5,}$/.test(line)) {
      lastReg = line;
    }
  }
  const map = new Map();
  pairs.forEach((p) => map.set(p.reg, p.email)); // last wins
  return [...map].map(([reg, email]) => ({ reg, email }));
}

// Save pasted emails onto the roster, matched by reg number. Only touches
// existing students (never creates rows). Returns { updated, unmatched, total }.
export async function importEmails(text, roster) {
  const pairs = parseRosterEmails(text);
  if (!pairs.length) return { updated: 0, unmatched: [], total: 0 };
  const byReg = new Map((roster || []).map((r) => [String(r.reg_no).trim(), r]));
  let updated = 0;
  const unmatched = [];
  for (const { reg, email } of pairs) {
    const stu = byReg.get(reg);
    if (!stu) { unmatched.push(reg); continue; }
    const { error } = await supabase.from("students").update({ email }).eq("id", stu.id);
    if (!error) updated++;
  }
  return { updated, unmatched, total: pairs.length };
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

// Derive the fine category from a stored row.
function rowToCat(r) {
  if (r.status === "present" || r.status === "late") return "present";
  if (r.status === "od") return "od";
  return r.absence_type || "unauth"; // any absent without a type → unauthorized
}

// ── day records ──
// Returns a map { student_id: { cat, reason, parent } } for the given day.
export async function getDayRecords(day) {
  const { data, error } = await supabase
    .from("attendance_records")
    .select("student_id, status, absence_type, reason, parent_contacted")
    .eq("day", day);
  if (error) throw error;
  const map = {};
  (data || []).forEach((r) => {
    map[r.student_id] = { cat: rowToCat(r), reason: r.reason || "", parent: r.parent_contacted === true };
  });
  return map;
}

// Upsert one record per student for the day.
// entries: { student_id: { cat, reason, parent } } (cat defaults to 'present').
export async function saveDay(day, entries) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id ?? null;
  const nowIso = new Date().toISOString();
  const rows = Object.entries(entries).map(([student_id, e]) => {
    const cat = (e && e.cat) || "present";
    const status = coarseStatus(cat);
    return {
      student_id, day, status,
      absence_type: status === "absent" ? cat : null,
      reason: catNeedsReason(cat) ? (e?.reason || null) : null,
      parent_contacted: catNeedsParent(cat) ? !!e?.parent : null,
      marked_by: uid, updated_at: nowIso,
    };
  });
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
