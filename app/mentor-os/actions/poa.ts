"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { getStudentPOAFollowUp } from "@/lib/data/poa";

// ---------------------------------------------------------------------------
// 1. Authoritative Faculty Resolver
// ---------------------------------------------------------------------------
async function getAuthenticatedFaculty() {
  const supabase = createServerSupabase();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    throw new Error("Unauthorized: Faculty mentor authentication required.");
  }

  const { data: isFaculty, error: roleError } = await supabase.rpc("is_faculty");
  if (roleError || !isFaculty) {
    throw new Error("Forbidden: Faculty mentor access required.");
  }

  return { supabase, user };
}

// ---------------------------------------------------------------------------
// 2. Validation Schemas
// ---------------------------------------------------------------------------
const CreatePOASchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  objective: z.string().trim().max(1000).optional(),
  expectedOutcome: z.string().trim().min(3, "Expected outcome is required").max(1000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional().or(z.literal("")),
  textInstructions: z.string().trim().max(2000).optional(),
  evidenceRequirement: z.string().trim().max(1000).optional(),
  initialTasks: z.array(z.string().trim().min(2).max(200)).max(15).optional(),
});

const CreateTaskSchema = z.object({
  poaId: z.string().uuid("Invalid POA ID"),
  studentId: z.string().uuid("Invalid student ID"),
  title: z.string().trim().min(3, "Task title must be at least 3 characters").max(200),
  description: z.string().trim().max(1000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional().or(z.literal("")),
});

const ToggleTaskSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
  studentId: z.string().uuid("Invalid student ID"),
  isCompleted: z.boolean(),
  source: z.enum(["milestone_tasks", "milestones"]).optional(),
});

const UpdateFeedbackSchema = z.object({
  poaId: z.string().uuid("Invalid POA ID"),
  studentId: z.string().uuid("Invalid student ID"),
  mentorFeedback: z.string().trim().max(2000),
});

const EditPOASchema = z.object({
  poaId: z.string().uuid("Invalid POA ID"),
  studentId: z.string().uuid("Invalid student ID"),
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  objective: z.string().trim().max(1000).optional().nullable(),
  targetOutcome: z.string().trim().min(3, "Target outcome is required").max(1000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional().or(z.literal("")).nullable(),
  textInstructions: z.string().trim().max(2000).optional().nullable(),
  evidenceRequirement: z.string().trim().max(1000).optional().nullable(),
  mentorFeedback: z.string().trim().max(2000).optional().nullable(),
  tasks: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        title: z.string().trim().min(2, "Task title must be at least 2 characters").max(200),
        description: z.string().trim().max(1000).optional().nullable(),
        orderIndex: z.number().int().nonnegative().optional(),
        isCompleted: z.boolean().optional(),
      })
    )
    .optional(),
});

const ReopenPOASchema = z.object({
  poaId: z.string().uuid("Invalid POA ID"),
  studentId: z.string().uuid("Invalid student ID"),
  reason: z.string().trim().max(500).optional(),
});

const CompletePOASchema = z.object({
  poaId: z.string().uuid("Invalid POA ID"),
  studentId: z.string().uuid("Invalid student ID"),
});

const DeletePOASchema = z.object({
  poaId: z.string().uuid("Invalid POA ID"),
  studentId: z.string().uuid("Invalid student ID"),
  confirmText: z.literal("DELETE", {
    errorMap: () => ({ message: 'Please type "DELETE" to confirm deletion.' }),
  }),
});

// ---------------------------------------------------------------------------
// 3. Server Actions
// ---------------------------------------------------------------------------

/**
 * Creates a new Plan of Action manually (Mentor-controlled, zero AI required).
 */
