"use client";

import React, { useState, useTransition } from "react";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit3,
  Loader2,
  AlertCircle,
  HelpCircle,
  Target,
  FileCheck,
  Compass,
  ArrowRight,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CopilotRecommendationItem } from "@/lib/ai/types";
import {
  generateInsightsAction,
  approveRecommendationAction,
  editAndApproveRecommendationAction,
  rejectRecommendationAction,
} from "@/app/actions/ai-copilot";

interface AICopilotCardProps {
  studentId: string;
  studentName: string;
  initialRecommendations: CopilotRecommendationItem[];
  initialSummary?: string | null;
  initialCareerAlignment?: string | null;
}

export function AICopilotCard({
  studentId,
  studentName,
  initialRecommendations = [],
  initialSummary = null,
  initialCareerAlignment = null,
}: AICopilotCardProps) {
  const [recommendations, setRecommendations] = useState<CopilotRecommendationItem[]>(
    initialRecommendations
  );
  const [summary, setSummary] = useState<string | null>(initialSummary);
  const [careerAlignment, setCareerAlignment] = useState<string | null>(
    initialCareerAlignment
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals / Dialog states
  const [milestoneConfirmRec, setMilestoneConfirmRec] =
    useState<CopilotRecommendationItem | null>(null);
  const [editModalRec, setEditModalRec] =
    useState<CopilotRecommendationItem | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    suggested_action: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    review_notes: string;
  }>({
    title: "",
    suggested_action: "",
    priority: "MEDIUM",
    review_notes: "",
  });

  const [rejectModalRec, setRejectModalRec] =
    useState<CopilotRecommendationItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [isPending, startTransition] = useTransition();

  // 1. Generate Copilot Insights
  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await generateInsightsAction(studentId);
      if (!res.success || !res.result) {
        setErrorMessage(
          res.error || "Failed to generate mentor insights. Please try again."
        );
      } else {
        setSummary(res.result.student_summary);
        setCareerAlignment(res.result.career_alignment_observation);
        // Prepend new pending recommendations to state
        setRecommendations((prev) => [...res.result!.recommendations, ...prev]);
        setSuccessMessage(
          `Generated ${res.result.recommendations.length} new recommendations for faculty review.`
        );
      }
    } catch (err: any) {
      setErrorMessage("An unexpected error occurred during AI analysis.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Approve Recommendation (With Milestone prompt if type === MILESTONE)
  const handleInitiateApprove = (rec: CopilotRecommendationItem) => {
    if (!rec.id) return;
    if (rec.type === "MILESTONE") {
      setMilestoneConfirmRec(rec);
    } else {
      executeApprove(rec.id);
    }
  };

  const executeApprove = async (recId: string) => {
    setActionLoadingId(recId);
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const res = await approveRecommendationAction(recId, studentId);
        if (!res.success) {
          setErrorMessage(res.error || "Failed to approve recommendation.");
        } else {
          setRecommendations((prev) =>
            prev.map((r) =>
              r.id === recId
                ? {
                    ...r,
                    status: "APPROVED",
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: "Current Mentor",
                  }
                : r
            )
          );
          setSuccessMessage("Recommendation approved and recorded.");
          setMilestoneConfirmRec(null);
        }
      } catch (err) {
        setErrorMessage("Network or server error while approving.");
      } finally {
        setActionLoadingId(null);
      }
    });
  };

  // 3. Edit & Approve Recommendation
  const handleOpenEdit = (rec: CopilotRecommendationItem) => {
    setEditModalRec(rec);
    setEditForm({
      title: rec.title,
      suggested_action: rec.suggested_action,
      priority: (rec.priority as any) || "MEDIUM",
      review_notes: "",
    });
  };

  const executeEditAndApprove = async () => {
    if (!editModalRec || !editModalRec.id) return;
    const recId = editModalRec.id;
    setActionLoadingId(recId);
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const res = await editAndApproveRecommendationAction(
          recId,
          studentId,
          editForm
        );
        if (!res.success) {
          setErrorMessage(res.error || "Failed to edit and approve.");
        } else {
          setRecommendations((prev) =>
            prev.map((r) =>
              r.id === recId
                ? {
                    ...r,
                    title: editForm.title,
                    suggested_action: editForm.suggested_action,
                    priority: editForm.priority,
                    status: "EDITED",
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: "Current Mentor",
                    review_notes: editForm.review_notes,
                  }
                : r
            )
          );
          setSuccessMessage("Refined recommendation approved and recorded.");
          setEditModalRec(null);
        }
      } catch (err) {
        setErrorMessage("Network or server error while editing.");
      } finally {
        setActionLoadingId(null);
      }
    });
  };

  // 4. Reject Recommendation
  const handleOpenReject = (rec: CopilotRecommendationItem) => {
    setRejectModalRec(rec);
    setRejectReason("");
  };

  const executeReject = async () => {
    if (!rejectModalRec || !rejectModalRec.id) return;
    const recId = rejectModalRec.id;
    setActionLoadingId(recId);
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const res = await rejectRecommendationAction(
          recId,
          studentId,
          rejectReason.trim() || undefined
        );
        if (!res.success) {
          setErrorMessage(res.error || "Failed to reject recommendation.");
        } else {
          setRecommendations((prev) =>
            prev.map((r) =>
              r.id === recId
                ? {
                    ...r,
                    status: "REJECTED",
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: "Current Mentor",
                    review_notes: rejectReason.trim() || "Rejected by mentor",
                  }
                : r
            )
          );
          setSuccessMessage("Recommendation rejected. Student record was not modified.");
          setRejectModalRec(null);
        }
      } catch (err) {
        setErrorMessage("Network or server error while rejecting.");
      } finally {
        setActionLoadingId(null);
      }
    });
  };

  // Helper for recommendation type badges
  const renderTypeBadge = (type: string) => {
    switch (type) {
      case "MILESTONE":
        return (
          <Badge variant="emerald" size="sm" className="gap-1 font-semibold">
            <Target className="w-3 h-3 text-emerald-600" />
            Milestone
          </Badge>
        );
      case "MENTORING_FOCUS":
        return (
          <Badge variant="blue" size="sm" className="gap-1 font-semibold">
            <Compass className="w-3 h-3 text-blue-600" />
            Mentoring Focus
          </Badge>
        );
      case "QUESTION":
        return (
          <Badge variant="amber" size="sm" className="gap-1 font-semibold">
            <HelpCircle className="w-3 h-3 text-amber-600" />
            Discussion Question
          </Badge>
        );
      case "INSIGHT":
      default:
        return (
          <Badge variant="stone" size="sm" className="gap-1 font-semibold">
            <Sparkles className="w-3 h-3 text-stone-500" />
            Insight
          </Badge>
        );
    }
  };

  const pendingCount = recommendations.filter((r) => r.status === "PENDING").length;

  return (
    <Card className="border border-emerald-900/15 shadow-sm bg-surface overflow-hidden">
      {/* Copilot Header */}
      <div className="bg-gradient-to-r from-emerald-950/95 via-emerald-900/90 to-emerald-950/95 text-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-700/50 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-semibold text-base text-white tracking-tight">
                  AI Mentor Copilot
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-800/90 text-emerald-200 border border-emerald-600/40">
                  Llama 3.3 70B
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Decision-support copilot · Human-in-the-loop: Recommends, never mutates without approval
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            <Badge
              variant="outline"
              size="sm"
              className="bg-emerald-900/60 text-emerald-200 border-emerald-700/40 gap-1.5 hidden md:inline-flex"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mentor Decisions Only</span>
            </Badge>

            <button
              onClick={handleGenerateInsights}
              disabled={isGenerating || isPending}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-emerald-950 font-semibold text-xs transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-950" />
                  <span>Synthesizing Cadet Data...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-950" />
                  <span>Generate Mentor Insights</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <CardContent className="p-5 space-y-5">
        {/* Error / Success Feedback Banners */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold">Generation Notice:</strong> {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-500 hover:text-emerald-700 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* AI Executive Summary & Career Alignment Callout */}
        {(summary || careerAlignment) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-workspace border border-border/80 text-xs">
            {summary && (
              <div className="space-y-1.5">
                <span className="font-semibold text-stone-700 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  Cadet Executive Summary
                </span>
                <p className="text-stone-600 leading-relaxed italic">
                  &ldquo;{summary}&rdquo;
                </p>
              </div>
            )}
            {careerAlignment && (
              <div className="space-y-1.5 md:border-l md:border-border md:pl-4">
                <span className="font-semibold text-stone-700 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <Compass className="w-3.5 h-3.5 text-blue-700" />
                  Career Alignment Observation
                </span>
                <p className="text-stone-600 leading-relaxed italic">
                  &ldquo;{careerAlignment}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recommendations Section Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Faculty Recommendations ({recommendations.length})
            </h4>
            {pendingCount > 0 && (
              <Badge variant="amber" size="sm" className="font-semibold text-[10px]">
                {pendingCount} Pending Review
              </Badge>
            )}
          </div>
          <span className="text-[11px] text-stone-400">
            AI inferences must be verified against student record
          </span>
        </div>

        {/* Empty State */}
        {recommendations.length === 0 && !isGenerating && (
          <div className="py-10 text-center border-2 border-dashed border-border rounded-xl bg-surface/50 space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200/70 mx-auto flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-stone-700">
              No AI recommendations generated yet
            </p>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Click &quot;Generate Mentor Insights&quot; above. The Copilot will securely synthesize {studentName}&apos;s career goals, skill ratings, readiness checklist, and past mentoring discussions to provide actionable guidance.
            </p>
          </div>
        )}

        {/* Recommendations List */}
        <div className="space-y-3.5">
          {recommendations.map((rec) => {
            const isPendingStatus = rec.status === "PENDING";
            const isLoading = actionLoadingId === rec.id;

            return (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border transition-all duration-150 ${
                  isPendingStatus
                    ? "bg-surface border-stone-300/80 shadow-sm hover:border-emerald-700/40"
                    : rec.status === "APPROVED"
                    ? "bg-emerald-50/40 border-emerald-200/70"
                    : rec.status === "EDITED"
                    ? "bg-blue-50/30 border-blue-200/70"
                    : "bg-stone-50/60 border-stone-200/70 opacity-75"
                }`}
              >
                {/* Header: Badges & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-border/60">
                  <div className="flex flex-wrap items-center gap-2">
                    {renderTypeBadge(rec.type)}
                    <Badge
                      variant={
                        rec.priority === "HIGH"
                          ? "rose"
                          : rec.priority === "MEDIUM"
                          ? "amber"
                          : "stone"
                      }
                      size="sm"
                      className="font-medium text-[10px]"
                    >
                      {rec.priority} Priority
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {rec.status === "PENDING" && (
                      <Badge variant="amber" size="sm" className="gap-1 font-semibold text-[11px]">
                        <Clock className="w-3 h-3 text-amber-600" />
                        AI Recommendation — Pending Mentor Review
                      </Badge>
                    )}
                    {rec.status === "APPROVED" && (
                      <Badge variant="emerald" size="sm" className="gap-1 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Approved by Mentor
                      </Badge>
                    )}
                    {rec.status === "EDITED" && (
                      <Badge variant="blue" size="sm" className="gap-1 font-semibold text-[11px]">
                        <Edit3 className="w-3 h-3 text-blue-600" />
                        Refined & Approved
                      </Badge>
                    )}
                    {rec.status === "REJECTED" && (
                      <Badge variant="stone" size="sm" className="gap-1 font-semibold text-[11px]">
                        <XCircle className="w-3 h-3 text-stone-500" />
                        Rejected
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Title & Cautious Rationale */}
                <div className="pt-3 space-y-1.5">
                  <h5 className="text-sm font-semibold text-ink">
                    {rec.title}
                  </h5>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {rec.rationale}
                  </p>
                </div>

                {/* Traceable Evidence Pills */}
                {rec.evidence && rec.evidence.length > 0 && (
                  <div className="pt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mr-1">
                      Evidence:
                    </span>
                    {rec.evidence.map((ev, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200/80 text-stone-700"
                      >
                        <strong className="font-medium text-stone-800">{ev.source}:</strong>
                        <span>{ev.value}</span>
                        {ev.provenance && (
                          <span className="text-[9px] text-stone-400 font-mono">
                            [{ev.provenance}]
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Action Box */}
                {rec.suggested_action && (
                  <div className="mt-3 p-3 rounded-lg bg-workspace border border-border/80 text-xs">
                    <div className="flex items-center gap-1.5 text-stone-700 font-semibold mb-1">
                      <ArrowRight className="w-3 h-3 text-emerald-700" />
                      <span>Suggested Mentoring Action / Success Criteria:</span>
                    </div>
                    <p className="text-stone-600 leading-relaxed pl-4">
                      {rec.suggested_action}
                    </p>
                  </div>
                )}

                {/* Review Notes (if already edited/rejected) */}
                {rec.review_notes && !isPendingStatus && (
                  <div className="mt-2.5 text-[11px] text-stone-500 italic pl-1">
                    <strong className="font-medium text-stone-600">Reviewer Note:</strong> &ldquo;{rec.review_notes}&rdquo;
                  </div>
                )}

                {/* Pending Actions Footer: [Approve] [Edit & Approve] [Reject] */}
                {isPendingStatus && (
                  <div className="mt-3.5 pt-3 border-t border-border/60 flex flex-wrap items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenReject(rec)}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 font-medium text-xs transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => handleOpenEdit(rec)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-700 font-medium text-xs transition-colors disabled:opacity-50"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Refine & Approve</span>
                    </button>

                    <button
                      onClick={() => handleInitiateApprove(rec)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {rec.type === "MILESTONE"
                          ? "Approve as Milestone"
                          : "Approve Recommendation"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* 1. Milestone Creation Confirmation Modal */}
      {milestoneConfirmRec && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-emerald-800">
              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="font-semibold text-ink text-sm">
                  Create Permanent Milestone?
                </h4>
                <p className="text-xs text-stone-500">
                  Cadet: {studentName}
                </p>
              </div>
            </div>

            <div className="p-3 bg-workspace rounded-lg border border-border text-xs space-y-1.5">
              <p className="font-semibold text-stone-800">
                {milestoneConfirmRec.title}
              </p>
              <p className="text-stone-600">
                {milestoneConfirmRec.suggested_action}
              </p>
              <div className="pt-1 flex items-center gap-2">
                <Badge variant="emerald" size="sm">
                  Priority: {milestoneConfirmRec.priority}
                </Badge>
                <span className="text-[10px] text-stone-400">
                  Provenance will be recorded as AI_GENERATED
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 font-medium leading-relaxed bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60">
              Approving this recommendation will create a permanent milestone for this student.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/80">
              <button
                onClick={() => setMilestoneConfirmRec(null)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 text-xs font-medium hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={() => milestoneConfirmRec.id && executeApprove(milestoneConfirmRec.id)}
                disabled={actionLoadingId === milestoneConfirmRec.id || !milestoneConfirmRec.id}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {actionLoadingId === milestoneConfirmRec.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Confirm & Create Milestone</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Refine & Approve Modal */}
      {editModalRec && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                <Edit3 className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h4 className="font-semibold text-ink text-sm">
                  Refine & Approve Recommendation
                </h4>
                <p className="text-xs text-stone-500">
                  Provenance will be recorded as MENTOR_ENTERED
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Title / Goal
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-workspace text-ink focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Suggested Action / Success Criteria
                </label>
                <textarea
                  rows={3}
                  value={editForm.suggested_action}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      suggested_action: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-workspace text-ink focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={editForm.priority}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        priority: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-workspace text-ink focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Type
                  </label>
                  <div className="px-3 py-2 rounded-lg border border-border/80 bg-stone-100 text-stone-600 font-mono text-[11px]">
                    {editModalRec.type}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Mentor Review Notes (Why this was modified)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Adjusted timeline to align with DGCA exam schedule."
                  value={editForm.review_notes}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      review_notes: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-workspace text-ink focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/80">
              <button
                onClick={() => setEditModalRec(null)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 text-xs font-medium hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={executeEditAndApprove}
                disabled={actionLoadingId === editModalRec.id || !editForm.title.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {actionLoadingId === editModalRec.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Save Refinement & Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Rejection Modal */}
      {rejectModalRec && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-stone-700">
              <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-stone-500" />
              </div>
              <div>
                <h4 className="font-semibold text-ink text-sm">
                  Reject AI Recommendation
                </h4>
                <p className="text-xs text-stone-500">
                  No records will be created or modified in student database
                </p>
              </div>
            </div>

            <div className="p-3 bg-workspace rounded-lg border border-border text-xs">
              <p className="font-semibold text-stone-800">{rejectModalRec.title}</p>
              <p className="text-stone-500 mt-1">{rejectModalRec.rationale}</p>
            </div>

            <div className="text-xs space-y-1.5">
              <label className="block font-semibold text-stone-700">
                Reason for Rejection (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Cadet has already completed this outside curriculum."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-workspace text-ink focus:outline-hidden focus:ring-2 focus:ring-stone-400/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/80">
              <button
                onClick={() => setRejectModalRec(null)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 text-xs font-medium hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={executeReject}
                disabled={actionLoadingId === rejectModalRec.id}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-800 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {actionLoadingId === rejectModalRec.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
