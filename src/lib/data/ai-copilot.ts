import fs from "fs";
import path from "path";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/factory";
import {
  SanitizedStudentContext,
  CopilotRecommendationItem,
  CopilotAnalysisResult,
} from "@/lib/ai/types";
import { assertPayloadSanitized } from "@/lib/ai/prompts";

// Helper to authenticate and authorize faculty mentor server-side
async function getAuthenticatedFaculty() {
  const supabase = createServerSupabase();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    throw new Error("Unauthorized. Faculty mentor authentication is required.");
  }

  // Verify faculty/admin role from public.profiles
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .single();

  if (profErr || !profile || (profile.role !== "instructor" && profile.role !== "admin")) {
    throw new Error("Unauthorized. User does not possess authorized faculty credentials.");
  }

  return { supabase, user, profile };
}

// Read historical strengths/weaknesses safely without upgrading provenance
let backupCache: Record<string, { strengths: string[]; weaknesses: string[] }> | null = null;

function getHistoricalProfileData(regNo: string) {
  if (!backupCache) {
    try {
      const backupPath = path.join(process.cwd(), "mentor-backup-2026-08-19.json");
      if (fs.existsSync(backupPath)) {
        const raw = fs.readFileSync(backupPath, "utf-8");
        const parsed = JSON.parse(raw);
        backupCache = {};
        (parsed.students || []).forEach((s: any) => {
          if (s.reg) {
            backupCache![s.reg] = {
              strengths: s.strengths || [],
              weaknesses: s.weaknesses || [],
            };
          }
        });
      }
    } catch {
      backupCache = {};
    }
  }
  return backupCache?.[regNo] || { strengths: [], weaknesses: [] };
}

// 1. Build Sanitized Student Context (Explicit Allowlist Only)
export async function buildSanitizedStudentContext(
  studentId: string
): Promise<SanitizedStudentContext> {
  const supabase = createServerSupabase();

  // 1. Student Core & Cohort (Explicit allowlist fields only)
  const { data: student, error: sErr } = await supabase
    .from("students")
    .select("id, reg_no, full_name, cohorts(name, programme, academic_year, current_year_of_study, section)")
    .eq("id", studentId)
    .single();

  if (sErr || !student) {
    throw new Error("Student record not found or access denied.");
  }

  // 2. Primary Career Goal & Role Prerequisites
  const { data: careerGoal } = await supabase
    .from("student_career_goals")
    .select("custom_role_title, career_roles(title, category, prerequisites)")
    .eq("student_id", studentId)
    .eq("is_primary", true)
    .single();

  // 3. Non-Sensitive Profile Fields (Explicitly excluding family, income, medical, gender, blood group)
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("why_aviation, inspired_by, dream_organizations, technical_expertise, biggest_challenge, mentor_help_needed")
    .eq("student_id", studentId)
    .single();

  // 4. Universal Skills & Ratings
  const { data: skillsData } = await supabase
    .from("skills")
    .select("id, name, category")
    .order("name", { ascending: true });

  const { data: assessmentsData } = await supabase
    .from("skill_assessments")
    .select("skill_id, rating, assessment_type, provenance, assessed_at")
    .eq("student_id", studentId)
    .order("assessed_at", { ascending: false });

  const latestAssessmentMap = new Map<string, any>();
  (assessmentsData || []).forEach((a: any) => {
    if (!latestAssessmentMap.has(a.skill_id)) {
      latestAssessmentMap.set(a.skill_id, a);
    }
  });

  const skills = (skillsData || []).map((sk: any) => {
    const a = latestAssessmentMap.get(sk.id);
    return {
      name: sk.name,
      category: sk.category,
      rating: a?.rating || 0,
      assessmentType: a?.assessment_type || "SELF_REPORTED",
      provenance: a?.provenance || "STUDENT_REPORTED",
    };
  });

  // 5. Career Readiness States (Verification status of core credentials only - NO identity numbers)
  const { data: readinessData } = await supabase
    .from("career_readiness")
    .select("resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status")
    .eq("student_id", studentId)
    .single();

  const rd = (readinessData as any) || {};
  const readinessStates = {
    "Resume": rd.resume_status || "NOT_REPORTED",
    "LinkedIn Profile": rd.linkedin_status || "NOT_REPORTED",
    "Passport": rd.passport_status || "NOT_REPORTED",
    "Driving License": rd.driving_license_status || "NOT_REPORTED",
    "PAN Card": rd.pan_card_status || "NOT_REPORTED",
    "Aadhaar Card": rd.aadhaar_card_status || "NOT_REPORTED",
  };

  // 6. Active Milestones
  const { data: milestonesData } = await supabase
    .from("milestones")
    .select("title, priority, success_criteria")
    .eq("student_id", studentId)
    .eq("status", "ACTIVE");

  const activeMilestones = (milestonesData || []).map((m: any) => ({
    title: m.title,
    priority: m.priority,
    criteria: m.success_criteria || undefined,
  }));

  // 7. Recent Session Observations (Relevant mentoring discussion context)
  const { data: sessionsData } = await supabase
    .from("sessions")
    .select("session_date, focus_area, observations")
    .eq("student_id", studentId)
    .order("session_date", { ascending: false })
    .limit(3);

  const recentSessionObservations = (sessionsData || []).map((s: any) => ({
    date: s.session_date,
    focus: s.focus_area || "General Mentoring",
    notes: s.observations || "No notes logged",
  }));

  // 8. Historical Strengths & Development Areas
  const historical = getHistoricalProfileData(student.reg_no);

  const context: SanitizedStudentContext = {
    studentId: student.id,
    regNo: student.reg_no,
    fullName: student.full_name,
    programme: (student.cohorts as any)?.programme || "B.Sc. Aeronautical Science",
    yearOfStudy: (student.cohorts as any)?.current_year_of_study || "2nd Year",
    section: (student.cohorts as any)?.section || "A",
    academicYear: (student.cohorts as any)?.academic_year || "2025 - 2026",
    primaryCareerGoal: (careerGoal as any)?.career_roles?.title || (careerGoal as any)?.custom_role_title || "Aviation Career Track",
    dreamOrganizations: profile?.dream_organizations || [],
    careerRoleCategory: (careerGoal as any)?.career_roles?.category || "Aviation",
    careerPrerequisites: (careerGoal as any)?.career_roles?.prerequisites || [],
    skills,
    readinessStates,
    activeMilestones,
    recentSessionObservations,
    strengths: historical.strengths,
    developmentAreas: historical.weaknesses,
    biggestChallenge: profile?.biggest_challenge || undefined,
    mentorHelpNeeded: profile?.mentor_help_needed || undefined,
  };

  // Enforce recursive programmatic sanitization assertion
  assertPayloadSanitized(context as any);

  return context;
}

