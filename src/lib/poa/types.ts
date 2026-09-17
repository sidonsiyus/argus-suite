export interface POATaskItem {
  id: string;
  poa_id: string;
  student_id: string;
  title: string;
  description?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
  target_date?: string | null;
  completed_at?: string | null;
  provenance: string;
  assigned_resources?: Array<{
    id: string;
    title: string;
    resource_type: string;
    url?: string | null;
  }>;
}

export interface PlanOfActionItem {
  id: string;
  student_id: string;
  title: string;
  objective?: string | null;
  expected_outcome?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "ACTIVE" | "COMPLETED" | "BLOCKED" | "NOT_STARTED" | "ARCHIVED";
  start_date?: string | null;
  target_date?: string | null;
  evidence_requirement?: string | null;
  text_instructions?: string | null;
  provenance: string;
  is_ai_suggested: boolean;
  is_historical: boolean;
  tasks: POATaskItem[];
  progress: number; // 0 - 100 deterministic
  linked_resources?: Array<{
    id: string;
    title: string;
    resource_type: string;
    category: string;
    url?: string | null;
    provider?: string | null;
  }>;
}

/**
 * Calculates deterministic progress for a POA.
 * If tasks exist: (completed_tasks / total_tasks) * 100
 * If 0 tasks exist: 100% if status === 'COMPLETED', else 0%
 */
export function calculatePOAProgress(
  status: string,
  tasks: Array<{ status: string }>
): number {
  if (status === "COMPLETED") return 100;
  if (!tasks || tasks.length === 0) {
    return status === "IN_PROGRESS" ? 50 : 0;
  }
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  return Math.round((completed / tasks.length) * 100);
}

/**
 * Parses milestones into structured Current POAs and Historical Action Plans.
 * Ensures the 16 historical milestones are NEVER reinterpreted as current active POAs.
 */
