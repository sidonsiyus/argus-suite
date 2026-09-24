"use client";

// Professor console — marks data layer (Supabase, faculty-only via RLS).
// Subjects carry editable max marks; marks hold one row per (student, subject).
import { supabase, supabaseConfigured } from "@/lib/supabase";

export const ASSESSMENTS = [
  { k: "cat1", label: "CAT-1", maxKey: "cat1_max" },
  { k: "cat2", label: "CAT-2", maxKey: "cat2_max" },
  { k: "model", label: "Model", maxKey: "model_max" },
  { k: "end_sem", label: "End-Sem", maxKey: "end_sem_max" },
];
export const PASS_FRACTION = 0.4; // 40% pass mark

export async function listSubjects() {
  if (!supabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from("mark_subjects")
    .select("id, name, cat1_max, cat2_max, model_max, end_sem_max, created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createSubject({ name, cat1_max, cat2_max, model_max, end_sem_max }) {
  const { data: auth } = await supabase.auth.getUser();
  const row = {
    name: (name || "").trim(),
    cat1_max: +cat1_max || 50, cat2_max: +cat2_max || 50,
    model_max: +model_max || 100, end_sem_max: +end_sem_max || 100,
    created_by: auth?.user?.id ?? null,
  };
  const { data, error } = await supabase.from("mark_subjects").insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function updateSubject(id, patch) {
  const clean = {};
  ["name", "cat1_max", "cat2_max", "model_max", "end_sem_max"].forEach((k) => {
    if (k in patch) clean[k] = k === "name" ? patch[k] : (+patch[k] || 0);
  });
  const { error } = await supabase.from("mark_subjects").update(clean).eq("id", id);
  if (error) throw error;
}

export async function deleteSubject(id) {
  const { error } = await supabase.from("mark_subjects").delete().eq("id", id);
  if (error) throw error;
}

// Returns { student_id: { cat1, cat2, model, end_sem } } for the subject.
export async function getMarks(subjectId) {
  const { data, error } = await supabase
    .from("marks")
    .select("student_id, cat1, cat2, model, end_sem")
    .eq("subject_id", subjectId);
  if (error) throw error;
  const map = {};
  (data || []).forEach((r) => { map[r.student_id] = { cat1: r.cat1, cat2: r.cat2, model: r.model, end_sem: r.end_sem }; });
  return map;
}

// marksMap: { student_id: { cat1, cat2, model, end_sem } }. Empty strings → null.
export async function saveMarks(subjectId, marksMap) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id ?? null;
  const nowIso = new Date().toISOString();
  const num = (v) => (v === "" || v == null || Number.isNaN(+v) ? null : +v);
  const rows = Object.entries(marksMap).map(([student_id, m]) => ({
    student_id, subject_id: subjectId,
    cat1: num(m.cat1), cat2: num(m.cat2), model: num(m.model), end_sem: num(m.end_sem),
    updated_by: uid, updated_at: nowIso,
  }));
  if (!rows.length) return 0;
  const { error } = await supabase.from("marks").upsert(rows, { onConflict: "student_id,subject_id" });
  if (error) throw error;
  return rows.length;
}
