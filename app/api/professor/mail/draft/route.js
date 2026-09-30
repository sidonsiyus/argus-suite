// Professor console — AI email draft from keywords (faculty-gated). Uses the
// existing OpenRouter key with a Gemini model. Returns { subject, body }.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireFaculty } from "@/lib/professor-auth";

const MODEL = process.env.OPENROUTER_DRAFT_MODEL || process.env.OPENROUTER_VISION_MODEL || "google/gemini-3.5-flash-lite";

export async function POST(request) {
  const gate = await requireFaculty(request);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return Response.json({ error: "draft_unconfigured" }, { status: 503 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "bad_request" }, { status: 400 }); }

  const brief = String(body?.brief || "").trim();
  const tone = String(body?.tone || "professional and warm").slice(0, 60);
  if (!brief) return Response.json({ error: "empty_brief" }, { status: 400 });

  const system = [
    "You draft emails for Siddarth J, an Assistant Professor at Vels University (aviation department).",
    "Write a concise, well-structured email from the keywords the user gives.",
    "Do NOT add a signature or sign-off block — it is appended automatically. A short closing line like 'Regards,' is fine but no name/title.",
    "Do NOT invent facts, names, dates or numbers that aren't in the brief.",
    `Tone: ${tone}.`,
    'Return ONLY strict JSON: {"subject": "...", "body": "..."} with no markdown, no code fence.',
  ].join(" ");

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://www.madebysid.space",
        "X-Title": "ARGUS Instructor Console - Mail draft",
      },
      cache: "no-store",
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.5,
        max_tokens: 700,
        messages: [{ role: "system", content: system }, { role: "user", content: `Draft an email about: ${brief}` }],
      }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return Response.json({ error: `upstream_${r.status}`, detail: detail.slice(0, 200) }, { status: 502 });
    }
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const cleaned = content.replace(/```(json)?/gi, "").trim();
    let subject = "", bodyText = "";
    try {
      const a = cleaned.indexOf("{"), b = cleaned.lastIndexOf("}");
      const parsed = JSON.parse(a !== -1 && b !== -1 ? cleaned.slice(a, b + 1) : cleaned);
      subject = String(parsed.subject || "").trim();
      bodyText = String(parsed.body || "").trim();
    } catch {
      bodyText = cleaned; // model returned prose — use it as the body
    }
    if (!bodyText) return Response.json({ error: "empty_draft" }, { status: 502 });
    return Response.json({ subject, body: bodyText });
  } catch (e) {
    return Response.json({ error: "fetch_failed", detail: String(e?.message || "").slice(0, 200) }, { status: 502 });
  }
}
