import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTodayIST, calculateDaysDiff } from "@/lib/data/dashboard";
import {
  CohortAnalytics,
  PipelineStage,
  ScatterPoint,
  ReadinessMatrix,
  StudentAnalytics,
  SessionJourneyNode,
  GanttBar,
  RadarAxis,
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
    ] = await Promise.all([
      supabase.from("students").select("id, full_name, reg_no, sno").order("sno", { ascending: true }),
      supabase.from("sessions").select("id, student_id, session_date, status"),
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
      generatedAt: new Date().toISOString(),
    };

    return { data: analytics, error: null };
  });
});

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

    const [{ data: sessionsRaw }, { data: milestonesRaw }, { data: skillsRaw }, { data: assessRaw }] =
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
    const skillMeta = new Map<string, { category: string }>();
    ((skillsRaw || []) as any[]).forEach((sk) => skillMeta.set(sk.id, { category: sk.category || "General" }));
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

    return {
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
