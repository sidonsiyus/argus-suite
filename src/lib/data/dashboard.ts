import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CommandCenterData,
  DashboardKpis,
  DashboardSessionItem,
  DashboardFollowUpItem,
  DashboardMilestoneItem,
  DashboardInternshipItem,
  DashboardAIRecommendationItem,
  DashboardAttentionItem,
  DashboardActivityItem,
  CareerDistributionItem,
  SearchIndexItem,
  SessionDisplayStatus,
} from "@/lib/dashboard/types";

export type { CareerDistributionItem } from "@/lib/dashboard/types";

export interface AttentionItem {
  student_id: string;
  full_name: string;
  reg_no: string;
  career_goal: string;
  reason: string;
  signal_type: "ATTENDANCE" | "COMMUNICATION" | "ACTIVE_MILESTONE" | "READINESS_GAP";
  status_label: string;
}
async function queryWithFallback<T>(queryFn: (client: any) => Promise<T>): Promise<T> {
  try {
    const primary = createServerSupabase();
    return await queryFn(primary);
  } catch (err) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = createAdminClient();
      return await queryFn(admin);
    }
    throw err;
  }
}

/**
 * Returns today's date in Indian Standard Time (Asia/Kolkata) as YYYY-MM-DD
 */
export function getTodayIST(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/**
 * Calculate difference in days between target date and base date
 * Positive: target is in the future
 * Negative: target is in the past (overdue)
 * Zero: target is today
 */
export function calculateDaysDiff(targetDateStr: string, baseDateStr: string): number {
  try {
    const target = new Date(targetDateStr + "T00:00:00Z").getTime();
    const base = new Date(baseDateStr + "T00:00:00Z").getTime();
    return Math.round((target - base) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Main data aggregation function for the Mentor Daily Command Center.
 * Strict Firewall: Zero modifications to domain tables (read-only).
 * Strict Cadet Privacy: Fetches only full_name, reg_no, career_goal.
 */
export const getCommandCenterData = cache(async function getCommandCenterData(): Promise<{ data: CommandCenterData; error: any }> {
  return queryWithFallback(async (supabase) => {
    const todayStr = getTodayIST();
    const sevenDaysLater = new Date(new Date().setDate(new Date().getDate() + 7))
      .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const fourteenDaysLater = new Date(new Date().setDate(new Date().getDate() + 14))
      .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

    // Execute all 8 independent operational queries concurrently via Promise.all
    const [
      { count: totalStudents, data: studentsRaw },
      { data: sessionsRaw },
      { count: activeMilestonesCount, data: milestonesRaw },
      { data: internshipsRaw },
      { data: aiRecsRaw },
      { data: auditLogsRaw },
      { data: roles },
      { data: goals },
    ] = await Promise.all([
      // 1. Total Cadets & Search Index (Strict data minimization)
      supabase
        .from("students")
        .select("id, full_name, reg_no, sno, student_career_goals(custom_role_title)", { count: "exact" })
        .order("sno", { ascending: true }),

      // 2. Mentoring Sessions (Today's Sessions + Follow-ups)
      supabase
        .from("sessions")
        .select(`
          id, student_id, session_date, scheduled_at, duration_minutes,
          status, session_type, focus_area, observations,
          follow_up_date, follow_up_notes,
          created_at, students(id, full_name, reg_no)
        `)
        .order("scheduled_at", { ascending: true, nullsFirst: false }),

      // 3. Milestones (Overdue + Approaching)
      supabase
        .from("milestones")
        .select("id, student_id, title, target_date, status, priority, category, is_ai_suggested, students(id, full_name, reg_no)", { count: "exact" })
        .eq("status", "ACTIVE")
        .not("target_date", "is", null)
        .order("target_date", { ascending: true }),

      // 4. Internship Deadlines (Within 14 days)
      supabase
        .from("internship_opportunities")
        .select("id, organization, title, location, application_deadline, is_active, internships(id)")
        .eq("is_active", true)
        .gte("application_deadline", todayStr)
        .lte("application_deadline", fourteenDaysLater)
        .order("application_deadline", { ascending: true }),

      // 5. Pending AI Recommendations
      supabase
        .from("ai_recommendations")
        .select(`
          id, student_id, suggested_actions, status, created_at,
          students(id, full_name, reg_no)
        `)
        .eq("status", "PENDING")
        .order("created_at", { ascending: false })
        .limit(8),

      // 6. Recent Operational Activity (Audit Logs)
      supabase
        .from("audit_logs")
        .select("id, action, entity_table, entity_id, actor_role, created_at, new_values")
        .order("created_at", { ascending: false })
        .limit(8),

      // 7. Career Roles
      supabase
        .from("career_roles")
        .select("id, slug, title, short_title"),

      // 8. Primary Goals (for distribution)
      supabase
        .from("student_career_goals")
        .select("career_role_id, custom_role_title")
        .eq("is_primary", true),
    ]);

    // 1. Process Cadets & Search Index
    const studentMap = new Map<string, { id: string; full_name: string; reg_no: string; career_goal: string }>();
    const searchIndex: SearchIndexItem[] = [];

    (studentsRaw || []).forEach((s: any) => {
      const goal = s.student_career_goals?.[0]?.custom_role_title || "Flight Operations Track";
      studentMap.set(s.id, {
        id: s.id,
        full_name: s.full_name,
        reg_no: s.reg_no,
        career_goal: goal,
      });
      searchIndex.push({
        id: s.id,
        full_name: s.full_name,
        reg_no: s.reg_no,
        career_goal: goal,
      });
    });

    // 2. Process Mentoring Sessions (Today's Sessions + Follow-ups)
    const todaySessions: DashboardSessionItem[] = [];
    const followUpsOverdue: DashboardFollowUpItem[] = [];
    const followUpsToday: DashboardFollowUpItem[] = [];
    const followUpsUpcoming: DashboardFollowUpItem[] = [];
    const followUpsAll: DashboardFollowUpItem[] = [];

    (sessionsRaw || []).forEach((sess: any) => {
      const st = sess.students || studentMap.get(sess.student_id);
      const studentName = st?.full_name || "Cadet";
      const regNo = st?.reg_no || "";
      const careerGoal = studentMap.get(sess.student_id)?.career_goal;

      const datePart = sess.session_date || (sess.scheduled_at ? sess.scheduled_at.split("T")[0] : null);
      const isHistorical = !sess.status || sess.status === "HISTORICAL";
      const status: SessionDisplayStatus = isHistorical ? "HISTORICAL" : (sess.status as SessionDisplayStatus);

      let timeStr: string | null = null;
      if (sess.scheduled_at) {
        try {
          const dt = new Date(sess.scheduled_at);
          timeStr = dt.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        } catch {
          timeStr = null;
        }
      }

      // Check if session is today
      if (datePart === todayStr && status !== "CANCELLED") {
        todaySessions.push({
          id: sess.id,
          studentId: sess.student_id,
          studentName,
          regNo,
          careerGoal,
          sessionType: sess.session_type || "GENERAL_MENTORING",
          focusArea: sess.focus_area || undefined,
          status,
          scheduledAt: sess.scheduled_at,
          sessionDate: datePart,
          timeStr,
          durationMinutes: sess.duration_minutes || 30,
        });
      }

      // Check follow-ups
      if (sess.follow_up_date && status !== "CANCELLED") {
        const diff = calculateDaysDiff(sess.follow_up_date, todayStr);
        const item: DashboardFollowUpItem = {
          id: `followup-${sess.id}`,
          sessionId: sess.id,
          studentId: sess.student_id,
          studentName,
          regNo,
          followUpDate: sess.follow_up_date,
          followUpNotes: sess.follow_up_notes || undefined,
          category: diff < 0 ? "OVERDUE" : diff === 0 ? "TODAY" : "UPCOMING",
          daysDiff: diff,
        };

        followUpsAll.push(item);
        if (diff < 0) {
          followUpsOverdue.push(item);
        } else if (diff === 0) {
          followUpsToday.push(item);
        } else {
          followUpsUpcoming.push(item);
        }
      }
    });

    // Identify Next Session for Today
    let nextSession: DashboardSessionItem | null = null;
    if (todaySessions.length > 0) {
      // Find in-progress first, then upcoming scheduled, or first item
      const inProgress = todaySessions.find((s) => s.status === "IN_PROGRESS");
      const upcoming = todaySessions.find((s) => s.status === "SCHEDULED");
      nextSession = inProgress || upcoming || todaySessions[0];
      if (nextSession) {
        nextSession.isNext = true;
      }
    }

    // Sort follow-ups
    followUpsOverdue.sort((a, b) => a.daysDiff - b.daysDiff); // Most overdue first
    followUpsUpcoming.sort((a, b) => a.daysDiff - b.daysDiff); // Closest upcoming first

    // 3. Milestones (Overdue + Approaching)
    const milestonesOverdue: DashboardMilestoneItem[] = [];
    const milestonesApproaching: DashboardMilestoneItem[] = [];

    (milestonesRaw || []).forEach((m: any) => {
      const st = m.students || studentMap.get(m.student_id);
      const studentName = st?.full_name || "Cadet";
      const regNo = st?.reg_no || "";
      const diff = calculateDaysDiff(m.target_date, todayStr);

      const item: DashboardMilestoneItem = {
        id: m.id,
        studentId: m.student_id,
        studentName,
        regNo,
        title: m.title,
        targetDate: m.target_date,
        priority: m.priority || "MEDIUM",
        category: m.category || "General",
        status: m.status,
        isOverdue: diff < 0,
        daysDiff: diff,
        isAiSuggested: m.is_ai_suggested,
      };

      if (diff < 0) {
        milestonesOverdue.push(item);
      } else if (diff <= 7) {
        milestonesApproaching.push(item);
      }
    });

    // 4. Internship Deadlines (Within 14 days)
    const internshipDeadlines: DashboardInternshipItem[] = (internshipsRaw || []).map((opp: any) => {
      const diff = calculateDaysDiff(opp.application_deadline, todayStr);
      const pursuitsCount = Array.isArray(opp.internships)
        ? opp.internships.length
        : 0;

      return {
        id: opp.id,
        companyName: opp.organization,
        roleTitle: opp.title,
        location: opp.location || undefined,
        applicationDeadline: opp.application_deadline,
        status: opp.is_active ? "OPEN" : "CLOSED",
        pursuitsCount,
        daysRemaining: Math.max(0, diff),
      };
    });

    // 5. Pending AI Recommendations

    const pendingAiRecommendations: DashboardAIRecommendationItem[] = (aiRecsRaw || []).map((r: any) => {
      const st = r.students || studentMap.get(r.student_id);
      const action = r.suggested_actions || {};
      return {
        id: r.id,
        studentId: r.student_id,
        studentName: st?.full_name || "Cadet",
        regNo: st?.reg_no || "",
        recommendationType: action.recommendation_type || action.type || "MILESTONE",
        suggestedTitle: action.suggested_title || action.title || "Recommendation",
        suggestedDescription: action.suggested_description || action.description || "",
        suggestedCategory: action.suggested_category || action.category || "Development",
        suggestedTargetDays: action.suggested_target_days || action.target_days || 14,
        evidenceSummary: action.evidence_summary || undefined,
        createdAt: r.created_at,
      };
    });

    // 6. Explainable Needs Attention Queue (Zero opaque scores!)
    // Gather operational signals:
    // HIGH: Overdue milestones, Overdue follow-ups
    // MEDIUM: Follow-up due today, Milestones approaching in 7 days, Session notes with attendance/communication struggles
    // INFORMATIONAL: Session scheduled today, Pending AI recommendation
    interface CadetSignalCollector {
      studentId: string;
      studentName: string;
      regNo: string;
      careerGoal: string;
      reasons: string[];
      signals: Set<string>;
      urgencyLevels: Set<"HIGH" | "MEDIUM" | "INFORMATIONAL">;
    }

    const attentionMap = new Map<string, CadetSignalCollector>();

    function getOrCreateCollector(studentId: string): CadetSignalCollector | null {
      const info = studentMap.get(studentId);
      if (!info) return null;
      if (!attentionMap.has(studentId)) {
        attentionMap.set(studentId, {
          studentId: info.id,
          studentName: info.full_name,
          regNo: info.reg_no,
          careerGoal: info.career_goal,
          reasons: [],
          signals: new Set<string>(),
          urgencyLevels: new Set(),
        });
      }
      return attentionMap.get(studentId)!;
    }

    // Signal A: Overdue milestones
    milestonesOverdue.forEach((m) => {
      const c = getOrCreateCollector(m.studentId);
      if (c) {
        c.urgencyLevels.add("HIGH");
        c.signals.add("OVERDUE_MILESTONE");
        const days = Math.abs(m.daysDiff);
        c.reasons.push(`Milestone overdue by ${days} day${days === 1 ? "" : "s"}: "${m.title}"`);
      }
    });

    // Signal B: Overdue follow-ups
    followUpsOverdue.forEach((f) => {
      const c = getOrCreateCollector(f.studentId);
      if (c) {
        c.urgencyLevels.add("HIGH");
        c.signals.add("OVERDUE_FOLLOW_UP");
        const days = Math.abs(f.daysDiff);
        c.reasons.push(`Follow-up overdue by ${days} day${days === 1 ? "" : "s"} (due ${f.followUpDate})`);
      }
    });

    // Signal C: Follow-ups due today
    followUpsToday.forEach((f) => {
      const c = getOrCreateCollector(f.studentId);
      if (c) {
        c.urgencyLevels.add("MEDIUM");
        c.signals.add("FOLLOW_UP_TODAY");
        c.reasons.push(`Follow-up scheduled for today`);
      }
    });

    // Signal D: Approaching milestones (within 7 days)
    milestonesApproaching.forEach((m) => {
      const c = getOrCreateCollector(m.studentId);
      if (c) {
        c.urgencyLevels.add("MEDIUM");
        c.signals.add("APPROACHING_MILESTONE");
        c.reasons.push(`Milestone due in ${m.daysDiff} day${m.daysDiff === 1 ? "" : "s"}: "${m.title}"`);
      }
    });

    // Signal E: Session observations mentioning attendance or communication struggles
    (sessionsRaw || []).forEach((sess: any) => {
      const obs = (sess.observations || "").toLowerCase();
      const focus = (sess.focus_area || "").toLowerCase();
      if (focus.includes("attendance") || obs.includes("attendance")) {
        const c = getOrCreateCollector(sess.student_id);
        if (c && !c.signals.has("ATTENDANCE_SUPPORT")) {
          c.urgencyLevels.add("MEDIUM");
          c.signals.add("ATTENDANCE_SUPPORT");
          c.reasons.push("Attendance consistency recovery support recommended");
        }
      } else if (focus.includes("english") || obs.includes("language") || obs.includes("communication")) {
        const c = getOrCreateCollector(sess.student_id);
        if (c && !c.signals.has("COMMUNICATION_SUPPORT")) {
          c.urgencyLevels.add("MEDIUM");
          c.signals.add("COMMUNICATION_SUPPORT");
          c.reasons.push("Communication & technical language development support needed");
        }
      }
    });

    // Signal F: Pending AI recommendations
    pendingAiRecommendations.forEach((r) => {
      const c = getOrCreateCollector(r.studentId);
      if (c) {
        c.urgencyLevels.add("INFORMATIONAL");
        c.signals.add("PENDING_AI");
        c.reasons.push(`AI Recommendation awaiting mentor review: "${r.suggestedTitle}"`);
      }
    });

    // Signal G: Session scheduled today
    todaySessions.forEach((s) => {
      const c = getOrCreateCollector(s.studentId);
      if (c) {
        c.urgencyLevels.add("INFORMATIONAL");
        c.signals.add("SESSION_TODAY");
        c.reasons.push(`Mentoring session scheduled today${s.timeStr ? ` at ${s.timeStr}` : ""}`);
      }
    });

    // Format explainable attention items
    const needingAttention: DashboardAttentionItem[] = Array.from(attentionMap.values())
      .map((c) => {
        let finalUrgency: "HIGH" | "MEDIUM" | "INFORMATIONAL" = "INFORMATIONAL";
        if (c.urgencyLevels.has("HIGH")) {
          finalUrgency = "HIGH";
        } else if (c.urgencyLevels.has("MEDIUM")) {
          finalUrgency = "MEDIUM";
        }

        return {
          studentId: c.studentId,
          studentName: c.studentName,
          regNo: c.regNo,
          careerGoal: c.careerGoal,
          urgency: finalUrgency,
          primaryReason: c.reasons[0] || "Mentor review recommended",
          reasons: c.reasons,
          signalTypes: Array.from(c.signals),
        };
      })
      .sort((a, b) => {
        const weight = { HIGH: 3, MEDIUM: 2, INFORMATIONAL: 1 };
        return weight[b.urgency] - weight[a.urgency];
      });

    // 7. Recent Operational Activity (Audit Logs)
    const recentActivity: DashboardActivityItem[] = (auditLogsRaw || []).map((log: any) => {
      let title = "System Activity";
      let description = `${log.action} on ${log.entity_table || "record"}`;

      const entity = log.entity_table?.toLowerCase() || "";
      const act = log.action?.toUpperCase() || "";

      if (entity === "sessions") {
        title = act.includes("CREATE") ? "Session Scheduled" : act.includes("COMPLETE") ? "Session Completed" : "Session Updated";
        description = log.new_values?.focus_area ? `Focus: ${log.new_values.focus_area}` : `Session updated by faculty`;
      } else if (entity === "milestones") {
        title = act.includes("CREATE") ? "Milestone Created" : act.includes("COMPLETE") ? "Milestone Completed" : "Milestone Updated";
        description = log.new_values?.title ? `"${log.new_values.title}"` : `Milestone updated`;
      } else if (entity === "resources") {
        title = act.includes("CREATE") ? "Resource Added" : "Resource Updated";
        description = log.new_values?.title ? `"${log.new_values.title}"` : `Resource catalogue updated`;
      } else if (entity === "achievements") {
        title = act.includes("CREATE") ? "Achievement Recorded" : "Achievement Verified";
        description = log.new_values?.title ? `"${log.new_values.title}"` : `Student achievement recorded`;
      } else if (entity === "groups") {
        title = act.includes("CREATE") ? "Intervention Group Created" : "Group Updated";
        description = log.new_values?.name ? `"${log.new_values.name}"` : `Intervention group updated`;
      } else if (entity === "ai_recommendations") {
        title = "AI Recommendation Processed";
        description = log.new_values?.suggested_title ? `"${log.new_values.suggested_title}"` : `Recommendation processed`;
      }

      return {
        id: log.id,
        action: log.action,
        entityType: log.entity_table || "system",
        entityId: log.entity_id || "",
        timestamp: log.created_at,
        title,
        description,
        actorRole: log.actor_role || "faculty",
      };
    });

    // 8. Career Distribution (Dynamic query preserved from Phase 1)
    const roleCounts: Record<string, number> = {};
    (goals || []).forEach((g: any) => {
      const id = g.career_role_id || "other";
      roleCounts[id] = (roleCounts[id] || 0) + 1;
    });

    const careerDistribution: CareerDistributionItem[] = (roles || []).map((r: any) => ({
      role_id: r.id,
      title: r.title,
      short_title: r.short_title,
      slug: r.slug,
      count: roleCounts[r.id] || 0,
    })).sort((a: any, b: any) => b.count - a.count);

    // 9. Final Aggregated KPIs (Clear operational counts, zero opaque numerical risk scores)
    const kpis: DashboardKpis = {
      todaySessionsCount: todaySessions.length,
      followUpsDueCount: followUpsOverdue.length + followUpsToday.length,
      overdueMilestonesCount: milestonesOverdue.length,
      pendingAiRecommendationsCount: pendingAiRecommendations.length,
      totalStudents: totalStudents ?? 0,
      activeMilestonesCount: activeMilestonesCount ?? 0,
    };

    const commandCenterData: CommandCenterData = {
      kpis,
      todaySessions,
      nextSession,
      followUps: {
        overdue: followUpsOverdue,
        today: followUpsToday,
        upcoming: followUpsUpcoming,
        all: followUpsAll,
      },
      milestones: {
        overdue: milestonesOverdue,
        approaching: milestonesApproaching,
      },
      internships: {
        approachingDeadlines: internshipDeadlines,
      },
      aiRecommendations: pendingAiRecommendations,
      needingAttention,
      recentActivity,
      careerDistribution,
      searchIndex,
    };

    return {
      data: commandCenterData,
      error: null,
    };
  });
});

/**
 * Backward compatibility wrapper for existing consumers of getDashboardData()
 */
export const getDashboardData = cache(async function getDashboardData() {
  const { data, error } = await getCommandCenterData();
  if (error || !data) {
    return { data: null, error };
  }

  // Preserve legacy fields alongside the new rich CommandCenterData structure
  return {
    data: {
      ...data,
      metrics: {
        totalStudents: data.kpis.totalStudents,
        needingAttention: data.needingAttention.length,
        activeMilestones: data.kpis.activeMilestonesCount,
        totalSessions: data.todaySessions.length,
      },
      attentionQueue: data.needingAttention.map((a) => ({
        student_id: a.studentId,
        full_name: a.studentName,
        reg_no: a.regNo,
        career_goal: a.careerGoal,
        reason: a.primaryReason,
        signal_type: (a.signalTypes[0] as any) || "ATTENDANCE",
        status_label: a.urgency,
      })),
      activeMilestones: data.milestones.overdue.concat(data.milestones.approaching).map((m) => ({
        id: m.id,
        title: m.title,
        priority: m.priority,
        status: m.status,
        target_date: m.targetDate,
        is_ai_suggested: m.isAiSuggested,
        students: {
          id: m.studentId,
          full_name: m.studentName,
          reg_no: m.regNo,
        },
      })),
      recentSessions: data.todaySessions.map((s) => ({
        id: s.id,
        session_date: s.sessionDate,
        focus_area: s.focusArea,
        observations: "",
        students: {
          id: s.studentId,
          full_name: s.studentName,
          reg_no: s.regNo,
        },
      })),
      searchIndex: data.searchIndex,
    },
    error: null,
  };
});
