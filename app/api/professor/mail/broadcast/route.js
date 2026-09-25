// Professor console — send a batch of emails (one per recipient) via the
// mailbox. Used by "Email absentees". Faculty-gated; the client sends in small
// chunks so each request stays short.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireFaculty } from "@/lib/professor-auth";
import { mailConfigured, sendReply, HmError } from "@/lib/hostinger-mail";
import { buildHtmlEmail, buildTextEmail } from "@/lib/mail-signature";

const MAX_PER_CALL = 15;

export async function POST(request) {
  const gate = await requireFaculty(request);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });
  if (!mailConfigured()) return Response.json({ error: "mail_unconfigured" }, { status: 503 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "bad_request" }, { status: 400 }); }

  const items = Array.isArray(body?.items) ? body.items : [];
  if (!items.length) return Response.json({ error: "no_items" }, { status: 400 });
  if (items.length > MAX_PER_CALL) return Response.json({ error: "too_many", max: MAX_PER_CALL }, { status: 400 });

  const results = [];
  for (const it of items) {
    const to = String(it?.to || "").trim();
    const text = String(it?.text || "");
    const subject = String(it?.subject || "").trim() || "(no subject)";
    if (!to || !text.trim()) { results.push({ to, ok: false, error: "missing" }); continue; }
    try {
      // Send as HTML (with the MH Cockpit signature) plus a plain-text fallback.
      await sendReply({ to, subject, text: buildTextEmail(text), html: buildHtmlEmail(text) });
      results.push({ to, ok: true });
    } catch (e) {
      results.push({ to, ok: false, error: e instanceof HmError ? e.code : "send_failed" });
    }
  }

  const failed = results.filter((r) => !r.ok);
  return Response.json({ sent: results.length - failed.length, total: results.length, failed });
}
