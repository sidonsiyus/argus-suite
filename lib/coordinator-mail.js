"use client";

// Client helpers for the Coordinator panel. Each call attaches the browser
// Supabase session's access token as a Bearer header so the faculty-gated API
// routes can verify the caller (the console session lives in localStorage, not
// cookies — see lib/professor-auth.js).
import { supabase } from "@/lib/supabase";
import { MAX_ATTACHMENTS, MAX_TOTAL_BYTES } from "@/lib/mail-attachments";

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

export async function sendCoordinatorReply({ uid, subject, text, cc, attachments }) {
  const res = await fetch("/api/professor/mail/reply", {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ uid, subject, text, cc, attachments: stripAttachmentMeta(attachments) }),
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

// Send a one-off email to any address(es).
export async function sendEmail({ to, cc, subject, text, attachments }) {
  const res = await fetch("/api/professor/mail/send", {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ to, cc, subject, text, attachments: stripAttachmentMeta(attachments) }),
  });
  return asJson(res);
}

// AI-draft an email → { subject, body }. Pass `brief` for a new email, and/or
// `context` ({ subject, from, body }) to draft a reply to that email.
export async function draftEmail({ brief, tone, context }) {
  const res = await fetch("/api/professor/mail/draft", {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ brief, tone, context }),
  });
  return asJson(res);
}

// Frequently-emailed addresses from the Sent folder → [{ address, name, count }].
export async function fetchMailContacts() {
  const res = await fetch("/api/professor/mail/contacts", { headers: await authHeaders(), cache: "no-store" });
  const j = await asJson(res);
  return Array.isArray(j.contacts) ? j.contacts : [];
}

// Attachments: the picker holds { filename, contentType, content, size }; only the
// fields the API needs are sent.
function stripAttachmentMeta(list) {
  return (list || []).map((a) => ({ filename: a.filename, contentType: a.contentType, content: a.content }));
}

const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1e3)) + " KB");

// Read picked files into attachment objects, enforcing the count/size caps.
// `existing` is what's already attached. Returns { list, error }.
export async function readAttachments(fileList, existing = []) {
  const files = Array.from(fileList || []);
  const list = existing.slice();
  let total = list.reduce((n, a) => n + (a.size || 0), 0);
  let error = "";
  for (const f of files) {
    if (list.length >= MAX_ATTACHMENTS) { error = `You can attach up to ${MAX_ATTACHMENTS} files.`; break; }
    if (total + f.size > MAX_TOTAL_BYTES) { error = `Attachments are limited to ${fmt(MAX_TOTAL_BYTES)} in total — “${f.name}” would go over.`; break; }
    const content = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(",")[1] || "");
      r.onerror = () => reject(new Error(`Could not read “${f.name}”.`));
      r.readAsDataURL(f);
    });
    list.push({ filename: f.name, contentType: f.type || "application/octet-stream", content, size: f.size });
    total += f.size;
  }
  return { list, error };
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