// 2. Generate and Persist Recommendations Batch
// Note: Derives authenticated mentor server-side. Does NOT accept mentorId parameter!
export async function generateAndPersistRecommendations(
  studentId: string
): Promise<CopilotAnalysisResult> {
  const { supabase, user } = await getAuthenticatedFaculty();

  // Verify student exists
  const { data: studentCheck, error: sErr } = await supabase
    .from("students")
    .select("id")
    .eq("id", studentId)
    .single();

  if (sErr || !studentCheck) {
    throw new Error("Cadet record not found or inaccessible.");
  }

  // Build authoritative sanitized context server-side
  const context = await buildSanitizedStudentContext(studentId);

  // Call AI Provider server-side
  const provider = getAIProvider();
  const result = await provider.generateCopilotInsights(context);

  // Persist Recommendations as PENDING in public.ai_recommendations
  for (const rec of result.recommendations) {
    const { data: recRow, error: rErr } = await supabase
      .from("ai_recommendations")
      .insert({
        student_id: studentId,
        provider: provider.name,
        model_name: provider.modelName || process.env.OPENROUTER_MODEL || "google/gemini-3.5-flash-lite",
        prompt_scope: "STUDENT_360_COPILOT",
        sanitized_input_context: context,
        raw_response: { summary: result.student_summary, career_alignment: result.career_alignment_observation },
        suggested_actions: rec,
        status: "PENDING",
      })
      .select("id")
      .single();

    if (rErr) {
      console.error("Error inserting recommendation:", rErr);
      continue;
    }

    // Attach DB id and status to recommendation item
    (rec as any).id = recRow?.id;
    (rec as any).db_id = recRow?.id;
    (rec as any).status = "PENDING";

    // Record Audit Log
    if (recRow?.id) {
      await supabase.from("audit_logs").insert({
        entity_table: "ai_recommendations",
        entity_id: recRow.id,
        action: "INSERT",
        actor_id: user.id,
        actor_role: "faculty",
        new_values: {
          title: rec.title,
          type: rec.type,
          priority: rec.priority,
          student_id: studentId,
        },
      });
    }
  }

  return result;
}

