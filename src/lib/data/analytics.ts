import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTodayIST, calculateDaysDiff } from "@/lib/data/dashboard";
import { prettyEnum } from "@/lib/charts/format";
import {
  CohortAnalytics,
  PipelineStage,
  ScatterPoint,
  ReadinessMatrix,
  StudentAnalytics,
  SessionJourneyNode,
  GanttBar,
  RadarAxis,
  SkillTrendSeries,
  EditorSkill,
  SessionOption,
} from "@/lib/analytics/types";

async function queryWithFallback<T>(queryFn: (client: any) => Promise<T>): Promise<T> {
  try {
    const primary = createServerSupabase();
    return await queryFn(primary);
  } catch (err) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return await queryFn(createAdminClient());
    }
    throw err;
  }
}

// Historical / non-current milestones aren't counted toward live progress.
function isHistoricalMilestone(m: any): boolean {
  return (
    m.provenance === "HISTORICAL_PROFILE" ||
    m.category === "Action Plan" ||
    m.status === "ARCHIVED" ||
    Boolean(m.is_archived)
  );
}

const READINESS_COLUMNS = [
  "Resume",
  "LinkedIn",
  "Passport",
  "License",
  "PAN",
  "Aadhaar",
] as const;

const READINESS_FIELDS = [
  "resume_status",
  "linkedin_status",
  "passport_status",
  "driving_license_status",
  "pan_card_status",
  "aadhaar_card_status",
] as const;

function readinessCell(status: string | null | undefined): "READY" | "PARTIAL" | "MISSING" {
  if (status === "VERIFIED" || status === "AVAILABLE") return "READY";
  if (status === "IN_PROGRESS" || status === "PENDING") return "PARTIAL";
  return "MISSING";
}

// "Placed" internship statuses (offer accepted / ongoing / done).
const PLACED_STATUSES = new Set(["SELECTED", "OFFERED", "OFFER_ACCEPTED", "ONGOING", "COMPLETED"]);

/**
 * Cohort-level analytics for the Analytics overview.
 * Read-only; reuses the same tables as the dashboard/student-detail layers.
 */
