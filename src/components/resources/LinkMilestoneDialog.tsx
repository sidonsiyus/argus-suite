"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Target,
  User,
  Search,
  Check,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";
import { ResourceItem } from "@/lib/resources/types";
import {
  linkMilestoneResourceAction,
  getActiveMilestonesForCadetAction,
} from "@/app/actions/resources";

interface CadetSummary {
  id: string;
  full_name: string;
  reg_no: string;
  career_goal?: string;
}

interface LinkMilestoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ResourceItem | null;
  studentsIndex: CadetSummary[];
  onSuccess?: () => void;
}

export function LinkMilestoneDialog({
  isOpen,
  onClose,
  resource,
  studentsIndex,
  onSuccess,
}: LinkMilestoneDialogProps) {
  const [searchCadet, setSearchCadet] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<CadetSummary | null>(null);
  const [milestones, setMilestones] = useState<Array<{ id: string; title: string; priority: string; status: string }>>([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);

  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedStudent(null);
    setMilestones([]);
    setSelectedMilestoneId(null);
    setSearchCadet("");
    setError(null);
  }, [isOpen, resource]);

  const filteredCadets = (studentsIndex || []).filter((s) => {
    if (!searchCadet.trim()) return true;
    const q = searchCadet.toLowerCase();
    return s.full_name.toLowerCase().includes(q) || s.reg_no.toLowerCase().includes(q);
  }).slice(0, 8);

  const handleSelectCadet = async (cadet: CadetSummary) => {
    setSelectedStudent(cadet);
    setSelectedMilestoneId(null);
    setLoadingMilestones(true);
    setError(null);

    try {
      const res = await getActiveMilestonesForCadetAction(cadet.id);
      setMilestones(res);
      if (res.length > 0) {
        setSelectedMilestoneId(res[0].id);
      }
    } catch {
      setError("Failed to load cadet action plans.");
    } finally {
      setLoadingMilestones(false);
    }
  };

  const handleLink = async () => {
    if (!resource || !selectedMilestoneId || !selectedStudent) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await linkMilestoneResourceAction(
        selectedMilestoneId,
        resource.id,
        selectedStudent.id
      );

      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || "Failed to link resource.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !resource) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className="bg-surface rounded-2xl border border-border max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="link-milestone-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-workspace">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 id="link-milestone-title" className="text-base font-semibold text-ink">
                Prescribe to Milestone
              </h2>
              <p className="text-xs text-ink-muted line-clamp-1">
                Resource: {resource.title}
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

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Select Cadet */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              1. Select Cadet
            </label>
            <div className="relative mb-2">
              <input
                type="text"
                value={searchCadet}
                onChange={(e) => setSearchCadet(e.target.value)}
                placeholder="Search cadet by name or reg no..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
              />
              <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-2.5" />
            </div>

            <div className="max-h-40 overflow-y-auto border border-border rounded-xl divide-y divide-border bg-workspace">
              {filteredCadets.length === 0 ? (
                <p className="p-3 text-xs text-ink-muted text-center">No cadets matched.</p>
              ) : (
                filteredCadets.map((cadet) => {
                  const isSelected = selectedStudent?.id === cadet.id;
                  return (
                    <button
                      key={cadet.id}
                      type="button"
                      onClick={() => handleSelectCadet(cadet)}
                      className={`w-full p-2.5 text-left flex items-center justify-between text-xs hover:bg-surface transition-colors ${
                        isSelected ? "bg-accent-emerald/10 font-medium" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-ink-muted" />
                        <span className="text-ink">{cadet.full_name}</span>
                        <span className="text-ink-muted font-mono text-[10px]">
                          ({cadet.reg_no})
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-accent-emerald" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Step 2: Select Milestone */}
          {selectedStudent && (
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                2. Select Active Milestone for {selectedStudent.full_name}
              </label>

              {loadingMilestones ? (
                <div className="p-6 text-center text-xs text-ink-muted flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-accent-emerald" />
                  <span>Loading action plans...</span>
                </div>
              ) : milestones.length === 0 ? (
                <p className="p-4 rounded-xl border border-dashed border-border text-xs text-ink-muted text-center bg-workspace">
                  This cadet has no active milestones. Create a milestone in Student 360 first.
                </p>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {milestones.map((m) => {
                    const isSelected = selectedMilestoneId === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMilestoneId(m.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 ${
                          isSelected
                            ? "bg-accent-emerald/5 border-accent-emerald"
                            : "bg-surface border-border hover:border-border-strong"
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <p className="text-xs font-medium text-ink line-clamp-1">{m.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-ink-muted font-mono">
                            <span className="uppercase px-1.5 py-0.2 rounded bg-stone-100">
                              {m.status}
                            </span>
                            <span>{m.priority} PRIORITY</span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="milestone"
                          checked={isSelected}
                          onChange={() => setSelectedMilestoneId(m.id)}
                          className="w-4 h-4 text-accent-emerald focus:ring-accent-emerald mt-0.5"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLink}
              disabled={submitting || !selectedMilestoneId}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Linking...</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Link Resource</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
