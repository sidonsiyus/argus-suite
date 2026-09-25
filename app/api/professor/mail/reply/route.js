// Professor console — send a threaded reply to the coordinator.
// Replying with inReplyTo also flags the original \Answered upstream.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireFaculty } from "@/lib/professor-auth";
import { mailConfigured, sendReply, HmError } from "@/lib/hostinger-mail";
import { COORDINATOR_EMAIL } from "@/lib/coordinator-inbox";

export async function POST(request) {
  const gate = await requireFaculty(request);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });
  if (!mailConfigured()) return Response.json({ error: "mail_unconfigured" }, { status: 503 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "bad_request" }, { status: 400 }); }

  const text = String(body?.text || "").trim();
  const uid = body?.uid;
  if (!text) return Response.json({ error: "empty_reply" }, { status: 400 });

  let subject = String(body?.subject || "").trim();
  if (!/^re:/i.test(subject)) subject = subject ? `Re: ${subject}` : "Re:";

  try {
    await sendReply({ to: COORDINATOR_EMAIL, subject, text, uid });
    return Response.json({ ok: true });
  } catch (e) {
    const status = e instanceof HmError ? e.status : 502;
    return Response.json({ error: e?.code || "send_failed", detail: String(e?.message || "").slice(0, 200) }, { status });
  }
}
