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

export interface CohortEngagement {
  /** Sessions per week, last ~12 weeks. */
  weekly: Array<{ label: string; count: number }>;
  /** Sessions grouped by type across the cohort. */
  typeMix: CountItem[];
  /** Cadets with no activity in a while (most silent first). */
  goneQuiet: Array<{ studentId: string; name: string; regNo: string; days: number | null }>;
  followUps: { overdue: number; upcoming: number };
  avgSessionsPerCadet: number;
}

export interface CohortSkills {
  /** Average rating by category across the cohort. */
  radar: Array<{ category: string; avg: number }>;
  /** Weakest skills cohort-wide (lowest average first). */
  weakest: Array<{ name: string; avg: number }>;
  /** Strongest skills cohort-wide. */
  strongest: Array<{ name: string; avg: number }>;
  assessedCount: number;
}

export interface CohortReadiness {
  byDocument: Array<{ label: string; ready: number; total: number }>;
  byTrack: Array<{ track: string; avg: number; count: number }>;
}

export interface CohortAchievements {
  byCategory: CountItem[];
  weekly: Array<{ label: string; count: number }>;
  verified: number;
  pending: number;
  total: number;
  zeroCount: number;
}

export interface CohortActivity {
  weekly: Array<{ label: string; count: number }>;
  byEntity: CountItem[];
  aiRecs: { pending: number; approved: number; rejected: number };
}

export interface CohortAnalytics {
  kpis: CohortKpis;
  scatter: ScatterPoint[];
  funnel: FunnelBucket[];
  readinessMatrix: ReadinessMatrix;
  engagement: CohortEngagement;
  skills: CohortSkills;
  readiness: CohortReadiness;
  achievements: CohortAchievements;
  activity: CohortActivity;
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

export interface SkillTrendSeries {
  skillId: string;
  name: string;
  category: string;
  points: Array<{ date: string; rating: number }>;
}

export interface EditorSkill {
  id: string;
  name: string;
  category: string;
  rating: number; // current (0 = unrated)
}

export interface SessionOption {
  id: string;
  date: string;
  label: string;
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
  /** Per-skill rating history over time (development trend). */
  skillTrend: SkillTrendSeries[];
  /** All skills with their current rating, for the mentor skill editor. */
  skillsForEditor: EditorSkill[];
  /** The cadet's sessions, for attributing a skill update to a session. */
  sessionOptions: SessionOption[];
  taskTotals: { completed: number; total: number };
  totals: {
    sessions: number;
    milestones: number;
    completedMilestones: number;
    skillAvg: number | null;
  };
}
