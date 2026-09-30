// Professor console — send an email to any address (faculty-gated). Signature
// auto-appended. Recipient is caller-supplied, so this stays faculty-only.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireFaculty } from "@/lib/professor-auth";
import { mailConfigured, sendReply, HmError } from "@/lib/hostinger-mail";
import { buildHtmlEmail, buildTextEmail } from "@/lib/mail-signature";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const parseList = (v) => (Array.isArray(v) ? v : String(v || "").split(/[,;\s]+/)).map((s) => String(s).trim()).filter(Boolean);

export async function POST(request) {
  const gate = await requireFaculty(request);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });
  if (!mailConfigured()) return Response.json({ error: "mail_unconfigured" }, { status: 503 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "bad_request" }, { status: 400 }); }

  const to = parseList(body?.to).filter((e) => EMAIL_RE.test(e));
  const cc = parseList(body?.cc).filter((e) => EMAIL_RE.test(e));
  const subject = String(body?.subject || "").trim();
  const text = String(body?.text || "").trim();

  if (!to.length) return Response.json({ error: "no_recipient" }, { status: 400 });
  if (to.length + cc.length > 25) return Response.json({ error: "too_many_recipients" }, { status: 400 });
  if (!text) return Response.json({ error: "empty_body" }, { status: 400 });

  try {
    await sendReply({ to, cc: cc.length ? cc : undefined, subject: subject || "(no subject)", text: buildTextEmail(text), html: buildHtmlEmail(text) });
    return Response.json({ ok: true, to, cc });
  } catch (e) {
    const status = e instanceof HmError ? e.status : 502;
    return Response.json({ error: e?.code || "send_failed", detail: String(e?.message || "").slice(0, 200) }, { status });
  }
}
