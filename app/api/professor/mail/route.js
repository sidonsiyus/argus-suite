// Professor console — today's emails from the coordinator (read side).
// Faculty-gated by a bearer token; the mailbox token stays server-side.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireFaculty } from "@/lib/professor-auth";
import { mailConfigured, searchFrom, todayInTz, daysAgoInTz, HmError } from "@/lib/hostinger-mail";
import { COORDINATOR_EMAIL, shapeMessage } from "@/lib/coordinator-inbox";

export async function GET(request) {
  const gate = await requireFaculty(request);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });

  if (!mailConfigured()) {
    return Response.json({ configured: false, coordinator: COORDINATOR_EMAIL, messages: [], total: 0, pending: 0 });
  }

  try {
    // Default: today only. ?days=N widens the window (for the history panel).
    const days = Math.min(Math.max(parseInt(new URL(request.url).searchParams.get("days") || "0", 10) || 0, 0), 180);
    const since = days > 0 ? daysAgoInTz(days) : todayInTz();
    const raw = await searchFrom({ from: COORDINATOR_EMAIL, since });
    const messages = raw
      .filter((m) => String(m.from?.address || "").toLowerCase().includes(COORDINATOR_EMAIL))
      .map(shapeMessage)
      .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0)); // oldest first → reply in order
    const pending = messages.filter((m) => !m.answered).length;
    return Response.json({ configured: true, coordinator: COORDINATOR_EMAIL, since, messages, total: messages.length, pending });
  } catch (e) {
    const status = e instanceof HmError ? e.status : 502;
    return Response.json({ configured: true, error: e?.code || "mail_error", detail: String(e?.message || "").slice(0, 200) }, { status });
  }
}
