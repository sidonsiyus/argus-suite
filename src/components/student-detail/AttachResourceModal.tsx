"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  Search,
  Check,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
  Building,
} from "lucide-react";
import { ResourceItem } from "@/lib/resources/types";
import { linkMilestoneResourceAction, getResourcesAction } from "@/app/actions/resources";
import { Badge } from "@/components/ui/Badge";

interface AttachResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId: string;
  milestoneTitle: string;
  studentId: string;
  onSuccess?: () => void;
}

export function AttachResourceModal({
  isOpen,
  onClose,
  milestoneId,
  milestoneTitle,
  studentId,
  onSuccess,
}: AttachResourceModalProps) {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      setSelectedResourceId(null);
      setSearch("");
      getResourcesAction({ status: "active" })
        .then((res) => {
          setResources(res || []);
          if (res && res.length > 0) setSelectedResourceId(res[0].id);
        })
        .catch(() => setError("Failed to load catalog resources."))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = resources.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      (r.provider && r.provider.toLowerCase().includes(q)) ||
      r.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleLink = async () => {
    if (!selectedResourceId) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await linkMilestoneResourceAction(milestoneId, selectedResourceId, studentId);
      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || "Failed to attach resource.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className="bg-surface rounded-2xl border border-border max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="attach-resource-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-workspace">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="attach-resource-title" className="text-base font-semibold text-ink">
                Prescribe Catalog Resource
              </h2>
              <p className="text-xs text-ink-muted line-clamp-1">
                Milestone: {milestoneTitle}
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog resources by title, provider, tag..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            />
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-2.5" />
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-ink-muted flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-accent-emerald" />
              <span>Loading resources catalog...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-ink-muted border border-dashed border-border rounded-xl bg-workspace">
              No matching resources found in library.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {filtered.map((r) => {
                const isSelected = selectedResourceId === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedResourceId(r.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? "bg-accent-emerald/5 border-accent-emerald"
                        : "bg-surface border-border hover:border-border-strong"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="stone" size="sm" className="text-[10px]">
                          {r.resource_type}
                        </Badge>
                        {r.provider && (
                          <span className="text-[11px] text-ink-muted flex items-center gap-1">
                            <Building className="w-3 h-3 text-stone-400" />
                            {r.provider}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-ink line-clamp-1">{r.title}</p>
                    </div>

                    <input
                      type="radio"
                      name="selectedResource"
                      checked={isSelected}
                      onChange={() => setSelectedResourceId(r.id)}
                      className="w-4 h-4 text-accent-emerald focus:ring-accent-emerald mt-0.5"
                    />
                  </div>
                );
              })}
            </div>
          )}

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
              type="button"
              onClick={handleLink}
              disabled={submitting || !selectedResourceId}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Attaching...</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Attach Resource</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
