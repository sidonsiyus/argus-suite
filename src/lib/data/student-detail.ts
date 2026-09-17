import { cache } from "react";
import fs from "fs";
import path from "path";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AchievementItem } from "@/lib/achievements/types";
import { StudentInternshipItem } from "@/lib/internships/types";
import { StudentGroupItem } from "@/lib/groups/types";

export interface Student360Data {
  student: {
    id: string;
    sno: number;
    full_name: string;
    reg_no: string;
    phone: string | null;
    email: string | null;
    cohort: {
      name: string;
      programme: string;
      academic_year: string;
      current_year_of_study: string;
      section: string;
    };
  };
  profile: {
    why_aviation?: string;
    inspired_by?: string;
    dream_organizations: string[];
    after_graduation_plan?: string;
    five_year_vision?: string;
    languages: string[];
    learning_styles: string[];
    preferred_communication: string[];
    sslc_score?: string;
    hsc_score?: string;
    technical_expertise?: string;
    sports: string[];
    hobbies: string[];
    clubs_of_interest: string[];
    biggest_challenge?: string;
    mentor_help_needed?: string;
    dgca_status?: string;
  } | null;
  careerGoal: {
    title: string;
    custom_role_title?: string;
    category?: string;
    prerequisites: string[];
    provenance: string;
  } | null;
  skills: Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
    rating: number;
    assessment_type: string;
    provenance: string;
    assessed_at: string;
    notes?: string;
  }>;
  readiness: {
    resume_status: string;
    linkedin_status: string;
    passport_status: string;
    driving_license_status: string;
    pan_card_status: string;
    aadhaar_card_status: string;
    raw_responses: Record<string, string>;
    available_count: number;
  };
  milestones: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    completion_percentage: number;
    target_date: string | null;
    is_ai_suggested: boolean;
    provenance: string;
    success_criteria: string;
    linked_resources?: Array<{
      id: string;
      title: string;
      resource_type: string;
      category: string;
      provider?: string | null;
      url?: string | null;
    }>;
  }>;
  sessions: Array<{
    id: string;
    session_date: string;
    scheduled_at?: string | null;
    focus_area: string;
    session_type?: string;
    status: string;
    observations: string;
    notes?: string | null;
    outcome?: string | null;
    follow_up_date?: string | null;
    follow_up_notes?: string | null;
    duration_minutes: number;
    provenance: string;
    is_historical: boolean;
  }>;
  achievements: AchievementItem[];
  internships: StudentInternshipItem[];
  groups: StudentGroupItem[];
  historicalStrengths: string[];
  historicalWeaknesses: string[];
  metrics: {
    skillAverage: number | null;
    activeMilestonesCount: number;
    totalSessionsCount: number;
    readinessScore: string;
  };
}

// Read historical strengths/weaknesses safely from backup without upgrading provenance
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