export const getCohortAnalytics = cache(async function getCohortAnalytics(): Promise<{
  data: CohortAnalytics | null;
  error: any;
}> {
  return queryWithFallback(async (supabase) => {
    const todayStr = getTodayIST();

    const [
      { data: studentsRaw },
      { data: sessionsRaw },
      { data: milestonesRaw },
      { data: readinessRaw },
      { data: internshipsRaw },
      { data: assessRaw },
      { data: skillsRaw },
      { data: goalsRaw },
      { data: rolesRaw },
      { data: achievementsRaw },
      { data: auditRaw },
      { data: aiRecsRaw },
    ] = await Promise.all([
      supabase.from("students").select("id, full_name, reg_no, sno").order("sno", { ascending: true }),
      supabase.from("sessions").select("id, student_id, session_date, status, session_type, duration_minutes, follow_up_date"),
      supabase
        .from("milestones")
        .select(
          "id, student_id, status, priority, completion_percentage, completed_at, target_date, provenance, category, is_archived, parent_milestone_id"
        ),
      supabase
        .from("career_readiness")
        .select(
          "student_id, resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status"
        ),
      supabase.from("internships").select("student_id, status"),
      supabase.from("skill_assessments").select("student_id, skill_id, rating, assessed_at").order("assessed_at", { ascending: true }),
      supabase.from("skills").select("id, name, category"),
      supabase.from("student_career_goals").select("student_id, custom_role_title, career_role_id, is_primary").eq("is_primary", true),
      supabase.from("career_roles").select("id, title, short_title"),
      supabase.from("achievements").select("student_id, category, is_verified, date_achieved, created_at"),
      supabase.from("audit_logs").select("entity_table, action, created_at").order("created_at", { ascending: false }).limit(1000),
      supabase.from("ai_recommendations").select("status"),
    ]);

    const students = (studentsRaw || []) as any[];
    if (students.length === 0) {
      return { data: emptyAnalytics(), error: null };
    }

    // Tasks for all live milestones (used for progress + recency + weekly buckets).
    const liveMilestones = (milestonesRaw || []).filter(
      (m: any) => !m.parent_milestone_id && !isHistoricalMilestone(m)
    );
    const milestoneIds = liveMilestones.map((m: any) => m.id);
    let tasksRaw: any[] = [];
    if (milestoneIds.length > 0) {
      const { data: t } = await supabase
        .from("milestone_tasks")
        .select("id, milestone_id, is_completed, completed_at")
        .in("milestone_id", milestoneIds);
      tasksRaw = t || [];
    }

    // ── Group data by student ────────────────────────────────────────────
    const tasksByMilestone = new Map<string, any[]>();
    tasksRaw.forEach((t) => {
      if (!tasksByMilestone.has(t.milestone_id)) tasksByMilestone.set(t.milestone_id, []);
      tasksByMilestone.get(t.milestone_id)!.push(t);
    });

    const milestonesByStudent = new Map<string, any[]>();
    liveMilestones.forEach((m: any) => {
      if (!milestonesByStudent.has(m.student_id)) milestonesByStudent.set(m.student_id, []);
      milestonesByStudent.get(m.student_id)!.push(m);
    });

    const sessionsByStudent = new Map<string, any[]>();
    (sessionsRaw || []).forEach((s: any) => {
      if (!sessionsByStudent.has(s.student_id)) sessionsByStudent.set(s.student_id, []);
      sessionsByStudent.get(s.student_id)!.push(s);
    });

    const readinessByStudent = new Map<string, any>();
    (readinessRaw || []).forEach((r: any) => readinessByStudent.set(r.student_id, r));

    const placedStudents = new Set<string>();
    (internshipsRaw || []).forEach((i: any) => {
      if (PLACED_STATUSES.has((i.status || "").toUpperCase())) placedStudents.add(i.student_id);
    });

    // Milestone progress like the POA layer: tasks first, else % / status.
    function milestoneProgress(m: any): number {
      const tasks = tasksByMilestone.get(m.id) || [];
      if (tasks.length > 0) {
        const done = tasks.filter((t) => t.is_completed).length;
        return Math.round((done / tasks.length) * 100);
      }
      if (m.status === "COMPLETED") return 100;
      return m.completion_percentage || (m.status === "IN_PROGRESS" ? 50 : 0);
    }

    // ── Per-student rollups ─────────────────────────────────────────────
    const scatter: ScatterPoint[] = [];
    const readinessRows: ReadinessMatrix["rows"] = [];
    const columnReady = new Array(READINESS_COLUMNS.length).fill(0);
    const stageCounts: Record<PipelineStage, number> = {
      "Not started": 0,
      "In progress": 0,
      Ready: 0,
      Placed: 0,
    };
    let readinessSum = 0;
    let atRiskCount = 0;

    students.forEach((s) => {
      const ms = milestonesByStudent.get(s.id) || [];
      const poaProgress =
        ms.length > 0 ? Math.round(ms.reduce((sum, m) => sum + milestoneProgress(m), 0) / ms.length) : 0;

      const openCritical = ms.filter(
        (m) => m.status !== "COMPLETED" && (m.priority === "CRITICAL" || m.priority === "HIGH")
      ).length;

      // Recency: latest completed task, completed milestone, or session date.
      const activityDates: string[] = [];
      ms.forEach((m) => {
        if (m.completed_at) activityDates.push(String(m.completed_at).split("T")[0]);
        (tasksByMilestone.get(m.id) || []).forEach((t) => {
          if (t.completed_at) activityDates.push(String(t.completed_at).split("T")[0]);
        });
      });
      (sessionsByStudent.get(s.id) || []).forEach((sess) => {
        if (sess.session_date && sess.status !== "CANCELLED") activityDates.push(sess.session_date);
      });
      let daysSinceActivity: number | null = null;
      if (activityDates.length > 0) {
        const latest = activityDates.sort().at(-1)!;
        daysSinceActivity = Math.max(0, -calculateDaysDiff(latest, todayStr));
      }

      // Readiness matrix + average.
      const rd = readinessByStudent.get(s.id) || {};
      const cells = READINESS_FIELDS.map((f) => readinessCell(rd[f]));
      cells.forEach((c, i) => {
        if (c === "READY") columnReady[i] += 1;
      });
      const readyCount = cells.filter((c) => c === "READY").length;
      const readinessPct = Math.round((readyCount / READINESS_COLUMNS.length) * 100);
      readinessSum += readinessPct;
      readinessRows.push({ studentId: s.id, name: s.full_name, regNo: s.reg_no, cells });

      // Blended progression score: half document-readiness, half POA progress.
      // Readiness is the populated signal early on; POA progress rewards plan
      // completion as it accrues. This is the scatter's X axis.
      const progress = Math.round(0.5 * readinessPct + 0.5 * poaProgress);

      // Pipeline stage — banded on the blended progression score so the funnel
      // actually distributes (progress > 0 alone put everyone in "In progress").
      let stage: PipelineStage;
      if (placedStudents.has(s.id)) stage = "Placed";
      else if (readyCount >= 4 && progress >= 70) stage = "Ready";
      else if (progress >= 20) stage = "In progress";
      else stage = "Not started";
      stageCounts[stage] += 1;

      const atRisk =
        stage !== "Placed" &&
        progress < 40 &&
        (daysSinceActivity === null || daysSinceActivity > 14);
      if (atRisk) atRiskCount += 1;

      scatter.push({
        studentId: s.id,
        name: s.full_name,
        regNo: s.reg_no,
        progress,
        daysSinceActivity,
        openCritical,
        stage,
        atRisk,
      });
    });

    // ── Weekly buckets (last 8 weeks) for sessions + tasks ──────────────
    const sessionsSpark = weeklyBuckets(
      (sessionsRaw || [])
        .filter((s: any) => s.status !== "CANCELLED" && s.session_date)
        .map((s: any) => s.session_date),
      todayStr
    );
    const tasksSpark = weeklyBuckets(
      tasksRaw.filter((t) => t.is_completed && t.completed_at).map((t) => String(t.completed_at).split("T")[0]),
      todayStr
    );

    const sessionsThisWeek = sessionsSpark.at(-1) || 0;
    const sessionsTrend = sessionsThisWeek - (sessionsSpark.at(-2) || 0);
    const tasksThisWeek = tasksSpark.at(-1) || 0;
    const tasksTrend = tasksThisWeek - (tasksSpark.at(-2) || 0);

    // ── Engagement section ──────────────────────────────────────────────
    const activeSessions = (sessionsRaw || []).filter((s: any) => s.status !== "CANCELLED" && s.session_date);
    const engagement = {
      weekly: weeklyLabelledBuckets(activeSessions.map((s: any) => s.session_date), todayStr, 12),
      typeMix: countBy(activeSessions.map((s: any) => prettyEnum(s.session_type || "General Mentoring"))),
      goneQuiet: scatter
        .filter((p) => p.daysSinceActivity === null || p.daysSinceActivity > 21)
        .sort((a, b) => (b.daysSinceActivity ?? 9999) - (a.daysSinceActivity ?? 9999))
        .slice(0, 12)
        .map((p) => ({ studentId: p.studentId, name: p.name, regNo: p.regNo, days: p.daysSinceActivity })),
      followUps: (() => {
        let overdue = 0;
        let upcoming = 0;
        activeSessions.forEach((s: any) => {
          if (!s.follow_up_date) return;
          if (s.follow_up_date < todayStr) overdue += 1;
          else upcoming += 1;
        });
        return { overdue, upcoming };
      })(),
      avgSessionsPerCadet: Math.round((activeSessions.length / students.length) * 10) / 10,
    };

    // ── Skills section (latest rating per student+skill) ────────────────
    const skillCat = new Map<string, { name: string; category: string }>();
    ((skillsRaw || []) as any[]).forEach((sk) => skillCat.set(sk.id, { name: sk.name || "Skill", category: sk.category || "General" }));
    const latestRating = new Map<string, number>(); // key student|skill → rating
    ((assessRaw || []) as any[]).forEach((a) => {
      if (a.rating) latestRating.set(`${a.student_id}|${a.skill_id}`, a.rating); // assess ordered asc → last wins
    });
    const catRatings = new Map<string, number[]>();
    const skillRatings = new Map<string, number[]>();
    latestRating.forEach((rating, key) => {
      const skillId = key.split("|")[1];
      const meta = skillCat.get(skillId);
      if (!meta || rating <= 0) return;
      if (!catRatings.has(meta.category)) catRatings.set(meta.category, []);
      catRatings.get(meta.category)!.push(rating);
      if (!skillRatings.has(meta.name)) skillRatings.set(meta.name, []);
      skillRatings.get(meta.name)!.push(rating);
    });
    const mean = (arr: number[]) => (arr.length ? Number((arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1)) : 0);
    const skillAverages = Array.from(skillRatings.entries()).map(([name, arr]) => ({ name, avg: mean(arr) }));
    const skills = {
      radar: Array.from(catRatings.entries()).map(([category, arr]) => ({ category, avg: mean(arr) })),
      weakest: skillAverages.slice().sort((a, b) => a.avg - b.avg).slice(0, 8),
      strongest: skillAverages.slice().sort((a, b) => b.avg - a.avg).slice(0, 8),
      assessedCount: latestRating.size,
    };

    // ── Readiness section ───────────────────────────────────────────────
    const roleTitle = new Map<string, string>();
    ((rolesRaw || []) as any[]).forEach((r) => roleTitle.set(r.id, r.short_title || r.title));
    const trackByStudent = new Map<string, string>();
    ((goalsRaw || []) as any[]).forEach((g) => {
      const t = g.custom_role_title || roleTitle.get(g.career_role_id) || "Unassigned";
      trackByStudent.set(g.student_id, t);
    });
    const readyPctByStudent = new Map<string, number>();
    readinessRows.forEach((r) => {
      const ready = r.cells.filter((c) => c === "READY").length;
      readyPctByStudent.set(r.studentId, Math.round((ready / READINESS_COLUMNS.length) * 100));
    });
    const trackAgg = new Map<string, number[]>();
    students.forEach((s) => {
      const track = trackByStudent.get(s.id) || "Unassigned";
      if (!trackAgg.has(track)) trackAgg.set(track, []);
      trackAgg.get(track)!.push(readyPctByStudent.get(s.id) || 0);
    });
    const readiness = {
      byDocument: READINESS_COLUMNS.map((label, i) => ({ label, ready: columnReady[i], total: students.length })),
      byTrack: Array.from(trackAgg.entries())
        .map(([track, arr]) => ({ track, avg: Math.round(arr.reduce((s, v) => s + v, 0) / arr.length), count: arr.length }))
        .sort((a, b) => b.count - a.count),
    };

    // ── Achievements section ────────────────────────────────────────────
    const ach = (achievementsRaw || []) as any[];
    const withAch = new Set(ach.map((a) => a.student_id));
    const achievements = {
      byCategory: countBy(ach.map((a) => prettyEnum(a.category || "Other"))),
      weekly: weeklyLabelledBuckets(
        ach.map((a) => String(a.date_achieved || a.created_at || "").split("T")[0]).filter(Boolean),
        todayStr,
        12
      ),
      verified: ach.filter((a) => a.is_verified).length,
      pending: ach.filter((a) => !a.is_verified).length,
      total: ach.length,
      zeroCount: students.filter((s) => !withAch.has(s.id)).length,
    };

    // ── Activity section ────────────────────────────────────────────────
    const audit = (auditRaw || []) as any[];
    const aiRecs = (aiRecsRaw || []) as any[];
    const activity = {
      weekly: weeklyLabelledBuckets(
        audit.map((l) => String(l.created_at || "").split("T")[0]).filter(Boolean),
        todayStr,
        12
      ),
      byEntity: countBy(audit.map((l) => prettyEnum(l.entity_table || "system"))).slice(0, 6),
      aiRecs: {
        pending: aiRecs.filter((r) => (r.status || "").toUpperCase() === "PENDING").length,
        approved: aiRecs.filter((r) => /APPROV/i.test(r.status || "")).length,
        rejected: aiRecs.filter((r) => /REJECT/i.test(r.status || "")).length,
      },
    };

    const analytics: CohortAnalytics = {
      kpis: {
        totalStudents: students.length,
        avgReadiness: Math.round(readinessSum / students.length),
        sessionsThisWeek,
        sessionsTrend,
        sessionsSpark,
        tasksThisWeek,
        tasksTrend,
        tasksSpark,
        atRiskCount,
      },
      scatter,
      funnel: (Object.keys(stageCounts) as PipelineStage[]).map((stage) => ({
        stage,
        count: stageCounts[stage],
      })),
      readinessMatrix: {
        columns: [...READINESS_COLUMNS],
        rows: readinessRows,
        columnReady,
      },
      engagement,
      skills,
      readiness,
      achievements,
      activity,
      generatedAt: new Date().toISOString(),
    };

    return { data: analytics, error: null };
  });
});

