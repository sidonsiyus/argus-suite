"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Award,
  Calendar,
  Building,
  FileText,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import {
  AchievementItem,
  AchievementCategory,
  ACHIEVEMENT_CATEGORIES,
} from "@/lib/achievements/types";
import {
  createAchievementAction,
  updateAchievementAction,
  fetchAvailableDocumentsAction,
} from "@/app/actions/achievements";

interface AchievementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentsList?: Array<{ id: string; full_name: string; reg_no: string }>;
  achievementToEdit?: AchievementItem | null;
  onSuccess?: () => void;
}

export function AchievementFormModal({
  isOpen,
  onClose,
  studentId: initialStudentId,
  studentsList,
  achievementToEdit,
  onSuccess,
}: AchievementFormModalProps) {
  const isEditing = Boolean(achievementToEdit);

  const [targetStudentId, setTargetStudentId] = useState(
    initialStudentId || achievementToEdit?.student_id || (studentsList && studentsList.length > 0 ? studentsList[0].id : "")
  );
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<AchievementCategory>("CERTIFICATION");
  const [issuedBy, setIssuedBy] = useState("");
  const [dateAchieved, setDateAchieved] = useState("");
  const [description, setDescription] = useState("");
  const [certificateDocId, setCertificateDocId] = useState("");

  const [availableDocs, setAvailableDocs] = useState<Array<{ id: string; title: string; category: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialStudentId) {
      setTargetStudentId(initialStudentId);
    } else if (achievementToEdit?.student_id) {
      setTargetStudentId(achievementToEdit.student_id);
    } else if (studentsList && studentsList.length > 0 && !targetStudentId) {
      setTargetStudentId(studentsList[0].id);
    }
  }, [initialStudentId, achievementToEdit, studentsList, targetStudentId]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (targetStudentId) {
        fetchAvailableDocumentsAction(targetStudentId)
          .then((docs) => setAvailableDocs(docs || []))
          .catch(() => setAvailableDocs([]));
      } else {
        setAvailableDocs([]);
      }

      if (achievementToEdit) {
        setTitle(achievementToEdit.title);
        setCategory(achievementToEdit.category);
        setIssuedBy(achievementToEdit.issued_by || "");
        setDateAchieved(achievementToEdit.date_achieved || "");
        setDescription(achievementToEdit.description || achievementToEdit.notes || "");
        setCertificateDocId(achievementToEdit.certificate_doc_id || "");
      } else {
        setTitle("");
        setCategory("CERTIFICATION");
        setIssuedBy("");
        setDateAchieved(new Date().toISOString().split("T")[0]);
        setDescription("");
        setCertificateDocId("");
      }
    }
  }, [isOpen, achievementToEdit, targetStudentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Achievement title is required.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      title: title.trim(),
      category,
      issued_by: issuedBy.trim() || undefined,
      date_achieved: dateAchieved || undefined,
      description: description.trim() || undefined,
      certificate_doc_id: certificateDocId || undefined,
    };

    try {
      if (!targetStudentId) {
        setError("Cadet selection is required.");
        setLoading(false);
        return;
      }
      let res;
      if (isEditing && achievementToEdit) {
        res = await updateAchievementAction(achievementToEdit.id, targetStudentId, payload);
      } else {
        res = await createAchievementAction(targetStudentId, payload);
      }

      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || "Failed to record achievement.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className="bg-surface rounded-2xl border border-border max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievement-form-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-workspace">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 id="achievement-form-title" className="text-base font-semibold text-ink">
                {isEditing ? "Edit Cadet Achievement" : "Record Cadet Achievement"}
              </h2>
              <p className="text-xs text-ink-muted">
                Document verified accomplishments, flight badges, and distinctions
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Selector (When on Global Achievements Registry) */}
          {!initialStudentId && studentsList && studentsList.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Cadet <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetStudentId}
                disabled={isEditing}
                onChange={(e) => setTargetStudentId(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald disabled:opacity-60"
              >
                {studentsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.reg_no})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Achievement Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DGCA CPL Ground School Navigation Certificate"
              maxLength={200}
              required
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            />
          </div>

          {/* Category and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AchievementCategory)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
              >
                {ACHIEVEMENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Date Completed / Achieved
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateAchieved}
                  onChange={(e) => setDateAchieved(e.target.value)}
                  className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                />
                <Calendar className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Issuing Organization */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Issuing Organization / Authority
            </label>
            <div className="relative">
              <input
                type="text"
                value={issuedBy}
                onChange={(e) => setIssuedBy(e.target.value)}
                placeholder="e.g. Directorate General of Civil Aviation, IATA, Flight Academy"
                maxLength={150}
                className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
              />
              <Building className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Description & Context
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details regarding the scope, score, or distinction of this achievement..."
              rows={3}
              maxLength={2000}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald resize-none"
            />
          </div>

          {/* Supporting Evidence Document */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Supporting Evidence Document
            </label>
            <div className="relative">
              <select
                value={certificateDocId}
                onChange={(e) => setCertificateDocId(e.target.value)}
                className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
              >
                <option value="">No document attached (Unverified claim)</option>
                {availableDocs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.category})
                  </option>
                ))}
              </select>
              <FileText className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
            </div>
            {availableDocs.length === 0 && (
              <p className="text-[11px] text-ink-muted mt-1">
                No uploaded student documents found. Cadet certificates can be uploaded in the Documents tab.
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? "Update Achievement" : "Save Achievement"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
