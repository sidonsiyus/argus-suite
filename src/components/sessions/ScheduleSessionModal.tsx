"use client";

import React, { useState, useTransition } from "react";
import {
  X,
  Calendar,
  Clock,
  Search,
  User,
  AlertCircle,
  CheckCircle2,
  CalendarPlus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  SESSION_TYPES,
  SESSION_DURATIONS,
  SessionType,
  SessionDuration,
} from "@/lib/sessions/types";
import { scheduleSessionAction } from "@/app/actions/sessions";
import { useToast } from "@/components/ui/ToastProvider";

interface SimpleCadet {
  id: string;
  full_name: string;
  reg_no: string;
  career_goal?: string | null;
}

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: SimpleCadet[];
  initialStudentId?: string;
  initialDate?: string;
  onSuccess?: () => void;
}

export function ScheduleSessionModal({
  isOpen,
  onClose,
  students,
  initialStudentId,
  initialDate,
  onSuccess,
}: ScheduleSessionModalProps) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  // Selected student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || ""
  );
  const [cadetSearch, setCadetSearch] = useState("");

  // Date and Time (default: tomorrow at 10:00 AM)
  const defaultDate =
    initialDate ||
    new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [sessionDate, setSessionDate] = useState(defaultDate);
  const [sessionTime, setSessionTime] = useState("10:00");
  const [duration, setDuration] = useState<SessionDuration>(30);
  const [sessionType, setSessionType] =
    useState<SessionType>("GENERAL_MENTORING");
  const [focusArea, setFocusArea] = useState("");
  const [notes, setNotes] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter cadets strictly by Name and Reg No
  const filteredStudents = students.filter((s) => {
    const q = cadetSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      s.full_name.toLowerCase().includes(q) || s.reg_no.toLowerCase().includes(q)
    );
  });

  const selectedCadet = students.find((s) => s.id === selectedStudentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedStudentId) {
      setErrorMsg("Please select a cadet for this session");
      return;
    }

    if (!sessionDate || !sessionTime) {
      setErrorMsg("Please choose a valid session date and time");
      return;
    }

    // Combine date and time into ISO string in Indian Standard Time (+05:30)
    const scheduledAtISO = `${sessionDate}T${sessionTime}:00+05:30`;

    startTransition(async () => {
      const res = await scheduleSessionAction({
        student_id: selectedStudentId,
        scheduled_at: scheduledAtISO,
        duration_minutes: duration,
        session_type: sessionType,
        focus_area: focusArea.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to schedule session");
      } else {
        toast.success("Mentoring session scheduled successfully.");
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
        aria-labelledby="schedule-modal-title"
        className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-workspace/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 id="schedule-modal-title" className="text-base font-bold text-ink">
                Schedule Mentoring Session
              </h2>
              <p className="text-xs text-ink-muted">
                Plan a 1-on-1 developmental session with a cadet
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* 1. Cadet Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Cadet <span className="text-rose-600">*</span>
            </label>

            {selectedCadet ? (
              <div className="p-3 rounded-xl border border-accent-emerald/30 bg-accent-emerald/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-accent-emerald/20 text-accent-emerald font-bold text-xs flex items-center justify-center">
                    {selectedCadet.full_name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink">
                      {selectedCadet.full_name}
                    </p>
                    <p className="text-[11px] font-mono text-ink-muted">
                      Reg No: {selectedCadet.reg_no}
                    </p>
                  </div>
                </div>
                {!initialStudentId && (
                  <button
                    type="button"
                    onClick={() => setSelectedStudentId("")}
                    className="text-xs text-ink-muted hover:text-rose-600 underline"
                  >
                    Change
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Search cadet by name or register number..."
                    value={cadetSearch}
                    onChange={(e) => setCadetSearch(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto border border-border rounded-xl divide-y divide-border bg-surface">
                  {filteredStudents.length === 0 ? (
                    <div className="p-3 text-center text-xs text-ink-muted">
                      No cadets found matching search
                    </div>
                  ) : (
                    filteredStudents.slice(0, 15).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedStudentId(s.id)}
                        className="w-full text-left p-2.5 hover:bg-surface-subtle flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-ink">{s.full_name}</p>
                          <p className="text-[11px] font-mono text-ink-muted">
                            {s.reg_no}
                          </p>
                        </div>
                        <span className="text-[11px] font-medium text-accent-emerald">
                          Select →
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent-emerald" />
                <span>Date</span> <span className="text-rose-600">*</span>
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
                <span>Time (IST)</span> <span className="text-rose-600">*</span>
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

          {/* 3. Duration & Session Type Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                Session Type <span className="text-rose-600">*</span>
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as SessionType)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-ink text-xs focus:outline-hidden focus:ring-2 focus:ring-accent-emerald"
              >
                {SESSION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Purpose / Agenda */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Purpose / Discussion Agenda
            </label>
            <Input
              type="text"
              placeholder="e.g. DGCA CPL navigation review & flight hours logbook audit"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="text-xs"
              maxLength={100}
            />
          </div>

          {/* 5. Pre-Session Notes (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Initial Notes / Topics for Discussion
            </label>
            <textarea
              rows={3}
              placeholder="Key questions or areas to prepare before meeting..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-surface text-ink text-xs focus:outline-hidden focus:ring-2 focus:ring-accent-emerald resize-none"
              maxLength={1000}
            />
          </div>

          {/* Form Actions */}
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
              Schedule Session
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
