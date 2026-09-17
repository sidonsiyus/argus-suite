"use client";

import React, { useState } from "react";
import {
  Compass,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  BookOpen,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Calendar,
  ListTodo,
  CheckSquare,
  Square,
  Loader2,
  Trash2,
  Archive,
  History,
  Edit2,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PlanOfActionItem, POATaskItem, structurePOARoadmap } from "@/lib/poa/types";
import { toggleTaskCompletionAction, createPOATaskAction, archivePlanOfActionAction } from "@/app/actions/poa";
import { unlinkMilestoneResourceAction } from "@/app/actions/resources";
import { AttachResourceDrawer } from "./AttachResourceDrawer";
import { CreatePOAModal } from "./CreatePOAModal";
import { EditPOAModal } from "./EditPOAModal";
import { ReopenPOAModal } from "./ReopenPOAModal";
import { CompletePOAModal } from "./CompletePOAModal";
import { DeletePOAModal } from "./DeletePOAModal";
import { POAHistoryModal } from "./POAHistoryModal";
import { useToast } from "@/components/ui/ToastProvider";

interface POARoadmapProps {
  milestones: any[];
  studentId: string;
  studentName: string;
  careerGoalTitle?: string;
}

export function POARoadmap({
  milestones,
  studentId,
  studentName,
  careerGoalTitle,
}: POARoadmapProps) {
  const toast = useToast();
  const { currentPOAs, historicalPlans } = structurePOARoadmap(milestones);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPoa, setEditingPoa] = useState<any | null>(null);
  const [completingPoa, setCompletingPoa] = useState<any | null>(null);
  const [reopeningPoa, setReopeningPoa] = useState<any | null>(null);
  const [deletingPoa, setDeletingPoa] = useState<any | null>(null);
  const [historyPoa, setHistoryPoa] = useState<{ id: string; title: string } | null>(null);
  const [attachTarget, setAttachTarget] = useState<{ id: string; title: string } | null>(null);

  // Expanded POAs state (all expanded by default for full visibility)
  const [expandedPoaIds, setExpandedPoaIds] = useState<Record<string, boolean>>({});

  // Inline New Task form state
  const [addingTaskForPoaId, setAddingTaskForPoaId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);

  // Optimistic toggling tracking
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
  const [archivingPoaId, setArchivingPoaId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedPoaIds((prev) => ({ ...prev, [id]: prev[id] === undefined ? false : !prev[id] }));
  };

  const isExpanded = (id: string) => expandedPoaIds[id] !== false;

  // Task Completion Toggle with Optimistic Perceived Responsiveness
  const handleToggleTask = async (task: POATaskItem) => {
    setTogglingTaskId(task.id);
    const isNowCompleted = task.status !== "COMPLETED";

    try {
      const res = await toggleTaskCompletionAction({
        taskId: task.id,
        studentId,
        isCompleted: isNowCompleted,
      });

      if (res.success) {
        toast.success(isNowCompleted ? `Task "${task.title}" completed.` : `Task reopened.`);
      } else {
        toast.error(res.error || "Failed to update task.");
      }
    } catch {
      toast.error("Network error while updating task.");
    } finally {
      setTogglingTaskId(null);
    }
  };

  const handleCreateTask = async (poaId: string) => {
    if (!newTaskTitle.trim()) return;
    setSubmittingTask(true);
    try {
      const res = await createPOATaskAction({
        poaId,
        studentId,
        title: newTaskTitle.trim(),
      });
      if (res.success) {
        toast.success("Task added to Plan of Action.");
        setNewTaskTitle("");
        setAddingTaskForPoaId(null);
      } else {
        toast.error(res.error || "Failed to add task.");
      }
    } catch {
      toast.error("Network error while creating task.");
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleArchivePOA = async (poaId: string) => {
    setArchivingPoaId(poaId);
    try {
      const res = await archivePlanOfActionAction(poaId, studentId);
      if (res.success) {
        toast.success("Plan of Action archived.");
      } else {
        toast.error(res.error || "Failed to archive POA.");
      }
    } catch {
      toast.error("Network error while archiving POA.");
    } finally {
      setArchivingPoaId(null);
    }
  };

  const handleUnlinkResource = async (milestoneId: string, resourceId: string) => {
    try {
      await unlinkMilestoneResourceAction(milestoneId, resourceId, studentId);
      toast.info("Resource detached.");
    } catch {
      toast.error("Failed to detach resource.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-surface border border-border rounded-xl p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-emerald" />
            <h3 className="text-base font-semibold text-ink">
              Plan of Action (POA) & Development Roadmap
            </h3>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Structured developmental milestones, deterministic task completion, and resource assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Plan of Action</span>
        </button>
      </div>

      {/* Conceptual Roadmap Flow Banner */}
      <div className="p-3 bg-surface border border-border rounded-xl flex items-center justify-between overflow-x-auto text-[11px] font-medium text-ink-muted gap-2">
        <div className="flex items-center gap-1.5 shrink-0 text-ink font-semibold">
          <Compass className="w-3.5 h-3.5 text-accent-emerald" />
          <span>1. CAREER GOAL</span>
        </div>
        <span>→</span>
        <div className="flex items-center gap-1.5 shrink-0 text-ink font-semibold">
          <Target className="w-3.5 h-3.5 text-accent-emerald" />
          <span>2. PLAN OF ACTION</span>
        </div>
        <span>→</span>
        <div className="flex items-center gap-1.5 shrink-0 text-ink font-semibold">
          <ListTodo className="w-3.5 h-3.5 text-accent-emerald" />
          <span>3. TASKS</span>
        </div>
        <span>→</span>
        <div className="flex items-center gap-1.5 shrink-0 text-ink font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-accent-emerald" />
          <span>4. RESOURCES</span>
        </div>
        <span>→</span>
        <div className="flex items-center gap-1.5 shrink-0 text-ink font-semibold">
          <FileText className="w-3.5 h-3.5 text-accent-emerald" />
          <span>5. EVIDENCE</span>
        </div>
        <span>→</span>
        <div className="flex items-center gap-1.5 shrink-0 text-accent-emerald font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>6. COMPLETION</span>
        </div>
      </div>

      {/* 1. Current Active POAs */}
      {currentPOAs.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-ink-muted">
          <Target className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-ink">No Current Plans of Action</p>
          <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
            Create a targeted Plan of Action to guide this cadet toward their career goals with concrete tasks, resources, and evidence.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Plan of Action</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {currentPOAs.map((poa, pIdx) => {
            const expanded = isExpanded(poa.id);
            const isCompleted = poa.status === "COMPLETED";

            return (
              <div
                key={poa.id}
                className={`bg-surface border rounded-xl shadow-card transition-all overflow-hidden ${
                  isCompleted ? "border-emerald-200/80 bg-emerald-50/20" : "border-border"
                }`}
              >
                {/* POA Card Header */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-workspace border-b border-border/80">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleExpand(poa.id)}
                      className="p-1 rounded-md text-ink-muted hover:text-ink transition-colors cursor-pointer mt-0.5"
                    >
                      {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-accent-emerald/10 text-accent-emerald font-semibold">
                          POA #{pIdx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-ink truncate">{poa.title}</h4>
                        {poa.is_ai_suggested && (
                          <Badge variant="blue" size="sm" className="gap-1 text-[10px]">
                            <Sparkles className="w-3 h-3 text-blue-500" />
                            <span>AI Recommended</span>
                          </Badge>
                        )}
                        <Badge variant="stone" size="sm" className="text-[10px] font-mono">
                          {poa.provenance}
                        </Badge>
                      </div>

                      {poa.expected_outcome && (
                        <p className="text-xs text-ink-secondary flex items-baseline gap-1.5">
                          <strong className="text-ink font-semibold shrink-0">Outcome:</strong>
                          <span className="truncate">{poa.expected_outcome}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress & Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {/* Deterministic Progress Indicator */}
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                        <span>{poa.progress}%</span>
                        <span className="text-[10px] font-normal text-ink-muted">
                          ({poa.tasks.filter((t) => t.status === "COMPLETED").length}/{poa.tasks.length} tasks)
                        </span>
                      </div>
                      <div className="w-28 h-2 rounded-full bg-surface-hover mt-1 overflow-hidden border border-border/80">
                        <div
                          className="h-full bg-accent-emerald transition-all duration-300"
                          style={{ width: `${poa.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {/* Review POA */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(poa.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
                        title={expanded ? "Collapse Details" : "Review POA Details"}
                      >
                        {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        <span>Review</span>
                      </button>

                      {/* Edit POA (Available for ALL POAs, including COMPLETED) */}
                      <button
                        type="button"
                        onClick={() => setEditingPoa(poa)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border text-ink hover:border-accent-emerald hover:text-accent-emerald transition-colors cursor-pointer"
                        title="Edit POA details, tasks, and guidance"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-accent-emerald" />
                        <span>Edit POA</span>
                      </button>

                      {/* Mark as Completed (Visible for ACTIVE / BLOCKED / SUBMITTED / UNDER_REVIEW) */}
                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => setCompletingPoa(poa)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald hover:bg-accent-emerald/20 transition-colors cursor-pointer"
                          title="Mark Plan of Action as completed"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark as Completed</span>
                        </button>
                      )}

                      {/* Reopen POA (Visible for COMPLETED POAs) */}
                      {isCompleted && (
                        <button
                          type="button"
                          onClick={() => setReopeningPoa(poa)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
                          title="Reopen completed POA to active"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reopen POA</span>
                        </button>
                      )}

                      {/* History */}
                      <button
                        type="button"
                        onClick={() => setHistoryPoa({ id: poa.id, title: poa.title })}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
                        title="View complete audit & status history"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>History</span>
                      </button>

                      {/* Delete POA */}
                      <button
                        type="button"
                        onClick={() => setDeletingPoa(poa)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                        title="Permanently delete Plan of Action"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete POA</span>
                      </button>

                      {/* Assign Resource */}
                      <button
                        type="button"
                        onClick={() => setAttachTarget({ id: poa.id, title: poa.title })}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
                        title="Assign Learning Resource"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-accent-emerald" />
                        <span className="hidden sm:inline">Resource</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded POA Details */}
                {expanded && (
                  <div className="p-5 space-y-4 animate-in fade-in duration-150">
                    {/* Plain Text Mentor Instructions if present */}
                    {poa.text_instructions && (
                      <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                        <span className="font-semibold block uppercase tracking-wider text-[10px] text-amber-800">
                          Mentor Instructions
                        </span>
                        <p className="leading-relaxed">{poa.text_instructions}</p>
                      </div>
                    )}

                    {/* Task Checklist */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                          <ListTodo className="w-3.5 h-3.5 text-accent-emerald" />
                          <span>Actionable Subtasks ({poa.tasks.length})</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setAddingTaskForPoaId(poa.id);
                            setNewTaskTitle("");
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-accent-emerald hover:text-accent-emerald/80 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Task</span>
                        </button>
                      </div>

                      {/* Add Task Input Row */}
                      {addingTaskForPoaId === poa.id && (
                        <div className="p-3 rounded-xl bg-workspace border border-border flex items-center gap-2 animate-in fade-in duration-100">
                          <input
                            type="text"
                            autoFocus
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleCreateTask(poa.id);
                              if (e.key === "Escape") setAddingTaskForPoaId(null);
                            }}
                            placeholder="Enter task title and press Enter..."
                            className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                          />
                          <button
                            type="button"
                            onClick={() => handleCreateTask(poa.id)}
                            disabled={submittingTask || !newTaskTitle.trim()}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 transition-all cursor-pointer disabled:opacity-50"
                          >
                            {submittingTask ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingTaskForPoaId(null)}
                            className="px-2 py-1.5 text-xs text-ink-muted hover:text-ink cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* Tasks List */}
                      {poa.tasks.length === 0 ? (
                        <p className="text-xs text-ink-muted italic p-3 bg-workspace rounded-xl border border-dashed border-border">
                          No subtasks added yet. Click "Add Task" to break this POA into actionable steps.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {poa.tasks.map((task) => {
                            const taskCompleted = task.status === "COMPLETED";
                            const isToggling = togglingTaskId === task.id;

                            return (
                              <div
                                key={task.id}
                                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                                  taskCompleted
                                    ? "bg-emerald-50/40 border-emerald-200/60"
                                    : "bg-workspace border-border hover:border-border-strong"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleTask(task)}
                                    disabled={isToggling}
                                    className="text-stone-400 hover:text-accent-emerald transition-colors cursor-pointer shrink-0"
                                  >
                                    {isToggling ? (
                                      <Loader2 className="w-4 h-4 animate-spin text-accent-emerald" />
                                    ) : taskCompleted ? (
                                      <CheckSquare className="w-4 h-4 text-accent-emerald" />
                                    ) : (
                                      <Square className="w-4 h-4" />
                                    )}
                                  </button>

                                  <span
                                    className={`text-xs font-medium truncate ${
                                      taskCompleted ? "line-through text-ink-muted" : "text-ink"
                                    }`}
                                  >
                                    {task.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {task.target_date && (
                                    <span className="text-[11px] text-ink-muted flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-stone-400" />
                                      {task.target_date}
                                    </span>
                                  )}
                                  <Badge
                                    variant={taskCompleted ? "emerald" : "stone"}
                                    size="sm"
                                    className="text-[10px]"
                                  >
                                    {taskCompleted ? "Completed" : "Pending"}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Prescribed Resources Section */}
                    {poa.linked_resources && poa.linked_resources.length > 0 && (
                      <div className="pt-3 border-t border-border space-y-2">
                        <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-accent-emerald" />
                          <span>Assigned Learning Resources ({poa.linked_resources.length})</span>
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {poa.linked_resources.map((r) => (
                            <div
                              key={r.id}
                              className="p-2.5 rounded-xl bg-workspace border border-border flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="stone" size="sm" className="text-[9px]">
                                    {r.resource_type}
                                  </Badge>
                                  {r.provider && (
                                    <span className="text-[10px] text-ink-muted truncate">
                                      {r.provider}
                                    </span>
                                  )}
                                </div>
                                <p className="font-medium text-ink truncate text-xs">{r.title}</p>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {r.url && (
                                  <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded hover:bg-surface text-accent-emerald transition-colors"
                                    title="Open resource"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleUnlinkResource(poa.id, r.id)}
                                  className="p-1 rounded hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Detach resource"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Historical Action Plans Section (Explicit Historical Provenance) */}
      {historicalPlans.length > 0 && (
        <div className="pt-6 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-stone-500" />
              <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
                Historical Action Plans (Pre-Migration Record)
              </h4>
            </div>
            <Badge variant="stone" size="sm" className="font-mono text-[10px]">
              PROVENANCE: HISTORICAL_PROFILE
            </Badge>
          </div>

          <div className="space-y-2">
            {historicalPlans.map((hist) => (
              <div
                key={hist.id}
                className="p-3.5 rounded-xl bg-surface-subtle/60 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">{hist.title}</span>
                    <Badge variant="stone" size="sm" className="text-[10px]">
                      Historical Reference
                    </Badge>
                  </div>
                  {hist.expected_outcome && (
                    <p className="text-ink-muted text-[11px] truncate">
                      {hist.expected_outcome}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-ink-muted">
                    {hist.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setHistoryPoa({ id: hist.id, title: hist.title })}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-surface border border-border text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
                    title="View historical audit & status history"
                  >
                    <History className="w-3 h-3" />
                    <span>History</span>
                  </button>
                  <Badge variant="stone" size="sm" className="font-mono text-[10px]">
                    READ_ONLY
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Plan of Action Modal */}
      <CreatePOAModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        studentId={studentId}
        studentName={studentName}
        careerGoalTitle={careerGoalTitle}
      />

      {/* Attach Resource Drawer */}
      {attachTarget && (
        <AttachResourceDrawer
          isOpen={Boolean(attachTarget)}
          onClose={() => setAttachTarget(null)}
          milestoneId={attachTarget.id}
          milestoneTitle={attachTarget.title}
          studentId={studentId}
        />
      )}

      {/* Edit POA Modal */}
      {editingPoa && (
        <EditPOAModal
          isOpen={Boolean(editingPoa)}
          onClose={() => setEditingPoa(null)}
          poa={editingPoa}
          studentId={studentId}
          studentName={studentName}
          onReopenClick={() => setReopeningPoa(editingPoa)}
        />
      )}

      {/* Complete POA Modal */}
      {completingPoa && (
        <CompletePOAModal
          isOpen={Boolean(completingPoa)}
          onClose={() => setCompletingPoa(null)}
          poa={completingPoa}
          studentId={studentId}
          studentName={studentName}
        />
      )}

      {/* Reopen POA Modal */}
      {reopeningPoa && (
        <ReopenPOAModal
          isOpen={Boolean(reopeningPoa)}
          onClose={() => setReopeningPoa(null)}
          poa={reopeningPoa}
          studentId={studentId}
          studentName={studentName}
        />
      )}

      {/* Delete POA Modal */}
      {deletingPoa && (
        <DeletePOAModal
          isOpen={Boolean(deletingPoa)}
          onClose={() => setDeletingPoa(null)}
          poa={deletingPoa}
          studentId={studentId}
          studentName={studentName}
        />
      )}

      {/* History Modal */}
      {historyPoa && (
        <POAHistoryModal
          isOpen={Boolean(historyPoa)}
          onClose={() => setHistoryPoa(null)}
          poaId={historyPoa.id}
          studentId={studentId}
          poaTitle={historyPoa.title}
        />
      )}
    </div>
  );
}