export async function createPlanOfActionAction(rawInput: any) {
  try {
    const { supabase, user } = await getAuthenticatedFaculty();
    const validated = CreatePOASchema.parse(rawInput);
    const now = new Date().toISOString();

    // Verify cadet exists
    const { data: student, error: sErr } = await supabase
      .from("students")
      .select("id, reg_no")
      .eq("id", validated.studentId)
      .single();

    if (sErr || !student) {
      return { success: false, error: "Cadet record not found." };
    }

    // Insert Parent POA milestone
    const { data: poaRow, error: poaErr } = await supabase
      .from("milestones")
      .insert({
        student_id: validated.studentId,
        title: validated.title,
        description: validated.objective || "Faculty-guided mentoring plan",
        success_criteria: validated.expectedOutcome,
        category: "Plan of Action",
        priority: validated.priority,
        status: "ACTIVE",
        completion_percentage: 0,
        target_date: validated.targetDate || null,
        mentor_feedback: validated.textInstructions || null,
        provenance: "MENTOR_ENTERED",
        is_ai_suggested: false,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (poaErr || !poaRow) {
      console.error("Error creating POA:", poaErr);
      return { success: false, error: "Failed to create Plan of Action." };
    }

    const poaId = poaRow.id;

    // Insert optional initial subtasks
    if (validated.initialTasks && validated.initialTasks.length > 0) {
      const taskInserts = validated.initialTasks.map((taskTitle) => ({
        student_id: validated.studentId,
        title: taskTitle,
        description: `Subtask of POA: ${validated.title}`,
        success_criteria: `Completion verified by mentor`,
        category: "Task",
        priority: validated.priority,
        status: "NOT_STARTED",
        completion_percentage: 0,
        provenance: "MENTOR_ENTERED",
        is_ai_suggested: false,
        created_by: user.id,
      }));

      await supabase.from("milestones").insert(taskInserts);
    }

    // Audit Log
    await supabase.from("audit_logs").insert({
      entity_table: "milestones",
      entity_id: poaId,
      action: "INSERT",
      actor_id: user.id,
      actor_role: "faculty",
      new_values: {
        poa_title: validated.title,
        student_id: validated.studentId,
        reg_no: student.reg_no,
        priority: validated.priority,
        tasks_count: validated.initialTasks?.length || 0,
        provenance: "MENTOR_ENTERED",
      },
    });

    revalidatePath(`/students/${validated.studentId}`);
    revalidatePath("/dashboard");

    return { success: true, poaId };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Validation error" };
    }
    console.error("createPlanOfActionAction error:", err);
    return {
      success: false,
      error: err?.message && err.message.includes("Unauthorized")
        ? "Unauthorized. Faculty mentor credentials required."
        : "Failed to create Plan of Action.",
    };
  }
}

/**
 * Creates a granular task under a Plan of Action.
 */
export async function createPOATaskAction(rawInput: any) {
  try {
    const { supabase, user } = await getAuthenticatedFaculty();
    const validated = CreateTaskSchema.parse(rawInput);

    const { data: taskRow, error: tErr } = await supabase
      .from("milestones")
      .insert({
        student_id: validated.studentId,
        title: validated.title,
        description: validated.description || null,
        success_criteria: "Completion verified by mentor",
        category: "Task",
        priority: validated.priority,
        status: "NOT_STARTED",
        completion_percentage: 0,
        target_date: validated.targetDate || null,
        provenance: "MENTOR_ENTERED",
        is_ai_suggested: false,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (tErr || !taskRow) {
      console.error("Error creating task:", tErr);
      return { success: false, error: "Failed to create task." };
    }

    // Audit Log
    await supabase.from("audit_logs").insert({
      entity_table: "milestones",
      entity_id: taskRow.id,
      action: "INSERT",
      actor_id: user.id,
      actor_role: "faculty",
      new_values: {
        task_title: validated.title,
        poa_id: validated.poaId,
        student_id: validated.studentId,
        provenance: "MENTOR_ENTERED",
      },
    });

    revalidatePath(`/students/${validated.studentId}`);
    return { success: true, taskId: taskRow.id };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Validation error" };
    }
    return { success: false, error: err?.message || "Failed to create task." };
  }
}

/**
 * Toggles a task's completion state deterministically.
 * Supports tasks stored in either public.milestone_tasks or as child milestones.
 * Automatically recalculates parent POA progress percentage and records audit log.
 */
export async function toggleTaskCompletionAction(rawInput: any) {
  try {
    const { supabase, user } = await getAuthenticatedFaculty();
    const validated = ToggleTaskSchema.parse(rawInput);

    const now = new Date().toISOString();

    // Check if task exists in milestone_tasks
    const { data: mTask } = await supabase
      .from("milestone_tasks")
      .select("id, milestone_id")
      .eq("id", validated.taskId)
      .maybeSingle();

    if (mTask) {
      // 1. Update milestone_tasks
      const { error: mtErr } = await supabase
        .from("milestone_tasks")
        .update({
          is_completed: validated.isCompleted,
          completed_at: validated.isCompleted ? now : null,
          updated_at: now,
        })
        .eq("id", validated.taskId);

      if (mtErr) {
        console.error("Error toggling milestone_tasks completion:", mtErr);
        return { success: false, error: "Failed to update task status in database." };
      }

      // Recalculate parent completion_percentage
      const { data: siblingTasks } = await supabase
        .from("milestone_tasks")
        .select("id, is_completed")
        .eq("milestone_id", mTask.milestone_id);

      let newPct = 0;
      if (siblingTasks && siblingTasks.length > 0) {
        const doneCount = siblingTasks.filter((t) => t.is_completed).length;
        newPct = Math.round((doneCount / siblingTasks.length) * 100);
        await supabase
          .from("milestones")
          .update({
            completion_percentage: newPct,
            status: newPct === 100 ? "COMPLETED" : "ACTIVE",
            updated_at: now,
          })
          .eq("id", mTask.milestone_id);
      }

      // Audit Log
      await supabase.from("audit_logs").insert({
        entity_table: "milestone_tasks",
        entity_id: validated.taskId,
        action: "UPDATE",
        actor_id: user.id,
        actor_role: "faculty",
        new_values: {
          task_id: validated.taskId,
          milestone_id: mTask.milestone_id,
          completed: validated.isCompleted,
          parent_completion_percentage: newPct,
        },
      });
    } else {
      // 2. Milestone-based task
      const newStatus = validated.isCompleted ? "COMPLETED" : "IN_PROGRESS";
      const completionPct = validated.isCompleted ? 100 : 0;

      const { data: updatedMilestone, error: updErr } = await supabase
        .from("milestones")
        .update({
          status: newStatus,
          completion_percentage: completionPct,
          completed_at: validated.isCompleted ? now : null,
          updated_at: now,
        })
        .eq("id", validated.taskId)
        .eq("student_id", validated.studentId)
        .select("id, parent_milestone_id")
        .maybeSingle();

      if (updErr) {
        console.error("Error toggling task completion in milestones:", updErr);
        return { success: false, error: "Failed to update task status in database." };
      }

      // If this milestone has a parent, recalculate parent completion percentage
      if (updatedMilestone?.parent_milestone_id) {
        const { data: siblings } = await supabase
          .from("milestones")
          .select("id, status")
          .eq("parent_milestone_id", updatedMilestone.parent_milestone_id);

        if (siblings && siblings.length > 0) {
          const doneCount = siblings.filter((s) => s.status === "COMPLETED").length;
          const pct = Math.round((doneCount / siblings.length) * 100);
          await supabase
            .from("milestones")
            .update({
              completion_percentage: pct,
              status: pct === 100 ? "COMPLETED" : "ACTIVE",
              updated_at: now,
            })
            .eq("id", updatedMilestone.parent_milestone_id);
        }
      }

      // Record Status History
      await supabase.from("milestone_status_history").insert({
        milestone_id: validated.taskId,
        to_status: newStatus,
        reason: validated.isCompleted ? "Marked complete by faculty mentor" : "Reopened by faculty mentor",
        changed_by: user.id,
      });

      // Audit Log
      await supabase.from("audit_logs").insert({
        entity_table: "milestones",
        entity_id: validated.taskId,
        action: "UPDATE",
        actor_id: user.id,
        actor_role: "faculty",
        new_values: {
          task_id: validated.taskId,
          new_status: newStatus,
          completed: validated.isCompleted,
        },
      });
    }

    revalidatePath(`/students/${validated.studentId}`);
    revalidatePath("/sessions");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to toggle task completion." };
  }
}

/**
 * Server action to fetch active and historical POAs with tasks for session follow-up.
 */
export async function getStudentPOAFollowUpAction(studentId: string) {
  try {
    await getAuthenticatedFaculty();
    const result = await getStudentPOAFollowUp(studentId);
    return { success: true, ...result };
  } catch (err: any) {
    console.error("getStudentPOAFollowUpAction error:", err);
    return {
      success: false,
      error: err?.message || "Failed to load student POA follow-up items.",
      activePOAs: [],
      historicalPOAs: [],
    };
  }
}

/**
 * Updates mentor feedback on a Plan of Action directly from a mentoring session.
 */
export async function updatePOAMentorFeedbackAction(rawInput: any) {
  try {
    const { supabase, user } = await getAuthenticatedFaculty();
    const validated = UpdateFeedbackSchema.parse(rawInput);
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("milestones")
      .update({
        mentor_feedback: validated.mentorFeedback,
        updated_at: now,
      })
      .eq("id", validated.poaId)
      .eq("student_id", validated.studentId);

    if (error) {
      console.error("Error updating mentor feedback:", error);
      return { success: false, error: "Failed to update mentor feedback." };
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      entity_table: "milestones",
      entity_id: validated.poaId,
      action: "UPDATE",
      actor_id: user.id,
      actor_role: "faculty",
      new_values: {
        mentor_feedback: validated.mentorFeedback,
        updated_at: now,
      },
    });

    revalidatePath(`/students/${validated.studentId}`);
    revalidatePath("/sessions");
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Validation error" };
    }
    return { success: false, error: err?.message || "Failed to update mentor feedback." };
  }
}

