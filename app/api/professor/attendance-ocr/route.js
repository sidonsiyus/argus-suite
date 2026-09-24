// Professor console — attendance OCR. Reads a photographed list (typically the
// day's absentees, by roll/reg number or name) into plain tokens the client
// matches against the roster. OpenRouter vision; key stays server-side.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MODEL =
  process.env.OPENROUTER_VISION_MODEL ||
  process.env.OPENROUTER_MODEL ||
  "google/gemini-3.5-flash-lite";
const MAX_IMG_BYTES = 6_000_000;

function extractJsonArray(text) {
  if (!text) return null;
  const cleaned = String(text).replace(/```(json)?/gi, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return null;
  try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { return null; }
}

export async function POST(request) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return Response.json({ error: "ocr_unconfigured", tokens: [] }, { status: 200 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "bad_request", tokens: [] }, { status: 400 }); }

  const image = body?.image;
  if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
    return Response.json({ error: "no_image", tokens: [] }, { status: 400 });
  }
  if (image.length > MAX_IMG_BYTES) return Response.json({ error: "image_too_large", tokens: [] }, { status: 413 });

  const prompt = [
    "This is a photo of a class attendance list — usually the students who are ABSENT,",
    "written as roll numbers, registration numbers, and/or names.",
    "Extract every identifier written on it (roll/reg numbers and names).",
    "Return ONLY a JSON array of strings, one per entry, exactly as written.",
    "Do not invent entries. If the image is blank, return [].",
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
        max_tokens: 700,
        messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: image } }] }],
      }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return Response.json({ error: `upstream_${r.status}`, detail: detail.slice(0, 200), tokens: [] }, { status: 200 });
    }
    const d = await r.json();
    const arr = extractJsonArray(d?.choices?.[0]?.message?.content || "") || [];
    const tokens = arr.map((x) => String(x).trim()).filter(Boolean).slice(0, 80);
    return Response.json({ tokens, model: MODEL }, { status: 200 });
  } catch {
    return Response.json({ error: "fetch_failed", tokens: [] }, { status: 200 });
  }
}
