"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, Loader2, RefreshCw, Check, Plus, Trash2 } from "lucide-react";
import { RoadmapStage } from "@/lib/mentor-os/roadmaps";
import { generateRoadmapSuggestionAction, saveRoadmapTemplateAction } from "@/app/actions/roadmaps";

interface EditableStage extends RoadmapStage {}

export function RoadmapAiReview({
  trackSlug,
  trackTitle,
  onClose,
}: {
  trackSlug: string;
  trackTitle: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stages, setStages] = useState<EditableStage[]>([]);
  const [examGuidance, setExamGuidance] = useState("");

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await generateRoadmapSuggestionAction(trackSlug);
    setLoading(false);
    if (res.success && res.suggestion) {
      setStages(res.suggestion.stages as EditableStage[]);
      setExamGuidance(res.suggestion.examGuidance || "");
    } else {
      setError(res.error || "Couldn't generate a suggestion.");
    }
  }

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackSlug]);

  function updateStage(i: number, patch: Partial<EditableStage>) {
    setStages((list) => list.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function removeStage(i: number) {
    setStages((list) => list.filter((_, idx) => idx !== i));
  }
  function addStage() {
    setStages((list) => [...list, { key: `stage-${list.length + 1}`, title: "New stage", phase: "", objective: "", criteria: [] }]);
  }

  async function approve() {
    if (stages.length === 0) return;
    setSaving(true);
    setError(null);
    const res = await saveRoadmapTemplateAction({ trackSlug, stages, examGuidance: examGuidance || null, source: "AI_SUGGESTED" });
    setSaving(false);
    if (res.success) {
      router.refresh();
      onClose();
    } else {
      setError(res.error || "Couldn't save. Is the roadmap_templates table migrated?");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-2xl max-h-[88vh] flex flex-col bg-surface border border-border-strong rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">AI roadmap suggestion</h3>
              <p className="text-xs text-ink-muted">{trackTitle} · review and edit before approving</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-subtle" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loading ? (
            <div className="h-40 flex flex-col items-center justify-center gap-2 text-ink-muted">
              <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
              <span className="text-sm">Generating a suggested roadmap…</span>
            </div>
          ) : (
            <>
              {stages.map((s, i) => (
                <div key={i} className="bg-surface-subtle border border-border rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <input
                      value={s.title}
                      onChange={(e) => updateStage(i, { title: e.target.value })}
                      className="flex-1 text-sm font-semibold bg-surface border border-border rounded-lg px-2.5 py-1.5 text-ink focus:outline-none focus:border-accent-emerald"
                    />
                    <input
                      value={s.phase}
                      onChange={(e) => updateStage(i, { phase: e.target.value })}
                      placeholder="phase"
                      className="w-28 text-[11px] bg-surface border border-border rounded-lg px-2 py-1.5 text-ink-secondary focus:outline-none focus:border-accent-emerald"
                    />
                    <button onClick={() => removeStage(i)} className="p-1.5 rounded-lg text-ink-muted hover:text-rose-500" aria-label="Remove stage">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={s.objective}
                    onChange={(e) => updateStage(i, { objective: e.target.value })}
                    rows={2}
                    placeholder="Objective"
                    className="w-full text-xs bg-surface border border-border rounded-lg px-2.5 py-2 text-ink resize-none focus:outline-none focus:border-accent-emerald"
                  />
                  <input
                    value={s.criteria.join(" · ")}
                    onChange={(e) => updateStage(i, { criteria: e.target.value.split("·").map((c) => c.trim()).filter(Boolean) })}
                    placeholder="Criteria · separated · by · dots"
                    className="mt-2 w-full text-[11px] bg-surface border border-border rounded-lg px-2.5 py-1.5 text-ink-secondary focus:outline-none focus:border-accent-emerald"
                  />
                </div>
              ))}
              <button onClick={addStage} className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent-emerald">
                <Plus className="w-3.5 h-3.5" /> Add stage
              </button>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Exam guidance (verify official notification)</label>
                <textarea
                  value={examGuidance}
                  onChange={(e) => setExamGuidance(e.target.value)}
                  rows={3}
                  className="mt-1 w-full text-xs bg-surface-subtle border border-border rounded-lg px-2.5 py-2 text-ink resize-none focus:outline-none focus:border-accent-emerald"
                />
              </div>

              {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
            </>
          )}
        </div>

        <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-3">
          <button onClick={generate} disabled={loading || saving} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg text-ink-secondary hover:bg-surface-subtle disabled:opacity-50">
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-xs font-medium px-3 py-2 rounded-lg text-ink-secondary hover:bg-surface-subtle">Cancel</button>
            <button
              onClick={approve}
              disabled={saving || loading || stages.length === 0}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-accent-emerald text-white disabled:opacity-50 hover:opacity-90"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Approve & use
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