/**
 * Archives a POA safely without deleting historical data.
 */
export async function archivePlanOfActionAction(poaId: string, studentId: string) {
  try {
    const { supabase, user } = await getAuthenticatedFaculty();

    const { error } = await supabase
      .from("milestones")
      .update({
        status: "COMPLETED",
        completion_percentage: 100,
        updated_at: new Date().toISOString(),
      })
      .eq("id", poaId)
      .eq("student_id", studentId);

    if (error) {
      return { success: false, error: "Failed to archive Plan of Action." };
    }

    revalidatePath(`/students/${studentId}`);
    revalidatePath("/sessions");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to archive POA." };
  }
}

/**
 * Edits an existing Plan of Action and its tasks.
 * Preserves COMPLETED status when editing descriptive fields.
 * Records immutable audit logs with before/after state.
 */
export async function editPlanOfActionAction(rawInput: any) {
  try {
    const { supabase, user } = await getAuthenticatedFaculty();
    const validated = EditPOASchema.parse(rawInput);
    const now = new Date().toISOString();

    // 1. Fetch current milestone state for before/after comparison
    const { data: oldRow, error: oldErr } = await supabase
      .from("milestones")
      .select(`
        id, student_id, title, description, success_criteria, target_outcome,
        outcome_statement, priority, status, target_date, text_instructions,
        evidence_requirement, mentor_feedback, completion_percentage
      `)
      .eq("id", validated.poaId)
      .eq("student_id", validated.studentId)
      .single();

    if (oldErr || !oldRow) {
      return { success: false, error: "Plan of Action not found." };
    }

    // Preserve status: if status was COMPLETED, keep it COMPLETED (do NOT automatically switch to ACTIVE)
    const currentStatus = oldRow.status;

    // Prepare update payload
    const updatePayload: any = {
      title: validated.title,
      description: validated.objective || oldRow.description || null,
      target_outcome: validated.targetOutcome,
      outcome_statement: validated.targetOutcome,
      success_criteria: validated.targetOutcome,
      priority: validated.priority,
      target_date: validated.targetDate || null,
      text_instructions: validated.textInstructions || null,
      evidence_requirement: validated.evidenceRequirement || null,
      mentor_feedback: validated.mentorFeedback || null,
      provenance: "MENTOR_ENTERED",
      updated_at: now,
    };

    // Update milestone
    const { error: updErr } = await supabase
      .from("milestones")
      .update(updatePayload)
      .eq("id", validated.poaId)
      .eq("student_id", validated.studentId);

    if (updErr) {
      console.error("Error updating POA:", updErr);
      return { success: false, error: "Failed to update Plan of Action." };
    }

    // Record POA update audit log with before/after state
    await supabase.from("audit_logs").insert({
      entity_table: "milestones",
      entity_id: validated.poaId,
      action: "UPDATE",
      actor_id: user.id,
      actor_role: "faculty",
      old_values: {
        title: oldRow.title,
        target_outcome: oldRow.target_outcome || oldRow.outcome_statement || oldRow.success_criteria,
        priority: oldRow.priority,
        target_date: oldRow.target_date,
        text_instructions: oldRow.text_instructions,
        evidence_requirement: oldRow.evidence_requirement,
        mentor_feedback: oldRow.mentor_feedback,
        status: oldRow.status,
      },
      new_values: {
        title: validated.title,
        target_outcome: validated.targetOutcome,
        priority: validated.priority,
        target_date: validated.targetDate || null,
        text_instructions: validated.textInstructions || null,
        evidence_requirement: validated.evidenceRequirement || null,
        mentor_feedback: validated.mentorFeedback || null,
        status: currentStatus,
        edited_by: user.id,
      },
    });

    // 2. Handle Tasks updates / additions if provided
    if (validated.tasks && validated.tasks.length > 0) {
      for (let i = 0; i < validated.tasks.length; i++) {
        const t = validated.tasks[i];
        const orderIdx = t.orderIndex !== undefined ? t.orderIndex : i;

        if (t.id) {
          // Existing task - fetch old
          const { data: oldTask } = await supabase
            .from("milestone_tasks")
            .select("id, title, description, order_index, is_completed")
            .eq("id", t.id)
            .maybeSingle();

          if (oldTask) {
            await supabase
              .from("milestone_tasks")
              .update({
                title: t.title,
                description: t.description || null,
                order_index: orderIdx,
                updated_at: now,
              })
              .eq("id", t.id);

            await supabase.from("audit_logs").insert({
              entity_table: "milestone_tasks",
              entity_id: t.id,
              action: "UPDATE",
              actor_id: user.id,
              actor_role: "faculty",
              old_values: oldTask,
              new_values: {
                milestone_id: validated.poaId,
                title: t.title,
                description: t.description || null,
                order_index: orderIdx,
              },
            });
          }
        } else {
          // New task added during edit
          const { data: insertedTask } = await supabase
            .from("milestone_tasks")
            .insert({
              milestone_id: validated.poaId,
              title: t.title,
              description: t.description || null,
              order_index: orderIdx,
              is_completed: false,
            })
            .select("id")
            .single();

          if (insertedTask) {
            await supabase.from("audit_logs").insert({
              entity_table: "milestone_tasks",
              entity_id: insertedTask.id,
              action: "INSERT",
              actor_id: user.id,
              actor_role: "faculty",
              new_values: {
                milestone_id: validated.poaId,
                title: t.title,
                description: t.description || null,
                order_index: orderIdx,
                provenance: "MENTOR_ENTERED",
              },
            });
          }
        }
      }

      // Recalculate completion percentage if new tasks were added
      const { data: allCurrentTasks } = await supabase
        .from("milestone_tasks")
        .select("id, is_completed")
        .eq("milestone_id", validated.poaId);

      if (allCurrentTasks && allCurrentTasks.length > 0) {
        const completedCount = allCurrentTasks.filter((ct) => ct.is_completed).length;
        const newPct = Math.round((completedCount / allCurrentTasks.length) * 100);
        await supabase
          .from("milestones")
          .update({
            completion_percentage: newPct,
            updated_at: now,
          })
          .eq("id", validated.poaId);
      }
    }

    revalidatePath(`/students/${validated.studentId}`);
    revalidatePath("/sessions");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Validation error" };
    }
    console.error("editPlanOfActionAction error:", err);
    return { success: false, error: err?.message || "Failed to edit Plan of Action." };
  }
}

