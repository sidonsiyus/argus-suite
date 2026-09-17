"use client";

import React, { useState, useTransition } from "react";
import { X, Calendar, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SessionItem, SESSION_DURATIONS, SessionDuration } from "@/lib/sessions/types";
import { rescheduleSessionAction } from "@/app/actions/sessions";
import { useToast } from "@/components/ui/ToastProvider";

interface RescheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionItem | null;
  onSuccess?: () => void;
}

export function RescheduleSessionModal({
  isOpen,
  onClose,
  session,
  onSuccess,
}: RescheduleSessionModalProps) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const [sessionDate, setSessionDate] = useState(
    session?.session_date || new Date().toISOString().split("T")[0]
  );
  const [sessionTime, setSessionTime] = useState(
    session?.scheduled_at
      ? new Date(session.scheduled_at).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "10:00"
  );
  const [duration, setDuration] = useState<SessionDuration>(
    (session?.duration_minutes as SessionDuration) || 30
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !session) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const scheduledAtISO = `${sessionDate}T${sessionTime}:00+05:30`;

    startTransition(async () => {
      const res = await rescheduleSessionAction({
        sessionId: session.id,
        scheduled_at: scheduledAtISO,
        duration_minutes: duration,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to reschedule session");
      } else {
        toast.success("Session rescheduled successfully.");
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
        aria-labelledby="reschedule-modal-title"
        className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-workspace/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 id="reschedule-modal-title" className="text-base font-bold text-ink">Reschedule Session</h2>
              <p className="text-xs text-ink-muted">
                Change scheduled date, time, or duration
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Current Info */}
          <div className="p-3 rounded-xl bg-workspace border border-border text-xs space-y-1">
            <p className="font-bold text-ink">{session.student_name}</p>
            <p className="text-ink-muted font-mono text-[11px]">
              Reg No: {session.reg_no} · Topic: {session.focus_area}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent-emerald" />
                <span>New Date</span>
              </label>
              <Input
                type="date"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent-emerald" />
                <span>New Time (IST)</span>
              </label>
              <Input
                type="time"
                required
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) as SessionDuration)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-ink text-xs focus:outline-hidden focus:ring-2 focus:ring-accent-emerald"
            >
              {SESSION_DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} minutes
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isPending}
              className="bg-accent-emerald text-white hover:bg-emerald-800"
            >
              Confirm Reschedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
