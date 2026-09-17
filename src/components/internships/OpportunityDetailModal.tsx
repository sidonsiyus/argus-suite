"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Building,
  Calendar,
  Globe,
  MapPin,
  ExternalLink,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  Archive,
  RotateCcw,
  Edit2,
  FileText,
} from "lucide-react";
import {
  InternshipOpportunityItem,
  INTERNSHIP_STATUSES,
  getDeadlineDisplay,
} from "@/lib/internships/types";
import { Badge } from "@/components/ui/Badge";
import { archiveOpportunityAction } from "@/app/actions/internships";

interface OpportunityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: InternshipOpportunityItem;
  onEdit: (opp: InternshipOpportunityItem) => void;
  onSuccess?: () => void;
}

export function OpportunityDetailModal({
  isOpen,
  onClose,
  opportunity,
  onEdit,
  onSuccess,
}: OpportunityDetailModalProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const deadlineInfo = getDeadlineDisplay(opportunity.application_deadline);
  const pursuingList = opportunity.students_pursuing || [];

  const handleToggleArchive = async () => {
    setIsArchiving(true);
    setError(null);
    try {
      const res = await archiveOpportunityAction(opportunity.id, !opportunity.is_active);
      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || "Failed to update opportunity archive status.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setIsArchiving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const meta = INTERNSHIP_STATUSES.find((s) => s.value === status);
    const label = meta?.label || status;

    switch (status) {
      case "SELECTED":
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            {label}
          </span>
        );
      case "INTERVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            {label}
          </span>
        );
      case "APPLIED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <TrendingUp className="w-3 h-3 text-sky-600" />
            {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            {label}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className="bg-surface rounded-2xl border border-border max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="opportunity-detail-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between bg-workspace">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="stone" size="sm">
                {opportunity.work_mode.replace("_", " ")}
              </Badge>
              {!opportunity.is_active && (
                <Badge variant="stone" size="sm" className="bg-stone-200 text-stone-600">
                  Archived
                </Badge>
              )}
            </div>
            <h2 id="opportunity-detail-title" className="text-base font-bold text-ink">
              {opportunity.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-ink-muted">
              <span className="font-semibold text-ink">{opportunity.organization}</span>
              {opportunity.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {opportunity.location}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Key Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-workspace border border-border text-xs">
            <div>
              <span className="text-[10px] text-ink-muted uppercase tracking-wider block font-medium">
                Deadline
              </span>
              <span className="font-mono font-semibold text-ink">
                {deadlineInfo.formattedDate}
              </span>
              <span
                className={`block text-[11px] font-mono mt-0.5 ${
                  deadlineInfo.isClosingSoon
                    ? "text-amber-700 font-semibold"
                    : deadlineInfo.isPassed
                    ? "text-rose-600"
                    : "text-ink-muted"
                }`}
              >
                {deadlineInfo.text}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-ink-muted uppercase tracking-wider block font-medium">
                Pursuing Cadets
              </span>
              <span className="font-mono font-semibold text-ink text-sm">
                {pursuingList.length} Students
              </span>
              <span className="block text-[11px] text-ink-muted mt-0.5">
                Across batches
              </span>
            </div>

            <div>
              <span className="text-[10px] text-ink-muted uppercase tracking-wider block font-medium">
                Official Application Link
              </span>
              {opportunity.application_url ? (
                <a
                  href={opportunity.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent-emerald hover:underline font-medium mt-0.5"
                >
                  <span>Portal Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-ink-muted mt-0.5 block">Direct / On-campus</span>
              )}
            </div>
          </div>

          {/* Description */}
          {opportunity.description && (
            <div>
              <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Overview & Description
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed whitespace-pre-line bg-surface p-3.5 rounded-xl border border-border/80">
                {opportunity.description}
              </p>
            </div>
          )}

          {/* Requirements */}
          {opportunity.requirements && (
            <div>
              <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Qualifications & Prerequisites
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed whitespace-pre-line bg-surface p-3.5 rounded-xl border border-border/80">
                {opportunity.requirements}
              </p>
            </div>
          )}

          {/* Students Pursuing List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent-emerald" />
                <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Students Pursuing This Opportunity ({pursuingList.length})
                </h3>
              </div>
            </div>

            {pursuingList.length === 0 ? (
              <div className="p-4 rounded-xl bg-workspace/60 border border-dashed border-border text-center text-xs text-ink-muted">
                No students are currently linked to this catalogue opportunity.
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                {pursuingList.map((st) => (
                  <div
                    key={st.internship_id}
                    className="p-3 bg-surface hover:bg-surface-subtle flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-ink">{st.full_name}</div>
                      <div className="text-[10px] text-ink-muted font-mono">{st.reg_no}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(st.status)}
                      <Link
                        href={`/students/${st.student_id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-emerald hover:underline shrink-0"
                      >
                        <span>Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-workspace">
          <button
            onClick={handleToggleArchive}
            disabled={isArchiving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-subtle border border-border rounded-xl transition-colors disabled:opacity-50"
          >
            {opportunity.is_active ? (
              <>
                <Archive className="w-3.5 h-3.5" />
                <span>Archive Opportunity</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore to Active</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(opportunity);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-ink bg-surface hover:bg-surface-subtle border border-border rounded-xl transition-colors shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