/**
 * Reopens a COMPLETED POA back to ACTIVE.
 * Preserves completed tasks and historical progress.
 * Records transition in milestone status history and creates audit log.
 */
export async function reopenPlanOfActionAction(rawInput: any) {
  try {
    const { supabase, user } = await getAuthenticatedFaculty();
    const validated = ReopenPOASchema.parse(rawInput);
    const now = new Date().toISOString();

    const { data: milestone, error: mErr } = await supabase
      .from("milestones")
      .select("id, student_id, title, status, completion_percentage")
      .eq("id", validated.poaId)
      .eq("student_id", validated.studentId)
      .single();

    if (mErr || !milestone) {
      return { success: false, error: "Plan of Action not found." };
    }

    const oldStatus = milestone.status;
    const reasonText = validated.reason || "Reopened by faculty mentor to assign additional developmental work";

    // 1. Move status back to ACTIVE, keep is_archived: false, preserve tasks
    const { error: updErr } = await supabase
      .from("milestones")
      .update({
        status: "ACTIVE",
        is_archived: false,
        updated_at: now,
      })
      .eq("id", validated.poaId)
      .eq("student_id", validated.studentId);

    if (updErr) {
      console.error("Error reopening POA:", updErr);
      return { success: false, error: "Failed to reopen Plan of Action." };
    }

    // 2. Record status history
    await supabase.from("milestone_status_history").insert({
      milestone_id: validated.poaId,
      from_status: oldStatus,
      to_status: "ACTIVE",
      reason: reasonText,
      changed_by: user.id,
    });

    // 3. Create Audit Log
    await supabase.from("audit_logs").insert({
      entity_table: "milestones",
      entity_id: validated.poaId,
      action: "UPDATE",
      actor_id: user.id,
      actor_role: "faculty",
      old_values: {
        status: oldStatus,
      },
      new_values: {
        status: "ACTIVE",
        action: "REOPEN_POA",
        reason: reasonText,
        reopened_by: user.id,
      },
    });

    revalidatePath(`/students/${validated.studentId}`);
    revalidatePath("/sessions");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Validation error" };
    }
    return { success: false, error: err?.message || "Failed to reopen POA." };
  }
}

