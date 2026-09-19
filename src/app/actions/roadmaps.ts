"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { executeSetRoadmapStage, executeSaveRoadmapTemplate, executeSetStudentTrack } from "@/lib/data/roadmaps";
import { getAuthenticatedFaculty } from "@/lib/data/achievements";
import { roadmapForSlug, RoadmapStage } from "@/lib/mentor-os/roadmaps";

// ── Set a cadet's stage (P2) ──────────────────────────────────────────
const SetStageSchema = z.object({
  studentId: z.string().uuid("Invalid cadet id"),
  trackSlug: z.string().min(1).max(64),
  stageKey: z.string().min(1).max(64),
});

export async function setStudentRoadmapStageAction(raw: {
  studentId: string;
  trackSlug: string;
  stageKey: string;
}) {
  try {
    const v = SetStageSchema.parse(raw);
    const res = await executeSetRoadmapStage(v.studentId, v.trackSlug, v.stageKey);
    if (!res.success) return { success: false, error: res.error || "Failed to update stage." };
    revalidatePath("/mentor-os/roadmaps");
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update stage." };
  }
}

// ── Change a cadet's career track ─────────────────────────────────────
const SetTrackSchema = z.object({
  studentId: z.string().uuid("Invalid cadet id"),
  trackSlug: z.string().min(1).max(64),
});

export async function setStudentTrackAction(raw: { studentId: string; trackSlug: string }) {
  try {
    const v = SetTrackSchema.parse(raw);
    const res = await executeSetStudentTrack(v.studentId, v.trackSlug);
    if (!res.success) return { success: false, error: res.error || "Failed to change track." };
    revalidatePath("/mentor-os/roadmaps");
    revalidatePath(`/mentor-os/students/${v.studentId}`);
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to change track." };
  }
}

// ── AI-suggested roadmap (P3) ─────────────────────────────────────────
const StageZ = z.object({
  key: z.string().min(1).max(64),
  title: z.string().min(1).max(120),
  phase: z.string().max(80).default(""),
  objective: z.string().min(1).max(600),
  criteria: z.array(z.string().max(200)).max(8).default([]),
});
const SuggestionZ = z.object({
  stages: z.array(StageZ).min(3).max(10),
  examGuidance: z.string().max(2000).default(""),
});

export type RoadmapSuggestion = z.infer<typeof SuggestionZ>;

const AI_MODEL = process.env.OPENROUTER_MODEL || "google/gemini-3.5-flash-lite";

/**
 * Generate a suggested roadmap for a track. Explicit mentor action only —
 * never runs on page load. Server-side key, structured JSON, Zod-validated;
 * the mentor reviews/edits and approves before it is saved.
 */
export async function generateRoadmapSuggestionAction(trackSlug: string): Promise<{
  success: boolean;
  suggestion: RoadmapSuggestion | null;
  error: string | null;
}> {
  try {
    await getAuthenticatedFaculty(); // gate to faculty
  } catch {
    return { success: false, suggestion: null, error: "Not authorised." };
  }

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return { success: false, suggestion: null, error: "AI is not configured." };

  const base = roadmapForSlug(trackSlug === "generic" ? null : trackSlug);
  const current = base.stages
    .map((s, i) => `${i + 1}. ${s.title} — ${s.objective}`)
    .join("\n");

  const system = [
    "You are an aviation career-pathway advisor for a B.Sc Aviation (2nd-year) cohort in India (DGCA / AAI / IATA context).",
    "Produce a refined, milestone-based career roadmap for the given track: an ordered list of stages from the current 2nd-year foundation through professional certification and placement.",
    "Rules:",
    "- Be accurate to the Indian regulatory pathway (DGCA CARs, AAI recruitment, IATA where relevant).",
    "- For exams, give the TYPICAL cadence / window and what to prepare — DO NOT invent specific dates; always add 'verify the official notification'. Put this in examGuidance.",
    "- 5–8 stages. Each stage: a short kebab-case key, a title, a short phase label, a one-sentence objective, and 1–4 concrete criteria.",
    "- Output STRICT JSON only, no prose, matching: {\"stages\":[{\"key\",\"title\",\"phase\",\"objective\",\"criteria\":[]}],\"examGuidance\":\"\"}.",
  ].join("\n");

  const user = `Track: ${base.title} (${base.authority}).\nCurrent roadmap for reference:\n${current}\n\nReturn the improved roadmap as JSON.`;

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://www.madebysid.space",
        "X-Title": "ARGUS MENTOR OS",
      },
      cache: "no-store",
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: 0.4,
        max_tokens: 1400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!r.ok) return { success: false, suggestion: null, error: `AI request failed (${r.status}).` };
    const d = await r.json();
    const raw = d?.choices?.[0]?.message?.content;
    if (!raw) return { success: false, suggestion: null, error: "Empty AI response." };

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = String(raw).match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : null;
    }
    const validated = SuggestionZ.safeParse(parsed);
    if (!validated.success) return { success: false, suggestion: null, error: "AI returned an unexpected format." };

    return { success: true, suggestion: validated.data, error: null };
  } catch {
    return { success: false, suggestion: null, error: "Couldn't reach the AI service." };
  }
}

// ── Save (approve/edit) a roadmap template ────────────────────────────
const SaveTemplateSchema = z.object({
  trackSlug: z.string().min(1).max(64),
  stages: z.array(StageZ).min(1).max(12),
  examGuidance: z.string().max(2000).optional().nullable(),
  source: z.enum(["AI_SUGGESTED", "MENTOR_EDITED"]).default("MENTOR_EDITED"),
});

export async function saveRoadmapTemplateAction(raw: {
  trackSlug: string;
  stages: RoadmapStage[];
  examGuidance?: string | null;
  source?: "AI_SUGGESTED" | "MENTOR_EDITED";
}) {
  try {
    const v = SaveTemplateSchema.parse(raw);
    const res = await executeSaveRoadmapTemplate(
      v.trackSlug,
      v.stages as RoadmapStage[],
      v.examGuidance ?? null,
      v.source
    );
    if (!res.success) return { success: false, error: res.error || "Failed to save." };
    revalidatePath("/mentor-os/roadmaps");
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save." };
  }
}
