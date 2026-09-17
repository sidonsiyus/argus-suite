"use client";

import React, { useState } from "react";
import { X, ArrowRight, ShieldCheck, AlertCircle, Loader2, Check } from "lucide-react";
import {
  StudentInternshipItem,
  InternshipStatus,
  INTERNSHIP_STATUSES,
  VALID_STATUS_TRANSITIONS,
} from "@/lib/internships/types";
import { updateStudentInternshipStatusAction } from "@/app/actions/internships";

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  internship: StudentInternshipItem;
  onSuccess?: () => void;
}

export function UpdateStatusModal({
  isOpen,
  onClose,
  internship,
  onSuccess,
}: UpdateStatusModalProps) {
  const currentStatus = internship.status;
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];

  const [selectedStatus, setSelectedStatus] = useState<InternshipStatus>(
    allowedTransitions.length > 0 ? allowedTransitions[0] : currentStatus
  );
  const [notes, setNotes] = useState(internship.mentor_notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === currentStatus) {
      onClose();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await updateStudentInternshipStatusAction(
        internship.id,
        internship.student_id,
        selectedStatus,
        notes
      );

      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || "Failed to update status.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const currentMeta = INTERNSHIP_STATUSES.find((s) => s.value === currentStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className="bg-surface rounded-2xl border border-border max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-status-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-workspace">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="update-status-title" className="text-sm font-semibold text-ink">
                Transition Application Stage
              </h2>
              <p className="text-[11px] text-ink-muted">
                {internship.organization} — {internship.role_description || "Internship"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current vs Next Stage Preview */}
          <div className="p-3 rounded-xl bg-workspace border border-border flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-ink-muted uppercase tracking-wider block font-medium">
                Current Stage
              </span>
              <span className="font-semibold text-ink">{currentMeta?.label || currentStatus}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-muted" />
            <div>
              <span className="text-[10px] text-ink-muted uppercase tracking-wider block font-medium">
                Target Stage
              </span>
              <span className="font-semibold text-accent-emerald">
                {INTERNSHIP_STATUSES.find((s) => s.value === selectedStatus)?.label}
              </span>
            </div>
          </div>

          {/* Allowed Transition Selector */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Select Authorized Next Stage <span className="text-rose-500">*</span>
            </label>
            {allowedTransitions.length === 0 ? (
              <div className="p-3 rounded-xl bg-stone-100 dark:bg-surface-subtle border border-stone-200 dark:border-border text-stone-700 dark:text-ink-secondary text-xs">
                This pursuit is in terminal stage (<strong>{currentStatus}</strong>). No further stage transitions are permitted.
              </div>
            ) : (
              <div className="space-y-2">
                {allowedTransitions.map((target) => {
                  const meta = INTERNSHIP_STATUSES.find((s) => s.value === target);
                  return (
                    <label
                      key={target}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedStatus === target
                          ? "bg-accent-emerald/5 border-accent-emerald/40 text-ink"
                          : "bg-surface border-border hover:bg-surface-subtle text-ink-muted"
                      }`}
                    >
                      <input
                        type="radio"
                        name="targetStatus"
                        value={target}
                        checked={selectedStatus === target}
                        onChange={() => setSelectedStatus(target)}
                        className="mt-0.5 text-accent-emerald focus:ring-accent-emerald"
                      />
                      <div>
                        <div className="text-xs font-semibold text-ink">{meta?.label}</div>
                        <div className="text-[11px] text-ink-muted leading-tight mt-0.5">
                          {meta?.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Transition Notes */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Mentor Operational Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record feedback, interview date, or rationale for this status update..."
              rows={3}
              maxLength={2000}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || allowedTransitions.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Transition</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
