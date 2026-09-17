"use client";

import { FunnelBucket, PipelineStage } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

const STAGE_STYLE: Record<PipelineStage, { bar: string; dot: string }> = {
  "Not started": { bar: "bg-stone-300 dark:bg-stone-600", dot: "bg-stone-400" },
  "In progress": { bar: "bg-amber-400 dark:bg-amber-500", dot: "bg-amber-500" },
  Ready: { bar: "bg-emerald-500 dark:bg-emerald-500", dot: "bg-emerald-500" },
  Placed: { bar: "bg-blue-500 dark:bg-blue-500", dot: "bg-blue-500" },
};

export function PipelineFunnel({ funnel }: { funnel: FunnelBucket[] }) {
  const total = funnel.reduce((s, f) => s + f.count, 0) || 1;
  const max = Math.max(...funnel.map((f) => f.count), 1);

  return (
    <div className="h-full flex flex-col justify-center gap-3 px-2">
      {funnel.map((f) => {
        const pct = Math.round((f.count / total) * 100);
        const width = Math.max((f.count / max) * 100, f.count > 0 ? 6 : 2);
        const style = STAGE_STYLE[f.stage];
        return (
          <div key={f.stage} className="group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", style.dot)} />
                <span className="text-xs font-medium text-ink-secondary">{f.stage}</span>
              </div>
              <span className="text-xs text-ink-muted tabular-nums">
                <b className="text-ink">{f.count}</b> · {pct}%
              </span>
            </div>
            <div className="h-6 rounded-md bg-surface-subtle overflow-hidden">
              <div
                className={cn("h-full rounded-md transition-all duration-500 ease-out", style.bar)}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
