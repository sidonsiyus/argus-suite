// Public text-to-speech for the AI tutors (NDT / GTEM). Students aren't signed
// in, so unlike the faculty-gated FRIDAY route this one is open — and therefore
// guarded: same-site requests only, short text, and a per-visitor rate limit.
// It is pinned to the free Edge voice, so it can never spend Fish Audio credits.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { synthesize, TtsError } from "@/lib/tts";

const MAX_CHARS = 1200;
const LIMIT = 30;            // requests…
const WINDOW_MS = 600_000;   // …per 10 minutes, per visitor (best-effort, per instance)
const hits = new Map();

const VOICE = process.env.TUTOR_TTS_VOICE || "en-IN-NeerjaNeural";

function sameSite(request) {
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "").toLowerCase();
  const from = request.headers.get("origin") || request.headers.get("referer") || "";
  if (!host || !from) return false;
  try { return new URL(from).host.toLowerCase() === host; } catch { return false; }
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) { hits.set(ip, recent); return true; }
  recent.push(now); hits.set(ip, recent);
  if (hits.size > 5000) { // keep the map from growing forever
    for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  }
  return false;
}

export async function POST(request) {
  if (!sameSite(request)) return Response.json({ error: "forbidden" }, { status: 403 });

  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "bad_request" }, { status: 400 }); }

  const text = String(body?.text || "").replace(/\s+/g, " ").trim().slice(0, MAX_CHARS);
  if (!text) return Response.json({ error: "empty_text" }, { status: 400 });

  try {
    const { buffer, contentType } = await synthesize(text, {
      provider: "edge",
      edgeVoice: VOICE,
      prosody: { rate: "-2%", pitch: "+0%" },
    });
    return new Response(buffer, { status: 200, headers: { "Content-Type": contentType, "Cache-Control": "no-store" } });
  } catch (e) {
    const status = e instanceof TtsError ? e.status : 502;
    return Response.json({ error: e?.code || "tts_failed" }, { status });
  }
}
