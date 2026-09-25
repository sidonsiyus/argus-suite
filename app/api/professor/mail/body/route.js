// Professor console — one coordinator email's body (fetched lazily by uid).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireFaculty } from "@/lib/professor-auth";
import { mailConfigured, messageText, HmError } from "@/lib/hostinger-mail";

function normalizeBody(data) {
  if (data == null) return { text: "", html: "" };
  if (typeof data === "string") return { text: data, html: "" };
  const text = data.text || data.plain || data.plainText || data.body || "";
  const html = data.html || "";
  return { text: String(text || ""), html: String(html || "") };
}

export async function GET(request) {
  const gate = await requireFaculty(request);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });
  if (!mailConfigured()) return Response.json({ configured: false, text: "", html: "" });

  const uid = new URL(request.url).searchParams.get("uid");
  if (!uid) return Response.json({ error: "no_uid" }, { status: 400 });

  try {
    const data = await messageText(uid);
    return Response.json({ configured: true, ...normalizeBody(data) });
  } catch (e) {
    const status = e instanceof HmError ? e.status : 502;
    return Response.json({ error: e?.code || "mail_error" }, { status });
  }
}
