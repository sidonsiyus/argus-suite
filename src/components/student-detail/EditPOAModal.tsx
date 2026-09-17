"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Target,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Loader2,
  FileCheck,
  MessageSquare,
  ListTodo,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { editPlanOfActionAction } from "@/app/actions/poa";
import { useToast } from "@/components/ui/ToastProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface TaskItemInput {
  id?: string;
  title: string;
  description?: string;
  orderIndex?: number;
  isCompleted?: boolean;
}

interface EditPOAModalProps {
  isOpen: boolean;
  onClose: () => void;
  poa: any;
  studentId: string;
  studentName: string;
  onSuccess?: () => void;
  onReopenClick?: () => void;
}

export function EditPOAModal({
  isOpen,
  onClose,
  poa,
  studentId,
  studentName,
  onSuccess,
  onReopenClick,
}: EditPOAModalProps) {
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [targetOutcome, setTargetOutcome] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [targetDate, setTargetDate] = useState("");
  const [textInstructions, setTextInstructions] = useState("");
  const [evidenceRequirement, setEvidenceRequirement] = useState("");
  const [mentorFeedback, setMentorFeedback] = useState("");
  const [tasks, setTasks] = useState<TaskItemInput[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (poa) {
      setTitle(poa.title || "");
      setObjective(poa.objective || poa.description || "");
      setTargetOutcome(
        poa.target_outcome || poa.expected_outcome || poa.outcome_statement || poa.success_criteria || ""
      );
      setPriority(poa.priority || "MEDIUM");
      setTargetDate(poa.target_date || "");
      setTextInstructions(poa.text_instructions || "");
      setEvidenceRequirement(poa.evidence_requirement || poa.evidence_status || "");
      setMentorFeedback(poa.mentor_feedback || "");

      const rawTasks = poa.all_tasks || poa.tasks || [];
      setTasks(
        rawTasks.map((t: any, idx: number) => ({
          id: t.id,
          title: t.title || "",
          description: t.description || "",
          orderIndex: t.order_index !== undefined ? t.order_index : idx,
          isCompleted: Boolean(t.is_completed || t.status === "COMPLETED"),
        }))
      );
      setError(null);
    }
  }, [poa]);

  if (!isOpen || !poa) return null;

  const isCompleted = poa.status === "COMPLETED";

  const handleAddTask = () => {
    setTasks([...tasks, { title: "", description: "", orderIndex: tasks.length }]);
  };

  const handleRemoveTask = (idx: number) => {
    setTasks(tasks.filter((_, i) => i !== idx));
  };

  const handleTaskChange = (idx: number, field: "title" | "description", val: string) => {
    const updated = [...tasks];
    updated[idx] = { ...updated[idx], [field]: val };
    setTasks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetOutcome.trim()) {
      setError("Please provide both a Title and Target Outcome.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const validTasks = tasks
      .map((t, idx) => ({
        id: t.id,
        title: t.title.trim(),
        description: t.description ? t.description.trim() : null,
        orderIndex: idx,
        isCompleted: t.isCompleted,
      }))
      .filter((t) => t.title.length > 0);

    try {
      const res = await editPlanOfActionAction({
        poaId: poa.id,
        studentId,
        title: title.trim(),
        objective: objective.trim() || null,
        targetOutcome: targetOutcome.trim(),
        priority,
        targetDate: targetDate || null,
        textInstructions: textInstructions.trim() || null,
        evidenceRequirement: evidenceRequirement.trim() || null,
        mentorFeedback: mentorFeedback.trim() || null,
        tasks: validTasks,
      });

      if (res.success) {
        toast.success(`Plan of Action "${title.trim()}" updated successfully.`);
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || "Failed to update Plan of Action.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-poa-modal-title"
        className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-workspace/40 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="edit-poa-modal-title" className="text-base font-bold text-ink">
                  Edit Plan of Action
                </h2>
                <Badge
                  variant={isCompleted ? "emerald" : "stone"}
                  size="sm"
                  className="text-[10px]"
                >
                  {poa.status}
                </Badge>
              </div>
              <p className="text-xs text-ink-muted">
                Cadet: <strong className="text-ink">{studentName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice for Completed POAs */}
        {isCompleted && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                This POA is <strong>COMPLETED</strong>. Editing descriptive details keeps it completed.
              </span>
            </div>
            {onReopenClick && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onReopenClick();
                }}
                className="text-[11px] h-7 px-2.5 bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald hover:bg-accent-emerald/20"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                <span>Reopen POA</span>
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              POA Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DGCA CPL Ground School Navigation"
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-workspace text-ink focus:outline-hidden focus:ring-2 focus:ring-accent-emerald"
            />
          </div>

          {/* Target Outcome */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Target Outcome Statement <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={targetOutcome}
              onChange={(e) => setTargetOutcome(e.target.value)}
              placeholder="Measurable developmental outcome statement..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-workspace text-ink focus:outline-hidden focus:ring-2 focus:ring-accent-emerald resize-y"
            />
          </div>

          {/* Priority & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-workspace text-ink focus:outline-hidden focus:ring-2 focus:ring-accent-emerald"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-accent-emerald" />
                <span>Cadet Target Date</span>
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-workspace text-ink focus:outline-hidden focus:ring-2 focus:ring-accent-emerald"
              />
            </div>
          </div>

          {/* Evidence Requirement */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-accent-emerald" />
              <span>Evidence Requirement</span>
            </label>
            <input
              type="text"
              value={evidenceRequirement}
              onChange={(e) => setEvidenceRequirement(e.target.value)}
              placeholder="e.g. DGCA Official Result Slip / Logbook endorsement"
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-workspace text-ink focus:outline-hidden focus:ring-2 focus:ring-accent-emerald"
            />
          </div>

          {/* Instructions & Mentor Guidance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                Mentor Instructions
              </label>
              <textarea
                rows={3}
                value={textInstructions}
                onChange={(e) => setTextInstructions(e.target.value)}
                placeholder="Study plan instructions or methodology..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-workspace text-ink focus:outline-hidden focus:ring-2 focus:ring-accent-emerald resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-accent-emerald" />
                <span>Mentor Feedback</span>
              </label>
              <textarea
                rows={3}
                value={mentorFeedback}
                onChange={(e) => setMentorFeedback(e.target.value)}
                placeholder="Direct feedback recorded during check-ups..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-workspace text-ink focus:outline-hidden focus:ring-2 focus:ring-accent-emerald resize-y"
              />
            </div>
          </div>

          {/* Actionable Subtasks */}
          <div className="space-y-2 pt-2 border-t border-border/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-accent-emerald" />
                <span>Actionable Tasks ({tasks.length})</span>
              </label>
              <button
                type="button"
                onClick={handleAddTask}
                className="text-xs text-accent-emerald hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            <div className="space-y-2">
              {tasks.map((task, idx) => (
                <div
                  key={task.id || `new-${idx}`}
                  className="p-3 rounded-xl bg-workspace/60 border border-border space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-ink-muted">#{idx + 1}</span>
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => handleTaskChange(idx, "title", e.target.value)}
                      placeholder="Task title..."
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-border bg-surface text-ink focus:outline-hidden focus:ring-1 focus:ring-accent-emerald"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(idx)}
                      className="p-1 text-ink-muted hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={task.description || ""}
                    onChange={(e) => handleTaskChange(idx, "description", e.target.value)}
                    placeholder="Task details/instructions (optional)..."
                    className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-border/60 bg-surface/80 text-ink-secondary focus:outline-hidden focus:ring-1 focus:ring-accent-emerald"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3 sticky bottom-0 bg-surface/95 backdrop-blur-xs py-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
              className="bg-accent-emerald text-white hover:bg-emerald-800"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
