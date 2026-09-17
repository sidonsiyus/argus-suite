import { createServerSupabase } from "@/lib/supabase/server";
import { POAFollowUpItem, POAFollowUpTask } from "@/lib/poa/types";

export * from "@/lib/poa/types";

/**
 * Retrieves a cadet's active POAs and tasks specifically formatted for
 * mentoring session follow-up review.
 */
export async function getStudentPOAFollowUp(studentId: string): Promise<{
  activePOAs: POAFollowUpItem[];
  historicalPOAs: POAFollowUpItem[];
}> {
  const supabase = createServerSupabase();

  // 1. Query all milestones for the cadet
  const { data: rawMilestones, error: mErr } = await supabase
    .from("milestones")
    .select(
      `
      id, student_id, title, description, category, priority, status,
      target_date, completed_at, completion_percentage, target_outcome, outcome_statement,
      success_criteria, evidence_requirement, text_instructions, mentor_feedback,
      provenance, is_archived, parent_milestone_id, updated_at, created_at,
      milestone_resources (
        resources ( id, title, url, resource_type )
      )
    `
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (mErr || !rawMilestones) {
    return { activePOAs: [], historicalPOAs: [] };
  }

  // 2. Query dedicated tasks from public.milestone_tasks
  const milestoneIds = rawMilestones.map((m) => m.id);
  let rawTasks: any[] = [];
  if (milestoneIds.length > 0) {
    const { data: tasksData } = await supabase
      .from("milestone_tasks")
      .select("id, milestone_id, title, description, order_index, is_completed, completed_at")
      .in("milestone_id", milestoneIds)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true });
    rawTasks = tasksData || [];
  }

  const tasksByMilestoneId = new Map<string, POAFollowUpTask[]>();
  rawTasks.forEach((t) => {
    if (!tasksByMilestoneId.has(t.milestone_id)) {
      tasksByMilestoneId.set(t.milestone_id, []);
    }
    tasksByMilestoneId.get(t.milestone_id)!.push({
      id: t.id,
      title: t.title,
      description: t.description || null,
      is_completed: Boolean(t.is_completed),
      target_date: null,
      completed_at: t.completed_at || null,
      source: "milestone_tasks",
    });
  });

  // Group child sub-milestones
  rawMilestones.forEach((m) => {
    if (m.parent_milestone_id) {
      if (!tasksByMilestoneId.has(m.parent_milestone_id)) {
        tasksByMilestoneId.set(m.parent_milestone_id, []);
      }
      tasksByMilestoneId.get(m.parent_milestone_id)!.push({
        id: m.id,
        title: m.title,
        description: m.description || null,
        is_completed: m.status === "COMPLETED",
        target_date: m.target_date || null,
        completed_at: m.completed_at || null,
        source: "milestones",
      });
    }
  });

  const activePOAs: POAFollowUpItem[] = [];
  const historicalPOAs: POAFollowUpItem[] = [];

  rawMilestones.forEach((m) => {
    // Skip child sub-milestones from top-level list
    if (m.parent_milestone_id) return;

    const isHistorical =
      m.provenance === "HISTORICAL_PROFILE" ||
      m.category === "Action Plan" ||
      (m as any).poa_type === "HISTORICAL_ACTION_PLAN";

    const isArchived = Boolean(m.is_archived) || m.status === "ARCHIVED";

    const allTasks = tasksByMilestoneId.get(m.id) || [];
    const completedTasks = allTasks.filter((t) => t.is_completed);
    const outstandingTasks = allTasks.filter((t) => !t.is_completed);

    const progress =
      allTasks.length > 0
        ? Math.round((completedTasks.length / allTasks.length) * 100)
        : m.status === "COMPLETED"
        ? 100
        : m.completion_percentage || (m.status === "IN_PROGRESS" ? 50 : 0);

    const linkedRes = (m.milestone_resources || [])
      .map((mr: any) => mr.resources)
      .filter(Boolean);

    const poaItem: POAFollowUpItem = {
      id: m.id,
      student_id: m.student_id,
      title: m.title,
      target_outcome: m.target_outcome || m.outcome_statement || m.success_criteria || null,
      objective: m.description || null,
      status: m.status,
      priority: m.priority || "MEDIUM",
      target_date: m.target_date || null,
      progress,
      total_tasks: allTasks.length,
      completed_tasks: completedTasks.length,
      outstanding_tasks: outstandingTasks,
      all_tasks: allTasks,
      evidence_status: m.evidence_requirement || null,
      last_updated: m.updated_at || m.created_at,
      mentor_feedback: m.mentor_feedback || null,
      is_historical: isHistorical,
      linked_resources: linkedRes,
    };

    if (isHistorical) {
      historicalPOAs.push(poaItem);
    } else if (!isArchived) {
      activePOAs.push(poaItem);
    }
  });

  return { activePOAs, historicalPOAs };
}

