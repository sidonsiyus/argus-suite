"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// 1. Authenticate Faculty Server-Side
// ---------------------------------------------------------------------------
async function getAuthenticatedFaculty() {
  const supabase = createServerSupabase();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    throw new Error("Unauthorized: Faculty mentor authentication required.");
  }

  const { data: isFaculty, error: roleError } = await supabase.rpc("is_faculty");
  if (roleError || !isFaculty) {
    throw new Error("Forbidden: Faculty mentor access required.");
  }

  return { supabase, user };
}

// ---------------------------------------------------------------------------
// 2. Strict Input Validation Schema (Explicit Allowlist Only)
// NEVER exposes family, income, medical, gender, blood group, or identity audits!
// ---------------------------------------------------------------------------
const ReadinessStateEnum = z.enum([
  "AVAILABLE",
  "IN_PROGRESS",
  "NOT_REPORTED",
  "NOT_AVAILABLE",
  "APPLIED",
  "VERIFIED",
]);

const EditProfileSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  // Career Aspirations
  customRoleTitle: z.string().trim().max(150).optional(),
  dreamOrganizations: z.array(z.string().trim().max(100)).max(10).optional(),
  afterGraduationPlan: z.string().trim().max(1000).optional(),
  fiveYearVision: z.string().trim().max(1000).optional(),
  dgcaStatus: z.string().trim().max(200).optional(),

  // Personal/Academic Non-Sensitive Profile
  whyAviation: z.string().trim().max(1000).optional(),
  inspiredBy: z.string().trim().max(500).optional(),
  languages: z.array(z.string().trim().max(50)).max(10).optional(),
  technicalExpertise: z.string().trim().max(1000).optional(),
  learningStyles: z.array(z.string().trim().max(50)).max(10).optional(),
  preferredCommunication: z.array(z.string().trim().max(50)).max(10).optional(),
  sports: z.array(z.string().trim().max(50)).max(10).optional(),
  hobbies: z.array(z.string().trim().max(50)).max(10).optional(),
  clubsOfInterest: z.array(z.string().trim().max(50)).max(10).optional(),

  // Mentoring Needs
  biggestChallenge: z.string().trim().max(1000).optional(),
  mentorHelpNeeded: z.string().trim().max(1000).optional(),

  // Readiness Checklist Updates (Optional)
  readiness: z
    .object({
      resume_status: ReadinessStateEnum.optional(),
      linkedin_status: ReadinessStateEnum.optional(),
      passport_status: ReadinessStateEnum.optional(),
      driving_license_status: ReadinessStateEnum.optional(),
      pan_card_status: ReadinessStateEnum.optional(),
      aadhaar_card_status: ReadinessStateEnum.optional(),
    })
    .optional(),
});

export type EditProfileInput = z.infer<typeof EditProfileSchema>;

// ---------------------------------------------------------------------------
// 3. Server Action: updateStudentProfileAction
// ---------------------------------------------------------------------------
export async function updateStudentProfileAction(rawInput: EditProfileInput) {
  try {
    const { supabase, user } = await getAuthenticatedFaculty();
    const validated = EditProfileSchema.parse(rawInput);
    const { studentId } = validated;

    // Verify student exists
    const { data: student, error: sErr } = await supabase
      .from("students")
      .select("id, full_name, reg_no")
      .eq("id", studentId)
      .single();

    if (sErr || !student) {
      return { success: false, error: "Cadet record not found." };
    }

    const now = new Date().toISOString();

    // 1. Update public.student_profiles (Strict allowlist non-sensitive columns)
    const profileUpdates: Record<string, any> = {
      updated_at: now,
      provenance: "MENTOR_ENTERED",
    };

    if (validated.whyAviation !== undefined) profileUpdates.why_aviation = validated.whyAviation;
    if (validated.inspiredBy !== undefined) profileUpdates.inspired_by = validated.inspiredBy;
    if (validated.dreamOrganizations !== undefined) profileUpdates.dream_organizations = validated.dreamOrganizations;
    if (validated.afterGraduationPlan !== undefined) profileUpdates.after_graduation_plan = validated.afterGraduationPlan;
    if (validated.fiveYearVision !== undefined) profileUpdates.five_year_vision = validated.fiveYearVision;
    if (validated.languages !== undefined) profileUpdates.languages = validated.languages;
    if (validated.technicalExpertise !== undefined) profileUpdates.technical_expertise = validated.technicalExpertise;
    if (validated.learningStyles !== undefined) profileUpdates.learning_styles = validated.learningStyles;
    if (validated.preferredCommunication !== undefined) profileUpdates.preferred_communication = validated.preferredCommunication;
    if (validated.sports !== undefined) profileUpdates.sports = validated.sports;
    if (validated.hobbies !== undefined) profileUpdates.hobbies = validated.hobbies;
    if (validated.clubsOfInterest !== undefined) profileUpdates.clubs_of_interest = validated.clubsOfInterest;
    if (validated.biggestChallenge !== undefined) profileUpdates.biggest_challenge = validated.biggestChallenge;
    if (validated.mentorHelpNeeded !== undefined) profileUpdates.mentor_help_needed = validated.mentorHelpNeeded;
    if (validated.dgcaStatus !== undefined) profileUpdates.dgca_status = validated.dgcaStatus;

    const { error: profErr } = await supabase
      .from("student_profiles")
      .update(profileUpdates)
      .eq("student_id", studentId);

    if (profErr) {
      console.error("Error updating student profile:", profErr);
      return { success: false, error: "Failed to update cadet profile." };
    }

    // 2. Update Primary Career Goal if customRoleTitle provided
    if (validated.customRoleTitle !== undefined && validated.customRoleTitle.trim() !== "") {
      const { error: cgErr } = await supabase
        .from("student_career_goals")
        .update({
          custom_role_title: validated.customRoleTitle.trim(),
          provenance: "MENTOR_ENTERED",
          updated_at: now,
        })
        .eq("student_id", studentId)
        .eq("is_primary", true);

      if (cgErr) {
        console.error("Error updating career goal:", cgErr);
      }
    }

    // 3. Update Readiness States if provided
    if (validated.readiness && Object.keys(validated.readiness).length > 0) {
      const readinessUpdates: Record<string, any> = {
        ...validated.readiness,
        updated_at: now,
        verified_by: user.id,
        verified_at: now,
      };

      const { error: rdErr } = await supabase
        .from("career_readiness")
        .update(readinessUpdates)
        .eq("student_id", studentId);

      if (rdErr) {
        console.error("Error updating career readiness:", rdErr);
      }
    }

    // 4. Immutable Audit Log Entry
    await supabase.from("audit_logs").insert({
      entity_table: "student_profiles",
      entity_id: studentId,
      action: "UPDATE",
      actor_id: user.id,
      actor_role: "faculty",
      new_values: {
        student_id: studentId,
        reg_no: student.reg_no,
        updated_fields: Object.keys(profileUpdates).filter((k) => k !== "updated_at"),
        has_career_goal_update: Boolean(validated.customRoleTitle),
        has_readiness_update: Boolean(validated.readiness),
        provenance: "MENTOR_ENTERED",
      },
    });

    revalidatePath(`/students/${studentId}`);
    revalidatePath("/students");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Validation failed." };
    }
    console.error("updateStudentProfileAction error:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty mentor credentials required."
        : "Failed to save profile changes. Please try again.",
    };
  }
}
