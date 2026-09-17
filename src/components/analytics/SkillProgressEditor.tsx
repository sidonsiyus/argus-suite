"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, TrendingUp, Loader2 } from "lucide-react";
import { EditorSkill, SessionOption } from "@/lib/analytics/types";
import { recordSkillProgressAction } from "@/app/actions/skills";
import { cn } from "@/lib/utils";

export function SkillProgressEditor({
  studentId,
  studentName,
  skills,
  sessions,
  defaultSessionId,
  onClose,
}: {
  studentId: string;
  studentName: string;
  skills: EditorSkill[];
  sessions: SessionOption[];
  defaultSessionId?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(skills.map((s) => [s.id, s.rating]))
  );
  const [sessionId, setSessionId] = useState<string>(defaultSessionId || "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changed = useMemo(
    () => skills.filter((s) => (ratings[s.id] || 0) >= 1 && (ratings[s.id] || 0) !== s.rating),
    [skills, ratings]
  );

  const grouped = useMemo(() => {
    const m = new Map<string, EditorSkill[]>();
    skills.forEach((s) => {
      if (!m.has(s.category)) m.set(s.category, []);
      m.get(s.category)!.push(s);
    });
    return Array.from(m.entries());
  }, [skills]);

  async function save() {
    if (changed.length === 0) return;
    setSaving(true);
    setError(null);
    const res = await recordSkillProgressAction({
      studentId,
      sessionId: sessionId || null,
      updates: changed.map((s) => ({ skillId: s.id, rating: ratings[s.id], note: note || undefined })),
    });
    setSaving(false);
    if (res.success) {
      router.refresh();
      onClose();
    } else {
      setError(res.error || "Failed to save.");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-surface border border-border-strong rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Log skill progress</h3>
              <p className="text-xs text-ink-muted">{studentName} · set a new rating for any skill that improved</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-subtle" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {sessions.length > 0 && (
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">After session (optional)</label>
              <select
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="mt-1 w-full text-sm bg-surface-subtle border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-accent-emerald"
              >
                <option value="">Not tied to a session</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          {grouped.map(([category, list]) => (
            <div key={category}>
              <p className="text-[11px] font-mono uppercase tracking-wider text-accent-emerald mb-2">{category}</p>
              <div className="space-y-2">
                {list.map((s) => {
                  const val = ratings[s.id] || 0;
                  const improved = val > s.rating;
                  return (
                    <div key={s.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-ink truncate">{s.name}</div>
                        <div className="text-[11px] text-ink-muted">
                          was {s.rating || "—"}/5{improved && <span className="text-emerald-600 dark:text-emerald-400 font-medium"> · +{val - s.rating}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <button
                            key={r}
                            onClick={() => setRatings((prev) => ({ ...prev, [s.id]: r }))}
                            className={cn(
                              "w-7 h-7 rounded-md text-xs font-semibold transition-colors",
                              val >= r
                                ? "bg-emerald-500 text-white"
                                : "bg-surface-subtle text-ink-muted hover:bg-surface-hover"
                            )}
                            aria-label={`Set ${s.name} to ${r}`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="What changed, evidence observed…"
              className="mt-1 w-full text-sm bg-surface-subtle border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-accent-emerald resize-none"
            />
          </div>

          {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-3">
          <span className="text-xs text-ink-muted">
            {changed.length > 0 ? `${changed.length} skill${changed.length === 1 ? "" : "s"} to update` : "No changes yet"}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-xs font-medium px-3 py-2 rounded-lg text-ink-secondary hover:bg-surface-subtle">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || changed.length === 0}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-accent-emerald text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
