"use client";

// Client helpers for the Coordinator panel. Each call attaches the browser
// Supabase session's access token as a Bearer header so the faculty-gated API
// routes can verify the caller (the console session lives in localStorage, not
// cookies — see lib/professor-auth.js).
import { supabase } from "@/lib/supabase";

async function authHeaders(extra) {
  let token = "";
  try {
    const { data } = await supabase.auth.getSession();
    token = data?.session?.access_token || "";
  } catch { /* not signed in */ }
  return { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(extra || {}) };
}

async function asJson(res) {
  let j = null;
  try { j = await res.json(); } catch { /* ignore */ }
  if (!res.ok) throw new Error(j?.error || `Request failed (${res.status})`);
  return j || {};
}

// Today's coordinator emails + counts. Returns { configured, messages, total, pending }.
export async function fetchCoordinatorMail() {
  const res = await fetch("/api/professor/mail", { headers: await authHeaders(), cache: "no-store" });
  return asJson(res);
}

// A wider window of coordinator emails (for the history panel). Returns the same
// shape; the caller filters to the already-replied, earlier ones.
export async function fetchCoordinatorHistory(days = 60) {
  const res = await fetch(`/api/professor/mail?days=${days}`, { headers: await authHeaders(), cache: "no-store" });
  return asJson(res);
}

export async function fetchMailBody(uid) {
  const res = await fetch(`/api/professor/mail/body?uid=${encodeURIComponent(uid)}`, {
    headers: await authHeaders(), cache: "no-store",
  });
  return asJson(res);
}

export async function sendCoordinatorReply({ uid, subject, text }) {
  const res = await fetch("/api/professor/mail/reply", {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ uid, subject, text }),
  });
  return asJson(res);
}

// Mark an email done (or undo) without replying — toggles \Answered upstream.
export async function markCoordinatorDone({ uid, done }) {
  const res = await fetch("/api/professor/mail/flag", {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ uid, done }),
  });
  return asJson(res);
}

// Send a batch of one-off emails ([{to, subject, text}]) in server-side chunks,
// reporting progress. Returns { sent, total, failed:[{to,error}] }.
const CHUNK = 10;
export async function sendBulkEmails(items, onProgress) {
  const all = Array.isArray(items) ? items : [];
  let sent = 0;
  const failed = [];
  for (let i = 0; i < all.length; i += CHUNK) {
    const slice = all.slice(i, i + CHUNK);
    const res = await fetch("/api/professor/mail/broadcast", {
      method: "POST",
      headers: await authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ items: slice }),
    });
    const j = await asJson(res);
    sent += j.sent || 0;
    if (Array.isArray(j.failed)) failed.push(...j.failed);
    onProgress?.(Math.min(i + slice.length, all.length), all.length);
  }
  return { sent, total: all.length, failed };
}
