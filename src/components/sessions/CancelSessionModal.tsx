"use client";

import React, { useState, useTransition } from "react";
import { X, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SessionItem } from "@/lib/sessions/types";
import { cancelSessionAction } from "@/app/actions/sessions";
import { useToast } from "@/components/ui/ToastProvider";

interface CancelSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionItem | null;
  onSuccess?: () => void;
}

export function CancelSessionModal({
  isOpen,
  onClose,
  session,
  onSuccess,
}: CancelSessionModalProps) {
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const toast = useToast();

  if (!isOpen || !session) return null;

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await cancelSessionAction(session.id, reason.trim() || undefined);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to cancel session");
      } else {
        toast.info("Mentoring session cancelled.");
        if (onSuccess) onSuccess();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
        className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-workspace/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cancel-modal-title" className="text-base font-bold text-ink">Cancel Mentoring Session</h2>
              <p className="text-xs text-ink-muted">
                Record cancellation reason in audit log
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

        <form onSubmit={handleCancel} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-workspace border border-border text-xs space-y-1">
            <p className="font-bold text-ink">{session.student_name}</p>
            <p className="text-ink-muted font-mono text-[11px]">
              Reg No: {session.reg_no} · Scheduled: {session.session_date}
            </p>
            <p className="text-ink-muted text-[11px]">Topic: {session.focus_area}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Cancellation Reason (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Cadet unwell; rescheduled for next week..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-surface text-ink text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
            >
              Keep Session
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              loading={isPending}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              Cancel Session
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
