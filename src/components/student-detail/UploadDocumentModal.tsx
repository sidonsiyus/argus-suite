"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  Loader2,
  Briefcase,
  Target,
  FileCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { uploadStudentDocumentAction } from "@/app/actions/documents";
import {
  StudentDocumentItem,
  GENERAL_DOCUMENT_CATEGORIES,
  INTERNSHIP_DOCUMENT_CATEGORIES,
  ALL_DOCUMENT_CATEGORIES,
  DocumentCategory,
  formatFileSize,
} from "@/lib/documents/types";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName?: string;
  internships?: Array<{ id: string; organization: string; role_description?: string | null }>;
  milestones?: Array<{ id: string; title: string; category?: string; provenance?: string }>;
  initialInternshipId?: string;
  initialMilestoneId?: string;
  scope?: "general" | "internship" | "poa" | "all";
  onSuccess?: (newDoc?: StudentDocumentItem | null) => void;
}

export function UploadDocumentModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  internships = [],
  milestones = [],
  initialInternshipId,
  initialMilestoneId,
  scope = "all",
  onSuccess,
}: UploadDocumentModalProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const isInternshipScoped = scope === "internship" || Boolean(initialInternshipId);
  const [category, setCategory] = useState<string>(
    isInternshipScoped ? "INTERNSHIP_OFFER_LETTER" : "ACADEMIC_DOCUMENT"
  );
  const [description, setDescription] = useState("");
  const [internshipId, setInternshipId] = useState<string>(initialInternshipId || "");
  const [milestoneId, setMilestoneId] = useState<string>(initialMilestoneId || "");

  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter out historical baseline milestones for association
  const eligibleMilestones = milestones.filter(
    (m) => m.provenance !== "HISTORICAL_PROFILE" && m.category !== "Action Plan"
  );

  const categoryOptions = isInternshipScoped
    ? INTERNSHIP_DOCUMENT_CATEGORIES
    : scope === "poa"
    ? ALL_DOCUMENT_CATEGORIES
    : ALL_DOCUMENT_CATEGORIES;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!allowed.includes(file.type)) {
      setError("Unsupported format. Please upload a PDF, DOC, or DOCX document.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10 MB limit.");
      return;
    }

    setSelectedFile(file);
    if (!title) {
      // Clean extension from filename as default title
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setTitle(cleanName);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a document to upload.");
      return;
    }

    if (!title.trim()) {
      setError("Document title is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("studentId", studentId);
      formData.append("title", title.trim());
      formData.append("category", category);
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      if (internshipId) {
        formData.append("internshipId", internshipId);
      }
      if (milestoneId) {
        formData.append("milestoneId", milestoneId);
      }

      const res = await uploadStudentDocumentAction(formData);

      if (res.success) {
        toast.success(`Document "${title.trim()}" uploaded securely.`);
        onSuccess?.(res.document);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-doc-modal-title"
        className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-workspace/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 id="upload-doc-modal-title" className="text-base font-bold text-ink">
                {isInternshipScoped ? "Upload Internship Document" : "Upload Cadet Document"}
              </h2>
              <p className="text-xs text-ink-muted">
                {studentName ? `For ${studentName}` : "Secure Student Documents"}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop File Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center space-y-2 ${
              isDragging
                ? "border-accent-emerald bg-accent-emerald/10"
                : selectedFile
                ? "border-accent-emerald/60 bg-accent-emerald/5"
                : "border-border hover:border-accent-emerald/50 bg-workspace/50 hover:bg-workspace"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-emerald/20 flex items-center justify-center text-accent-emerald">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-ink truncate max-w-[260px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-ink-muted font-mono">
                    {formatFileSize(selectedFile.size)} • Click or drag to replace
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="w-9 h-9 rounded-xl bg-surface mx-auto flex items-center justify-center text-ink-muted border border-border">
                  <Upload className="w-4 h-4 text-accent-emerald" />
                </div>
                <p className="text-xs font-semibold text-ink">
                  Click to select or drag and drop document
                </p>
                <p className="text-[11px] text-ink-muted">
                  Supports PDF, DOC, and DOCX (Max 10 MB)
                </p>
              </div>
            )}
          </div>

          {/* Document Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink">
              Document Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DGCA Flight Training Certificate"
              className="w-full px-3 py-2 rounded-xl border border-border bg-workspace text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/30 focus:border-accent-emerald transition-all"
              required
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-workspace text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/30 focus:border-accent-emerald transition-all"
              required
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink">
              Description <span className="text-ink-muted font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add mentor observations or context regarding this document..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-border bg-workspace text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/30 focus:border-accent-emerald transition-all resize-none"
            />
          </div>

          {/* Optional Context Associations (Internship & POA) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Internship Association */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-ink flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-accent-emerald" />
                <span>Related Internship</span>
              </label>
              {initialInternshipId ? (
                <div className="px-3 py-2 rounded-xl border border-border bg-workspace/80 text-xs font-medium text-ink truncate">
                  {internships.find((i) => i.id === initialInternshipId)?.organization ||
                    "Current Internship"}
                </div>
              ) : (
                <select
                  value={internshipId}
                  onChange={(e) => setInternshipId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-workspace text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/30 focus:border-accent-emerald transition-all"
                >
                  <option value="">None (General Document)</option>
                  {internships.map((int) => (
                    <option key={int.id} value={int.id}>
                      {int.organization} {int.role_description ? `(${int.role_description})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* POA / Milestone Association */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-ink flex items-center gap-1">
                <Target className="w-3 h-3 text-accent-emerald" />
                <span>Related POA</span>
              </label>
              {initialMilestoneId ? (
                <div className="px-3 py-2 rounded-xl border border-border bg-workspace/80 text-xs font-medium text-ink truncate">
                  {eligibleMilestones.find((m) => m.id === initialMilestoneId)?.title ||
                    "Current POA"}
                </div>
              ) : (
                <select
                  value={milestoneId}
                  onChange={(e) => setMilestoneId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-workspace text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/30 focus:border-accent-emerald transition-all"
                >
                  <option value="">None (Standalone)</option>
                  {eligibleMilestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || !title.trim() || submitting}
              className="cursor-pointer bg-accent-emerald hover:bg-accent-emerald/90 text-white text-xs gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading securely...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Document</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