async function queryWithFallback(queryFn: (client: any) => Promise<any>) {
  try {
    const primary = createServerSupabase();
    const result = await queryFn(primary);
    if (!result.error && result.data) {
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

export const getStudent360 = cache(async function getStudent360(studentId: string): Promise<Student360Data | null> {
  const res = await queryWithFallback(async (supabase) => {
    // 1. Fetch Student Core + Cohort
    const { data: student, error: sErr } = await supabase
      .from("students")
      .select("id, sno, full_name, reg_no, phone, email, cohorts(name, programme, academic_year, current_year_of_study, section)")
      .eq("id", studentId)
      .single();

    if (sErr || !student) return { data: null, error: sErr };

    // Concurrently fetch all remaining 10 student-specific data points
    const [
      { data: profile },
      { data: careerGoalData },
      { data: skillsData },
      { data: assessmentsData },
      { data: readinessData },
      { data: milestonesData },
      { data: sessionsData },
      { data: achievementsData },
      { data: internshipsData },
      { data: groupsData },
    ] = await Promise.all([
      // 2. Fetch Non-Sensitive Profile Details (Excludes income, parent info, medical, blood group)
      supabase
        .from("student_profiles")
        .select(`
          why_aviation, inspired_by, dream_organizations, after_graduation_plan, five_year_vision,
          languages, learning_styles, preferred_communication, sslc_score, hsc_score,
          technical_expertise, sports, hobbies, clubs_of_interest, biggest_challenge,
          mentor_help_needed, dgca_status
        `)
        .eq("student_id", studentId)
        .single(),

      // 3. Fetch Primary Career Goal & Role Prerequisites
      supabase
        .from("student_career_goals")
        .select("custom_role_title, provenance, career_roles(title, category, prerequisites)")
        .eq("student_id", studentId)
        .eq("is_primary", true)
        .single(),

      // 4. Fetch Universal Skills & Latest Ratings
      supabase
        .from("skills")
        .select("id, name, slug, category")
        .order("name", { ascending: true }),

      // 4b. Fetch Skill Assessments
      supabase
        .from("skill_assessments")
        .select("skill_id, rating, assessment_type, provenance, assessed_at, notes")
        .eq("student_id", studentId)
        .order("assessed_at", { ascending: false }),

      // 5. Fetch Career Readiness
      supabase
        .from("career_readiness")
        .select("resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status, student_reported_raw")
        .eq("student_id", studentId)
        .single(),

      // 6. Fetch Active Milestones & Linked Prescribed Resources
      supabase
        .from("milestones")
        .select("id, title, status, priority, completion_percentage, target_date, is_ai_suggested, provenance, success_criteria, milestone_resources(resource_id, resources(id, title, resource_type, category, provider, url))")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false }),

      // 7. Fetch Mentoring Sessions
      supabase
        .from("sessions")
        .select("id, session_date, scheduled_at, focus_area, session_type, status, observations, notes, outcome, follow_up_date, follow_up_notes, duration_minutes, provenance")
        .eq("student_id", studentId)
        .order("session_date", { ascending: false }),

      // 7b. Fetch Cadet Achievements
      supabase
        .from("achievements")
        .select("*, student_documents(id, title, storage_path, mime_type)")
        .eq("student_id", studentId)
        .order("date_achieved", { ascending: false }),

      // 7c. Fetch Cadet Internships & Industry Attachments
      supabase
        .from("internships")
        .select("*, internship_opportunities(id, organization, title, location, work_mode, application_deadline, application_url), student_documents:internships_certificate_doc_id_fkey(id, title, storage_path, mime_type)")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false }),

      // 7d. Fetch Functional Intervention Groups
      supabase
        .from("group_members")
        .select("group_id, joined_at, notes, groups(id, name, description, category, status)")
        .eq("student_id", studentId)
        .order("joined_at", { ascending: false }),
    ]);

    const latestAssessmentMap = new Map<string, any>();
    (assessmentsData || []).forEach((a: any) => {
      if (!latestAssessmentMap.has(a.skill_id)) {
        latestAssessmentMap.set(a.skill_id, a);
      }
    });

    const skills = (skillsData || []).map((sk: any) => {
      const a = latestAssessmentMap.get(sk.id);
      return {
        id: sk.id,
        name: sk.name,
        slug: sk.slug,
        category: sk.category,
        rating: a?.rating || 0,
        assessment_type: a?.assessment_type || "SELF_REPORTED",
        provenance: a?.provenance || "STUDENT_REPORTED",
        assessed_at: a?.assessed_at || new Date().toISOString(),
        notes: a?.notes || "",
      };
    });

    const rd = readinessData || {};
    const statuses = [
      rd.resume_status,
      rd.linkedin_status,
      rd.passport_status,
      rd.driving_license_status,
      rd.pan_card_status,
      rd.aadhaar_card_status,
    ];
    const availableCount = statuses.filter((s) => s === "AVAILABLE" || s === "VERIFIED").length;

    const mappedMilestones = (milestonesData || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      status: m.status,
      priority: m.priority,
      completion_percentage: m.completion_percentage,
      target_date: m.target_date,
      is_ai_suggested: m.is_ai_suggested,
      provenance: m.provenance,
      success_criteria: m.success_criteria,
      linked_resources: (m.milestone_resources || [])
        .map((mr: any) => mr.resources)
        .filter(Boolean)
        .map((r: any) => ({
          id: r.id,
          title: r.title,
          resource_type: r.resource_type || "GUIDE",
          category: r.category,
          provider: r.provider || null,
          url: r.url || null,
        })),
    }));

    const mappedSessions = (sessionsData || []).map((row: any) => ({
      id: row.id,
      session_date: row.session_date,
      scheduled_at: row.scheduled_at || null,
      focus_area: row.focus_area || row.session_type || "General Mentoring",
      session_type: row.session_type || "GENERAL_MENTORING",
      status: !row.status || row.status === "HISTORICAL" ? "HISTORICAL" : row.status,
      observations: row.observations || row.notes || "",
      notes: row.notes || null,
      outcome: row.outcome || null,
      follow_up_date: row.follow_up_date || null,
      follow_up_notes: row.follow_up_notes || null,
      duration_minutes: row.duration_minutes || 30,
      provenance: row.provenance || "MENTOR_ENTERED",
      is_historical: !row.status || row.status === "HISTORICAL",
    }));

    const mappedAchievements: AchievementItem[] = (achievementsData || []).map((row: any) => ({
      id: row.id,
      student_id: row.student_id,
      student_name: student.full_name,
      reg_no: student.reg_no,
      title: row.title,
      category: row.category,
      description: row.description || row.notes || null,
      issued_by: row.issued_by || null,
      date_achieved: row.date_achieved || null,
      notes: row.notes || null,
      certificate_doc_id: row.certificate_doc_id || null,
      certificate_document: row.student_documents
        ? {
            id: row.student_documents.id,
            title: row.student_documents.title,
            storage_path: row.student_documents.storage_path,
            mime_type: row.student_documents.mime_type,
          }
        : null,
      is_verified: row.is_verified ?? false,
      verified_by: row.verified_by || null,
      verified_at: row.verified_at || null,
      created_by: row.created_by || null,
      provenance: row.provenance || "MENTOR_ENTERED",
      created_at: row.created_at,
      updated_at: row.updated_at || row.created_at,
    }));

    const mappedInternships: StudentInternshipItem[] = (internshipsData || []).map((row: any) => ({
      id: row.id,
      student_id: row.student_id,
      student_name: student.full_name,
      reg_no: student.reg_no,
      opportunity_id: row.opportunity_id || null,
      opportunity: row.internship_opportunities
        ? {
            id: row.internship_opportunities.id,
            organization: row.internship_opportunities.organization,
            title: row.internship_opportunities.title,
            location: row.internship_opportunities.location || null,
            work_mode: row.internship_opportunities.work_mode || "ON_SITE",
            application_deadline: row.internship_opportunities.application_deadline || null,
            application_url: row.internship_opportunities.application_url || null,
          }
        : null,
      organization: row.organization,
      role_description: row.role_description || null,
      status: row.status || "APPLIED",
      applied_date: row.applied_date || null,
      start_date: row.start_date || null,
      end_date: row.end_date || null,
      mentor_notes: row.mentor_notes || null,
      is_verified: row.is_verified ?? false,
      verified_by: row.verified_by || null,
      verified_at: row.verified_at || null,
      certificate_doc_id: row.certificate_doc_id || null,
      certificate_document: row.student_documents
        ? {
            id: row.student_documents.id,
            title: row.student_documents.title,
            storage_path: row.student_documents.storage_path,
            mime_type: row.student_documents.mime_type,
          }
        : null,
      provenance: row.provenance || "MENTOR_ENTERED",
      created_by: row.created_by || null,
      created_at: row.created_at,
      updated_at: row.updated_at || row.created_at,
    }));

    const mappedGroups: StudentGroupItem[] = (groupsData || [])
      .filter((gm: any) => gm.groups)
      .map((gm: any) => ({
        group_id: gm.groups.id,
        group_name: gm.groups.name,
        category: gm.groups.category || "OTHER",
        status: gm.groups.status || "ACTIVE",
        joined_at: gm.joined_at,
        notes: gm.notes || null,
      }));

    // 8. Historical Strengths & Weaknesses (from historical profile)
    const historical = getHistoricalProfileData(student.reg_no);

    // Compute Metrics
    const validRatings = skills.filter((s: any) => s.rating > 0);
    const skillAverage = validRatings.length > 0
      ? Number((validRatings.reduce((sum: number, s: any) => sum + s.rating, 0) / validRatings.length).toFixed(1))
      : null;

    const activeMilestones = mappedMilestones.filter((m: any) => m.status === "ACTIVE");

    return {
      data: {
        student: {
          id: student.id,
          sno: student.sno,
          full_name: student.full_name,
          reg_no: student.reg_no,
          phone: student.phone,
          email: student.email,
          cohort: student.cohorts || {
            name: "B.Sc. Aeronautical Science Batch 2025–2028",
            programme: "B.Sc. Aeronautical Science",
            academic_year: "2025 - 2026",
            current_year_of_study: "2nd Year",
            section: "A",
          },
        },
        profile: profile || null,
        careerGoal: careerGoalData ? {
          title: careerGoalData.career_roles?.title || careerGoalData.custom_role_title || "Aviation Career Track",
          custom_role_title: careerGoalData.custom_role_title,
          category: careerGoalData.career_roles?.category,
          prerequisites: careerGoalData.career_roles?.prerequisites || [],
          provenance: careerGoalData.provenance,
        } : null,
        skills,
        readiness: {
          resume_status: rd.resume_status || "NOT_REPORTED",
          linkedin_status: rd.linkedin_status || "NOT_REPORTED",
          passport_status: rd.passport_status || "NOT_REPORTED",
          driving_license_status: rd.driving_license_status || "NOT_REPORTED",
          pan_card_status: rd.pan_card_status || "NOT_REPORTED",
          aadhaar_card_status: rd.aadhaar_card_status || "NOT_REPORTED",
          raw_responses: rd.student_reported_raw || {},
          available_count: availableCount,
        },
        milestones: mappedMilestones,
        sessions: mappedSessions,
        achievements: mappedAchievements,
        internships: mappedInternships,
        groups: mappedGroups,
        historicalStrengths: historical.strengths,
        historicalWeaknesses: historical.weaknesses,
        metrics: {
          skillAverage,
          activeMilestonesCount: activeMilestones.length,
          totalSessionsCount: (sessionsData || []).length,
          readinessScore: `${availableCount} / 6 available`,
        },
      },
      error: null,
    };
  });

  return res?.data || null;
});
