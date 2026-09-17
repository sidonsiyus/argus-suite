"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Target,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Edit2,
  Save,
  X,
  History,
  CheckCheck,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { POAFollowUpItem, POAFollowUpTask } from "@/lib/poa/types";
import {
  getStudentPOAFollowUpAction,
  toggleTaskCompletionAction,
  updatePOAMentorFeedbackAction,
} from "@/app/actions/poa";
import { EditPOAModal } from "@/components/student-detail/EditPOAModal";
import { ReopenPOAModal } from "@/components/student-detail/ReopenPOAModal";
import { CompletePOAModal } from "@/components/student-detail/CompletePOAModal";
import { DeletePOAModal } from "@/components/student-detail/DeletePOAModal";
import { POAHistoryModal } from "@/components/student-detail/POAHistoryModal";

interface POAFollowUpSectionProps {
  studentId: string;
  studentName?: string;
  isReadOnly?: boolean;
  onCreatePOAClick?: () => void;
  onPOAUpdated?: () => void;
}

export function POAFollowUpSection({
  studentId,
  studentName = "Cadet",
  isReadOnly = false,
  onCreatePOAClick,
  onPOAUpdated,
}: POAFollowUpSectionProps) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [loading, setLoading] = useState(true);
  const [activePOAs, setActivePOAs] = useState<POAFollowUpItem[]>([]);
  const [historicalPOAs, setHistoricalPOAs] = useState<POAFollowUpItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedPoaIds, setExpandedPoaIds] = useState<Set<string>>(new Set());

  // Modal states for Edit, Complete, Reopen, Delete, History
  const [editingPoa, setEditingPoa] = useState<any | null>(null);
  const [completingPoa, setCompletingPoa] = useState<any | null>(null);
  const [reopeningPoa, setReopeningPoa] = useState<any | null>(null);
  const [deletingPoa, setDeletingPoa] = useState<any | null>(null);
  const [historyPoa, setHistoryPoa] = useState<{ id: string; title: string } | null>(null);

  // Mentor Feedback edit state
  const [editingFeedbackPoaId, setEditingFeedbackPoaId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [savingFeedback, setSavingFeedback] = useState(false);

  // Load POA follow-up items
  const loadPOAs = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await getStudentPOAFollowUpAction(studentId);
      if (res.success) {
        setActivePOAs(res.activePOAs || []);
        setHistoricalPOAs(res.historicalPOAs || []);
      } else {
        toast.error(res.error || "Failed to load active POAs.");
      }
    } catch (e) {
      console.error("Error loading POAs:", e);
      toast.error("Failed to load student POA follow-up items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPOAs();
  }, [studentId]);

  const toggleExpand = (id: string) => {
    setExpandedPoaIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Optimistic task toggling
  const handleToggleTask = (poaId: string, task: POAFollowUpTask) => {
    if (isReadOnly) return;

    const previousPOAs = [...activePOAs];
    const newCompleted = !task.is_completed;

    // Optimistically update local state
    setActivePOAs((prev) =>
      prev.map((poa) => {
        if (poa.id !== poaId) return poa;

        const updatedTasks = poa.all_tasks.map((t) =>
          t.id === task.id
            ? { ...t, is_completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null }
            : t
        );
        const completedCount = updatedTasks.filter((t) => t.is_completed).length;
        const outstanding = updatedTasks.filter((t) => !t.is_completed);
        const progress = updatedTasks.length > 0
          ? Math.round((completedCount / updatedTasks.length) * 100)
          : newCompleted ? 100 : 0;

        return {
          ...poa,
          all_tasks: updatedTasks,
          outstanding_tasks: outstanding,
          completed_tasks: completedCount,
          progress,
          status: progress === 100 ? "COMPLETED" : "ACTIVE",
        };
      })
    );

    startTransition(async () => {
      const res = await toggleTaskCompletionAction({
        taskId: task.id,
        studentId,
        isCompleted: newCompleted,
        source: task.source,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to update task.");
        // Revert to previous state
        setActivePOAs(previousPOAs);
      } else {
        toast.success(newCompleted ? `Task completed: "${task.title}"` : `Task marked in progress: "${task.title}"`);
        onPOAUpdated?.();
      }
    });
  };

  // Save mentor feedback
  const handleSaveFeedback = async (poaId: string) => {
    if (!feedbackText.trim()) {
      setEditingFeedbackPoaId(null);
      return;
    }
    setSavingFeedback(true);
    try {
      const res = await updatePOAMentorFeedbackAction({
        poaId,
        studentId,
        mentorFeedback: feedbackText.trim(),
      });
      if (res.success) {
        toast.success("Mentor feedback updated on POA.");
        setActivePOAs((prev) =>
          prev.map((p) => (p.id === poaId ? { ...p, mentor_feedback: feedbackText.trim() } : p))
        );
        setEditingFeedbackPoaId(null);
        setFeedbackText("");
        onPOAUpdated?.();
      } else {
        toast.error(res.error || "Failed to update feedback.");
      }
    } catch {
      toast.error("An unexpected error occurred while updating feedback.");
    } finally {
      setSavingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="p-5 rounded-xl border border-border bg-workspace/30 space-y-3 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-border/60 rounded"></div>
          <div className="h-4 w-20 bg-border/60 rounded"></div>
        </div>
        <div className="h-20 bg-border/30 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <span>POA Follow-Up</span>
              <span className="text-[10px] text-ink-muted font-normal">
                ({activePOAs.length} active {activePOAs.length === 1 ? "plan" : "plans"})
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {historicalPOAs.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="text-[11px] text-ink-muted hover:text-ink flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <History className="w-3 h-3" />
              <span>{showHistory ? "Hide Past Plans" : `Past Plans (${historicalPOAs.length})`}</span>
            </button>
          )}

          {!isReadOnly && onCreatePOAClick && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCreatePOAClick}
              className="text-[11px] h-7 px-2.5 bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald hover:bg-accent-emerald/20"
            >
              <Plus className="w-3 h-3 mr-1" />
              <span>New POA</span>
            </Button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {activePOAs.length === 0 ? (
        <div className="p-5 rounded-xl border border-dashed border-border/80 bg-workspace/20 text-center space-y-2">
          <p className="text-xs font-semibold text-ink">No active POAs requiring follow-up.</p>
          <p className="text-[11px] text-ink-muted max-w-sm mx-auto">
            This cadet does not currently have any active Plans of Action. Create an action plan during this session to guide their developmental milestones.
          </p>
          {!isReadOnly && onCreatePOAClick && (
            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onCreatePOAClick}
                className="text-xs bg-accent-emerald text-white hover:bg-emerald-800"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>+ Create Plan of Action</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Active POAs List */
        <div className="space-y-3">
          {activePOAs.map((poa) => {
            const isExpanded = expandedPoaIds.has(poa.id);
            const isFeedbackOpen = editingFeedbackPoaId === poa.id;

            return (
              <div
                key={poa.id}
                className="p-4 rounded-xl border border-border bg-workspace/50 hover:border-accent-emerald/30 transition-all space-y-3 shadow-xs"
              >
                {/* Top Row: Title, Badges, Progress */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-ink">{poa.title}</span>
                      <Badge
                        variant={
                          poa.status === "COMPLETED"
                            ? "emerald"
                            : poa.status === "BLOCKED"
                            ? "rose"
                            : "emerald"
                        }
                        size="sm"
                        className="text-[10px]"
                      >
                        {poa.status}
                      </Badge>
                      <Badge variant="stone" size="sm" className="text-[10px]">
                        {poa.priority}
                      </Badge>
                    </div>

                    {poa.target_outcome && (
                      <p className="text-xs text-ink-muted line-clamp-1">
                        <strong className="text-ink font-medium">Outcome: </strong>
                        {poa.target_outcome}
                      </p>
                    )}
                  </div>

                  {/* Progress Metric */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-bold text-ink">
                        <span>{poa.progress}%</span>
                        <span className="text-[10px] text-ink-muted font-normal">
                          ({poa.completed_tasks}/{poa.total_tasks} tasks)
                        </span>
                      </div>
                      <div className="w-24 sm:w-28 h-1.5 rounded-full bg-border overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full transition-all duration-300 bg-accent-emerald"
                          style={{ width: `${poa.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons: Review, Edit, Mark Completed, Reopen, Delete, History */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => toggleExpand(poa.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-surface border border-border text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
                        title={isExpanded ? "Collapse details" : "Review POA"}
                      >
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        <span>Review</span>
                      </button>

                      {!isReadOnly && (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditingPoa(poa)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-surface border border-border text-ink hover:border-accent-emerald hover:text-accent-emerald transition-colors cursor-pointer"
                            title="Edit POA details and tasks"
                          >
                            <Edit2 className="w-3 h-3 text-accent-emerald" />
                            <span>Edit</span>
                          </button>

                          {poa.status !== "COMPLETED" && (
                            <button
                              type="button"
                              onClick={() => setCompletingPoa(poa)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald hover:bg-accent-emerald/20 transition-colors cursor-pointer"
                              title="Mark Plan of Action as completed"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Mark Completed</span>
                            </button>
                          )}

                          {poa.status === "COMPLETED" && (
                            <button
                              type="button"
                              onClick={() => setReopeningPoa(poa)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
                              title="Reopen completed POA to active"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reopen</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeletingPoa(poa)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                            title="Delete Plan of Action"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => setHistoryPoa({ id: poa.id, title: poa.title })}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-surface border border-border text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
                        title="View POA history"
                      >
                        <History className="w-3 h-3" />
                        <span>History</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Meta details bar */}
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-ink-muted pt-1 border-t border-border/40">
                  {poa.target_date && (
                    <div className="flex items-center gap-1.5" title="Cadet Target Due Date">
                      <Calendar className="w-3 h-3 text-ink-muted" />
                      <span>Cadet Target: <strong className="text-ink">{poa.target_date}</strong></span>
                    </div>
                  )}

                  {poa.evidence_status && (
                    <div className="flex items-center gap-1.5">
                      <FileCheck className="w-3 h-3 text-accent-emerald" />
                      <span>Evidence: <span className="text-ink font-medium">{poa.evidence_status}</span></span>
                    </div>
                  )}

                  {poa.last_updated && (
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <Clock className="w-3 h-3 text-ink-muted" />
                      <span>Updated {new Date(poa.last_updated).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Outstanding Tasks Checklist (Interactive in session workspace!) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-ink uppercase tracking-wider">
                      {isExpanded ? "All Tasks" : "Outstanding Tasks"}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleExpand(poa.id)}
                      className="text-[11px] text-accent-emerald hover:underline font-medium cursor-pointer"
                    >
                      {isExpanded ? "Show Outstanding Only" : "Review All Tasks"}
                    </button>
                  </div>

                  {(isExpanded ? poa.all_tasks : poa.outstanding_tasks).length === 0 ? (
                    <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/50 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCheck className="w-4 h-4 text-accent-emerald shrink-0" />
                      <span>All tasks completed for this plan. Ready for review or graduation.</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {(isExpanded ? poa.all_tasks : poa.outstanding_tasks).map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all text-xs ${
                            task.is_completed
                              ? "bg-emerald-50/30 border-emerald-200/40 text-ink-muted line-through"
                              : "bg-surface border-border hover:border-accent-emerald/40 text-ink"
                          }`}
                        >
                          {!isReadOnly ? (
                            <button
                              type="button"
                              onClick={() => handleToggleTask(poa.id, task)}
                              disabled={isPending}
                              className="mt-0.5 text-accent-emerald hover:text-emerald-700 transition-colors cursor-pointer shrink-0"
                              title={task.is_completed ? "Reopen task" : "Mark task complete"}
                            >
                              {task.is_completed ? (
                                <CheckCircle2 className="w-4 h-4 fill-accent-emerald text-white" />
                              ) : (
                                <Circle className="w-4 h-4 text-ink-muted hover:text-accent-emerald" />
                              )}
                            </button>
                          ) : (
                            <span className="mt-0.5 shrink-0">
                              {task.is_completed ? (
                                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                              ) : (
                                <Circle className="w-4 h-4 text-ink-muted" />
                              )}
                            </span>
                          )}

                          <div className="flex-1 min-w-0">
                            <span className="font-medium">{task.title}</span>
                            {task.description && (
                              <p className="text-[11px] text-ink-muted no-underline mt-0.5">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mentor Feedback Display / Edit */}
                <div className="pt-2 border-t border-border/40">
                  {isFeedbackOpen ? (
                    <div className="space-y-2 p-2.5 rounded-lg bg-surface border border-border">
                      <div className="flex items-center justify-between text-xs font-semibold text-ink">
                        <span>Update Mentor Guidance / Feedback</span>
                        <button
                          type="button"
                          onClick={() => setEditingFeedbackPoaId(null)}
                          className="text-ink-muted hover:text-ink cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="e.g. Focus on speaking and listening module before next week..."
                        className="w-full p-2 text-xs rounded-lg border border-border bg-workspace text-ink focus:outline-hidden focus:ring-1 focus:ring-accent-emerald"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingFeedbackPoaId(null)}
                          className="text-[11px] h-6 px-2"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          loading={savingFeedback}
                          onClick={() => handleSaveFeedback(poa.id)}
                          className="text-[11px] h-6 px-2 bg-accent-emerald text-white"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save Feedback
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2 text-xs bg-workspace/40 p-2.5 rounded-lg border border-border/40">
                      <div className="flex items-start gap-2 flex-1">
                        <MessageSquare className="w-3.5 h-3.5 text-accent-emerald shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-ink text-[11px] uppercase tracking-wider block">
                            Mentor Feedback & Guidance
                          </span>
                          <p className="text-ink text-xs mt-0.5 italic">
                            {poa.mentor_feedback || "No mentor feedback recorded yet for this plan."}
                          </p>
                        </div>
                      </div>

                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFeedbackPoaId(poa.id);
                            setFeedbackText(poa.mentor_feedback || "");
                          }}
                          className="text-[11px] text-ink-muted hover:text-ink flex items-center gap-1 p-1 hover:bg-surface rounded-md cursor-pointer transition-colors"
                          title="Edit feedback"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Expandable Resources (when reviewed) */}
                {isExpanded && poa.linked_resources && poa.linked_resources.length > 0 && (
                  <div className="pt-2 border-t border-border/40 space-y-1.5">
                    <span className="text-[11px] font-semibold text-ink uppercase tracking-wider block">
                      Recommended Resources
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {poa.linked_resources.map((res: any) => (
                        <a
                          key={res.id}
                          href={res.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border hover:border-accent-emerald text-xs text-ink hover:text-accent-emerald transition-colors"
                        >
                          <span className="truncate">{res.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 ml-1 text-ink-muted" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Historical POAs Toggle */}
      {showHistory && historicalPOAs.length > 0 && (
        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted uppercase tracking-wider">
            <History className="w-3.5 h-3.5" />
            <span>Past / Historical Action Plans ({historicalPOAs.length})</span>
          </div>
          <div className="space-y-2 opacity-85">
            {historicalPOAs.map((hPoa) => (
              <div
                key={hPoa.id}
                className="p-3 rounded-xl border border-border bg-workspace/20 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">{hPoa.title}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHistoryPoa({ id: hPoa.id, title: hPoa.title })}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-surface border border-border text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
                      title="View POA history"
                    >
                      <History className="w-3 h-3" />
                      <span>History</span>
                    </button>
                    <Badge variant="stone" size="sm" className="text-[10px]">
                      {hPoa.status}
                    </Badge>
                  </div>
                </div>
                {hPoa.target_outcome && (
                  <p className="text-ink-muted text-[11px]">{hPoa.target_outcome}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit POA Modal */}
      {editingPoa && (
        <EditPOAModal
          isOpen={Boolean(editingPoa)}
          onClose={() => setEditingPoa(null)}
          poa={editingPoa}
          studentId={studentId}
          studentName={studentName}
          onSuccess={() => {
            loadPOAs();
            onPOAUpdated?.();
          }}
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
          onSuccess={() => {
            loadPOAs();
            onPOAUpdated?.();
          }}
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
          onSuccess={() => {
            loadPOAs();
            onPOAUpdated?.();
          }}
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
          onSuccess={() => {
            loadPOAs();
            onPOAUpdated?.();
          }}
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
