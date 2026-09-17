"use client";

import React, { useState } from "react";
import {
  Award,
  Calendar,
  Building,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AchievementItem, ACHIEVEMENT_CATEGORIES } from "@/lib/achievements/types";
import { AchievementFormModal } from "./AchievementFormModal";
import {
  verifyAchievementAction,
  deleteAchievementAction,
} from "@/app/actions/achievements";

interface StudentAchievementsCardProps {
  achievements: AchievementItem[];
  studentId: string;
}

export function StudentAchievementsCard({
  achievements,
  studentId,
}: StudentAchievementsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementItem | null>(null);

  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setSelectedAchievement(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ach: AchievementItem) => {
    setSelectedAchievement(ach);
    setIsModalOpen(true);
  };

  const handleVerify = async (achId: string) => {
    setVerifyingId(achId);
    setError(null);
    try {
      const res = await verifyAchievementAction(achId, studentId);
      if (!res.success) {
        setError(res.error || "Failed to verify achievement.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDelete = async (achId: string) => {
    if (!window.confirm("Are you sure you want to remove this achievement record?")) {
      return;
    }

    setDeletingId(achId);
    setError(null);
    try {
      const res = await deleteAchievementAction(achId, studentId);
      if (!res.success) {
        setError(res.error || "Failed to delete achievement.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setDeletingId(null);
    }
  };

  const verifiedCount = achievements.filter((a) => a.is_verified).length;

  return (
    <>
      <Card className="border-border bg-surface">
        <CardHeader
          title="Aviation Achievements & Distinctions"
          subtitle={`${achievements.length} recorded honors (${verifiedCount} verified)`}
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Achievement</span>
              </button>
            </div>
          }
        />
        <CardContent>
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {achievements.length === 0 ? (
            <div className="py-8 text-center text-stone-400">
              <Award className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-stone-600">No Achievements Recorded</p>
              <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto leading-relaxed">
                Record DGCA examination clearances, flight certifications, hackathons, academic distinctions, and leadership accomplishments.
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-accent-emerald bg-accent-emerald/10 hover:bg-accent-emerald/20 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record First Achievement</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {achievements.map((ach) => {
                const categoryLabel =
                  ACHIEVEMENT_CATEGORIES.find((c) => c.value === ach.category)?.label || ach.category;

                return (
                  <div
                    key={ach.id}
                    className="p-4 rounded-xl bg-workspace border border-border space-y-2.5 hover:border-emerald-800/30 transition-colors"
                  >
                    {/* Header: Title & Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Award className="w-4 h-4 text-accent-emerald shrink-0" />
                        <h4 className="text-sm font-semibold text-ink truncate">{ach.title}</h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="stone" size="sm">
                          {categoryLabel}
                        </Badge>
                        <Badge variant="stone" size="sm" className="font-mono text-[10px]">
                          {ach.provenance}
                        </Badge>
                        {ach.is_verified ? (
                          <Badge variant="emerald" size="sm" className="gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </Badge>
                        ) : (
                          <Badge variant="amber" size="sm">
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Issuer & Date Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                      {ach.issued_by && (
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-stone-400" />
                          <span>{ach.issued_by}</span>
                        </div>
                      )}
                      {ach.date_achieved && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>
                            Achieved:{" "}
                            {new Date(ach.date_achieved).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {ach.description && (
                      <p className="text-xs text-stone-600 leading-relaxed bg-surface p-2.5 rounded-lg border border-border/60">
                        {ach.description}
                      </p>
                    )}

                    {/* Supporting Evidence Document */}
                    {ach.certificate_document && (
                      <div className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-accent-emerald shrink-0" />
                          <span className="font-medium text-ink truncate">
                            {ach.certificate_document.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-ink-muted font-mono uppercase shrink-0">
                          Evidence Attached
                        </span>
                      </div>
                    )}

                    {/* Verification & Action Footer */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                      <div className="text-[11px] text-ink-muted">
                        {ach.is_verified ? (
                          <span className="flex items-center gap-1 text-emerald-700 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Verified by faculty mentor
                            {ach.verified_at &&
                              ` on ${new Date(ach.verified_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}`}
                          </span>
                        ) : (
                          <span className="text-stone-400">
                            Awaiting faculty evidence verification
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!ach.is_verified && (
                          <button
                            type="button"
                            onClick={() => handleVerify(ach.id)}
                            disabled={verifyingId === ach.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {verifyingId === ach.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            )}
                            <span>Verify</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(ach)}
                          className="p-1 rounded hover:bg-surface-subtle text-stone-500 hover:text-ink transition-colors"
                          title="Edit achievement"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(ach.id)}
                          disabled={deletingId === ach.id}
                          className="p-1 rounded hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Delete achievement record"
                        >
                          {deletingId === ach.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AchievementFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studentId={studentId}
        achievementToEdit={selectedAchievement}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
