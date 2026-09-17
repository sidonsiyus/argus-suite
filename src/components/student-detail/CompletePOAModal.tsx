"use client";

import React, { useState } from "react";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { completePlanOfActionAction } from "@/app/actions/poa";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";

interface CompletePOAModalProps {
  isOpen: boolean;
  onClose: () => void;
  poa: {
    id: string;
    title: string;
    status: string;
    progress?: number;
    completed_tasks?: number;
    total_tasks?: number;
    tasks?: any[];
  } | null;
  studentId: string;
  studentName?: string;
  onSuccess?: () => void;
}

export function CompletePOAModal({
  isOpen,
  onClose,
  poa,
  studentId,
  studentName,
  onSuccess,
}: CompletePOAModalProps) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !poa) return null;

  // Derive task metrics
  const totalTasks =
    poa.total_tasks !== undefined
      ? poa.total_tasks
      : poa.tasks
      ? poa.tasks.length
      : 0;

  const completedTasks =
    poa.completed_tasks !== undefined
      ? poa.completed_tasks
      : poa.tasks
      ? poa.tasks.filter((t: any) => t.status === "COMPLETED" || t.is_completed).length
      : 0;

  const progress =
    poa.progress !== undefined
      ? poa.progress
      : totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await completePlanOfActionAction({
        poaId: poa.id,
        studentId,
      });

      if (res.success) {
        toast.success(`Plan of Action "${poa.title}" marked as completed.`);
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || "Failed to mark Plan of Action as completed.");
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
        aria-labelledby="complete-poa-modal-title"
        className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-workspace/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="complete-poa-modal-title" className="text-base font-bold text-ink">
                Mark this POA as completed?
              </h2>
              <p className="text-xs text-ink-muted">
                {studentName ? `For ${studentName}` : "Developmental Action Plan"}
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

        {/* Content */}
        <form onSubmit={handleComplete} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Target POA Summary Card */}
          <div className="p-4 rounded-xl border border-border bg-workspace/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-muted">
                Plan of Action
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                {poa.status}
              </span>
            </div>
            <h4 className="text-sm font-bold text-ink">{poa.title}</h4>
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-ink-muted">
              <span>Task Progress</span>
              <span className="font-semibold text-ink">
                {completedTasks}/{totalTasks} tasks ({progress}%)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-accent-emerald transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Invariant Explanation Box */}
          <div className="p-3.5 rounded-xl bg-accent-emerald/5 border border-accent-emerald/20 text-xs text-ink space-y-2">
            <p className="font-medium text-accent-emerald leading-relaxed">
              This will mark the Plan of Action as <strong>COMPLETED</strong>. Existing task completion states will be preserved and the completion will be recorded in the POA history.
            </p>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              <strong>Note:</strong> Outstanding tasks will NOT be automatically marked complete. Actual task progress ({progress}%) remains authentic.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="cursor-pointer bg-accent-emerald hover:bg-accent-emerald/90 text-white text-xs gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Completing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Completed</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
