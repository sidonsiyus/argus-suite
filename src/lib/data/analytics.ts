import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTodayIST, calculateDaysDiff } from "@/lib/data/dashboard";
import {
  CohortAnalytics,
  PipelineStage,
  ScatterPoint,
  ReadinessMatrix,
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

      // Pipeline stage.
      let stage: PipelineStage;
      if (placedStudents.has(s.id)) stage = "Placed";
      else if (readyCount >= 4 && progress >= 70) stage = "Ready";
      else if (progress > 0 || (sessionsByStudent.get(s.id) || []).length > 0) stage = "In progress";
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
