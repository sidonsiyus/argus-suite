"use client";

import React, { useState, useEffect } from "react";
import { X, Users, AlertCircle, Loader2, Check } from "lucide-react";
import {
  GroupItem,
  GroupCategory,
  GROUP_CATEGORIES,
} from "@/lib/groups/types";
import { createGroupAction, updateGroupAction } from "@/app/actions/groups";

interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupToEdit?: GroupItem | null;
  onSuccess?: () => void;
}

export function GroupFormModal({
  isOpen,
  onClose,
  groupToEdit,
  onSuccess,
}: GroupFormModalProps) {
  const isEditing = Boolean(groupToEdit);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<GroupCategory>("CAREER");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (groupToEdit) {
        setName(groupToEdit.name);
        setCategory(groupToEdit.category);
        setDescription(groupToEdit.description || "");
      } else {
        setName("");
        setCategory("CAREER");
        setDescription("");
      }
    }
  }, [isOpen, groupToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      category,
      description: description.trim() || undefined,
    };

    try {
      let res;
      if (isEditing && groupToEdit) {
        res = await updateGroupAction(groupToEdit.id, payload);
      } else {
        res = await createGroupAction(payload);
      }

      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || "Failed to save group.");
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
        aria-labelledby="group-form-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-workspace">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 id="group-form-title" className="text-base font-semibold text-ink">
                {isEditing ? "Edit Functional Group" : "Create Functional Group"}
              </h2>
              <p className="text-xs text-ink-muted">
                Cohort-independent intervention, tutoring, or development group
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

          {/* Group Name */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Group Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. DGCA CPL Ground School Preparation, Resume Development"
              maxLength={150}
              required
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Functional Focus / Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GroupCategory)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            >
              {GROUP_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-ink-muted mt-1">
              {GROUP_CATEGORIES.find((c) => c.value === category)?.description}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Purpose & Operational Scope
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the mentoring objectives, meeting schedules, or target development milestones..."
              rows={3}
              maxLength={2000}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald resize-none"
            />
          </div>

          {/* Footer */}
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
                  <span>{isEditing ? "Update Group" : "Create Group"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
