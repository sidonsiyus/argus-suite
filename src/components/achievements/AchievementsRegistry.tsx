"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  Plus,
  ExternalLink,
  Building,
  CheckCircle,
  Calendar,
  Edit2,
  Trash2,
  FileText,
  User,
  Clock,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  AchievementItem,
  ACHIEVEMENT_CATEGORIES,
} from "@/lib/achievements/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { AchievementFormModal } from "@/components/student-detail/AchievementFormModal";
import {
  verifyAchievementAction,
  deleteAchievementAction,
} from "@/app/actions/achievements";

interface CadetSummary {
  id: string;
  full_name: string;
  reg_no: string;
  career_goal?: string;
}

interface AchievementsRegistryProps {
  initialAchievements: AchievementItem[];
  studentsIndex: CadetSummary[];
}

export function AchievementsRegistry({
  initialAchievements,
  studentsIndex,
}: AchievementsRegistryProps) {
  const [achievements, setAchievements] = useState<AchievementItem[]>(initialAchievements);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<"all" | "verified" | "unverified">("all");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [achievementToEdit, setAchievementToEdit] = useState<AchievementItem | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter logic
  const filteredAchievements = useMemo(() => {
    return achievements.filter((ach) => {
      // Verification status filter
      if (verificationFilter === "verified" && !ach.is_verified) return false;
      if (verificationFilter === "unverified" && ach.is_verified) return false;

      // Category filter
      if (selectedCategory !== "all" && ach.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = ach.title.toLowerCase().includes(q);
        const matchesIssuer = ach.issued_by?.toLowerCase().includes(q) || false;
        const matchesStudentName = ach.student_name?.toLowerCase().includes(q) || false;
        const matchesStudentReg = ach.reg_no?.toLowerCase().includes(q) || false;
        const matchesDesc = (ach.description || ach.notes)?.toLowerCase().includes(q) || false;

        if (!matchesTitle && !matchesIssuer && !matchesStudentName && !matchesStudentReg && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [achievements, searchQuery, selectedCategory, verificationFilter]);

  // Handlers
  const handleOpenCreate = () => {
    setAchievementToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: AchievementItem) => {
    setAchievementToEdit(item);
    setIsFormOpen(true);
  };

  const handleVerify = async (item: AchievementItem) => {
    setActionLoadingId(item.id);
    setErrorMessage(null);
    try {
      const res = await verifyAchievementAction(item.id, item.student_id);
      if (res.success) {
        setAchievements((prev) =>
          prev.map((a) => (a.id === item.id ? { ...a, is_verified: true, provenance: "VERIFIED" } : a))
        );
      } else {
        setErrorMessage(res.error || "Failed to verify achievement.");
      }
    } catch {
      setErrorMessage("An unexpected network error occurred.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (item: AchievementItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;
    setActionLoadingId(item.id);
    setErrorMessage(null);
    try {
      const res = await deleteAchievementAction(item.id, item.student_id);
      if (res.success) {
        setAchievements((prev) => prev.filter((a) => a.id !== item.id));
      } else {
        setErrorMessage(res.error || "Failed to delete achievement.");
      }
    } catch {
      setErrorMessage("An unexpected network error occurred.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const stats = useMemo(() => {
    const total = achievements.length;
    const verified = achievements.filter((a) => a.is_verified).length;
    const unverified = total - verified;
    return { total, verified, unverified };
  }, [achievements]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <h1 className="text-xl font-bold text-ink tracking-tight">Achievements & Honors Registry</h1>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Faculty verified aeronautical certifications, flight badges, DGCA clearances, and institutional distinctions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record Achievement</span>
          </button>
        </div>
      </div>

      {/* Error notification banner */}
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

      {/* Filters & Search Control Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by achievement title, cadet name, reg no, or issuing authority..."
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            />
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            >
              <option value="all">All Distinction Categories</option>
              {ACHIEVEMENT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Verification Status Filter & Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-border text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setVerificationFilter("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                verificationFilter === "all"
                  ? "bg-accent-emerald text-white"
                  : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setVerificationFilter("verified")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                verificationFilter === "verified"
                  ? "bg-emerald-600 text-white"
                  : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
              }`}
            >
              Verified ({stats.verified})
            </button>
            <button
              onClick={() => setVerificationFilter("unverified")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                verificationFilter === "unverified"
                  ? "bg-amber-600 text-white"
                  : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
              }`}
            >
              Pending Review ({stats.unverified})
            </button>
          </div>

          <div className="text-xs text-ink-muted font-mono">
            Showing {filteredAchievements.length} of {achievements.length} records
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      {filteredAchievements.length === 0 ? (
        <EmptyState
          icon={Award}
          title={achievements.length === 0 ? "No student achievements registered yet." : "No matching achievements."}
          description={
            achievements.length === 0
              ? "Record accredited flight training certifications, DGCA credentials, or institutional honors for cadets."
              : "Try adjusting your search criteria or resetting filters."
          }
          action={
            achievements.length === 0 ? (
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-accent-emerald rounded-xl hover:bg-accent-emerald/90 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Record First Achievement</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setVerificationFilter("all");
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
          {filteredAchievements.map((item) => {
            const categoryMeta =
              ACHIEVEMENT_CATEGORIES.find((c) => c.value === item.category) || {
                label: item.category,
              };
            const isLoading = actionLoadingId === item.id;

            return (
              <Card
                key={item.id}
                className="flex flex-col justify-between p-5 hover:border-border-strong transition-all duration-150 relative group"
              >
                <div className="space-y-3.5">
                  {/* Category and Verification Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="stone" size="sm" className="font-medium">
                      {categoryMeta.label}
                    </Badge>
                    <div>
                      {item.is_verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Unverified Claim
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-sm font-semibold text-ink leading-snug">
                      {item.title}
                    </h3>
                    {item.issued_by && (
                      <div className="flex items-center gap-1.5 text-xs text-ink-muted mt-1">
                        <Building className="w-3.5 h-3.5 text-ink-muted/70 shrink-0" />
                        <span className="truncate">{item.issued_by}</span>
                      </div>
                    )}
                  </div>

                  {/* Cadet Details Badge / Link */}
                  <div className="p-2.5 rounded-xl bg-workspace border border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-surface flex items-center justify-center border border-border text-ink-muted shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-ink truncate">
                          {item.student_name || "Cadet"}
                        </div>
                        <div className="text-[10px] text-ink-muted font-mono">
                          {item.reg_no || "ID N/A"}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/students/${item.student_id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-emerald hover:underline shrink-0 ml-2"
                    >
                      <span>360</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Description / Notes */}
                  {(item.description || item.notes) && (
                    <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                      {item.description || item.notes}
                    </p>
                  )}

                  {/* Supporting Evidence Document */}
                  {item.certificate_document?.title && (
                    <div className="flex items-center gap-1.5 text-xs text-accent-emerald bg-accent-emerald/5 px-2.5 py-1.5 rounded-lg border border-accent-emerald/20">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate font-medium">{item.certificate_document.title}</span>
                    </div>
                  )}

                  {/* Date achieved */}
                  {item.date_achieved && (
                    <div className="flex items-center gap-1 text-[11px] text-ink-muted">
                      <Calendar className="w-3 h-3 text-ink-muted/70" />
                      <span>Achieved: {new Date(item.date_achieved).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Footer / Action Bar */}
                <div className="pt-3.5 mt-3.5 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      disabled={isLoading}
                      className="p-1.5 rounded-lg hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors"
                      title="Edit Achievement"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={isLoading}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-ink-muted hover:text-rose-600 transition-colors"
                      title="Delete Achievement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Inline Verification CTA */}
                  {!item.is_verified ? (
                    <button
                      onClick={() => handleVerify(item)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      )}
                      <span>Verify Honor</span>
                    </button>
                  ) : (
                    <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Record / Edit Modal */}
      {isFormOpen && (
        <AchievementFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setAchievementToEdit(null);
          }}
          studentsList={studentsIndex}
          achievementToEdit={achievementToEdit}
          onSuccess={() => {
            // Full reload for fresh SSR revalidation
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
