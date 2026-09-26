// Professor console — JARVIS text-to-speech. Faculty-gated; returns MP3 audio.
// Fish Audio when configured, else free Edge TTS (see lib/tts.js).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireFaculty } from "@/lib/professor-auth";
import { synthesize, TtsError } from "@/lib/tts";

export async function POST(request) {
  const gate = await requireFaculty(request);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "bad_request" }, { status: 400 }); }

  const text = String(body?.text || "").trim();
  if (!text) return Response.json({ error: "empty_text" }, { status: 400 });

  try {
    const { buffer, contentType, provider } = await synthesize(text, { voiceId: body?.voiceId });
    return new Response(buffer, {
      status: 200,
      headers: { "Content-Type": contentType, "X-TTS-Provider": provider, "Cache-Control": "no-store" },
    });
  } catch (e) {
    const status = e instanceof TtsError ? e.status : 502;
    return Response.json({ error: e?.code || "tts_failed", detail: String(e?.message || "").slice(0, 200) }, { status });
  }
}
