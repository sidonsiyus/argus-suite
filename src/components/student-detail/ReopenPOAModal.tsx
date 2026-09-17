"use client";

import React, { useState } from "react";
import { X, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { reopenPlanOfActionAction } from "@/app/actions/poa";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";

interface ReopenPOAModalProps {
  isOpen: boolean;
  onClose: () => void;
  poa: {
    id: string;
    title: string;
    status: string;
  } | null;
  studentId: string;
  studentName?: string;
  onSuccess?: () => void;
}

export function ReopenPOAModal({
  isOpen,
  onClose,
  poa,
  studentId,
  studentName,
  onSuccess,
}: ReopenPOAModalProps) {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !poa) return null;

  const handleReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await reopenPlanOfActionAction({
        poaId: poa.id,
        studentId,
        reason: reason.trim() || undefined,
      });

      if (res.success) {
        toast.success(`Plan of Action "${poa.title}" reopened and moved to ACTIVE.`);
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || "Failed to reopen Plan of Action.");
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
        aria-labelledby="reopen-poa-modal-title"
        className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-workspace/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 id="reopen-poa-modal-title" className="text-base font-bold text-ink">
                Reopen Plan of Action
              </h2>
              <p className="text-xs text-ink-muted">
                Move plan back to active developmental tracking
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
        <form onSubmit={handleReopen} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-workspace border border-border space-y-2">
            <p className="text-xs font-semibold text-ink">
              Reopen this POA? This will move it back to ACTIVE so additional work can be assigned.
            </p>
            <p className="text-xs text-ink-muted leading-relaxed">
              Plan: <strong className="text-ink">{poa.title}</strong>
              {studentName && <> • Cadet: <strong className="text-ink">{studentName}</strong></>}
            </p>
            <div className="pt-2 border-t border-border/60 text-[11px] text-ink-muted space-y-1">
              <p>✔ Completed tasks and historical milestones remain preserved.</p>
              <p>✔ You can add new tasks and review items once reopened.</p>
              <p>✔ This action will be permanently recorded in the milestone audit trail.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Reason for Reopening (Optional)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Additional practical simulator problem sets required before flight exam..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-workspace text-ink focus:outline-hidden focus:ring-2 focus:ring-accent-emerald resize-y"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
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
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              <span>Confirm Reopen</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
