import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { roadmapForSlug, CareerRoadmap } from "@/lib/mentor-os/roadmaps";

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
      ] = await Promise.all([
        supabase.from("students").select("id, full_name, reg_no, sno").order("sno", { ascending: true }),
        supabase.from("student_career_goals").select("student_id, career_role_id, custom_role_title, is_primary").eq("is_primary", true),
        supabase.from("career_roles").select("id, slug, title"),
        supabase.from("career_readiness").select("student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status"),
        supabase.from("milestones").select("student_id, status, provenance, category, is_archived, parent_milestone_id"),
        supabase.from("achievements").select("student_id"),
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

      // Group students into track clusters.
      const clusters = new Map<string, RoadmapStudent[]>();
      students.forEach((s) => {
        const slug = trackByStudent.get(s.id) || "generic";
        const roadmap = roadmapForSlug(slug === "generic" ? null : slug);
        const stageIndex = deriveStageIndex(
          readyByStudent.get(s.id) || 0,
          completedByStudent.get(s.id) || 0,
          achByStudent.get(s.id) || 0,
          roadmap.stages.length
        );
        const key = roadmap.slug; // normalises unknown slugs to "generic"
        if (!clusters.has(key)) clusters.set(key, []);
        clusters.get(key)!.push({
          id: s.id,
          name: s.full_name,
          regNo: s.reg_no,
          stageIndex,
          stageKey: roadmap.stages[stageIndex]?.key || roadmap.stages[0].key,
          estimated: true,
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
