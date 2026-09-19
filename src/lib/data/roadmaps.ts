import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedFaculty } from "@/lib/data/achievements";
import { roadmapForSlug, CareerRoadmap } from "@/lib/mentor-os/roadmaps";
import { MENTOR_COHORT_CODE } from "@/lib/mentor-os/cohort";

async function queryWithFallback<T>(queryFn: (client: any) => Promise<T>): Promise<T> {
  try {
    return await queryFn(createServerSupabase());
  } catch (err) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) return await queryFn(createAdminClient());
    throw err;
  }
}

export interface RoadmapStudent {
  id: string;
  name: string;
  regNo: string;
  /** Derived (auto-estimated) stage index into the track's roadmap. */
  stageIndex: number;
  stageKey: string;
  /** True until a mentor confirms/overrides (P2). */
  estimated: boolean;
}

export interface TrackCluster {
  slug: string;
  title: string;
  icon: string;
  authority: string;
  summary: string;
  stageCount: number;
  studentCount: number;
  avgStageIndex: number;
  students: RoadmapStudent[];
}

export interface CohortRoadmaps {
  tracks: TrackCluster[];
  totalStudents: number;
  generatedAt: string;
}

const READY = new Set(["VERIFIED", "AVAILABLE"]);
const READINESS_FIELDS = [
  "resume_status",
  "linkedin_status",
  "passport_status",
  "driving_license_status",
  "pan_card_status",
  "aadhaar_card_status",
] as const;

function isHistorical(m: any): boolean {
  return m.provenance === "HISTORICAL_PROFILE" || m.category === "Action Plan" || m.status === "ARCHIVED" || Boolean(m.is_archived);
}

/**
 * Derive a conservative, auto-estimated stage for a 2nd-year student. Readiness
 * documents and early milestones are foundation signals — they must not imply
 * licensing progress — so the estimate stays in the lower-to-mid range and the
 * mentor confirms/overrides it later.
 */
function deriveStageIndex(readyCount: number, completedMilestones: number, achievements: number, stageCount: number): number {
  const readinessFrac = readyCount / 6;
  const mFrac = Math.min(completedMilestones, 5) / 5;
  const aFrac = Math.min(achievements, 3) / 3;
  const score = 0.5 * readinessFrac + 0.3 * mFrac + 0.2 * aFrac; // 0–1
  if (score < 0.15) return 0;
  const idx = Math.round(score * (stageCount - 1) * 0.6); // conservative cap
  return Math.max(0, Math.min(idx, stageCount - 1));
}