// Labelled weekly buckets for the last N weeks (oldest → current).
function weeklyLabelledBuckets(dates: string[], todayStr: string, weeks: number): Array<{ label: string; count: number }> {
  const counts = new Array(weeks).fill(0);
  dates.forEach((d) => {
    const diff = -calculateDaysDiff(d, todayStr);
    if (diff < 0) return;
    const w = Math.floor(diff / 7);
    if (w < weeks) counts[weeks - 1 - w] += 1;
  });
  return counts.map((count, i) => {
    const weeksAgo = weeks - 1 - i;
    return { label: weeksAgo === 0 ? "This wk" : `${weeksAgo}w`, count };
  });
}

function countBy(labels: string[]): Array<{ label: string; count: number }> {
  const m = new Map<string, number>();
  labels.forEach((l) => m.set(l, (m.get(l) || 0) + 1));
  return Array.from(m.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

// Count dated items into the last 8 ISO weeks (index 7 = current week).
function weeklyBuckets(dates: string[], todayStr: string): number[] {
  const buckets = new Array(8).fill(0);
  dates.forEach((d) => {
    const diff = -calculateDaysDiff(d, todayStr); // days ago (>=0 past)
    if (diff < 0) return; // future
    const weekAgo = Math.floor(diff / 7);
    if (weekAgo < 8) buckets[7 - weekAgo] += 1;
  });
  return buckets;
}

function emptyAnalytics(): CohortAnalytics {
  return {
    kpis: {
      totalStudents: 0,
      avgReadiness: 0,
      sessionsThisWeek: 0,
      sessionsTrend: 0,
      sessionsSpark: new Array(8).fill(0),
      tasksThisWeek: 0,
      tasksTrend: 0,
      tasksSpark: new Array(8).fill(0),
      atRiskCount: 0,
    },
    scatter: [],
    funnel: [
      { stage: "Not started", count: 0 },
      { stage: "In progress", count: 0 },
      { stage: "Ready", count: 0 },
      { stage: "Placed", count: 0 },
    ],
    readinessMatrix: { columns: [...READINESS_COLUMNS], rows: [], columnReady: new Array(6).fill(0) },
    engagement: { weekly: [], typeMix: [], goneQuiet: [], followUps: { overdue: 0, upcoming: 0 }, avgSessionsPerCadet: 0 },
    skills: { radar: [], weakest: [], strongest: [], assessedCount: 0 },
    readiness: { byDocument: [], byTrack: [] },
    achievements: { byCategory: [], weekly: [], verified: 0, pending: 0, total: 0, zeroCount: 0 },
    activity: { weekly: [], byEntity: [], aiRecs: { pending: 0, approved: 0, rejected: 0 } },
    generatedAt: new Date().toISOString(),
  };
}

function progressOf(m: any, tasks: any[]): number {
  if (tasks.length > 0) {
    const done = tasks.filter((t) => t.is_completed).length;
    return Math.round((done / tasks.length) * 100);
  }
  if (m.status === "COMPLETED") return 100;
  return m.completion_percentage || (m.status === "IN_PROGRESS" ? 50 : 0);
}

const PRIORITY_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

/**
 * Per-student progression data for the analytics drill-down:
 * session journey, cumulative engagement, POA Gantt, and a skills radar.
 */
export const getStudentAnalytics = cache(async function getStudentAnalytics(
  studentId: string
): Promise<StudentAnalytics | null> {
  return queryWithFallback(async (supabase) => {
    const todayStr = getTodayIST();

    const { data: student } = await supabase
      .from("students")
      .select("id, full_name, reg_no")
      .eq("id", studentId)
      .single();
    if (!student) return null;

    const [{ data: sessionsRaw }, { data: milestonesRaw }, { data: skillsRaw }, { data: assessRaw }, { data: readinessRaw }] =
      await Promise.all([
        supabase
          .from("sessions")
          .select("id, session_date, status, session_type, focus_area, duration_minutes")
          .eq("student_id", studentId)
          .order("session_date", { ascending: true }),
        supabase
          .from("milestones")
          .select(
            "id, title, status, priority, completion_percentage, target_date, created_at, completed_at, provenance, category, is_archived, parent_milestone_id"
          )
          .eq("student_id", studentId),
        supabase.from("skills").select("id, name, category"),
        supabase
          .from("skill_assessments")
          .select("skill_id, rating, assessed_at")
          .eq("student_id", studentId)
          .order("assessed_at", { ascending: true }),
        supabase
          .from("career_readiness")
          .select(
            "resume_status, linkedin_status, passport_status, driving_license_status, pan_card_status, aadhaar_card_status"
          )
          .eq("student_id", studentId)
          .single(),
      ]);

    const sessions = ((sessionsRaw || []) as any[]).filter((s) => s.session_date);
    const milestones = ((milestonesRaw || []) as any[]).filter(
      (m) => !m.parent_milestone_id && !isHistoricalMilestone(m)
    );

    // Tasks for these milestones.
    const mIds = milestones.map((m) => m.id);
    let tasks: any[] = [];
    if (mIds.length > 0) {
      const { data } = await supabase
        .from("milestone_tasks")
        .select("milestone_id, is_completed, completed_at")
        .in("milestone_id", mIds);
      tasks = data || [];
    }
    const tasksByMilestone = new Map<string, any[]>();
    tasks.forEach((t) => {
      if (!tasksByMilestone.has(t.milestone_id)) tasksByMilestone.set(t.milestone_id, []);
      tasksByMilestone.get(t.milestone_id)!.push(t);
    });

    // ── Session journey + engagement ──────────────────────────────────
    const activeSessions = sessions.filter((s) => s.status !== "CANCELLED");
    const sessionDates = activeSessions.map((s) => s.session_date).sort();
    const completedTaskDates = tasks
      .filter((t) => t.is_completed && t.completed_at)
      .map((t) => String(t.completed_at).split("T")[0]);

    // Attribute each completed task to the interval opened by the latest session <= its date.
    const tasksPerSessionDate = new Map<string, number>();
    completedTaskDates.forEach((d) => {
      let owner: string | null = null;
      for (const sd of sessionDates) {
        if (sd <= d) owner = sd;
        else break;
      }
      if (owner) tasksPerSessionDate.set(owner, (tasksPerSessionDate.get(owner) || 0) + 1);
    });

    const journey: SessionJourneyNode[] = sessions.map((s) => ({
      id: s.id,
      date: s.session_date,
      status: !s.status || s.status === "HISTORICAL" ? "COMPLETED" : s.status,
      type: s.session_type || "GENERAL_MENTORING",
      focus: s.focus_area || "General mentoring",
      durationMinutes: s.duration_minutes || 30,
      tasksCompleted: s.status === "CANCELLED" ? 0 : tasksPerSessionDate.get(s.session_date) || 0,
    }));

    let running = 0;
    const engagement = activeSessions.map((s) => {
      running += 1;
      return { date: s.session_date, cumulativeSessions: running };
    });

    const milestoneFlags = milestones
      .filter((m) => m.completed_at)
      .map((m) => ({ date: String(m.completed_at).split("T")[0], title: m.title }));

    // ── POA Gantt ─────────────────────────────────────────────────────
    const gantt: GanttBar[] = milestones
      .map((m) => {
        const start = (m.created_at ? String(m.created_at).split("T")[0] : null) || todayStr;
        const end = m.target_date || null;
        const overdue = Boolean(end && end < todayStr && m.status !== "COMPLETED");
        return {
          id: m.id,
          title: m.title,
          start,
          end,
          progress: progressOf(m, tasksByMilestone.get(m.id) || []),
          priority: m.priority || "MEDIUM",
          status: m.status,
          overdue,
        };
      })
      .sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)));

    // ── Skills radar (avg rating per category, current vs earliest) ────
    const skillMeta = new Map<string, { category: string; name: string }>();
    ((skillsRaw || []) as any[]).forEach((sk) =>
      skillMeta.set(sk.id, { category: sk.category || "General", name: sk.name || "Skill" })
    );
    const firstBySkill = new Map<string, number>();
    const lastBySkill = new Map<string, number>();
    ((assessRaw || []) as any[]).forEach((a) => {
      if (!firstBySkill.has(a.skill_id)) firstBySkill.set(a.skill_id, a.rating);
      lastBySkill.set(a.skill_id, a.rating);
    });
    const catCurrent = new Map<string, number[]>();
    const catEarlier = new Map<string, number[]>();
    lastBySkill.forEach((rating, skillId) => {
      const cat = skillMeta.get(skillId)?.category || "General";
      if (rating > 0) {
        if (!catCurrent.has(cat)) catCurrent.set(cat, []);
        catCurrent.get(cat)!.push(rating);
      }
      const first = firstBySkill.get(skillId);
      if (first !== undefined && first !== rating && first > 0) {
        if (!catEarlier.has(cat)) catEarlier.set(cat, []);
        catEarlier.get(cat)!.push(first);
      }
    });
    const avg = (arr: number[]) => (arr.length ? Number((arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1)) : 0);
    const radar: RadarAxis[] = Array.from(catCurrent.keys()).map((category) => ({
      category,
      current: avg(catCurrent.get(category) || []),
      earlier: catEarlier.has(category) ? avg(catEarlier.get(category)!) : null,
    }));

    const allRatings = Array.from(lastBySkill.values()).filter((r) => r > 0);

    // ── Per-skill bars (ranked) ────────────────────────────────────────
    const skillsBars = Array.from(lastBySkill.entries())
      .filter(([, r]) => r > 0)
      .map(([id, rating]) => ({ name: skillMeta.get(id)?.name || "Skill", rating }))
      .sort((a, b) => b.rating - a.rating);

    // ── Skill development trend (per-skill rating history) ─────────────
    const pointsBySkill = new Map<string, Array<{ date: string; rating: number }>>();
    ((assessRaw || []) as any[]).forEach((a) => {
      if (!a.assessed_at || !a.rating) return;
      const d = String(a.assessed_at).split("T")[0];
      if (!pointsBySkill.has(a.skill_id)) pointsBySkill.set(a.skill_id, []);
      pointsBySkill.get(a.skill_id)!.push({ date: d, rating: a.rating });
    });
    const skillTrend: SkillTrendSeries[] = Array.from(pointsBySkill.entries()).map(([skillId, points]) => ({
      skillId,
      name: skillMeta.get(skillId)?.name || "Skill",
      category: skillMeta.get(skillId)?.category || "General",
      points,
    }));

    // All skills with current rating, for the mentor editor.
    const skillsForEditor: EditorSkill[] = ((skillsRaw || []) as any[])
      .map((sk) => ({
        id: sk.id,
        name: sk.name || "Skill",
        category: sk.category || "General",
        rating: lastBySkill.get(sk.id) || 0,
      }))
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

    // Sessions (most recent first) for attributing an update to a session.
    const sessionOptions: SessionOption[] = sessions
      .filter((s) => s.status !== "CANCELLED")
      .slice()
      .reverse()
      .map((s) => ({
        id: s.id,
        date: s.session_date,
        label: `${s.session_date} · ${prettyEnum(s.session_type || "General Mentoring")}`,
      }));

    // ── Readiness (6 shared documents) ────────────────────────────────
    const rd = (readinessRaw || {}) as any;
    const readinessCells = READINESS_FIELDS.map((f) => readinessCell(rd[f]));
    const readiness = {
      columns: [...READINESS_COLUMNS],
      cells: readinessCells,
      readyCount: readinessCells.filter((c) => c === "READY").length,
    };

    // ── POA status breakdown ──────────────────────────────────────────
    const statusCounts = new Map<string, number>();
    milestones.forEach((m) => {
      const label = prettyEnum(m.status);
      statusCounts.set(label, (statusCounts.get(label) || 0) + 1);
    });
    const poaStatus = Array.from(statusCounts.entries()).map(([label, count]) => ({ label, count }));

    // ── Session-type mix ──────────────────────────────────────────────
    const typeCounts = new Map<string, number>();
    sessions
      .filter((s) => s.status !== "CANCELLED")
      .forEach((s) => {
        const label = prettyEnum(s.session_type || "General Mentoring");
        typeCounts.set(label, (typeCounts.get(label) || 0) + 1);
      });
    const sessionTypeMix = Array.from(typeCounts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    // ── Task totals ───────────────────────────────────────────────────
    const taskTotals = {
      completed: tasks.filter((t) => t.is_completed).length,
      total: tasks.length,
    };

    return {
      readiness,
      poaStatus,
      sessionTypeMix,
      skillsBars,
      skillTrend,
      skillsForEditor,
      sessionOptions,
      taskTotals,
      studentId: student.id,
      name: student.full_name,
      regNo: student.reg_no,
      journey,
      engagement,
      milestoneFlags,
      gantt,
      radar,
      totals: {
        sessions: activeSessions.length,
        milestones: milestones.length,
        completedMilestones: milestones.filter((m) => m.status === "COMPLETED").length,
        skillAvg: allRatings.length ? avg(allRatings) : null,
      },
    };
  });
});
