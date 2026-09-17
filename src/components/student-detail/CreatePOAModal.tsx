"use client";

import React, { useState } from "react";
import {
  X,
  Target,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Loader2,
  FileCheck,
  Compass,
} from "lucide-react";
import { createPlanOfActionAction } from "@/app/actions/poa";
import { useToast } from "@/components/ui/ToastProvider";

interface CreatePOAModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  careerGoalTitle?: string;
  onSuccess?: () => void;
}

export function CreatePOAModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  careerGoalTitle,
  onSuccess,
}: CreatePOAModalProps) {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [targetDate, setTargetDate] = useState("");
  const [textInstructions, setTextInstructions] = useState("");
  const [tasks, setTasks] = useState<string[]>([""]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddTask = () => {
    if (tasks.length < 10) setTasks([...tasks, ""]);
  };

  const handleRemoveTask = (idx: number) => {
    setTasks(tasks.filter((_, i) => i !== idx));
  };

  const handleTaskChange = (idx: number, val: string) => {
    const updated = [...tasks];
    updated[idx] = val;
    setTasks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !expectedOutcome.trim()) {
      setError("Please provide both a POA Title and Expected Outcome.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const validTasks = tasks.map((t) => t.trim()).filter((t) => t.length > 0);

    try {
      const res = await createPlanOfActionAction({
        studentId,
        title: title.trim(),
        objective: objective.trim() || undefined,
        expectedOutcome: expectedOutcome.trim(),
        priority,
        targetDate: targetDate || undefined,
        textInstructions: textInstructions.trim() || undefined,
        initialTasks: validTasks.length > 0 ? validTasks : undefined,
      });

      if (res.success) {
        toast.success(`Plan of Action "${title.trim()}" created successfully.`);
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || "Failed to create Plan of Action.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className="bg-surface rounded-2xl border border-border max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-poa-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-workspace">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 id="create-poa-title" className="text-base font-semibold text-ink">
                New Plan of Action (POA)
              </h2>
              <p className="text-xs text-ink-muted">
                Cadet: {studentName} {careerGoalTitle && `· Track: ${careerGoalTitle}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink">
              Plan Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Airline Flight Dispatch Ground Operations"
              className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            />
          </div>

          {/* Objective & Expected Outcome */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Objective</label>
              <input
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Core developmental objective"
                className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">
                Expected Outcome <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={expectedOutcome}
                onChange={(e) => setExpectedOutcome(e.target.value)}
                placeholder="Measurable result upon completion"
                className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
              />
            </div>
          </div>

          {/* Priority & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Target Completion Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
              />
            </div>
          </div>

          {/* Plain Text Mentor Instructions */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink">Mentor Instructions (Plain Text)</label>
            <textarea
              rows={2}
              value={textInstructions}
              onChange={(e) => setTextInstructions(e.target.value)}
              placeholder="e.g. Study chapter 4 & 5 of Jeppesen Airway Manual before our next 1-on-1 session."
              className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald resize-none"
            />
          </div>

          {/* Subtasks Checklist */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink">
                Subtasks / Action Checklist ({tasks.filter((t) => t.trim()).length})
              </label>
              {tasks.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-emerald hover:text-accent-emerald/80 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {tasks.map((task, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => handleTaskChange(idx, e.target.value)}
                    placeholder={`Task ${idx + 1} (e.g. Complete ATC phraseology mock drill)`}
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-border bg-workspace text-ink focus:outline-none focus:ring-1 focus:ring-accent-emerald"
                  />
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(idx)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Remove task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating POA...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Create Plan of Action</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
