"use client";

import React, { useState, useTransition, useEffect } from "react";
import {
  X,
  Clock,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Target,
  ArrowRight,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { SessionItem } from "@/lib/sessions/types";
import { completeSessionAction, linkMilestoneToSessionAction } from "@/app/actions/sessions";
import { useToast } from "@/components/ui/ToastProvider";
import { POAFollowUpSection } from "./POAFollowUpSection";
import { CreatePOAModal } from "@/components/student-detail/CreatePOAModal";

interface SimpleMilestone {
  id: string;
  title: string;
  status: string;
}

interface SessionWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionItem | null;
  studentMilestones?: SimpleMilestone[];
  onSuccess?: () => void;
}

export function SessionWorkspaceModal({
  isOpen,
  onClose,
  session,
  studentMilestones = [],
  onSuccess,
}: SessionWorkspaceModalProps) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const [observations, setObservations] = useState(session?.observations || session?.notes || "");
  const [outcome, setOutcome] = useState(session?.outcome || "");
  const [requireFollowUp, setRequireFollowUp] = useState(Boolean(session?.follow_up_date));
  const [followUpDate, setFollowUpDate] = useState(session?.follow_up_date || "");
  const [followUpNotes, setFollowUpNotes] = useState(session?.follow_up_notes || "");

  // Linked milestones
  const initialLinked = (session?.linked_milestones || []).map((m) => m.milestone_id);
  const [selectedMilestoneIds, setSelectedMilestoneIds] = useState<string[]>(initialLinked);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCreatePOAOpen, setIsCreatePOAOpen] = useState(false);
  const [poaRefreshKey, setPoaRefreshKey] = useState(0);

  useEffect(() => {
    if (session) {
      setObservations(session.observations || session.notes || "");
      setOutcome(session.outcome || "");
      setRequireFollowUp(Boolean(session.follow_up_date));
      setFollowUpDate(session.follow_up_date || "");
      setFollowUpNotes(session.follow_up_notes || "");
      setSelectedMilestoneIds((session.linked_milestones || []).map((m) => m.milestone_id));
      setErrorMsg(null);
    }
  }, [session]);

  if (!isOpen || !session) return null;

  const handleToggleMilestone = (id: string) => {
    setSelectedMilestoneIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      // 1. Complete the session
      const res = await completeSessionAction({
        sessionId: session.id,
        observations: observations.trim() || undefined,
        notes: observations.trim() || undefined,
        outcome: outcome.trim() || undefined,
        follow_up_date: requireFollowUp && followUpDate ? followUpDate : null,
        follow_up_notes: requireFollowUp && followUpNotes ? followUpNotes.trim() : null,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to complete session");
        return;
      }

      // 2. Link newly selected milestones
      for (const mId of selectedMilestoneIds) {
        if (!initialLinked.includes(mId)) {
          await linkMilestoneToSessionAction(session.id, mId);
        }
      }

      if (onSuccess) onSuccess();
      toast.success("Mentoring session completed and documented.");
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-modal-title"
        className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-workspace/40 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="workspace-modal-title" className="text-base font-bold text-ink">Mentoring Session Workspace</h2>
                <Badge
                  variant={session.status === "COMPLETED" ? "emerald" : "stone"}
                  size="sm"
                  className="text-[10px]"
                >
                  {session.status}
                </Badge>
              </div>
              <p className="text-xs text-ink-muted">
                Document discussion points, agreed outcomes, and follow-up commitments
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
        <form onSubmit={handleComplete} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Cadet & Session Header Summary */}
          <div className="p-4 rounded-xl bg-workspace border border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">
                Cadet
              </span>
              <p className="font-bold text-ink text-sm mt-0.5">{session.student_name}</p>
              <p className="text-ink-muted font-mono text-[11px]">Reg: {session.reg_no}</p>
            </div>
            <div>
              <span className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">
                Session Focus
              </span>
              <p className="font-semibold text-ink mt-0.5">{session.focus_area}</p>
              <div className="flex items-center gap-2 text-ink-muted text-[11px] mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>{session.session_date}</span>
                <Clock className="w-3 h-3 ml-1" />
                <span>{session.duration_minutes} mins</span>
              </div>
            </div>
          </div>

          {/* POA Follow-Up Section (Active Plans & Tasks) */}
          {session.student_id && (
            <div className="p-4 rounded-xl border border-border/80 bg-workspace/20">
              <POAFollowUpSection
                key={`${session.student_id}-${poaRefreshKey}`}
                studentId={session.student_id}
                studentName={session.student_name}
                isReadOnly={session.status === "COMPLETED" || session.status === "CANCELLED" || session.is_historical}
                onCreatePOAClick={() => setIsCreatePOAOpen(true)}
              />
            </div>
          )}

          {/* 1. Discussion & Mentor Observations */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center justify-between">
              <span>Discussion Notes & Mentor Observations</span>
              <span className="text-[10px] text-ink-muted font-normal">Confidential faculty notes</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Record mentoring discussion, cadet progress observations, questions raised, and feedback given..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-surface text-ink text-xs focus:outline-hidden focus:ring-2 focus:ring-accent-emerald resize-y"
            />
          </div>

          {/* 2. Outcome & Action Items */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Session Outcome & Agreed Action Items
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Cadet to complete 3 navigation problem sets; verify DGCA medical renewal date..."
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-surface text-ink text-xs focus:outline-hidden focus:ring-2 focus:ring-accent-emerald resize-y"
            />
          </div>

          {/* 3. Link Relevant Milestones (Action Plans) */}
          {studentMilestones.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-accent-emerald" />
                <span>Link Relevant Milestones (Action Plans)</span>
              </label>
              <div className="max-h-32 overflow-y-auto border border-border rounded-xl p-2 divide-y divide-border/60 bg-workspace/30">
                {studentMilestones.map((m) => {
                  const isChecked = selectedMilestoneIds.includes(m.id);
                  return (
                    <label
                      key={m.id}
                      className="flex items-center gap-2.5 p-2 hover:bg-surface-subtle rounded-lg cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleMilestone(m.id)}
                        className="rounded border-border text-accent-emerald focus:ring-accent-emerald"
                      />
                      <span className="font-medium text-ink flex-1 truncate">{m.title}</span>
                      <Badge variant="stone" size="sm" className="text-[10px]">
                        {m.status}
                      </Badge>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Follow-up Requirements */}
          <div className="p-4 rounded-xl border border-border bg-workspace/40 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireFollowUp}
                  onChange={(e) => setRequireFollowUp(e.target.checked)}
                  className="rounded border-border text-accent-emerald focus:ring-accent-emerald"
                />
                <CalendarClock className="w-4 h-4 text-accent-emerald" />
                <span>Schedule Mentor Follow-Up Date</span>
              </label>
              <span className="text-[10px] text-ink-muted hidden sm:inline">
                Distinct from Cadet Task Target Date
              </span>
            </div>

            {requireFollowUp && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-ink font-medium">
                    Mentor Check-up / Review Date
                  </label>
                  <Input
                    type="date"
                    required={requireFollowUp}
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="text-xs"
                  />
                  <p className="text-[10px] text-ink-muted">When mentor and cadet meet again to evaluate progress</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-ink font-medium">
                    Follow-Up Review Deliverable / Focus
                  </label>
                  <Input
                    type="text"
                    placeholder="Inspect completed tasks, verify flight logbook..."
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    className="text-xs"
                  />
                  <p className="text-[10px] text-ink-muted">Key agenda/deliverable to inspect during next review</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-3 sticky bottom-0 bg-surface/90 backdrop-blur-xs py-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
            >
              Close
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isPending}
              className="bg-accent-emerald text-white hover:bg-emerald-800"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>
                {session.status === "COMPLETED" || session.is_historical
                  ? "Update Session Documentation"
                  : "Complete Session"}
              </span>
            </Button>
          </div>
        </form>
      </div>

      {/* Create Plan of Action Modal (Launched directly from mentoring session) */}
      {isCreatePOAOpen && session && (
        <CreatePOAModal
          isOpen={isCreatePOAOpen}
          onClose={() => setIsCreatePOAOpen(false)}
          studentId={session.student_id}
          studentName={session.student_name}
          careerGoalTitle={session.focus_area}
          onSuccess={() => {
            setPoaRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
