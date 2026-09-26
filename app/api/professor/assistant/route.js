// Professor console — JARVIS conversational brain. Faculty-gated. Calls
// OpenRouter with tool-calling; the CLIENT executes the tools (against the
// Supabase data layers under RLS) and calls back with results. Stateless: the
// client sends the full message history each turn.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireFaculty } from "@/lib/professor-auth";
import { ASSISTANT_SYSTEM, ASSISTANT_TOOLS } from "@/lib/jarvis-tools-def";

const MODEL = process.env.OPENROUTER_ASSISTANT_MODEL || "openai/gpt-4o-mini";

export async function POST(request) {
  const gate = await requireFaculty(request);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return Response.json({ error: "assistant_unconfigured" }, { status: 503 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "bad_request" }, { status: 400 }); }

  const incoming = Array.isArray(body?.messages) ? body.messages : [];
  if (!incoming.length) return Response.json({ error: "no_messages" }, { status: 400 });

  const today = String(body?.today || new Date().toISOString().slice(0, 10));
  const system = { role: "system", content: ASSISTANT_SYSTEM.replace("{today}", today) };
  const messages = incoming[0]?.role === "system" ? incoming : [system, ...incoming];

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://www.madebysid.space",
        "X-Title": "ARGUS Instructor Console — JARVIS",
      },
      cache: "no-store",
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        max_tokens: 700,
        tools: ASSISTANT_TOOLS,
        tool_choice: "auto",
        messages,
      }),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return Response.json({ error: `upstream_${r.status}`, detail: detail.slice(0, 300) }, { status: 502 });
    }
    const data = await r.json();
    const message = data?.choices?.[0]?.message || { role: "assistant", content: "" };
    return Response.json({ message });
  } catch (e) {
    return Response.json({ error: "fetch_failed", detail: String(e?.message || "").slice(0, 200) }, { status: 502 });
  }
}
