// Professor console — mark a coordinator email handled (or not) without a reply.
// Toggles the standard \Answered flag on the message.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireFaculty } from "@/lib/professor-auth";
import { mailConfigured, setAnswered, HmError } from "@/lib/hostinger-mail";

export async function POST(request) {
  const gate = await requireFaculty(request);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });
  if (!mailConfigured()) return Response.json({ error: "mail_unconfigured" }, { status: 503 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "bad_request" }, { status: 400 }); }

  const uid = body?.uid;
  const done = body?.done !== false; // default true
  if (uid == null || uid === "") return Response.json({ error: "no_uid" }, { status: 400 });

  try {
    await setAnswered(uid, done);
    return Response.json({ ok: true });
  } catch (e) {
    const status = e instanceof HmError ? e.status : 502;
    return Response.json({ error: e?.code || "flag_failed", detail: String(e?.message || "").slice(0, 200) }, { status });
  }
}
