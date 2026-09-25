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
