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
