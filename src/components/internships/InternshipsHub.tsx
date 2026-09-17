"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Compass,
  Users,
  Search,
  Plus,
  ExternalLink,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  MapPin,
  TrendingUp,
  FileText,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
} from "lucide-react";
import {
  InternshipOpportunityItem,
  StudentInternshipItem,
  InternshipStatus,
  WorkMode,
  INTERNSHIP_STATUSES,
  WORK_MODES,
  getDeadlineDisplay,
} from "@/lib/internships/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { OpportunityFormModal } from "./OpportunityFormModal";
import { OpportunityDetailModal } from "./OpportunityDetailModal";
import { UpdateStatusModal } from "@/components/student-detail/UpdateStatusModal";
import {
  archiveOpportunityAction,
  deleteStudentInternshipAction,
} from "@/app/actions/internships";

interface CadetSummary {
  id: string;
  full_name: string;
  reg_no: string;
  career_goal?: string;
}

interface InternshipsHubProps {
  initialOpportunities: InternshipOpportunityItem[];
  initialStudentInternships: StudentInternshipItem[];
  studentsIndex: CadetSummary[];
}

export function InternshipsHub({
  initialOpportunities,
  initialStudentInternships,
  studentsIndex,
}: InternshipsHubProps) {
  const [activeTab, setActiveTab] = useState<"opportunities" | "applications">("opportunities");

  // Opportunities State
  const [opportunities, setOpportunities] = useState<InternshipOpportunityItem[]>(initialOpportunities);
  const [oppSearch, setOppSearch] = useState("");
  const [oppStatusFilter, setOppStatusFilter] = useState<"all" | "active" | "closing_soon" | "archived">("active");
  const [oppWorkModeFilter, setOppWorkModeFilter] = useState<string>("all");

  // Applications State
  const [applications, setApplications] = useState<StudentInternshipItem[]>(initialStudentInternships);
  const [appSearch, setAppSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState<InternshipStatus | "all">("all");

  // Modal States
  const [isOppFormOpen, setIsOppFormOpen] = useState(false);
  const [opportunityToEdit, setOpportunityToEdit] = useState<InternshipOpportunityItem | null>(null);
  const [detailOpportunity, setDetailOpportunity] = useState<InternshipOpportunityItem | null>(null);
  const [statusModalTarget, setStatusModalTarget] = useState<StudentInternshipItem | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtered Opportunities
  const filteredOpportunities = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return opportunities.filter((opp) => {
      // Status Filter
      if (oppStatusFilter === "active" && !opp.is_active) return false;
      if (oppStatusFilter === "archived" && opp.is_active) return false;
      if (oppStatusFilter === "closing_soon") {
        if (!opp.is_active || !opp.application_deadline) return false;
        const d = new Date(opp.application_deadline);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        if (d < today || d > nextWeek) return false;
      }

      // Work mode
      if (oppWorkModeFilter !== "all" && opp.work_mode !== oppWorkModeFilter) return false;

      // Text Search
      if (oppSearch.trim()) {
        const q = oppSearch.toLowerCase().trim();
        const matchesOrg = opp.organization.toLowerCase().includes(q);
        const matchesTitle = opp.title.toLowerCase().includes(q);
        const matchesLoc = opp.location?.toLowerCase().includes(q) || false;
        const matchesDesc = opp.description?.toLowerCase().includes(q) || false;
        if (!matchesOrg && !matchesTitle && !matchesLoc && !matchesDesc) return false;
      }

      return true;
    });
  }, [opportunities, oppSearch, oppStatusFilter, oppWorkModeFilter]);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Status Filter
      if (appStatusFilter !== "all" && app.status !== appStatusFilter) return false;

      // Text Search
      if (appSearch.trim()) {
        const q = appSearch.toLowerCase().trim();
        const matchesOrg = app.organization.toLowerCase().includes(q);
        const matchesRole = app.role_description?.toLowerCase().includes(q) || false;
        const matchesStudent = app.student_name?.toLowerCase().includes(q) || false;
        const matchesReg = app.reg_no?.toLowerCase().includes(q) || false;
        const matchesNotes = app.mentor_notes?.toLowerCase().includes(q) || false;
        if (!matchesOrg && !matchesRole && !matchesStudent && !matchesReg && !matchesNotes) return false;
      }

      return true;
    });
  }, [applications, appSearch, appStatusFilter]);

  // Handlers
  const handleToggleArchiveOpp = async (opp: InternshipOpportunityItem) => {
    try {
      const res = await archiveOpportunityAction(opp.id, !opp.is_active);
      if (res.success) {
        setOpportunities((prev) =>
          prev.map((o) => (o.id === opp.id ? { ...o, is_active: !o.is_active } : o))
        );
      } else {
        setErrorMessage(res.error || "Failed to update archive status.");
      }
    } catch {
      setErrorMessage("An unexpected network error occurred.");
    }
  };

  const handleDeleteApplication = async (app: StudentInternshipItem) => {
    if (!confirm(`Delete application record for "${app.student_name}" at "${app.organization}"?`)) return;
    try {
      const res = await deleteStudentInternshipAction(app.id, app.student_id);
      if (res.success) {
        setApplications((prev) => prev.filter((a) => a.id !== app.id));
      } else {
        setErrorMessage(res.error || "Failed to delete internship record.");
      }
    } catch {
      setErrorMessage("An unexpected network error occurred.");
    }
  };

  const getStatusBadge = (status: string) => {
    const meta = INTERNSHIP_STATUSES.find((s) => s.value === status);
    const label = meta?.label || status;

    switch (status) {
      case "SELECTED":
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            {label}
          </span>
        );
      case "INTERVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            {label}
          </span>
        );
      case "APPLIED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <TrendingUp className="w-3 h-3 text-sky-600" />
            {label}
          </span>
        );
      case "RECOMMENDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            {label}
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            {label}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <h1 className="text-xl font-bold text-ink tracking-tight">Internships & Opportunities Hub</h1>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Manage industry catalogue openings, track student application stages & record placement outcomes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setOpportunityToEdit(null);
              setIsOppFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Post Opportunity</span>
          </button>
        </div>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-900 font-medium ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Dual Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("opportunities")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "opportunities"
              ? "bg-accent-emerald text-white shadow-sm"
              : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Opportunities Catalogue ({opportunities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("applications")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "applications"
              ? "bg-accent-emerald text-white shadow-sm"
              : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Pursuits & Applications ({applications.length})</span>
        </button>
      </div>

      {/* TAB 1: OPPORTUNITIES CATALOGUE */}
      {activeTab === "opportunities" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-surface p-4 rounded-xl border border-border space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={oppSearch}
                  onChange={(e) => setOppSearch(e.target.value)}
                  placeholder="Search opportunities by organization, title, location, or description..."
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                />
                <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
              </div>

              {/* Work Mode */}
              <div className="w-full md:w-48">
                <select
                  value={oppWorkModeFilter}
                  onChange={(e) => setOppWorkModeFilter(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                >
                  <option value="all">All Work Modes</option>
                  {WORK_MODES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-border text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setOppStatusFilter("all")}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    oppStatusFilter === "all"
                      ? "bg-accent-emerald text-white"
                      : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
                  }`}
                >
                  All ({opportunities.length})
                </button>
                <button
                  onClick={() => setOppStatusFilter("active")}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    oppStatusFilter === "active"
                      ? "bg-accent-emerald text-white"
                      : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setOppStatusFilter("closing_soon")}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    oppStatusFilter === "closing_soon"
                      ? "bg-amber-600 text-white"
                      : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
                  }`}
                >
                  Closing Soon
                </button>
                <button
                  onClick={() => setOppStatusFilter("archived")}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    oppStatusFilter === "archived"
                      ? "bg-stone-600 text-white"
                      : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
                  }`}
                >
                  Archived
                </button>
              </div>

              <div className="text-xs text-ink-muted font-mono">
                Showing {filteredOpportunities.length} of {opportunities.length} opportunities
              </div>
            </div>
          </div>

          {/* Opportunities Grid */}
          {filteredOpportunities.length === 0 ? (
            <EmptyState
              icon={Compass}
              title={opportunities.length === 0 ? "No internship opportunities posted yet." : "No matching opportunities."}
              description={
                opportunities.length === 0
                  ? "Post your first airline, airport authority, or flight ops internship opportunity to prescribe across cadets."
                  : "Try clearing search filters or changing the status filter."
              }
              action={
                opportunities.length === 0 ? (
                  <button
                    onClick={() => {
                      setOpportunityToEdit(null);
                      setIsOppFormOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-accent-emerald rounded-xl hover:bg-accent-emerald/90 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post First Opportunity</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setOppSearch("");
                      setOppStatusFilter("all");
                      setOppWorkModeFilter("all");
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium text-ink bg-surface border border-border rounded-xl hover:bg-surface-subtle transition-colors"
                  >
                    Reset Filters
                  </button>
                )
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOpportunities.map((opp) => {
                const deadlineInfo = getDeadlineDisplay(opp.application_deadline);

                return (
                  <Card
                    key={opp.id}
                    className={`flex flex-col justify-between p-5 hover:border-border-strong transition-all duration-150 ${
                      !opp.is_active ? "opacity-75 bg-surface-subtle/30" : ""
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Organization & Work Mode */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-accent-emerald uppercase tracking-wider">
                          {opp.organization}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="stone" size="sm">
                            {opp.work_mode.replace("_", " ")}
                          </Badge>
                          {!opp.is_active && (
                            <Badge variant="stone" size="sm" className="bg-stone-200 text-stone-600">
                              Archived
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-semibold text-ink leading-snug">
                        {opp.title}
                      </h3>

                      {/* Location */}
                      {opp.location && (
                        <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                          <MapPin className="w-3.5 h-3.5 text-ink-muted/70 shrink-0" />
                          <span>{opp.location}</span>
                        </div>
                      )}

                      {/* Deadline deterministic display */}
                      <div className="p-2.5 rounded-xl bg-workspace border border-border/70 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-ink-muted text-[11px]">Deadline:</span>
                          <span className="text-ink font-semibold">{deadlineInfo.formattedDate}</span>
                        </div>
                        <div
                          className={`text-[11px] mt-0.5 font-medium ${
                            deadlineInfo.isClosingSoon
                              ? "text-amber-700"
                              : deadlineInfo.isPassed
                              ? "text-rose-600"
                              : "text-ink-muted"
                          }`}
                        >
                          {deadlineInfo.text}
                        </div>
                      </div>

                      {/* Pursuing Count */}
                      <div className="flex items-center gap-1.5 text-xs text-ink-muted pt-1">
                        <Users className="w-3.5 h-3.5 text-accent-emerald shrink-0" />
                        <span className="font-semibold text-ink">{opp.pursuing_count || 0}</span>
                        <span>students pursuing this opportunity</span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3.5 mt-3.5 border-t border-border flex items-center justify-between">
                      <button
                        onClick={() => setDetailOpportunity(opp)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-accent-emerald hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setOpportunityToEdit(opp);
                            setIsOppFormOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors"
                          title="Edit Opportunity"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleArchiveOpp(opp)}
                          className="p-1.5 rounded-lg hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors"
                          title={opp.is_active ? "Archive Opportunity" : "Restore Opportunity"}
                        >
                          {opp.is_active ? (
                            <Archive className="w-3.5 h-3.5" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDENT APPLICATIONS & PURSUITS */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-surface p-4 rounded-xl border border-border space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  placeholder="Search pursuits by cadet name, reg no, employer, or role title..."
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                />
                <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
              </div>

              {/* Status Filter Dropdown */}
              <div className="w-full md:w-56">
                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value as any)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                >
                  <option value="all">All Pursuit Stages</option>
                  {INTERNSHIP_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-ink-muted font-mono">
              <span>Showing {filteredApplications.length} of {applications.length} student applications</span>
            </div>
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <EmptyState
              icon={Users}
              title={applications.length === 0 ? "No student internship pursuits recorded yet." : "No matching pursuits."}
              description={
                applications.length === 0
                  ? "Record student internship pursuits from Student 360 or assign catalogue opportunities to cadets."
                  : "Try clearing search filters or changing the status filter."
              }
              action={
                <button
                  onClick={() => {
                    setAppSearch("");
                    setAppStatusFilter("all");
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium text-ink bg-surface border border-border rounded-xl hover:bg-surface-subtle transition-colors"
                >
                  Reset Filters
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredApplications.map((app) => {
                const oppDeadline = app.opportunity?.application_deadline;
                const deadlineInfo = oppDeadline ? getDeadlineDisplay(oppDeadline) : null;

                return (
                  <Card
                    key={app.id}
                    className="flex flex-col justify-between p-5 hover:border-border-strong transition-all duration-150 space-y-3"
                  >
                    <div className="space-y-3">
                      {/* Student Header */}
                      <div className="p-2.5 rounded-xl bg-workspace border border-border/60 flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-ink truncate">
                            {app.student_name || "Cadet"}
                          </div>
                          <div className="text-[10px] text-ink-muted font-mono">
                            {app.reg_no || "ID N/A"}
                          </div>
                        </div>
                        <Link
                          href={`/students/${app.student_id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-emerald hover:underline shrink-0 ml-2"
                        >
                          <span>360</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      {/* Employer & Role */}
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-ink uppercase tracking-wider">
                            {app.organization}
                          </span>
                          {getStatusBadge(app.status)}
                        </div>
                        <h4 className="text-sm font-semibold text-ink mt-0.5">
                          {app.role_description || "Internship Trainee"}
                        </h4>
                      </div>

                      {/* Deadline & Dates */}
                      <div className="space-y-1 text-[11px] text-ink-muted font-mono">
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
                            <span>Deadline: {deadlineInfo.formattedDate} ({deadlineInfo.text})</span>
                          </div>
                        )}
                        {app.applied_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-ink-muted/70" />
                            <span>Applied: {new Date(app.applied_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {app.mentor_notes && (
                        <p className="text-xs text-ink-muted line-clamp-2 bg-workspace p-2 rounded-lg border border-border/60">
                          {app.mentor_notes}
                        </p>
                      )}

                      {/* Completion Document */}
                      {app.certificate_document && (
                        <div className="flex items-center gap-1.5 text-xs text-accent-emerald bg-accent-emerald/5 px-2 py-1.5 rounded-lg border border-accent-emerald/20">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate font-medium">{app.certificate_document.title}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <button
                        onClick={() => setStatusModalTarget(app)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-accent-emerald hover:bg-accent-emerald/10 border border-accent-emerald/20 rounded-lg transition-colors"
                      >
                        <span>Update Stage</span>
                      </button>

                      <button
                        onClick={() => handleDeleteApplication(app)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-ink-muted hover:text-rose-600 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Opportunity Form Modal */}
      {isOppFormOpen && (
        <OpportunityFormModal
          isOpen={isOppFormOpen}
          onClose={() => {
            setIsOppFormOpen(false);
            setOpportunityToEdit(null);
          }}
          opportunityToEdit={opportunityToEdit}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}

      {/* Opportunity Detail Modal */}
      {detailOpportunity && (
        <OpportunityDetailModal
          isOpen={Boolean(detailOpportunity)}
          onClose={() => setDetailOpportunity(null)}
          opportunity={detailOpportunity}
          onEdit={(opp) => {
            setOpportunityToEdit(opp);
            setIsOppFormOpen(true);
          }}
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
    </div>
  );
}
