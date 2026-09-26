// Server-only text-to-speech for the JARVIS voice.
//
// Provider order:
//   1. Fish Audio  — when FISH_AUDIO_API_KEY is set (uses your voice/clone).
//   2. Edge TTS    — free Microsoft neural voice (en-GB-RyanNeural), no key.
//   3. (the browser's own speech, handled client-side, if this route fails).
//
// Returns raw MP3 bytes. The Fish key is a secret (env only, never client-side).

export class TtsError extends Error {
  constructor(code, status, message) {
    super(message || code);
    this.name = "TtsError";
    this.code = code;
    this.status = status || 502;
  }
}

const MAX_CHARS = 2000;

// Synthesize `text` to MP3. opts.voiceId overrides the Fish reference id.
export async function synthesize(text, opts = {}) {
  const clean = String(text || "").slice(0, MAX_CHARS).trim();
  if (!clean) throw new TtsError("empty_text", 400);

  if (process.env.FISH_AUDIO_API_KEY) {
    try {
      return await fishTts(clean, opts);
    } catch (e) {
      // Fall back to Edge unless explicitly told not to.
      if (process.env.TTS_NO_FALLBACK) throw e;
    }
  }
  return await edgeTts(clean, opts);
}

// Which provider a call would use right now (for status/debug).
export function ttsProvider() {
  return process.env.FISH_AUDIO_API_KEY ? "fish" : "edge";
}

async function fishTts(text, opts) {
  const voice = (opts.voiceId || process.env.FISH_AUDIO_VOICE_ID || "").trim();
  const body = { text, format: "mp3", mp3_bitrate: 128 };
  if (voice) body.reference_id = voice;
  const headers = {
    Authorization: `Bearer ${process.env.FISH_AUDIO_API_KEY}`,
    "Content-Type": "application/json",
  };
  if (process.env.FISH_AUDIO_MODEL) headers.model = process.env.FISH_AUDIO_MODEL;

  let r;
  try {
    r = await fetch("https://api.fish.audio/v1/tts", { method: "POST", headers, body: JSON.stringify(body), cache: "no-store" });
  } catch {
    throw new TtsError("fish_network", 502, "Could not reach Fish Audio.");
  }
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw new TtsError(`fish_${r.status}`, r.status, detail.slice(0, 200));
  }
  const buf = Buffer.from(await r.arrayBuffer());
  return { buffer: buf, contentType: "audio/mpeg", provider: "fish" };
}

async function edgeTts(text, opts) {
  const { MsEdgeTTS, OUTPUT_FORMAT } = await import("msedge-tts");
  const voice = (opts.edgeVoice || process.env.EDGE_TTS_VOICE || "en-GB-RyanNeural").trim();
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const chunks = [];
  await new Promise((resolve, reject) => {
    const { audioStream } = tts.toStream(text);
    const done = () => resolve();
    const timer = setTimeout(() => reject(new TtsError("edge_timeout", 504, "Edge TTS timed out.")), 20000);
    audioStream.on("data", (c) => chunks.push(c));
    audioStream.on("end", () => { clearTimeout(timer); done(); });
    audioStream.on("close", () => { clearTimeout(timer); done(); });
    audioStream.on("error", (e) => { clearTimeout(timer); reject(new TtsError("edge_failed", 502, String(e?.message || ""))); });
  });
  if (!chunks.length) throw new TtsError("edge_empty", 502, "Edge TTS returned no audio.");
  return { buffer: Buffer.concat(chunks), contentType: "audio/mpeg", provider: "edge" };
}
