"use client";

import { supabase, NOTES_BUCKET } from "./supabase";

/* ── reads (public) ── */
export async function listSubjects() {
  const { data, error } = await supabase.from("subjects").select("id,name,code,created_at").order("name");
  if (error) throw error;
  return data || [];
}

export async function listNotes(subjectId) {
  const { data, error } = await supabase
    .from("notes").select("*").eq("subject_id", subjectId).order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function noteCounts() {
  const { data, error } = await supabase.from("notes").select("subject_id");
  if (error) throw error;
  const map = {};
  (data || []).forEach((r) => { map[r.subject_id] = (map[r.subject_id] || 0) + 1; });
  return map;
}

export function publicUrl(path) {
  return supabase.storage.from(NOTES_BUCKET).getPublicUrl(path).data.publicUrl;
}

/* ── admin writes (require an authenticated session; enforced by RLS) ── */
export async function createSubject(name, code) {
  const { data, error } = await supabase.from("subjects").insert({ name, code: code || null }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSubject(id) {
  const notes = await listNotes(id);
  if (notes.length) await supabase.storage.from(NOTES_BUCKET).remove(notes.map((n) => n.path));
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadNote(subjectId, title, file) {
  const safe = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${subjectId}/${Date.now()}-${safe}`;
  const up = await supabase.storage.from(NOTES_BUCKET).upload(path, file, {
    cacheControl: "3600", upsert: false, contentType: file.type || undefined,
  });
  if (up.error) throw up.error;
  const { data, error } = await supabase.from("notes")
    .insert({ subject_id: subjectId, title: title || file.name, filename: file.name, path, size: file.size })
    .select().single();
  if (error) { await supabase.storage.from(NOTES_BUCKET).remove([path]); throw error; }
  return data;
}

export async function deleteNote(note) {
  await supabase.storage.from(NOTES_BUCKET).remove([note.path]);
  const { error } = await supabase.from("notes").delete().eq("id", note.id);
  if (error) throw error;
}

/* ── auth (admin only) ── */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
export async function signOut() { await supabase.auth.signOut(); }

/* ── helpers ── */
export function fmtSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0, n = bytes;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${u[i]}`;
}
export function fileKind(name = "") {
  const ext = name.split(".").pop().toLowerCase();
  if (ext === "pdf") return "PDF";
  if (["ppt", "pptx"].includes(ext)) return "PPT";
  if (["doc", "docx"].includes(ext)) return "DOC";
  if (["xls", "xlsx", "csv"].includes(ext)) return "XLS";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "IMG";
  if (["zip", "rar", "7z"].includes(ext)) return "ZIP";
  return ext ? ext.toUpperCase().slice(0, 4) : "FILE";
}
