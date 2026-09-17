"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Plus,
  Calendar,
  Building,
  ExternalLink,
  Download,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit2,
  Trash2,
  TrendingUp,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import {
  StudentInternshipItem,
  InternshipOpportunityItem,
  INTERNSHIP_STATUSES,
  getDeadlineDisplay,
} from "@/lib/internships/types";
import {
  StudentDocumentItem,
  getCategoryLabel,
  formatFileSize,
} from "@/lib/documents/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StudentInternshipModal } from "./StudentInternshipModal";
import { UpdateStatusModal } from "./UpdateStatusModal";
import { UploadDocumentModal } from "./UploadDocumentModal";
import { deleteStudentInternshipAction } from "@/app/actions/internships";
import {
  getDocumentViewUrlAction,
  deleteStudentDocumentAction,
} from "@/app/actions/documents";
import { useToast } from "@/components/ui/ToastProvider";

interface StudentInternshipsCardProps {
  internships: StudentInternshipItem[];
  studentId: string;
  studentName?: string;
  opportunities?: InternshipOpportunityItem[];
  documents?: StudentDocumentItem[];
  milestones?: Array<{ id: string; title: string; category?: string; provenance?: string }>;
}

function InternshipDocItem({
  doc,
  studentId,
  onDeleted,
}: {
  doc: StudentDocumentItem;
  studentId: string;
  onDeleted?: () => void;
}) {
  const toast = useToast();
  const [isViewing, setIsViewing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        toast.error(res.error || "Could not retrieve viewing link.");
      }
    } catch {
      toast.error("Failed to open document preview.");
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
        toast.error(res.error || "Could not download document.");
      }
    } catch {
      toast.error("Failed to start document download.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${doc.title}"?`)) return;
    setIsDeleting(true);
    try {
      const res = await deleteStudentDocumentAction({
        documentId: doc.id,
        studentId,
      });
      if (res.success) {
        toast.success(`"${doc.title}" has been deleted.`);
        onDeleted?.();
      } else {
        toast.error(res.error || "Could not delete document.");
      }
    } catch {
      toast.error("Failed to process document deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border/80 text-xs hover:border-border-strong transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
            isPdf
              ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
              : isWord
              ? "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400"
              : "bg-stone-50 dark:bg-surface-subtle text-stone-600 dark:text-ink-secondary"
          }`}
        >
          {isPdf ? (
            <FileText className="w-3.5 h-3.5" />
          ) : isWord ? (
            <FileSpreadsheet className="w-3.5 h-3.5" />
          ) : (
            <FileText className="w-3.5 h-3.5" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-ink truncate max-w-[200px]" title={doc.title}>
              {doc.title}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium">
              {getCategoryLabel(doc.category)}
            </span>
          </div>
          <span className="text-[10px] font-mono text-ink-muted">
            {formatFileSize(doc.file_size_bytes)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2">
        <button
          onClick={handleView}
          disabled={isViewing || isDownloading || isDeleting}
          className="p-1 rounded hover:bg-surface-subtle text-ink-secondary hover:text-ink transition-colors cursor-pointer"
          title="Preview Document"
        >
          {isViewing ? <Loader2 className="w-3 h-3 animate-spin text-ink-muted" /> : <ExternalLink className="w-3 h-3" />}
        </button>
        <button
          onClick={handleDownload}
          disabled={isViewing || isDownloading || isDeleting}
          className="p-1 rounded hover:bg-surface-subtle text-ink-secondary hover:text-ink transition-colors cursor-pointer"
          title="Download Document"
        >
          {isDownloading ? <Loader2 className="w-3 h-3 animate-spin text-ink-muted" /> : <Download className="w-3 h-3" />}
        </button>
        <button
          onClick={handleDelete}
          disabled={isViewing || isDownloading || isDeleting}
          className="p-1 rounded hover:bg-rose-50 text-ink-muted hover:text-rose-600 transition-colors cursor-pointer"
          title="Delete Document"
        >
          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin text-rose-500" /> : <Trash2 className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}

export function StudentInternshipsCard({
  internships,
  studentId,
  studentName,
  opportunities = [],
  documents = [],
  milestones = [],
}: StudentInternshipsCardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [internshipToEdit, setInternshipToEdit] = useState<StudentInternshipItem | null>(null);
  const [statusModalTarget, setStatusModalTarget] = useState<StudentInternshipItem | null>(null);
  const [uploadModalTarget, setUploadModalTarget] = useState<StudentInternshipItem | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async (item: StudentInternshipItem) => {
    if (!confirm(`Remove internship record at "${item.organization}"?`)) return;
    setActionLoadingId(item.id);
    setErrorMessage(null);

    try {
      const res = await deleteStudentInternshipAction(item.id, studentId);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to delete internship record.");
      }
    } catch {
      setErrorMessage("An unexpected network error occurred.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const meta = INTERNSHIP_STATUSES.find((s) => s.value === status);
    const label = meta?.label || status;

    switch (status) {
      case "SELECTED":
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            {label}
          </span>
        );
      case "INTERVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            {label}
          </span>
        );
      case "APPLIED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
            <TrendingUp className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            {label}
          </span>
        );
      case "RECOMMENDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
            {label}
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
            {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-surface-subtle text-stone-700 dark:text-ink-secondary border border-stone-200 dark:border-border">
            {label}
          </span>
        );
    }
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-ink">Internships & Industry Attachments</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-subtle font-mono text-ink-muted">
                {internships.length}
              </span>
            </div>
            <p className="text-[11px] text-ink-muted">
              Corporate placements, airport ground operations & airline internships
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setInternshipToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-lg transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Internship</span>
        </button>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-900 font-medium ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Body List */}
      <div className="mt-4 space-y-3.5">
        {internships.length === 0 ? (
          <div className="text-center py-8 px-4 bg-workspace/50 rounded-xl border border-dashed border-border">
            <Briefcase className="w-8 h-8 text-ink-muted/50 mx-auto mb-2" />
            <p className="text-xs font-medium text-ink">No internship pursuits recorded</p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Record external attachments or prescribe catalogue opportunities to track cadet placement progress.
            </p>
            <button
              onClick={() => {
                setInternshipToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-accent-emerald bg-accent-emerald/10 hover:bg-accent-emerald/20 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Record First Internship</span>
            </button>
          </div>
        ) : (
          internships.map((item) => {
            const oppDeadline = item.opportunity?.application_deadline;
            const deadlineInfo = oppDeadline ? getDeadlineDisplay(oppDeadline) : null;
            const isActing = actionLoadingId === item.id;

            // Documents attached to this specific internship
            const internshipDocs = (documents || []).filter((d) => d.internship_id === item.id);

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-border bg-surface hover:border-border-strong transition-all space-y-3"
              >
                {/* Header Row: Organization, Role, Status */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-ink">{item.organization}</span>
                      {item.opportunity ? (
                        <Badge variant="stone" size="sm" className="text-[10px]">
                          Catalogue
                        </Badge>
                      ) : (
                        <Badge variant="stone" size="sm" className="text-[10px] text-stone-500">
                          Direct / External
                        </Badge>
                      )}
                    </div>
                    {item.role_description && (
                      <div className="text-xs text-ink-muted mt-0.5 flex items-center gap-1.5">
                        <Building className="w-3 h-3 text-ink-muted/70" />
                        <span>{item.role_description}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {getStatusBadge(item.status)}
                    <button
                      onClick={() => setStatusModalTarget(item)}
                      disabled={isActing}
                      className="px-2.5 py-1 text-[11px] font-medium text-accent-emerald hover:bg-accent-emerald/10 border border-accent-emerald/20 rounded-lg transition-colors cursor-pointer"
                    >
                      Update Stage
                    </button>
                  </div>
                </div>

                {/* Deadlines & Dates Bar */}
                <div className="flex items-center gap-4 text-[11px] text-ink-muted flex-wrap font-mono pt-1">
                  {deadlineInfo && (
                    <div
                      className={`flex items-center gap-1 ${
                        deadlineInfo.isClosingSoon
                          ? "text-amber-700 font-semibold"
                          : deadlineInfo.isPassed
                          ? "text-rose-600"
                          : "text-ink-muted"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>
                        Deadline: {deadlineInfo.formattedDate} ({deadlineInfo.text})
                      </span>
                    </div>
                  )}

                  {item.applied_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-ink-muted/70" />
                      <span>Applied: {new Date(item.applied_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  {(item.start_date || item.end_date) && (
                    <div className="flex items-center gap-1">
                      <span>
                        Tenure: {item.start_date ? new Date(item.start_date).toLocaleDateString() : "TBD"} –{" "}
                        {item.end_date ? new Date(item.end_date).toLocaleDateString() : "Present"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Mentor Notes */}
                {item.mentor_notes && (
                  <p className="text-xs text-ink-muted bg-workspace/70 p-2.5 rounded-lg border border-border/60 leading-relaxed">
                    <span className="font-semibold text-ink text-[11px] block mb-0.5">Faculty Notes:</span>
                    {item.mentor_notes}
                  </p>
                )}

                {/* Internship Documents Section */}
                <div className="pt-2 border-t border-border/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                      <FileText className="w-3.5 h-3.5 text-ink-muted" />
                      <span>Internship Documents</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-subtle font-mono text-ink-muted border border-border">
                        {internshipDocs.length}
                      </span>
                    </div>

                    <button
                      onClick={() => setUploadModalTarget(item)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-emerald hover:text-accent-emerald/80 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Upload Document</span>
                    </button>
                  </div>

                  {internshipDocs.length === 0 ? (
                    <div className="p-2 rounded-lg bg-surface-subtle/50 border border-dashed border-border/80 text-center">
                      <p className="text-[11px] text-ink-muted">
                        No documents attached. Upload offer letter, joining letter, or evaluation report.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {internshipDocs.map((doc) => (
                        <InternshipDocItem
                          key={doc.id}
                          doc={doc}
                          studentId={studentId}
                          onDeleted={() => {
                            window.location.reload();
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-2 border-t border-border/70 flex items-center justify-between">
                  <div className="text-[10px] text-ink-muted font-mono">
                    Provenance: {item.provenance}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setInternshipToEdit(item);
                        setIsAddModalOpen(true);
                      }}
                      disabled={isActing}
                      className="p-1 rounded hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors cursor-pointer"
                      title="Edit Internship Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={isActing}
                      className="p-1 rounded hover:bg-rose-50 text-ink-muted hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Record / Edit Modal */}
      {isAddModalOpen && (
        <StudentInternshipModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setInternshipToEdit(null);
          }}
          studentId={studentId}
          opportunities={opportunities}
          internshipToEdit={internshipToEdit}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}

      {/* Status Transition Modal */}
      {statusModalTarget && (
        <UpdateStatusModal
          isOpen={Boolean(statusModalTarget)}
          onClose={() => setStatusModalTarget(null)}
          internship={statusModalTarget}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}

      {/* Upload Internship Document Modal */}
      {uploadModalTarget && (
        <UploadDocumentModal
          isOpen={Boolean(uploadModalTarget)}
          onClose={() => setUploadModalTarget(null)}
          studentId={studentId}
          studentName={studentName}
          initialInternshipId={uploadModalTarget.id}
          scope="internship"
          internships={internships}
          milestones={milestones}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </Card>
  );
}
