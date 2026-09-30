// Professor console — frequently-emailed addresses (from the Sent folder), for
// recipient autofill. Faculty-gated. Failure is non-fatal: the UI still has the
// roster + recent addresses, so this just returns an empty list on error.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireFaculty } from "@/lib/professor-auth";
import { mailConfigured, sentContacts } from "@/lib/hostinger-mail";

export async function GET(request) {
  const gate = await requireFaculty(request);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });
  if (!mailConfigured()) return Response.json({ contacts: [] });

  try {
    return Response.json({ contacts: await sentContacts() });
  } catch {
    return Response.json({ contacts: [] });
  }
}
