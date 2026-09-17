"use client";

import React, { useState, useEffect } from "react";
import { X, Building, Calendar, Globe, MapPin, AlertCircle, Loader2, Check, FileText } from "lucide-react";
import {
  InternshipOpportunityItem,
  WorkMode,
  WORK_MODES,
} from "@/lib/internships/types";
import {
  createOpportunityAction,
  updateOpportunityAction,
} from "@/app/actions/internships";

interface OpportunityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityToEdit?: InternshipOpportunityItem | null;
  onSuccess?: () => void;
}

export function OpportunityFormModal({
  isOpen,
  onClose,
  opportunityToEdit,
  onSuccess,
}: OpportunityFormModalProps) {
  const isEditing = Boolean(opportunityToEdit);

  const [organization, setOrganization] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState<WorkMode>("ON_SITE");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (opportunityToEdit) {
        setOrganization(opportunityToEdit.organization);
        setTitle(opportunityToEdit.title);
        setLocation(opportunityToEdit.location || "");
        setWorkMode(opportunityToEdit.work_mode || "ON_SITE");
        setApplicationDeadline(opportunityToEdit.application_deadline || "");
        setApplicationUrl(opportunityToEdit.application_url || "");
        setDescription(opportunityToEdit.description || "");
        setRequirements(opportunityToEdit.requirements || "");
      } else {
        setOrganization("");
        setTitle("");
        setLocation("");
        setWorkMode("ON_SITE");
        setApplicationDeadline("");
        setApplicationUrl("");
        setDescription("");
        setRequirements("");
      }
    }
  }, [isOpen, opportunityToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization.trim() || !title.trim()) {
      setError("Organization and Title are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      organization: organization.trim(),
      title: title.trim(),
      location: location.trim() || undefined,
      work_mode: workMode,
      application_deadline: applicationDeadline || undefined,
      application_url: applicationUrl.trim() || undefined,
      description: description.trim() || undefined,
      requirements: requirements.trim() || undefined,
    };

    try {
      let res;
      if (isEditing && opportunityToEdit) {
        res = await updateOpportunityAction(opportunityToEdit.id, payload);
      } else {
        res = await createOpportunityAction(payload);
      }

      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || "Failed to save opportunity.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className="bg-surface rounded-2xl border border-border max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="opportunity-form-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-workspace">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 id="opportunity-form-title" className="text-base font-semibold text-ink">
                {isEditing ? "Edit Internship Opportunity" : "Post Internship Opportunity"}
              </h2>
              <p className="text-xs text-ink-muted">
                Publish reusable corporate openings & flight training attachments to catalogue
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

          {/* Organization & Title */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Organization / Airline / Airport Authority <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. IndiGo, Air India SATS, Vistara, BIAL"
              maxLength={150}
              required
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Role Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Airport Operations Trainee — Ramp & Baggage Ops"
              maxLength={200}
              required
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            />
          </div>

          {/* Location & Work Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bangalore (BLR), Delhi"
                  maxLength={150}
                  className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                />
                <MapPin className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Work Mode
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
              >
                {WORK_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline and Application Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Application Deadline
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                  className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                />
                <Calendar className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Official Portal / Apply URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={applicationUrl}
                  onChange={(e) => setApplicationUrl(e.target.value)}
                  placeholder="https://careers.indigo.in/..."
                  className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                />
                <Globe className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Description & Scope
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide role overview, shift rotations, stipend details, or departmental exposure..."
              rows={3}
              maxLength={3000}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald resize-none"
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Eligibility & Qualifications
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="e.g. Min 65% aggregate, valid Passport, DGCA CPL ground clearance preferred..."
              rows={2}
              maxLength={2000}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald resize-none"
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
                  <span>{isEditing ? "Update Opportunity" : "Publish Opportunity"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
