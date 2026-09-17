"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  ExternalLink,
  Trash2,
  Calendar,
  User,
  Briefcase,
  Target,
  Loader2,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";
import {
  StudentDocumentItem,
  getCategoryLabel,
  formatFileSize,
} from "@/lib/documents/types";
import {
  getDocumentViewUrlAction,
  deleteStudentDocumentAction,
} from "@/app/actions/documents";
import { useToast } from "@/components/ui/ToastProvider";

interface DocumentCardProps {
  document: StudentDocumentItem;
  studentId: string;
  onDeleted?: (documentId: string) => void;
  showInternshipTag?: boolean;
  showPoaTag?: boolean;
}

export function DocumentCard({
  document: doc,
  studentId,
  onDeleted,
  showInternshipTag = true,
  showPoaTag = true,
}: DocumentCardProps) {
  const toast = useToast();
  const [isViewing, setIsViewing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isPdf = doc.mime_type?.toLowerCase().includes("pdf");
  const isWord =
    doc.mime_type?.toLowerCase().includes("word") ||
    doc.mime_type?.toLowerCase().includes("officedocument");

  const handleView = async () => {
    setIsViewing(true);
    try {
      const res = await getDocumentViewUrlAction(doc.id, studentId, false);
      if (res.success && res.signedUrl) {
        window.open(res.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.error(res.error || "Could not retrieve secure viewing URL.");
      }
    } catch {
      toast.error("Failed to connect to document storage.");
    } finally {
      setIsViewing(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await getDocumentViewUrlAction(doc.id, studentId, true);
      if (res.success && res.signedUrl) {
        const link = window.document.createElement("a");
        link.href = res.signedUrl;
        link.download = doc.title || "document";
        link.target = "_blank";
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      } else {
        toast.error(res.error || "Could not retrieve download link.");
      }
    } catch {
      toast.error("Failed to initiate download.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteStudentDocumentAction({
        documentId: doc.id,
        studentId,
      });

      if (res.success) {
        toast.success(`"${doc.title}" has been deleted.`);
        setShowConfirmDelete(false);
        onDeleted?.(doc.id);
      } else {
        toast.error(res.error || "Could not delete document.");
      }
    } catch {
      toast.error("Failed to process deletion request.");
    } finally {
      setIsDeleting(false);
    }
  };

  const uploadDateFormatted = doc.uploaded_at
    ? new Date(doc.uploaded_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown date";

  return (
    <div className="bg-surface rounded-xl border border-border hover:border-border-strong transition-all p-4 shadow-sm flex flex-col justify-between group">
      <div>
        {/* Top Header: File Icon, Title, and Category Tag */}
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isPdf
                ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                : isWord
                ? "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20"
                : "bg-stone-50 dark:bg-surface-subtle text-stone-600 dark:text-ink-secondary border border-stone-200 dark:border-border"
            }`}
          >
            {isPdf ? (
              <FileText className="w-5 h-5" />
            ) : isWord ? (
              <FileSpreadsheet className="w-5 h-5" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4
              className="text-sm font-semibold text-ink leading-snug line-clamp-2"
              title={doc.title}
            >
              {doc.title}
            </h4>

            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20">
                {getCategoryLabel(doc.category)}
              </span>

              <span className="text-[10px] font-mono text-ink-muted">
                {formatFileSize(doc.file_size_bytes)}
              </span>
            </div>
          </div>
        </div>

        {/* Optional Description */}
        {doc.description && (
          <p className="mt-2.5 text-xs text-ink-secondary bg-surface-subtle/80 p-2 rounded-lg border border-border/60 leading-relaxed line-clamp-3">
            {doc.description}
          </p>
        )}

        {/* Associated Metadata Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
          {showInternshipTag && doc.internship && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-800 dark:text-sky-400 border border-sky-200/80 dark:border-sky-500/20 font-medium"
              title={`Attached to internship at ${doc.internship.organization}`}
            >
              <Briefcase className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="truncate max-w-[180px]">
                {doc.internship.organization}
              </span>
            </span>
          )}

          {showPoaTag && doc.milestone && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-800 dark:text-purple-400 border border-purple-200/80 dark:border-purple-500/20 font-medium"
              title={`Attached to POA: ${doc.milestone.title}`}
            >
              <Target className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="truncate max-w-[180px]">
                {doc.milestone.title}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Footer: Upload info and Actions */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2 text-xs">
        <div className="text-[11px] text-ink-muted flex items-center gap-1.5 truncate">
          <Calendar className="w-3 h-3 text-ink-muted/70 shrink-0" />
          <span className="truncate">{uploadDateFormatted}</span>
          {doc.uploader?.full_name && (
            <>
              <span className="text-border">·</span>
              <User className="w-3 h-3 text-ink-muted/70 shrink-0" />
              <span className="truncate">{doc.uploader.full_name}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleView}
            disabled={isViewing || isDownloading || isDeleting}
            className="p-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-subtle border border-transparent hover:border-border transition-colors cursor-pointer"
            title="Open Document Preview"
            aria-label="Preview document"
          >
            {isViewing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-ink-muted" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={isViewing || isDownloading || isDeleting}
            className="p-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-subtle border border-transparent hover:border-border transition-colors cursor-pointer"
            title="Download Document"
            aria-label="Download document"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-ink-muted" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => setShowConfirmDelete(true)}
            disabled={isViewing || isDownloading || isDeleting}
            className="p-1.5 rounded-lg text-ink-muted hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-colors cursor-pointer"
            title="Delete Document"
            aria-label="Delete document"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Delete */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-ink">Delete Document</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-ink">"{doc.title}"</span>? This will permanently remove the file from secure storage and record an audit log.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                disabled={isDeleting}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-ink-secondary hover:bg-surface-subtle border border-border transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer shadow-sm"
              >
                {isDeleting && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>{isDeleting ? "Deleting..." : "Confirm Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
