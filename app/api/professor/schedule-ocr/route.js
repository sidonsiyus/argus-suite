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

// Parse whatever JSON the model returned — an array, or an object (possibly
// keyed by weekday for a weekly grid). Returns the classes for `weekday` when
// the object is day-keyed, else flattens everything it finds.
function parseEntries(text, weekday) {
  if (!text) return [];
  const cleaned = String(text).replace(/```(json)?/gi, "").trim();
  let data = null;
  // try a full parse first, then the widest {...} or [...] block
  for (const slice of [cleaned, blockOf(cleaned, "{", "}"), blockOf(cleaned, "[", "]")]) {
    if (!slice) continue;
    try { data = JSON.parse(slice); break; } catch { /* try next */ }
  }
  if (!data) return [];
  if (Array.isArray(data)) return normalize(data);
  if (typeof data === "object") {
    // common wrappers
    if (Array.isArray(data.entries)) return normalize(data.entries);
    if (Array.isArray(data.classes)) return normalize(data.classes);
    if (Array.isArray(data.schedule)) return normalize(data.schedule);
    // day-keyed object → pick the requested weekday (case-insensitive), else flatten
    const wd = (weekday || "").toLowerCase();
    const dayKey = Object.keys(data).find((k) => k.toLowerCase() === wd);
    if (dayKey && Array.isArray(data[dayKey])) return normalize(data[dayKey]);
    const flat = [];
    Object.values(data).forEach((v) => { if (Array.isArray(v)) flat.push(...v); });
    return normalize(flat);
  }
  return [];
}

function blockOf(s, open, close) {
  const a = s.indexOf(open), b = s.lastIndexOf(close);
  return a !== -1 && b !== -1 && b > a ? s.slice(a, b + 1) : null;
}

function normalize(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((e) => (typeof e === "string" ? { subject: e } : e))
    .map((e) => ({
      time: String(e?.time || e?.period || e?.slot || "").slice(0, 40).trim(),
      subject: String(e?.subject || e?.course || e?.class || e?.name || "").slice(0, 120).trim(),
      room: String(e?.room || e?.venue || e?.location || e?.hall || "").slice(0, 60).trim(),
      group: String(e?.group || e?.section || e?.cohort || e?.batch || "").slice(0, 60).trim(),
    }))
    .filter((e) => e.subject || e.time)
    .slice(0, 24);
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

  const weekday = String(body?.weekday || "").slice(0, 20).trim();
  const instructor = String(body?.instructor || "").slice(0, 40).trim();
  const subjects = Array.isArray(body?.subjects) ? body.subjects.map((s) => String(s).slice(0, 40)).slice(0, 12) : [];

  let prompt;
  if (instructor && subjects.length) {
    // Department-wide "daily classroom monitoring report" grid → pull only the
    // periods this instructor teaches (a fixed short subject list).
    const subj = subjects.join(", ");
    prompt = [
      'This image is a DEPARTMENT-WIDE "DAILY CLASSROOM MONITORING REPORT" — a grid.',
      '- Each ROW is a class/section, labelled on the left by a code like "AVI 2A" with a room number below it like "706".',
      '- Each COLUMN is a period numbered 1..6, with a time range in the header (e.g. "01.30-2.15"). One column is "LUNCH BREAK" — ignore it.',
      "- Inside a cell: the subject/short-code is on top and the teacher's name is below it.",
      `Find the periods that belong to instructor "${instructor}" (the name appears as "Mr. ${instructor}" or a very close spelling such as "Siddarth"). Scan EVERY cell in the whole grid — all class rows and all period columns 1-6 — and apply this single rule:`,
      `INCLUDE a cell only if BOTH are true: (a) its subject is one of ${subj} (Mentor Hour = "Mentoring Hour"); AND (b) the teacher name written in that same cell is ${instructor} (or a close spelling).`,
      `EXCLUDE any cell that has no teacher name, or a different teacher's name — even if the subject matches. For example, an NDT or a Mentoring Hour cell taught by someone else, or with no name, is NOT ${instructor}'s and must be left out.`,
      "Ignore every other subject.",
      "Scan all 6 period columns for every class row before answering; do not stop at the first match.",
      "For each matching cell return an object:",
      '{ "time": "<the period time range from the column header>", "subject": "<NDT | GTEM | Mentoring Hour>", "room": "<the row room number, e.g. 706>", "group": "<the row class code, e.g. AVI 2A>" }.',
      "Return ONLY a JSON array (no prose, no code fence). If there are no matches, return [].",
    ].join("\n");
  } else {
    prompt = [
      "You are reading a university class timetable from an image.",
      "It may be a full WEEKLY timetable (a grid of days as rows/columns and time periods), or a single day.",
      weekday ? `Extract ONLY the classes for ${weekday}. Find the ${weekday} row/column and read across its periods.` : "Extract the classes shown.",
      "Ignore breaks, lunch, library/free periods and empty cells.",
      "Return ONLY a JSON array (no prose, no code fence). Each item:",
      '{ "time": "start-end or period label", "subject": "subject/course name", "room": "room/venue if shown", "group": "class/section if shown" }.',
      "If a field is not visible, use an empty string. Keep the periods in time order.",
      "If there are genuinely no classes for that day, return [].",
    ].join("\n");
  }

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
        max_tokens: 1400,
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
    const entries = parseEntries(text, weekday);
    // Surface the raw model text when nothing parsed, so the UI can explain why.
    return Response.json({ entries, model: MODEL, raw: entries.length ? undefined : text.slice(0, 300) }, { status: 200 });
  } catch (e) {
    return Response.json({ error: "fetch_failed", detail: String(e?.message || "").slice(0, 200), entries: [] }, { status: 200 });
  }
}
