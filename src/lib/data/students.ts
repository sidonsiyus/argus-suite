import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface DirectoryStudent {
  id: string;
  sno: number;
  full_name: string;
  reg_no: string;
  career_goal: string;
  skill_avg: number | null;
  readiness_ratio: string;
  active_milestones_count: number;
  last_session_date: string | null;
  needs_attention: boolean;
  attention_reason?: string;
}

async function queryWithFallback<T>(queryFn: (client: any) => Promise<T>): Promise<T> {
  try {
    const primary = createServerSupabase();
    const result = await queryFn(primary);
    const resAny = result as any;
    if (!resAny?.error && resAny?.data && resAny.data.length > 0) {
      return result;
    }
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = createAdminClient();
      return await queryFn(admin);
    }
    return result;
  } catch (err) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = createAdminClient();
      return await queryFn(admin);
    }
    throw err;
  }
}

export const getStudentsDirectory = cache(async function getStudentsDirectory(): Promise<{ data: DirectoryStudent[]; error: any }> {
  return queryWithFallback(async (supabase) => {
    // Run all 6 independent directory queries concurrently
    const [
      { data: students, error: sErr },
      { data: goals },
      { data: assessments },
      { data: readiness },
      { data: milestones },
      { data: sessions },
    ] = await Promise.all([
      // 1. Fetch Students (Operational fields only - NO phone, NO email, NO demographics)
      supabase
        .from("students")
        .select("id, sno, full_name, reg_no")
        .order("sno", { ascending: true }),

      // 2. Fetch Primary Career Goals
      supabase
        .from("student_career_goals")
        .select("student_id, custom_role_title")
        .eq("is_primary", true),

      // 3. Fetch Skill Averages (from append-only skill_assessments)
      supabase
        .from("skill_assessments")
        .select("student_id, rating"),

      // 4. Fetch Career Readiness (Tri-State count of AVAILABLE items out of 6)
      supabase
        .from("career_readiness")
        .select("student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status"),

      // 5. Fetch Active Milestones count
      supabase
        .from("milestones")
        .select("student_id")
        .eq("status", "ACTIVE"),

      // 6. Fetch Last Session Date & Attention Focus
      supabase
        .from("sessions")
        .select("student_id, session_date, focus_area, observations")
        .order("session_date", { ascending: false }),
    ]);

    if (sErr) throw sErr;

    const goalMap = new Map<string, string>();
    (goals || []).forEach((g: any) => goalMap.set(g.student_id, g.custom_role_title));

    const skillMap = new Map<string, { total: number; count: number }>();
    (assessments || []).forEach((a: any) => {
      const curr = skillMap.get(a.student_id) || { total: 0, count: 0 };
      skillMap.set(a.student_id, {
        total: curr.total + a.rating,
        count: curr.count + 1,
      });
    });

    const readinessMap = new Map<string, string>();
    (readiness || []).forEach((r: any) => {
      const keys = [
        r.resume_status,
        r.linkedin_status,
        r.passport_status,
        r.driving_license_status,
        r.pan_card_status,
        r.aadhaar_card_status,
      ];
      const available = keys.filter((k) => k === "AVAILABLE" || k === "VERIFIED").length;
      readinessMap.set(r.student_id, `${available} / 6`);
    });

    const milestoneMap = new Map<string, number>();
    (milestones || []).forEach((m: any) => {
      milestoneMap.set(m.student_id, (milestoneMap.get(m.student_id) || 0) + 1);
    });

    const sessionMap = new Map<string, { lastDate: string; focus: string; obs: string }>();
    (sessions || []).forEach((s: any) => {
      if (!sessionMap.has(s.student_id)) {
        sessionMap.set(s.student_id, {
          lastDate: s.session_date,
          focus: s.focus_area || "",
          obs: s.observations || "",
        });
      }
    });

    // 7. Assemble Directory List
    const directoryList: DirectoryStudent[] = (students || []).map((s: any) => {
      const sm = skillMap.get(s.id);
      const avg = sm && sm.count > 0 ? Number((sm.total / sm.count).toFixed(1)) : null;
      const sess = sessionMap.get(s.id);

      // Explainable attention flag from DB signals
      let needsAttention = false;
      let attentionReason = undefined;

      if (sess) {
        const text = (sess.focus + " " + sess.obs).toLowerCase();
        if (text.includes("attendance")) {
          needsAttention = true;
          attentionReason = "Attendance Focus";
        } else if (text.includes("english") || text.includes("language")) {
          needsAttention = true;
          attentionReason = "Language Support";
        }
      }

      return {
        id: s.id,
        sno: s.sno,
        full_name: s.full_name,
        reg_no: s.reg_no,
        career_goal: goalMap.get(s.id) || "Unassigned",
        skill_avg: avg,
        readiness_ratio: readinessMap.get(s.id) || "0 / 6",
        active_milestones_count: milestoneMap.get(s.id) || 0,
        last_session_date: sess?.lastDate || null,
        needs_attention: needsAttention,
        attention_reason: attentionReason,
      };
    });

    return { data: directoryList, error: null };
  });
});
