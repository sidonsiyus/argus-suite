"use client";

import React, { useState } from "react";
import { X, Trash2, AlertTriangle, Loader2, Calendar, Clock, User } from "lucide-react";
import { deleteMentoringSessionAction } from "@/app/actions/sessions";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { SessionItem } from "@/lib/sessions/types";

interface DeleteSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionItem | null;
  onSuccess?: () => void;
}

export function DeleteSessionModal({
  isOpen,
  onClose,
  session,
  onSuccess,
}: DeleteSessionModalProps) {
  const toast = useToast();
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !session) return null;

  const isHistorical =
    session.is_historical ||
    session.status === "HISTORICAL" ||
    session.provenance === "HISTORICAL_IMPORT" ||
    session.provenance === "HISTORICAL_PROFILE";

  const isConfirmed = confirmText.trim() === "DELETE";

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed || isHistorical) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await deleteMentoringSessionAction(session.id, "DELETE");

      if (res.success) {
        toast.success("Mentoring session deleted successfully.");
        setConfirmText("");
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || "Failed to delete mentoring session.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const formattedTime = session.scheduled_at
    ? new Date(session.scheduled_at).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-session-modal-title"
        className="bg-surface rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-2xl w-full max-w-lg overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-rose-100 dark:border-rose-950/60 flex items-center justify-between bg-rose-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="delete-session-modal-title" className="text-base font-bold text-ink">
                Delete this mentoring session?
              </h2>
              <p className="text-xs text-ink-muted">
                Permanent deletion &bull; Cannot be undone
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
        <form onSubmit={handleDelete} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Session Identification Card */}
          <div className="p-4 rounded-xl bg-workspace border border-border space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink">
              <User className="w-3.5 h-3.5 text-accent-emerald shrink-0" />
              <span>{session.student_name}</span>
              {session.reg_no && (
                <span className="font-mono text-[11px] text-ink-muted">
                  ({session.reg_no})
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-ink-muted font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-accent-emerald" />
                {session.session_date}
              </span>
              {formattedTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-accent-emerald" />
                  {formattedTime} ({session.duration_minutes}m)
                </span>
              )}
            </div>

            <div className="text-xs text-ink pt-1 border-t border-border/50">
              <span className="font-semibold">{session.focus_area}</span>
              <span className="text-ink-muted ml-2 text-[11px]">
                &bull; {session.session_type.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {isHistorical ? (
            <div className="p-4 rounded-xl bg-stone-100 dark:bg-surface-subtle border border-stone-300 dark:border-border text-xs text-ink space-y-2">
              <p className="font-bold text-rose-600">Action Restricted</p>
              <p>
                This record is a historical baseline session and cannot be deleted. Historical institutional records are permanently preserved for compliance.
              </p>
            </div>
          ) : (
            <>
              {/* Warning Notice Box */}
              <div className="p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-2 text-xs">
                <p className="font-bold text-rose-800 dark:text-rose-300">
                  Are you sure you want to permanently delete this session?
                </p>
                <p className="text-rose-700 dark:text-rose-400 leading-relaxed">
                  This action is permanent and cannot be undone. Student profiles, career goals, POAs, milestones, and documents will NOT be deleted.
                </p>
                <p className="text-[11px] text-ink-muted pt-1 border-t border-rose-200/50 dark:border-rose-900/40">
                  An immutable audit event recording this deletion will be stored in the institutional audit log.
                </p>
              </div>

              {/* Type DELETE to confirm input */}
              <div className="space-y-1.5 pt-1">
                <label
                  htmlFor="confirm-session-delete-input"
                  className="block text-xs font-semibold text-ink"
                >
                  Type <span className="font-mono text-rose-600 font-bold">DELETE</span> to confirm:
                </label>
                <input
                  id="confirm-session-delete-input"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  autoComplete="off"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-workspace text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all placeholder:text-ink-muted/50"
                />
              </div>
            </>
          )}

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
            {!isHistorical && (
              <Button
                type="submit"
                disabled={!isConfirmed || submitting}
                className="cursor-pointer bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs gap-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Session</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
