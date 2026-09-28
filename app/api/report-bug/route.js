// Public "report a bug" endpoint. Anyone on the site can submit; the report is
// emailed to a FIXED recipient (server-side, never client-controlled), so it
// can't be abused to email arbitrary addresses. Basic anti-spam: honeypot,
// length caps, and a best-effort per-instance rate limit.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { mailConfigured, sendReply, HmError } from "@/lib/hostinger-mail";
import { createClient } from "@supabase/supabase-js";

const TO = process.env.BUG_REPORT_TO || "sidjr.me@gmail.com";
const hits = new Map(); // ip -> timestamps (per serverless instance; best-effort)

// Store the report as a ticket (best-effort; anon insert allowed by RLS).
async function storeTicket(row) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;
  try {
    const supabase = createClient(url, anon, { auth: { persistSession: false } });
    const { error } = await supabase.from("bug_reports").insert(row);
    return !error;
  } catch { return false; }
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "bad_request" }, { status: 400 }); }

  // Honeypot — bots fill hidden fields; silently accept and drop.
  if (body?.hp) return Response.json({ ok: true });

  const message = String(body?.message || "").trim();
  if (message.length < 5) return Response.json({ error: "too_short" }, { status: 400 });
  if (message.length > 5000) return Response.json({ error: "too_long" }, { status: 400 });

  const page = String(body?.page || "").slice(0, 400);
  const email = String(body?.email || "").slice(0, 200).trim();
  const ua = (request.headers.get("user-agent") || "").slice(0, 300);
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";

  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 600000); // 10 min
  if (recent.length >= 5) return Response.json({ error: "rate_limited" }, { status: 429 });
  recent.push(now); hits.set(ip, recent);

  const path = page.replace(/^https?:\/\/[^/]+/, "") || page || "/";
  const subject = `🐞 Bug report — ${path}`.slice(0, 180);
  const text = [
    "A bug was reported on madebysid.space.",
    "",
    "What happened:",
    message,
    "",
    "— details —",
    `Page: ${page || "(not provided)"}`,
    `Reporter email: ${email || "(not provided)"}`,
    `Time: ${new Date().toISOString()}`,
    `Browser: ${ua}`,
    `IP: ${ip}`,
  ].join("\n");

  // Store as a ticket and email — either succeeding is enough to accept it.
  const stored = await storeTicket({ message, page: page || null, email: email || null, user_agent: ua });

  let emailed = false, emailErr = null;
  if (mailConfigured()) {
    try { await sendReply({ to: TO, subject, text }); emailed = true; }
    catch (e) { emailErr = e instanceof HmError ? e.code : "send_failed"; }
  }

  if (!stored && !emailed) {
    return Response.json({ error: emailErr || "unavailable" }, { status: 502 });
  }
  return Response.json({ ok: true, stored, emailed });
}
