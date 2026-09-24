// Professor console — timetable image → structured schedule via OpenRouter vision.
// The client posts a base64 data-URL of a timetable photo; we ask a multimodal
// model to read it into a JSON array of { time, subject, room, group }.
// Key stays server-side (OPENROUTER_API_KEY). Faculty-gating is enforced by RLS
// on the write that follows; this route only parses an image the user supplied.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MODEL =
  process.env.OPENROUTER_VISION_MODEL ||
  process.env.OPENROUTER_MODEL ||
  "google/gemini-3.5-flash-lite";

const MAX_IMG_BYTES = 6_000_000; // ~6MB data-URL cap

function extractJsonArray(text) {
  if (!text) return null;
  // strip code fences, then grab the first [...] block
  const cleaned = String(text).replace(/```(json)?/gi, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function normalize(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((e) => ({
      time: String(e?.time || e?.period || "").slice(0, 40).trim(),
      subject: String(e?.subject || e?.course || e?.class || "").slice(0, 120).trim(),
      room: String(e?.room || e?.venue || e?.location || "").slice(0, 60).trim(),
      group: String(e?.group || e?.section || e?.cohort || "").slice(0, 60).trim(),
    }))
    .filter((e) => e.subject || e.time)
    .slice(0, 20);
}

export async function POST(request) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return Response.json({ error: "ocr_unconfigured", entries: [] }, { status: 200 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request", entries: [] }, { status: 400 });
  }

  const image = body?.image;
  if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
    return Response.json({ error: "no_image", entries: [] }, { status: 400 });
  }
  if (image.length > MAX_IMG_BYTES) {
    return Response.json({ error: "image_too_large", entries: [] }, { status: 413 });
  }

  const prompt = [
    "You are reading a university class timetable from an image.",
    "Extract every class/period you can see for the day.",
    "Return ONLY a JSON array (no prose, no code fence). Each item:",
    '{ "time": "start-end or period", "subject": "course name", "room": "room/venue if shown", "group": "class/section if shown" }.',
    "If a field is not visible, use an empty string. Keep times in the order they appear.",
  ].join("\n");

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://www.madebysid.space",
        "X-Title": "ARGUS Instructor Console",
      },
      cache: "no-store",
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        max_tokens: 900,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
      }),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return Response.json({ error: `upstream_${r.status}`, detail: detail.slice(0, 300), entries: [] }, { status: 200 });
    }

    const d = await r.json();
    const text = d?.choices?.[0]?.message?.content || "";
    const entries = normalize(extractJsonArray(text));
    return Response.json({ entries, model: MODEL }, { status: 200 });
  } catch {
    return Response.json({ error: "fetch_failed", entries: [] }, { status: 200 });
  }
}
