"use client";

import { SessionJourneyNode } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: "bg-emerald-500 border-emerald-600",
  SCHEDULED: "bg-blue-500 border-blue-600",
  IN_PROGRESS: "bg-amber-500 border-amber-600",
  CANCELLED: "bg-stone-300 dark:bg-stone-600 border-stone-400",
  NO_SHOW: "bg-rose-500 border-rose-600",
};

function fmt(d: string) {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  } catch {
    return d;
  }
}

export function SessionJourney({ nodes }: { nodes: SessionJourneyNode[] }) {
  if (nodes.length === 0) {
    return <div className="h-full flex items-center justify-center text-sm text-ink-muted">No sessions logged yet.</div>;
  }

  // Dot size scales with duration (15–60 min → 12–22px).
  const size = (min: number) => Math.round(12 + Math.min(Math.max(min, 15), 60) / 60 * 10);

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden">
      <div className="flex items-center gap-0 min-w-max px-4 h-full">
        {nodes.map((n, i) => {
          const s = size(n.durationMinutes);
          return (
            <div key={n.id} className="flex items-center">
              <div className="flex flex-col items-center w-[74px]">
                {/* Tasks-completed badge */}
                <div className="h-5 mb-1 flex items-end">
                  {n.tasksCompleted > 0 && (
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                      +{n.tasksCompleted}
                    </span>
                  )}
                </div>
                <div
                  className={cn("rounded-full border-2 shrink-0 transition-transform hover:scale-110", STATUS_COLOR[n.status] || STATUS_COLOR.COMPLETED)}
                  style={{ width: s, height: s }}
                  title={`${fmt(n.date)} · ${n.focus} · ${n.durationMinutes}m · ${n.status.toLowerCase()}`}
                />
                <span className="mt-2 text-[10px] text-ink-secondary font-medium">{fmt(n.date)}</span>
                <span className="text-[9px] text-ink-muted truncate max-w-[70px] text-center">
                  {n.type.replace(/_/g, " ").toLowerCase()}
                </span>
              </div>
              {i < nodes.length - 1 && <div className="w-6 h-px bg-border-strong shrink-0 -mt-6" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
