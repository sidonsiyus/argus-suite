// NDT tutor — grounded Q&A for a single session.
// The client posts the current session's context (title, overview, sections,
// key terms, case study) plus the student's question. We build a tightly
// scoped prompt so the model answers ONLY from NDT course material and says so
// when a doubt falls outside it. Key stays server-side (OPENROUTER_API_KEY).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MODEL = process.env.OPENROUTER_MODEL || "google/gemini-3.5-flash-lite";
const MAX_Q = 500; // cap the student question length

function clip(s, n) {
  s = String(s || "");
  return s.length > n ? s.slice(0, n) + "…" : s;
}

// Build a compact context block from whatever the client sends about the session.
function buildContext(ctx = {}) {
  const parts = [];
  if (ctx.unit) parts.push(`Unit: ${clip(ctx.unit, 120)}`);
  if (ctx.title) parts.push(`Session: ${clip(ctx.title, 160)}`);
  if (ctx.overview) parts.push(`Overview: ${clip(ctx.overview, 900)}`);
  if (Array.isArray(ctx.sections) && ctx.sections.length) {
    parts.push(
      "Lesson notes:\n" +
        ctx.sections
          .slice(0, 8)
          .map((s) => `• ${clip(s.h, 120)}: ${clip(s.p, 500)}`)
          .join("\n")
    );
  }
  if (Array.isArray(ctx.terms) && ctx.terms.length) {
    parts.push(
      "Key terms:\n" +
        ctx.terms
          .slice(0, 14)
          .map((t) => `• ${clip(t.t, 80)} — ${clip(t.d, 200)}`)
          .join("\n")
    );
  }
  if (ctx.caseStudy) {
    const c = ctx.caseStudy;
    parts.push(
      `Case study — ${clip(c.title, 140)}: ${clip(c.context, 300)} ${clip(c.finding, 300)} ${clip(c.lesson, 300)}`
    );
  }
  return parts.join("\n\n");
}

export async function POST(request) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return Response.json(
      { error: "tutor_unconfigured", answer: null },
      { status: 200 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request", answer: null }, { status: 400 });
  }

  const question = clip(body?.question, MAX_Q).trim();
  if (!question) {
    return Response.json({ error: "empty_question", answer: null }, { status: 400 });
  }

  const context = buildContext(body?.context);

  const system = [
    "You are the NDT Bay tutor — a patient, precise teaching assistant for a university",
    "Non-Destructive Testing course (B.Sc Aviation). You help students clear doubts about",
    "the current lesson.",
    "",
    "RULES:",
    "- Answer using the SESSION MATERIAL below and established NDT / materials-science and",
    "  aviation-maintenance knowledge. Stay strictly on NDT and its engineering context.",
    "- If a question is unrelated to NDT or this course, politely decline and steer the",
    "  student back to the lesson. Do not answer off-topic requests (coding, personal, etc.).",
    "- Be accurate. If you are unsure or the material does not cover it, say so plainly and",
    "  suggest asking the instructor — never invent standards, numbers, or citations.",
    "- Keep answers concise and student-friendly: 2–5 short paragraphs or a tight bullet list.",
    "- Use plain text (light markdown ok). Define jargon the first time you use it.",
    "",
    "SESSION MATERIAL:",
    context || "(no extra context supplied — rely on general NDT knowledge for this session)",
  ].join("\n");

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://www.madebysid.space",
        "X-Title": "ARGUS NDT Bay",
      },
      cache: "no-store",
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        max_tokens: 700,
        messages: [
          { role: "system", content: system },
          { role: "user", content: question },
        ],
      }),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return Response.json(
        { error: `upstream_${r.status}`, detail: clip(detail, 300), answer: null },
        { status: 200 }
      );
    }

    const d = await r.json();
    const answer = d?.choices?.[0]?.message?.content?.trim() || null;
    if (!answer) {
      return Response.json({ error: "empty_answer", answer: null }, { status: 200 });
    }
    return Response.json({ answer, model: MODEL }, { status: 200 });
  } catch {
    return Response.json({ error: "fetch_failed", answer: null }, { status: 200 });
  }
}
