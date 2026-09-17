import { getAuthenticatedFaculty } from "@/lib/data/achievements";

export interface SkillUpdateInput {
  skillId: string;
  rating: number; // 1–5
  note?: string;
}

/**
 * Record mentor skill re-assessments (typically after a session). Each update
 * inserts a new skill_assessments row — the history is the development trend.
 * session_id is best-effort: if the column isn't present yet (migration not
 * applied), we retry without it so the feature still works.
 */
export async function executeRecordSkillAssessments(
  studentId: string,
  sessionId: string | null,
  updates: SkillUpdateInput[]
): Promise<{ success: boolean; inserted: number; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const clean = (updates || [])
    .filter((u) => u.skillId && u.rating >= 1 && u.rating <= 5)
    .map((u) => ({
      student_id: studentId,
      skill_id: u.skillId,
      rating: Math.round(u.rating),
      assessment_type: "MENTOR_ASSESSED" as const,
      provenance: "MENTOR_ENTERED" as const,
      assessed_by: user.id,
      notes: u.note?.trim() || null,
    }));

  if (clean.length === 0) return { success: true, inserted: 0 };

  const withSession = sessionId ? clean.map((r) => ({ ...r, session_id: sessionId })) : clean;

  let { error } = await supabase.from("skill_assessments").insert(withSession);

  // Retry without session_id if the column doesn't exist yet.
  if (error && sessionId && /session_id/i.test(error.message || "")) {
    ({ error } = await supabase.from("skill_assessments").insert(clean));
  }

  if (error) {
    console.error("Error recording skill assessments:", error);
    return { success: false, inserted: 0, error: "Failed to save skill updates." };
  }

  await supabase.from("audit_logs").insert({
    entity_table: "skill_assessments",
    entity_id: studentId,
    action: "INSERT",
    actor_id: user.id,
    actor_role: "faculty",
    new_values: { student_id: studentId, session_id: sessionId, count: clean.length },
  });

  return { success: true, inserted: clean.length };
}
