"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  Upload,
  Link as LinkIcon,
  FileText,
  Search,
  Check,
  Loader2,
  AlertCircle,
  Building,
} from "lucide-react";
import { ResourceItem } from "@/lib/resources/types";
import { linkMilestoneResourceAction, getResourcesAction } from "@/app/actions/resources";
import { uploadMentorDocumentAction } from "@/app/actions/documents";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/ToastProvider";

interface AttachResourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId: string;
  milestoneTitle: string;
  studentId: string;
  onSuccess?: () => void;
}

type Mode = "catalog" | "upload" | "url" | "instructions";

export function AttachResourceDrawer({
  isOpen,
  onClose,
  milestoneId,
  milestoneTitle,
  studentId,
  onSuccess,
}: AttachResourceDrawerProps) {
  const toast = useToast();
  const [mode, setMode] = useState<Mode>("catalog");

  // Catalog State
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");

  // External URL State
  const [urlTitle, setUrlTitle] = useState("");
  const [externalUrl, setExternalUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSelectedResourceId(null);
      setUploadFile(null);
      setDocTitle("");
      setUrlTitle("");
      setExternalUrl("");
      setLoadingCatalog(true);
      getResourcesAction({ status: "active" })
        .then((res) => {
          setResources(res || []);
          if (res && res.length > 0) setSelectedResourceId(res[0].id);
        })
        .catch(() => setError("Failed to load catalog resources."))
        .finally(() => setLoadingCatalog(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLinkCatalog = async () => {
    if (!selectedResourceId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await linkMilestoneResourceAction(milestoneId, selectedResourceId, studentId);
      if (res.success) {
        toast.success("Resource attached to Plan of Action.");
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

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !docTitle.trim()) {
      setError("Please select a document file and provide a title.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("studentId", studentId);
      formData.append("title", docTitle.trim());
      formData.append("milestoneId", milestoneId);

      const res = await uploadMentorDocumentAction(formData);
      if (res.success) {
        toast.success("Document uploaded and attached successfully.");
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || "Failed to upload document.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = resources.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      (r.provider && r.provider.toLowerCase().includes(q)) ||
      r.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className="bg-surface rounded-2xl border border-border max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="attach-resource-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-workspace">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="attach-resource-title" className="text-base font-semibold text-ink">
                Assign Learning Resource
              </h2>
              <p className="text-xs text-ink-muted truncate max-w-sm">
                Target: {milestoneTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b border-border bg-surface px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode("catalog")}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              mode === "catalog"
                ? "border-accent-emerald text-accent-emerald"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Resource Library</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              mode === "upload"
                ? "border-accent-emerald text-accent-emerald"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
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

          {/* Mode 1: Catalog Selection */}
          {mode === "catalog" && (
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search library by title, provider, tag..."
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                />
                <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-2.5" />
              </div>

              {loadingCatalog ? (
                <div className="p-8 text-center text-xs text-ink-muted flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-accent-emerald" />
                  <span>Loading resource library...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-center text-xs text-ink-muted border border-dashed border-border rounded-xl bg-workspace">
                  No matching resources found.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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
                          name="selectedCatalogRes"
                          checked={isSelected}
                          onChange={() => setSelectedResourceId(r.id)}
                          className="w-4 h-4 text-accent-emerald focus:ring-accent-emerald mt-0.5"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLinkCatalog}
                  disabled={submitting || !selectedResourceId}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Attaching...</span>
                    </>
                  ) : (
                    <span>Attach Library Item</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Mentor Document Upload */}
          {mode === "upload" && (
            <form onSubmit={handleUploadDocument} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Document Title</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Airline Pilot Interview Preparation Guide.pdf"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Select File (PDF or DOCX, max 10MB)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setUploadFile(f);
                      if (!docTitle) setDocTitle(f.name.replace(/\.[^/.]+$/, ""));
                    }
                  }}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-accent-emerald file:text-white hover:file:bg-accent-emerald/90 cursor-pointer"
                />
              </div>

              <p className="text-[11px] text-ink-muted">
                Uploaded files are stored privately in encrypted Supabase Storage and associated with this cadet's mentoring dossier.
              </p>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !uploadFile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading to Secure Storage...</span>
                    </>
                  ) : (
                    <span>Upload & Attach Document</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