export const getCohortRoadmaps = cache(async function getCohortRoadmaps(): Promise<{
  data: CohortRoadmaps | null;
  error: any;
}> {
  return queryWithFallback(async (supabase) => {
    try {
      const [
        { data: studentsRaw },
        { data: goalsRaw },
        { data: rolesRaw },
        { data: readinessRaw },
        { data: milestonesRaw },
        { data: achievementsRaw },
        { data: progressRaw },
      ] = await Promise.all([
        supabase.from("students").select("id, full_name, reg_no, sno, cohorts!inner(code)").eq("cohorts.code", MENTOR_COHORT_CODE).order("sno", { ascending: true }),
        supabase.from("student_career_goals").select("student_id, career_role_id, custom_role_title, is_primary").eq("is_primary", true),
        supabase.from("career_roles").select("id, slug, title"),
        supabase.from("career_readiness").select("student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status"),
        supabase.from("milestones").select("student_id, status, provenance, category, is_archived, parent_milestone_id"),
        supabase.from("achievements").select("student_id"),
        // Resilient: if the table isn't migrated yet this returns null → all estimated.
        supabase.from("roadmap_progress").select("student_id, track_slug, current_stage_key"),
      ]);

      const students = (studentsRaw || []) as any[];
      const slugById = new Map<string, string>();
      ((rolesRaw || []) as any[]).forEach((r) => slugById.set(r.id, r.slug));

      const trackByStudent = new Map<string, string>(); // student → slug
      ((goalsRaw || []) as any[]).forEach((g) => {
        const slug = g.career_role_id ? slugById.get(g.career_role_id) : undefined;
        trackByStudent.set(g.student_id, slug || slugFromTitle(g.custom_role_title));
      });

      const readyByStudent = new Map<string, number>();
      ((readinessRaw || []) as any[]).forEach((r) => {
        readyByStudent.set(r.student_id, READINESS_FIELDS.filter((f) => READY.has(r[f])).length);
      });

      const completedByStudent = new Map<string, number>();
      ((milestonesRaw || []) as any[]).forEach((m) => {
        if (m.parent_milestone_id || isHistorical(m)) return;
        if (m.status === "COMPLETED") completedByStudent.set(m.student_id, (completedByStudent.get(m.student_id) || 0) + 1);
      });

      const achByStudent = new Map<string, number>();
      ((achievementsRaw || []) as any[]).forEach((a) => achByStudent.set(a.student_id, (achByStudent.get(a.student_id) || 0) + 1));

      // Explicit mentor-set placement (overrides the estimate).
      const explicit = new Map<string, string>(); // `${student}|${track}` → stage_key
      ((progressRaw || []) as any[]).forEach((p) => explicit.set(`${p.student_id}|${p.track_slug}`, p.current_stage_key));

      // Group students into track clusters.
      const clusters = new Map<string, RoadmapStudent[]>();
      students.forEach((s) => {
        const slug = trackByStudent.get(s.id) || "generic";
        const roadmap = roadmapForSlug(slug === "generic" ? null : slug);
        const key = roadmap.slug; // normalises unknown slugs to "generic"

        const setKey = explicit.get(`${s.id}|${key}`);
        const setIdx = setKey ? roadmap.stages.findIndex((st) => st.key === setKey) : -1;
        const estimated = setIdx < 0;
        const stageIndex = estimated
          ? deriveStageIndex(
              readyByStudent.get(s.id) || 0,
              completedByStudent.get(s.id) || 0,
              achByStudent.get(s.id) || 0,
              roadmap.stages.length
            )
          : setIdx;

        if (!clusters.has(key)) clusters.set(key, []);
        clusters.get(key)!.push({
          id: s.id,
          name: s.full_name,
          regNo: s.reg_no,
          stageIndex,
          stageKey: roadmap.stages[stageIndex]?.key || roadmap.stages[0].key,
          estimated,
        });
      });

      const tracks: TrackCluster[] = Array.from(clusters.entries())
        .map(([slug, studentsInTrack]) => {
          const rm: CareerRoadmap = roadmapForSlug(slug === "generic" ? null : slug);
          const avg = studentsInTrack.reduce((sum, st) => sum + st.stageIndex, 0) / studentsInTrack.length;
          return {
            slug: rm.slug,
            title: rm.title,
            icon: rm.icon,
            authority: rm.authority,
            summary: rm.summary,
            stageCount: rm.stages.length,
            studentCount: studentsInTrack.length,
            avgStageIndex: Math.round(avg * 10) / 10,
            students: studentsInTrack.sort((a, b) => b.stageIndex - a.stageIndex || a.name.localeCompare(b.name)),
          };
        })
        .sort((a, b) => b.studentCount - a.studentCount);

      return { data: { tracks, totalStudents: students.length, generatedAt: new Date().toISOString() }, error: null };
    } catch (e: any) {
      return { data: null, error: e?.message || String(e) };
    }
  });
});

/**
 * Mentor confirms/overrides where a cadet stands on a track's roadmap.
 * Upserts one row per (student, track). Faculty-only (RLS + is_faculty()).
 */
export async function executeSetRoadmapStage(
  studentId: string,
  trackSlug: string,
  stageKey: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedFaculty();

  const { error } = await supabase.from("roadmap_progress").upsert(
    {
      student_id: studentId,
      track_slug: trackSlug,
      current_stage_key: stageKey,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,track_slug" }
  );

  if (error) {
    console.error("Error setting roadmap stage:", error);
    return { success: false, error: "Failed to update the cadet's stage." };
  }

  // Best-effort audit (never blocks the write).
  try {
    await supabase.from("audit_logs").insert({
      entity_table: "roadmap_progress",
      entity_id: studentId,
      action: "UPDATE",
      actor_id: user.id,
      actor_role: "faculty",
      new_values: { track_slug: trackSlug, current_stage_key: stageKey },
    });
  } catch {
    /* ignore */
  }

  return { success: true };
}

// Best-effort mapping from a free-text custom role title to a roadmap slug.
function slugFromTitle(title: string | null | undefined): string {
  const t = (title || "").toLowerCase();
  if (!t) return "generic";
  if (t.includes("pilot")) return "pilot-cpl";
  if (t.includes("traffic") || t.includes("atc")) return "atc";
  if (t.includes("dispatch")) return "dispatcher";
  if (t.includes("ground")) return "ground-ops";
  if (t.includes("airport")) return "airport-ops";
  if (t.includes("avionic")) return "avionics";
  if (t.includes("maintenance") || t.includes("ame")) return "ame";
  if (t.includes("drone") || t.includes("uav")) return "uav-drone";
  return "generic";
}