// 3. Retrieve Stored Recommendations for Student
export async function getStudentRecommendations(
  studentId: string
): Promise<CopilotRecommendationItem[]> {
  const supabase = createServerSupabase();

  const { data: rows, error } = await supabase
    .from("ai_recommendations")
    .select("id, suggested_actions, status, reviewed_at, reviewed_by, review_notes, created_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error || !rows) return [];

  return rows.map((row: any) => {
    const action = row.suggested_actions || {};
    return {
      id: row.id,
      db_id: row.id,
      type: action.type || "MENTORING_FOCUS",
      title: action.title || "Recommendation",
      rationale: action.rationale || "",
      suggested_action: action.suggested_action || "",
      priority: action.priority || "MEDIUM",
      evidence: action.evidence || [],
      status: row.status,
      reviewed_at: row.reviewed_at,
      reviewed_by: row.reviewed_by,
      review_notes: row.review_notes,
      created_at: row.created_at,
    };
  });
}

// 4. Execute Approve Recommendation (Single PostgreSQL ACID Transaction)
// Strictly invokes public.approve_ai_recommendation_atomic via RPC.
// Never silently falls back to non-atomic execution.
export async function executeApproveRecommendation(
  recId: string,
  studentId: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await getAuthenticatedFaculty();

  const { error } = await supabase.rpc("approve_ai_recommendation_atomic", {
    p_rec_id: recId,
    p_student_id: studentId,
    p_action_type: "APPROVE",
  });

  if (error) {
    console.error("Atomic approval RPC error:", error);
    return {
      success: false,
      error: error.message.includes("does not exist") || error.message.includes("function")
        ? "Atomic approval database function is currently unavailable."
        : error.message.includes("Unauthorized")
        ? "Unauthorized. Faculty mentor credentials required."
        : error.message.includes("PENDING")
        ? "Recommendation has already been reviewed."
        : "Failed to approve recommendation atomically.",
    };
  }

  return { success: true };
}

// 5. Execute Edit & Approve Recommendation (Single PostgreSQL ACID Transaction)
// Strictly invokes public.approve_ai_recommendation_atomic via RPC with p_edits payload.
// Preserves original AI rationale, records MENTOR_ENTERED provenance, updates recommendation and audit log atomically.
export async function executeEditAndApproveRecommendation(
  recId: string,
  studentId: string,
  edits: {
    title: string;
    suggested_action: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    review_notes: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await getAuthenticatedFaculty();

  const { error } = await supabase.rpc("approve_ai_recommendation_atomic", {
    p_rec_id: recId,
    p_student_id: studentId,
    p_action_type: "EDIT_AND_APPROVE",
    p_edits: edits,
  });

  if (error) {
    console.error("Atomic edit-and-approve RPC error:", error);
    return {
      success: false,
      error: error.message.includes("does not exist") || error.message.includes("function")
        ? "Atomic approval database function is currently unavailable."
        : error.message.includes("Unauthorized")
        ? "Unauthorized. Faculty mentor credentials required."
        : error.message.includes("PENDING")
        ? "Recommendation has already been reviewed."
        : "Failed to refine and approve recommendation atomically.",
    };
  }

  return { success: true };
}

// 6. Execute Reject Recommendation (Single PostgreSQL ACID Transaction)
// Strictly invokes public.approve_ai_recommendation_atomic via RPC with p_action_type = 'REJECT'.
// Updates status to REJECTED and writes audit log in one atomic transaction. Zero milestones created.
export async function executeRejectRecommendation(
  recId: string,
  studentId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await getAuthenticatedFaculty();

  const { error } = await supabase.rpc("approve_ai_recommendation_atomic", {
    p_rec_id: recId,
    p_student_id: studentId,
    p_action_type: "REJECT",
    p_reason: reason || "Rejected by faculty mentor during Student 360 review.",
  });

  if (error) {
    console.error("Atomic reject RPC error:", error);
    return {
      success: false,
      error: error.message.includes("does not exist") || error.message.includes("function")
        ? "Atomic approval database function is currently unavailable."
        : error.message.includes("Unauthorized")
        ? "Unauthorized. Faculty mentor credentials required."
        : error.message.includes("PENDING")
        ? "Recommendation has already been reviewed."
        : "Failed to reject recommendation atomically.",
    };
  }

  return { success: true };
}

