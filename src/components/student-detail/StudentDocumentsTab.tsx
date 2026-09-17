"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Briefcase,
  Target,
  FolderOpen,
  X,
  FileCheck,
  Building,
} from "lucide-react";
import {
  StudentDocumentItem,
  ALL_DOCUMENT_CATEGORIES,
  GENERAL_DOCUMENT_CATEGORIES,
  INTERNSHIP_DOCUMENT_CATEGORIES,
  formatFileSize,
} from "@/lib/documents/types";
import { getStudentDocumentsAction } from "@/app/actions/documents";
import { DocumentCard } from "./DocumentCard";
import { UploadDocumentModal } from "./UploadDocumentModal";
import { Card } from "@/components/ui/Card";

interface StudentDocumentsTabProps {
  studentId: string;
  studentName: string;
  initialDocuments: StudentDocumentItem[];
  internships?: Array<{ id: string; organization: string; role_description?: string | null }>;
  milestones?: Array<{ id: string; title: string; category?: string; provenance?: string }>;
  onCountChange?: (count: number) => void;
}

type SubTab = "all" | "general" | "internship" | "poa";

export function StudentDocumentsTab({
  studentId,
  studentName,
  initialDocuments = [],
  internships = [],
  milestones = [],
  onCountChange,
}: StudentDocumentsTabProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<StudentDocumentItem[]>(initialDocuments);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [fileTypeFilter, setFileTypeFilter] = useState<"ALL" | "pdf" | "word">("ALL");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Sync state if server initialDocuments updates
  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  // Notify parent component of current document count for tab badge
  useEffect(() => {
    onCountChange?.(documents.length);
  }, [documents.length, onCountChange]);

  // Compute category counts
  const counts = useMemo(() => {
    return {
      all: documents.length,
      general: documents.filter((d) => !d.internship_id).length,
      internship: documents.filter((d) => Boolean(d.internship_id)).length,
      poa: documents.filter((d) => Boolean(d.milestone_id)).length,
    };
  }, [documents]);

  // Dynamic category options based on active tab
  const categoryOptions = useMemo(() => {
    if (activeSubTab === "internship") return INTERNSHIP_DOCUMENT_CATEGORIES;
    if (activeSubTab === "general") return GENERAL_DOCUMENT_CATEGORIES;
    return ALL_DOCUMENT_CATEGORIES;
  }, [activeSubTab]);

  // Filtered documents list
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // 1. Sub-tab filter
      if (activeSubTab === "general" && doc.internship_id) return false;
      if (activeSubTab === "internship" && !doc.internship_id) return false;
      if (activeSubTab === "poa" && !doc.milestone_id) return false;

      // 2. Category filter
      if (categoryFilter !== "ALL" && doc.category !== categoryFilter) {
        return false;
      }

      // 3. File type filter
      if (fileTypeFilter === "pdf") {
        if (!doc.mime_type?.toLowerCase().includes("pdf")) return false;
      } else if (fileTypeFilter === "word") {
        const isWord =
          doc.mime_type?.toLowerCase().includes("word") ||
          doc.mime_type?.toLowerCase().includes("officedocument");
        if (!isWord) return false;
      }

      // 4. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesDesc = doc.description?.toLowerCase().includes(q);
        const matchesOrg = doc.internship?.organization.toLowerCase().includes(q);
        const matchesMilestone = doc.milestone?.title.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesOrg && !matchesMilestone) {
          return false;
        }
      }

      return true;
    });
  }, [documents, activeSubTab, categoryFilter, fileTypeFilter, searchQuery]);

  const handleDocumentDeleted = (deletedId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== deletedId));
    router.refresh();
  };

  const handleUploadSuccess = (newDoc?: StudentDocumentItem | null) => {
    if (newDoc) {
      setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
    }
    router.refresh();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setFileTypeFilter("ALL");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" || categoryFilter !== "ALL" || fileTypeFilter !== "ALL";

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-ink">Cadet Document Repository</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-mono font-semibold">
                  {counts.all} {counts.all === 1 ? "file" : "files"}
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                Secure faculty vault for verified credentials, identity documents, internship documentation, and POA completion evidence.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="pt-4 flex flex-wrap items-center gap-1.5 border-b border-border pb-4">
          <button
            onClick={() => {
              setActiveSubTab("all");
              setCategoryFilter("ALL");
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeSubTab === "all"
                ? "bg-emerald-800 text-white font-semibold shadow-xs"
                : "text-ink-secondary hover:text-ink hover:bg-surface-subtle"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>All Documents</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeSubTab === "all" ? "bg-emerald-700 text-emerald-100" : "bg-surface-subtle text-ink-muted"
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("general");
              setCategoryFilter("ALL");
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeSubTab === "general"
                ? "bg-emerald-800 text-white font-semibold shadow-xs"
                : "text-ink-secondary hover:text-ink hover:bg-surface-subtle"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>General Documents</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeSubTab === "general" ? "bg-emerald-700 text-emerald-100" : "bg-surface-subtle text-ink-muted"
              }`}
            >
              {counts.general}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("internship");
              setCategoryFilter("ALL");
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeSubTab === "internship"
                ? "bg-emerald-800 text-white font-semibold shadow-xs"
                : "text-ink-secondary hover:text-ink hover:bg-surface-subtle"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Internship Documents</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeSubTab === "internship" ? "bg-emerald-700 text-emerald-100" : "bg-surface-subtle text-ink-muted"
              }`}
            >
              {counts.internship}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("poa");
              setCategoryFilter("ALL");
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeSubTab === "poa"
                ? "bg-emerald-800 text-white font-semibold shadow-xs"
                : "text-ink-secondary hover:text-ink hover:bg-surface-subtle"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>POA Evidence</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeSubTab === "poa" ? "bg-emerald-700 text-emerald-100" : "bg-surface-subtle text-ink-muted"
              }`}
            >
              {counts.poa}
            </span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="pt-4 flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Search documents by title, notes, or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-border bg-surface focus:outline-none focus:ring-1 focus:ring-accent-emerald focus:border-accent-emerald"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-border bg-surface text-ink font-medium focus:outline-none focus:ring-1 focus:ring-accent-emerald cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* File Type Dropdown */}
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value as "ALL" | "pdf" | "word")}
              className="px-3 py-2 text-xs rounded-xl border border-border bg-surface text-ink font-medium focus:outline-none focus:ring-1 focus:ring-accent-emerald cursor-pointer"
            >
              <option value="ALL">All Formats</option>
              <option value="pdf">PDF Documents</option>
              <option value="word">Word Documents (DOC / DOCX)</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-2.5 py-2 text-xs text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-xl border border-border transition-colors cursor-pointer"
                title="Clear all filters"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Document Grid / Empty States */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-dashed border-border p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-surface-subtle border border-border flex items-center justify-center text-ink-muted mx-auto mb-3">
            <FolderOpen className="w-6 h-6" />
          </div>

          {documents.length === 0 ? (
            <div className="space-y-3 max-w-md mx-auto">
              <h3 className="text-sm font-semibold text-ink">No documents uploaded yet</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Upload verified identity documents, resumes, course certificates, internship offer letters, or completion reports for {studentName}.
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm cursor-pointer mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload First Document</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-w-md mx-auto">
              <h3 className="text-sm font-semibold text-ink">No documents match your filters</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Try adjusting your search keywords, clearing the category filter, or switching sub-tabs.
              </p>
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-ink-secondary bg-surface-subtle hover:bg-surface-subtle/80 rounded-lg border border-border transition-colors cursor-pointer mt-2"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              studentId={studentId}
              onDeleted={handleDocumentDeleted}
              showInternshipTag={activeSubTab !== "internship"}
              showPoaTag={activeSubTab !== "poa"}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <UploadDocumentModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          studentId={studentId}
          studentName={studentName}
          internships={internships}
          milestones={milestones}
          scope={activeSubTab}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
