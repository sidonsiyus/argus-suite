"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  ExternalLink,
  Globe,
  Building,
  Tag,
  Calendar,
  ShieldCheck,
  Edit,
  Archive,
  RotateCcw,
  Target,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  Download,
  FileCheck,
  Eye,
} from "lucide-react";
import { ResourceItem, RESOURCE_CATEGORIES, RESOURCE_TYPES } from "@/lib/resources/types";
import { Badge } from "@/components/ui/Badge";
import {
  archiveResourceAction,
  unlinkMilestoneResourceAction,
  getResourceFileUrlAction,
  deleteResourceAction,
} from "@/app/actions/resources";

interface CadetSummary {
  id: string;
  full_name: string;
  reg_no: string;
  career_goal?: string;
}

interface ResourceDetailDrawerProps {
  resource: ResourceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (resource: ResourceItem) => void;
  onOpenLinkModal: (resource: ResourceItem) => void;
  onResourceUpdated: () => void;
  studentsIndex: CadetSummary[];
}

export function ResourceDetailDrawer({
  resource,
  isOpen,
  onClose,
  onEdit,
  onOpenLinkModal,
  onResourceUpdated,
}: ResourceDetailDrawerProps) {
  const [archiving, setArchiving] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !resource) return null;

  const categoryLabel =
    RESOURCE_CATEGORIES.find((c) => c.value === resource.category)?.label || resource.category;

  const typeLabel =
    RESOURCE_TYPES.find((t) => t.value === resource.resource_type)?.label || resource.resource_type;

  const handleToggleArchive = async () => {
    setArchiving(true);
    setError(null);
    try {
      const res = await archiveResourceAction(resource.id, !resource.is_active);
      if (res.success) {
        onResourceUpdated();
        onClose();
      } else {
        setError(res.error || "Failed to update archive status.");
      }
    } catch {
      setError("Failed to archive resource.");
    } finally {
      setArchiving(false);
    }
  };

  const handleUnlinkMilestone = async (milestoneId: string, studentId: string) => {
    setUnlinkingId(milestoneId);
    setError(null);
    try {
      const res = await unlinkMilestoneResourceAction(milestoneId, resource.id, studentId);
      if (res.success) {
        onResourceUpdated();
      } else {
        setError(res.error || "Failed to unlink resource.");
      }
    } catch {
      setError("Failed to unlink resource.");
    } finally {
      setUnlinkingId(null);
    }
  };

  const handleViewDoc = async () => {
    setError(null);
    try {
      const res = await getResourceFileUrlAction(resource.id, false);
      if (res.success && res.url) {
        window.open(res.url, "_blank", "noopener,noreferrer");
      } else {
        setError(res.error || "Failed to retrieve view link.");
      }
    } catch {
      setError("Error previewing resource document.");
    }
  };

  const handleDownloadDoc = async () => {
    setError(null);
    try {
      const res = await getResourceFileUrlAction(resource.id, true);
      if (res.success && res.url) {
        const link = document.createElement("a");
        link.href = res.url;
        link.download = resource.title || "resource-document";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError(res.error || "Failed to retrieve download link.");
      }
    } catch {
      setError("Error downloading resource document.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${resource.title}"? This cannot be undone.`)) {
      return;
    }
    setError(null);
    try {
      const res = await deleteResourceAction(resource.id);
      if (res.success) {
        onResourceUpdated();
        onClose();
      } else {
        setError(res.error || "Failed to delete resource.");
      }
    } catch {
      setError("Error deleting resource.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-surface border-l border-border h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resource-drawer-title"
      >
        {/* Header */}
        <div>
          <div className="p-6 border-b border-border bg-workspace flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={resource.is_active ? "emerald" : "stone"} size="sm">
                  {resource.is_active ? "Active" : "Archived"}
                </Badge>
                <Badge variant="stone" size="sm">
                  {typeLabel}
                </Badge>
                <Badge variant="stone" size="sm" className="font-mono text-[10px]">
                  {resource.provenance}
                </Badge>
              </div>
              <h2 id="resource-drawer-title" className="text-lg font-bold text-ink leading-tight">
                {resource.title}
              </h2>
              {resource.provider && (
                <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <Building className="w-3.5 h-3.5 text-stone-400" />
                  <span>{resource.provider}</span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="m-6 mb-0 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Body Content */}
          <div className="p-6 space-y-6">
            {/* Resource Document or External URL */}
            {resource.url && (
              resource.url.startsWith("resources/") ? (
                <div className="p-4 rounded-xl bg-workspace border border-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCheck className="w-4 h-4 text-accent-emerald shrink-0" />
                    <span className="text-xs text-ink font-semibold truncate">{resource.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleViewDoc}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-accent-emerald bg-accent-emerald/10 hover:bg-accent-emerald/20 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadDoc}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-ink-secondary hover:text-ink bg-surface-subtle hover:bg-border transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-workspace border border-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Globe className="w-4 h-4 text-accent-emerald shrink-0" />
                    <span className="text-xs text-ink font-mono truncate">{resource.url}</span>
                  </div>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-accent-emerald bg-accent-emerald/10 hover:bg-accent-emerald/20 transition-colors shrink-0"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )
            )}

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                Description & Mentoring Notes
              </h4>
              <p className="text-sm text-stone-600 leading-relaxed bg-surface-subtle/40 p-3.5 rounded-xl border border-border/70">
                {resource.description || "No specific description provided by author."}
              </p>
            </div>

            {/* Classification & Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-border bg-workspace space-y-1">
                <span className="text-ink-muted block text-[11px]">Category</span>
                <span className="font-medium text-ink">{categoryLabel}</span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-workspace space-y-1">
                <span className="text-ink-muted block text-[11px]">Visibility</span>
                <span className="font-medium text-ink">
                  {resource.is_public ? "All Mentors (Public)" : "Restricted"}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-workspace space-y-1">
                <span className="text-ink-muted block text-[11px]">Created At</span>
                <span className="font-mono text-ink">
                  {new Date(resource.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-workspace space-y-1">
                <span className="text-ink-muted block text-[11px]">Total Prescriptions</span>
                <span className="font-semibold text-accent-emerald font-mono">
                  {resource.usage_count || 0} active milestones
                </span>
              </div>
            </div>

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                  Competency Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Milestones Section */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
                    Linked Cadet Milestones ({resource.linked_milestones?.length || 0})
                  </h4>
                  <p className="text-[11px] text-ink-muted">
                    Cadets currently prescribed this resource
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenLinkModal(resource)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent-emerald bg-accent-emerald/10 hover:bg-accent-emerald/20 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Prescribe</span>
                </button>
              </div>

              {(!resource.linked_milestones || resource.linked_milestones.length === 0) ? (
                <div className="p-4 rounded-xl border border-dashed border-border bg-workspace text-center">
                  <Target className="w-5 h-5 text-ink-muted mx-auto mb-1" />
                  <p className="text-xs text-ink-muted">
                    Not currently attached to any cadet milestones.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {resource.linked_milestones.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-border bg-surface flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink">{item.student_name}</span>
                          <span className="text-ink-muted font-mono text-[10px]">
                            ({item.reg_no})
                          </span>
                        </div>
                        <p className="text-stone-600 line-clamp-1">{item.title}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUnlinkMilestone(item.id, item.student_id)}
                        disabled={unlinkingId === item.id}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                        title="Unlink resource from this milestone"
                      >
                        {unlinkingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border bg-workspace flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleToggleArchive}
            disabled={archiving}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl border transition-colors ${
              resource.is_active
                ? "text-stone-700 bg-surface border-border hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                : "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            {archiving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : resource.is_active ? (
              <>
                <Archive className="w-3.5 h-3.5" />
                <span>Archive Resource</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Resource</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(resource);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-ink bg-surface border border-border hover:bg-surface-subtle rounded-xl transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-stone-500" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
