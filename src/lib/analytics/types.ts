/** Types for the MENTOR OS Analytics view (cohort overview + per-student). */

export type PipelineStage = "Not started" | "In progress" | "Ready" | "Placed";

export interface ScatterPoint {
  studentId: string;
  name: string;
  regNo: string;
  /** 0–100 average active-POA progress. */
  progress: number;
  /** Days since the last completed task / milestone / session. null = no activity ever. */
  daysSinceActivity: number | null;
  /** Open HIGH + CRITICAL milestones (drives bubble size). */
  openCritical: number;
  stage: PipelineStage;
  atRisk: boolean;
}

export interface FunnelBucket {
  stage: PipelineStage;
  count: number;
}

export interface ReadinessMatrix {
  columns: string[]; // e.g. ["Resume", "LinkedIn", ...]
  rows: Array<{
    studentId: string;
    name: string;
    regNo: string;
    /** One of "READY" | "PARTIAL" | "MISSING" per column. */
    cells: Array<"READY" | "PARTIAL" | "MISSING">;
  }>;
  /** Per-column ready-count, for the column summary strip. */
  columnReady: number[];
}

export interface CohortKpis {
  totalStudents: number;
  avgReadiness: number; // 0–100
  sessionsThisWeek: number;
  sessionsTrend: number; // delta vs previous week
  sessionsSpark: number[]; // last 8 weeks
  tasksThisWeek: number;
  tasksTrend: number;
  tasksSpark: number[];
  atRiskCount: number;
}

export interface CohortAnalytics {
  kpis: CohortKpis;
  scatter: ScatterPoint[];
  funnel: FunnelBucket[];
  readinessMatrix: ReadinessMatrix;
  generatedAt: string;
}

// ── Per-student drill-down ────────────────────────────────────────────
export interface SessionJourneyNode {
  id: string;
  date: string;
  status: string;
  type: string;
  focus: string;
  durationMinutes: number;
  /** Tasks completed in the interval that opened with this session. */
  tasksCompleted: number;
}

export interface EngagementPoint {
  date: string;
  cumulativeSessions: number;
}

export interface MilestoneFlag {
  date: string;
  title: string;
}

export interface GanttBar {
  id: string;
  title: string;
  start: string;
  end: string | null;
  progress: number;
  priority: string;
  status: string;
  overdue: boolean;
}

export interface RadarAxis {
  category: string;
  current: number;
  earlier: number | null;
}

export interface CountItem {
  label: string;
  count: number;
}

export interface StudentAnalytics {
  studentId: string;
  name: string;
  regNo: string;
  journey: SessionJourneyNode[];
  engagement: EngagementPoint[];
  milestoneFlags: MilestoneFlag[];
  gantt: GanttBar[];
  radar: RadarAxis[];
  /** 6 career-readiness documents at a glance. */
  readiness: {
    columns: string[];
    cells: Array<"READY" | "PARTIAL" | "MISSING">;
    readyCount: number;
  };
  /** POAs grouped by status. */
  poaStatus: CountItem[];
  /** Sessions grouped by type. */
  sessionTypeMix: CountItem[];
  /** Per-skill current ratings (0–5), ranked. */
  skillsBars: Array<{ name: string; rating: number }>;
  taskTotals: { completed: number; total: number };
  totals: {
    sessions: number;
    milestones: number;
    completedMilestones: number;
    skillAvg: number | null;
  };
}