/**
 * Retrieves the complete chronological lifecycle history for a POA:
 * creation, status changes, task completions, mentor feedback, and edits.
 */
export async function getPOAHistoryAction(poaId: string, studentId: string) {
  try {
    const { supabase } = await getAuthenticatedFaculty();

    // 1. Get Milestone creation & metadata
    const { data: poa, error: poaErr } = await supabase
      .from("milestones")
      .select("id, title, status, created_at, created_by, provenance, completed_at, updated_at")
      .eq("id", poaId)
      .eq("student_id", studentId)
      .single();

    if (poaErr || !poa) {
      return { success: false, error: "Plan of Action not found.", history: [] };
    }

    // 2. Status History
    const { data: statusHistory } = await supabase
      .from("milestone_status_history")
      .select("id, from_status, to_status, reason, created_at, changed_by")
      .eq("milestone_id", poaId)
      .order("created_at", { ascending: false });

    // 3. Audit Logs for this milestone
    const { data: milestoneAudit } = await supabase
      .from("audit_logs")
      .select("id, entity_table, entity_id, action, actor_id, actor_role, old_values, new_values, created_at")
      .eq("entity_table", "milestones")
      .eq("entity_id", poaId)
      .order("created_at", { ascending: false });

    // 4. Audit Logs for milestone_tasks belonging to this milestone
    const { data: taskRows } = await supabase
      .from("milestone_tasks")
      .select("id")
      .eq("milestone_id", poaId);

    const taskIds = (taskRows || []).map((t) => t.id);
    let taskAudit: any[] = [];
    if (taskIds.length > 0) {
      const { data: tLogs } = await supabase
        .from("audit_logs")
        .select("id, entity_table, entity_id, action, actor_id, actor_role, old_values, new_values, created_at")
        .eq("entity_table", "milestone_tasks")
        .in("entity_id", taskIds)
        .order("created_at", { ascending: false });
      taskAudit = tLogs || [];
    }

    return {
      success: true,
      poa,
      statusHistory: statusHistory || [],
      auditLogs: [...(milestoneAudit || []), ...taskAudit].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to load POA history.", history: [] };
  }
}

/**
 * Marks an active/blocked/submitted/under_review POA as COMPLETED.
 * CRITICAL: DOES NOT AUTO-COMPLETE TASKS.
 * Preserves existing task completion states exactly as they are.
 * Milestones table:
 * - status -> COMPLETED
 * - completed_at -> now()
 * - updated_at -> now()
 * Record entry in milestone_status_history and audit_logs.
 */
export async function completePlanOfActionAction(rawInput: any) {
  try {
    const { supabase, user } = await getAuthenticatedFaculty();
    const validated = CompletePOASchema.parse(rawInput);
    const now = new Date().toISOString();

    // 1. Verify existence & safety
    const { data: poa, error: poaErr } = await supabase
      .from("milestones")
      .select("id, student_id, title, status, provenance, category, completion_percentage")
      .eq("id", validated.poaId)
      .eq("student_id", validated.studentId)
      .single();

    if (poaErr || !poa) {
      return { success: false, error: "Plan of Action not found." };
    }

    if (poa.provenance === "HISTORICAL_PROFILE" || poa.category === "Action Plan") {
      return { success: false, error: "Historical baseline milestones cannot be marked complete via this action." };
    }

    if (poa.status === "COMPLETED") {
      return { success: false, error: "Plan of Action is already completed." };
    }

    const oldStatus = poa.status;

    // 2. Update status to COMPLETED on milestones table
    // DO NOT touch milestone_tasks or artificially update completion_percentage
    const { error: updErr } = await supabase
      .from("milestones")
      .update({
        status: "COMPLETED",
        completed_at: now,
        updated_at: now,
      })
      .eq("id", validated.poaId);

    if (updErr) {
      console.error("Error marking POA complete:", updErr);
      return { success: false, error: "Failed to mark Plan of Action as completed." };
    }

    // 3. Record in milestone_status_history
    await supabase.from("milestone_status_history").insert({
      milestone_id: validated.poaId,
      from_status: oldStatus,
      to_status: "COMPLETED",
      reason: "Marked as completed by mentor",
      changed_by: user.id,
    });

    // 4. Record in audit_logs
    await supabase.from("audit_logs").insert({
      entity_table: "milestones",
      entity_id: validated.poaId,
      action: "UPDATE",
      actor_id: user.id,
      actor_role: "faculty",
      old_values: {
        status: oldStatus,
        completion_percentage: poa.completion_percentage,
      },
      new_values: {
        status: "COMPLETED",
        action: "MARK_COMPLETED",
        completion_percentage: poa.completion_percentage,
        completed_at: now,
        completed_by: user.id,
      },
    });

    revalidatePath(`/students/${validated.studentId}`);
    revalidatePath("/sessions");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Validation error" };
    }
    return { success: false, error: err?.message || "Failed to complete Plan of Action." };
  }
}

