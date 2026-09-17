"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Briefcase,
  Calendar,
  Building,
  FileText,
  AlertCircle,
  Loader2,
  Check,
  Compass,
} from "lucide-react";
import {
  StudentInternshipItem,
  InternshipOpportunityItem,
  InternshipStatus,
  INTERNSHIP_STATUSES,
  getDeadlineDisplay,
} from "@/lib/internships/types";
import {
  recordStudentInternshipAction,
  updateStudentInternshipAction,
} from "@/app/actions/internships";
import { fetchAvailableDocumentsAction } from "@/app/actions/achievements";

interface StudentInternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  opportunities?: InternshipOpportunityItem[];
  internshipToEdit?: StudentInternshipItem | null;
  onSuccess?: () => void;
}

export function StudentInternshipModal({
  isOpen,
  onClose,
  studentId,
  opportunities = [],
  internshipToEdit,
  onSuccess,
}: StudentInternshipModalProps) {
  const isEditing = Boolean(internshipToEdit);

  // Form Mode: "catalogue" vs "external"
  const [sourceType, setSourceType] = useState<"catalogue" | "external">("catalogue");
  const [selectedOppId, setSelectedOppId] = useState("");
  const [organization, setOrganization] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [status, setStatus] = useState<InternshipStatus>("APPLIED");
  const [appliedDate, setAppliedDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mentorNotes, setMentorNotes] = useState("");
  const [certificateDocId, setCertificateDocId] = useState("");

  const [availableDocs, setAvailableDocs] = useState<Array<{ id: string; title: string; category: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      fetchAvailableDocumentsAction(studentId)
        .then((docs) => setAvailableDocs(docs || []))
        .catch(() => setAvailableDocs([]));

      if (internshipToEdit) {
        if (internshipToEdit.opportunity_id) {
          setSourceType("catalogue");
          setSelectedOppId(internshipToEdit.opportunity_id);
        } else {
          setSourceType("external");
          setSelectedOppId("");
        }
        setOrganization(internshipToEdit.organization);
        setRoleDescription(internshipToEdit.role_description || "");
        setStatus(internshipToEdit.status);
        setAppliedDate(internshipToEdit.applied_date || "");
        setStartDate(internshipToEdit.start_date || "");
        setEndDate(internshipToEdit.end_date || "");
        setMentorNotes(internshipToEdit.mentor_notes || "");
        setCertificateDocId(internshipToEdit.certificate_doc_id || "");
      } else {
        setSourceType(opportunities.length > 0 ? "catalogue" : "external");
        setSelectedOppId(opportunities.length > 0 ? opportunities[0].id : "");
        setOrganization("");
        setRoleDescription("");
        setStatus("APPLIED");
        setAppliedDate(new Date().toISOString().split("T")[0]);
        setStartDate("");
        setEndDate("");
        setMentorNotes("");
        setCertificateDocId("");
      }
    }
  }, [isOpen, internshipToEdit, studentId, opportunities]);

  // When catalogue opportunity changes, auto-fill organization/role if empty or in catalogue mode
  useEffect(() => {
    if (sourceType === "catalogue" && selectedOppId) {
      const opp = opportunities.find((o) => o.id === selectedOppId);
      if (opp) {
        setOrganization(opp.organization);
        setRoleDescription(opp.title);
      }
    }
  }, [selectedOppId, sourceType, opportunities]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sourceType === "external" && !organization.trim()) {
      setError("Organization name is required for external internships.");
      return;
    }

    if (sourceType === "catalogue" && !selectedOppId && !organization.trim()) {
      setError("Please select an opportunity or switch to external entry.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let res;
      if (isEditing && internshipToEdit) {
        res = await updateStudentInternshipAction(internshipToEdit.id, studentId, {
          organization: organization.trim(),
          role_description: roleDescription.trim() || undefined,
          applied_date: appliedDate || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          mentor_notes: mentorNotes.trim() || undefined,
          certificate_doc_id: certificateDocId || undefined,
        });
      } else {
        res = await recordStudentInternshipAction(studentId, {
          opportunity_id: sourceType === "catalogue" && selectedOppId ? selectedOppId : null,
          organization: organization.trim(),
          role_description: roleDescription.trim() || undefined,
          status,
          applied_date: appliedDate || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          mentor_notes: mentorNotes.trim() || undefined,
          certificate_doc_id: certificateDocId || undefined,
        });
      }

      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || "Failed to record internship.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const selectedOpp = opportunities.find((o) => o.id === selectedOppId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className="bg-surface rounded-2xl border border-border max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="internship-form-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-workspace">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 id="internship-form-title" className="text-base font-semibold text-ink">
                {isEditing ? "Edit Student Internship" : "Record Student Internship"}
              </h2>
              <p className="text-xs text-ink-muted">
                Track industry attachments, airline operations training & corporate placements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sourcing Mode Switcher (Catalogue vs External) */}
          {!isEditing && (
            <div className="p-1.5 rounded-xl bg-workspace border border-border flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSourceType("catalogue")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  sourceType === "catalogue"
                    ? "bg-surface text-ink shadow-sm border border-border"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-accent-emerald" />
                <span>From Catalogue</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceType("external")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  sourceType === "external"
                    ? "bg-surface text-ink shadow-sm border border-border"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <Building className="w-3.5 h-3.5 text-ink-muted" />
                <span>External / Direct Sourced</span>
              </button>
            </div>
          )}

          {/* Catalogue Selector */}
          {sourceType === "catalogue" && !isEditing && (
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Select Opportunity <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedOppId}
                onChange={(e) => setSelectedOppId(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
              >
                {opportunities.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.organization} — {opp.title} ({opp.location || "Remote"})
                  </option>
                ))}
              </select>
              {selectedOpp && selectedOpp.application_deadline && (
                <div className="mt-1.5 text-[11px] text-ink-muted flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-accent-emerald" />
                  <span>
                    Deadline: {getDeadlineDisplay(selectedOpp.application_deadline).formattedDate} (
                    {getDeadlineDisplay(selectedOpp.application_deadline).text})
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Organization Name */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Organization / Airline / Firm <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. IndiGo, Air India, Bangalore International Airport Ltd"
              maxLength={150}
              required
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            />
          </div>

          {/* Role Description */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Role / Attachment Title
            </label>
            <input
              type="text"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="e.g. Flight Dispatch Trainee, Ground Operations Intern"
              maxLength={200}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            />
          </div>

          {/* Application Status & Applied Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Current Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                disabled={isEditing} // Status transitions for existing records are managed via controlled transition action
                onChange={(e) => setStatus(e.target.value as InternshipStatus)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald disabled:opacity-60"
              >
                {INTERNSHIP_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Date Applied
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={appliedDate}
                  onChange={(e) => setAppliedDate(e.target.value)}
                  className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                />
                <Calendar className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Start and End Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
              />
            </div>
          </div>

          {/* Mentor Notes */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Mentor Operational Notes
            </label>
            <textarea
              value={mentorNotes}
              onChange={(e) => setMentorNotes(e.target.value)}
              placeholder="Candidate interview preparation, reference letters issued, or placement feedback..."
              rows={2}
              maxLength={2000}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald resize-none"
            />
          </div>

          {/* Completion Certificate Document */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Completion Certificate / Offer Letter
            </label>
            <div className="relative">
              <select
                value={certificateDocId}
                onChange={(e) => setCertificateDocId(e.target.value)}
                className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
              >
                <option value="">No document attached</option>
                {availableDocs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.category})
                  </option>
                ))}
              </select>
              <FileText className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
            </div>
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
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? "Update Internship" : "Save Internship"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
