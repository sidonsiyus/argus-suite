"use client";

import { FunnelBucket } from "@/lib/analytics/types";
import { useChartPalette } from "@/lib/charts/palette";
import { fmtInt, fmtPct } from "@/lib/charts/format";

export function PipelineFunnel({ funnel }: { funnel: FunnelBucket[] }) {
  const palette = useChartPalette();
  const total = funnel.reduce((s, f) => s + f.count, 0) || 1;
  const max = Math.max(...funnel.map((f) => f.count), 1);

  return (
    <div className="h-full flex flex-col justify-center gap-3.5 px-2">
      {funnel.map((f, i) => {
        const pct = Math.round((f.count / total) * 100);
        const width = Math.max((f.count / max) * 100, f.count > 0 ? 6 : 2);
        // Ordinal ramp: earlier stage = lighter, later = deeper.
        const color = palette.ordinal[Math.min(i, palette.ordinal.length - 1)];
        return (
          <div key={f.stage}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: color }} />
                <span className="text-xs font-semibold text-ink-secondary">{f.stage}</span>
              </div>
              <span className="text-xs text-ink-muted tabular-nums">
                <b className="text-ink">{fmtInt(f.count)}</b> · {fmtPct(pct)}
              </span>
            </div>
            <div className="h-6 rounded-md bg-surface-subtle overflow-hidden">
              <div
                className="h-full rounded-md transition-all duration-500 ease-out"
                style={{ width: `${width}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
