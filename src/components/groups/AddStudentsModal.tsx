"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  UserPlus,
  Search,
  Check,
  AlertCircle,
  Loader2,
  Users,
} from "lucide-react";
import { addStudentsToGroupAction } from "@/app/actions/groups";

interface CadetSummary {
  id: string;
  full_name: string;
  reg_no: string;
  career_goal?: string;
}

interface AddStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  allStudents: CadetSummary[];
  existingStudentIds: string[];
  onSuccess?: () => void;
}

export function AddStudentsModal({
  isOpen,
  onClose,
  groupId,
  groupName,
  allStudents,
  existingStudentIds,
  onSuccess,
}: AddStudentsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingSet = useMemo(() => new Set(existingStudentIds), [existingStudentIds]);

  // Filter students by Name and Register Number ONLY (Privacy Rule: Never search by phone/email)
  const filteredStudents = useMemo(() => {
    return allStudents.filter((s) => {
      if (existingSet.has(s.id)) return false; // Already in group

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = s.full_name.toLowerCase().includes(q);
        const matchesReg = s.reg_no.toLowerCase().includes(q);
        return matchesName || matchesReg;
      }

      return true;
    });
  }, [allStudents, existingSet, searchQuery]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredStudents.map((s) => s.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      setError("Please select at least one student to add.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await addStudentsToGroupAction(groupId, selectedIds, notes);
      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || "Failed to add students to group.");
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
        className="bg-surface rounded-2xl border border-border max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-students-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-workspace">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 id="add-students-title" className="text-base font-semibold text-ink">
                Add Students to Group
              </h2>
              <p className="text-xs text-ink-muted">
                Assign cadets to <span className="font-semibold text-ink">{groupName}</span>
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 flex flex-col">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Search (Strictly Name & Reg No Only) */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students by name or register number..."
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            />
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
          </div>

          {/* Selection Counter & Select All */}
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-semibold text-accent-emerald">
              {selectedIds.length} cadet{selectedIds.length === 1 ? "" : "s"} selected
            </span>
            {filteredStudents.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAllVisible}
                className="text-[11px] text-accent-emerald hover:underline font-medium"
              >
                {filteredStudents.every((s) => selectedIds.includes(s.id))
                  ? "Deselect All Visible"
                  : "Select All Visible"}
              </button>
            )}
          </div>

          {/* Student List */}
          <div className="border border-border rounded-xl divide-y divide-border max-h-56 overflow-y-auto bg-surface">
            {filteredStudents.length === 0 ? (
              <div className="p-6 text-center text-xs text-ink-muted">
                {allStudents.length === existingSet.size
                  ? "All cadets in the directory are already members of this group."
                  : "No matching cadets available to add."}
              </div>
            ) : (
              filteredStudents.map((s) => {
                const isSelected = selectedIds.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className={`flex items-center justify-between p-3 cursor-pointer hover:bg-surface-subtle transition-colors ${
                      isSelected ? "bg-accent-emerald/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(s.id)}
                        className="rounded border-border text-accent-emerald focus:ring-accent-emerald"
                      />
                      <div>
                        <div className="text-xs font-semibold text-ink">{s.full_name}</div>
                        <div className="text-[10px] text-ink-muted font-mono">{s.reg_no}</div>
                      </div>
                    </div>

                    {s.career_goal && (
                      <span className="text-[11px] text-ink-muted font-medium truncate max-w-[150px]">
                        {s.career_goal}
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>

          {/* Optional Mentor Operational Notes */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Mentor Placement Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Assigned to weekly resume workshop session A..."
              rows={2}
              maxLength={2000}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedIds.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Add {selectedIds.length} Student{selectedIds.length === 1 ? "" : "s"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
