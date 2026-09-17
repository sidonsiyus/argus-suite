"use client";

import React, { useState } from "react";
import { X, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { deletePlanOfActionAction } from "@/app/actions/poa";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";

interface DeletePOAModalProps {
  isOpen: boolean;
  onClose: () => void;
  poa: {
    id: string;
    title: string;
    status?: string;
    provenance?: string;
  } | null;
  studentId: string;
  studentName?: string;
  onSuccess?: () => void;
}

export function DeletePOAModal({
  isOpen,
  onClose,
  poa,
  studentId,
  studentName,
  onSuccess,
}: DeletePOAModalProps) {
  const toast = useToast();
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !poa) return null;

  const isHistorical =
    poa.provenance === "HISTORICAL_PROFILE";

  const isConfirmed = confirmText.trim() === "DELETE";

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await deletePlanOfActionAction({
        poaId: poa.id,
        studentId,
        confirmText: "DELETE",
      });

      if (res.success) {
        toast.success("Plan of Action deleted successfully.");
        setConfirmText("");
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || "Failed to delete Plan of Action.");
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
        aria-labelledby="delete-poa-modal-title"
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
              <h2 id="delete-poa-modal-title" className="text-base font-bold text-ink">
                Delete this POA?
              </h2>
              <p className="text-xs text-ink-muted">
                {studentName ? `For ${studentName}` : "Permanent deletion"}
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

          {isHistorical ? (
            <div className="p-4 rounded-xl bg-stone-100 dark:bg-surface-subtle border border-stone-300 dark:border-border text-xs text-ink space-y-2">
              <p className="font-bold text-rose-600">Action Restricted</p>
              <p>
                This record is a historical baseline profile milestone and cannot be deleted. Historical baseline records are permanently preserved for institutional compliance.
              </p>
            </div>
          ) : (
            <>
              {/* Warning Notice Box */}
              <div className="p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-2 text-xs">
                <p className="font-bold text-rose-800 dark:text-rose-300">
                  Are you sure you want to delete &ldquo;{poa.title}&rdquo;?
                </p>
                <p className="text-rose-700 dark:text-rose-400 leading-relaxed">
                  This will permanently remove the Plan of Action and any active tasks or attached resources associated with it.
                </p>
                <p className="text-[11px] text-ink-muted pt-1 border-t border-rose-200/50 dark:border-rose-900/40">
                  Historical profile milestones will not be affected. An audit log of this deletion will be permanently archived.
                </p>
              </div>

              {/* Type DELETE to confirm input */}
              <div className="space-y-1.5 pt-1">
                <label
                  htmlFor="confirm-delete-input"
                  className="block text-xs font-semibold text-ink"
                >
                  Type <span className="font-mono text-rose-600 font-bold">DELETE</span> to confirm:
                </label>
                <input
                  id="confirm-delete-input"
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
                    <span>Delete POA</span>
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