/**
 * Permanently deletes a Plan of Action and its associated tasks/resources.
 * Never allows deleting historical profile milestones.
 * Captures an audit log before deletion so historical accountability survives.
 */
export async function deletePlanOfActionAction(rawInput: any) {
  try {
    const { supabase, user } = await getAuthenticatedFaculty();
    const validated = DeletePOASchema.parse(rawInput);

    // 1. Verify existence & safety
    const { data: poa, error: poaErr } = await supabase
      .from("milestones")
      .select("id, student_id, title, status, provenance, category, completion_percentage, created_at")
      .eq("id", validated.poaId)
      .eq("student_id", validated.studentId)
      .single();

    if (poaErr || !poa) {
      return { success: false, error: "Plan of Action not found." };
    }

    if (poa.provenance === "HISTORICAL_PROFILE" || poa.category === "Action Plan") {
      return { success: false, error: "Historical baseline milestones cannot be deleted." };
    }

    // 2. Fetch associated tasks & child milestones for audit snapshot
    const { data: tasks } = await supabase
      .from("milestone_tasks")
      .select("id, title, is_completed")
      .eq("milestone_id", validated.poaId);

    const { data: childMilestones } = await supabase
      .from("milestones")
      .select("id, title, status")
      .eq("parent_milestone_id", validated.poaId);

    const allTasksCount = (tasks?.length || 0) + (childMilestones?.length || 0);
    const taskTitles = [
      ...(tasks || []).map((t) => t.title),
      ...(childMilestones || []).map((m) => m.title),
    ];

    // 3. Record audit log BEFORE deletion (audit_logs has no FK to milestones, survives deletion)
    await supabase.from("audit_logs").insert({
      entity_table: "milestones",
      entity_id: validated.poaId,
      action: "DELETE",
      actor_id: user.id,
      actor_role: "faculty",
      old_values: {
        id: poa.id,
        student_id: poa.student_id,
        title: poa.title,
        status: poa.status,
        provenance: poa.provenance,
        completion_percentage: poa.completion_percentage,
        created_at: poa.created_at,
        tasks_count: allTasksCount,
        task_titles: taskTitles,
      },
      new_values: {
        action: "DELETE_POA",
        deleted_by: user.id,
        deleted_at: new Date().toISOString(),
      },
    });

    // 4. Cascade delete child entities due to ON DELETE RESTRICT constraints
    if (childMilestones && childMilestones.length > 0) {
      const childIds = childMilestones.map((c) => c.id);
      await supabase.from("milestone_tasks").delete().in("milestone_id", childIds);
      await supabase.from("milestone_resources").delete().in("milestone_id", childIds);
      await supabase.from("session_milestones").delete().in("milestone_id", childIds);
      await supabase.from("milestone_status_history").delete().in("milestone_id", childIds);
      await supabase.from("milestones").delete().in("id", childIds);
    }

    await supabase.from("milestone_tasks").delete().eq("milestone_id", validated.poaId);
    await supabase.from("milestone_resources").delete().eq("milestone_id", validated.poaId);
    await supabase.from("session_milestones").delete().eq("milestone_id", validated.poaId);
    await supabase.from("milestone_status_history").delete().eq("milestone_id", validated.poaId);

    // 5. Delete parent milestone
    const { error: delErr } = await supabase
      .from("milestones")
      .delete()
      .eq("id", validated.poaId);

    if (delErr) {
      console.error("Error deleting milestone:", delErr);
      return { success: false, error: "Failed to delete Plan of Action: " + delErr.message };
    }

    revalidatePath(`/students/${validated.studentId}`);
    revalidatePath("/sessions");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || "Validation error" };
    }
    return { success: false, error: err?.message || "Failed to delete Plan of Action." };
  }
}