export function structurePOARoadmap(
  rawMilestones: any[]
): {
  currentPOAs: PlanOfActionItem[];
  historicalPlans: PlanOfActionItem[];
} {
  const currentPOAs: PlanOfActionItem[] = [];
  const historicalPlans: PlanOfActionItem[] = [];

  const allItems = rawMilestones || [];

  // 1. Separate Historical Records (Legacy / Historical Profile)
  allItems.forEach((m) => {
    const isHistorical =
      m.provenance === "HISTORICAL_PROFILE" ||
      m.category === "Action Plan" ||
      m.poa_type === "HISTORICAL_ACTION_PLAN";

    const linkedRes = (m.linked_resources || m.milestone_resources || [])
      .map((mr: any) => mr.resources || mr)
      .filter((r: any) => r && r.title);

    if (isHistorical) {
      historicalPlans.push({
        id: m.id,
        student_id: m.student_id,
        title: m.title,
        objective: m.description || "Historical Action Step",
        expected_outcome: m.success_criteria || "Historical baseline fulfillment",
        priority: m.priority || "MEDIUM",
        status: m.status || "ACTIVE",
        start_date: m.start_date || null,
        target_date: m.target_date || null,
        evidence_requirement: m.evidence_requirement || null,
        text_instructions: m.text_instructions || m.mentor_feedback || null,
        provenance: m.provenance || "HISTORICAL_PROFILE",
        is_ai_suggested: Boolean(m.is_ai_suggested),
        is_historical: true,
        tasks: [],
        progress: m.status === "COMPLETED" ? 100 : m.completion_percentage || 0,
        linked_resources: linkedRes,
      });
    }
  });

  // 2. Separate V2 Current POAs vs Sub-Tasks
  // Sub-tasks have parent_milestone_id or parent reference in description/category
  const currentItems = allItems.filter(
    (m) =>
      m.provenance !== "HISTORICAL_PROFILE" &&
      m.category !== "Action Plan" &&
      m.poa_type !== "HISTORICAL_ACTION_PLAN"
  );

  const parentMap = new Map<string, PlanOfActionItem>();
  const tasksList: any[] = [];

  currentItems.forEach((m) => {
    const hasParent = Boolean(m.parent_milestone_id);
    const linkedRes = (m.linked_resources || m.milestone_resources || [])
      .map((mr: any) => mr.resources || mr)
      .filter((r: any) => r && r.title);

    if (hasParent) {
      tasksList.push(m);
    } else {
      const poaItem: PlanOfActionItem = {
        id: m.id,
        student_id: m.student_id,
        title: m.title,
        objective: m.description || null,
        expected_outcome: m.outcome_statement || m.success_criteria || null,
        priority: m.priority || "MEDIUM",
        status: m.status || "ACTIVE",
        start_date: m.start_date || null,
        target_date: m.target_date || null,
        evidence_requirement: m.evidence_requirement || null,
        text_instructions: m.text_instructions || m.mentor_feedback || null,
        provenance: m.provenance || "MENTOR_ENTERED",
        is_ai_suggested: Boolean(m.is_ai_suggested),
        is_historical: false,
        tasks: [],
        progress: 0,
        linked_resources: linkedRes,
      };
      parentMap.set(m.id, poaItem);
    }
  });

  // Assign tasks to parents
  tasksList.forEach((t) => {
    const parent = parentMap.get(t.parent_milestone_id);
    const taskItem: POATaskItem = {
      id: t.id,
      poa_id: t.parent_milestone_id,
      student_id: t.student_id,
      title: t.title,
      description: t.description || null,
      priority: t.priority || "MEDIUM",
      status: t.status || "NOT_STARTED",
      target_date: t.target_date || null,
      completed_at: t.completed_at || null,
      provenance: t.provenance || "MENTOR_ENTERED",
      assigned_resources: (t.linked_resources || t.milestone_resources || [])
        .map((mr: any) => mr.resources || mr)
        .filter((r: any) => r && r.title),
    };

    if (parent) {
      parent.tasks.push(taskItem);
    } else {
      // Standalone task promoted to current POA
      parentMap.set(t.id, {
        id: t.id,
        student_id: t.student_id,
        title: t.title,
        objective: t.description || null,
        expected_outcome: t.success_criteria || null,
        priority: t.priority || "MEDIUM",
        status: t.status || "NOT_STARTED",
        start_date: null,
        target_date: t.target_date || null,
        evidence_requirement: null,
        text_instructions: null,
        provenance: t.provenance || "MENTOR_ENTERED",
        is_ai_suggested: Boolean(t.is_ai_suggested),
        is_historical: false,
        tasks: [],
        progress: t.status === "COMPLETED" ? 100 : 0,
      });
    }
  });

  // Calculate deterministic progress for each parent POA
  parentMap.forEach((poa) => {
    poa.progress = calculatePOAProgress(poa.status, poa.tasks);
    currentPOAs.push(poa);
  });

  return { currentPOAs, historicalPlans };
}

// ---------------------------------------------------------------------------
// Session POA Follow-Up Data Types
// ---------------------------------------------------------------------------
export interface POAFollowUpTask {
  id: string;
  title: string;
  description?: string | null;
  is_completed: boolean;
  target_date?: string | null;
  completed_at?: string | null;
  source: "milestone_tasks" | "milestones";
}

export interface POAFollowUpItem {
  id: string;
  student_id: string;
  title: string;
  target_outcome: string | null;
  objective: string | null;
  status: string;
  priority: string;
  target_date: string | null; // Student Target Date (conceptually distinct from Mentor Follow-Up Date)
  progress: number; // 0 - 100 deterministic
  total_tasks: number;
  completed_tasks: number;
  outstanding_tasks: POAFollowUpTask[];
  all_tasks: POAFollowUpTask[];
  evidence_status: string | null;
  last_updated: string;
  mentor_feedback: string | null;
  is_historical: boolean;
  linked_resources?: Array<{
    id: string;
    title: string;
    url?: string | null;
    resource_type: string;
  }>;
}
