"use client";

import { useChartPalette } from "@/lib/charts/palette";
import { fmtInt } from "@/lib/charts/format";

interface Item {
  label: string;
  value: number;
}

/**
 * Horizontal magnitude bars — one hue (magnitude ⇒ single colour), direct value
 * labels, recessive track. Used for POA status, session-type mix, skill ratings.
 */
export function CountBars({
  items,
  max,
  hue = "blue",
  unit = "",
  emptyLabel = "No data yet",
}: {
  items: Item[];
  /** Fixed scale max (e.g. 5 for ratings). Defaults to the largest value. */
  max?: number;
  hue?: "blue" | "emerald" | "amber" | "violet";
  unit?: string;
  emptyLabel?: string;
}) {
  const palette = useChartPalette();
  const HUE: Record<string, string> = {
    blue: palette.blue,
    emerald: palette.emerald,
    amber: palette.amber,
    violet: palette.isDark ? "#9085e9" : "#4a3aa7",
  };
  const color = HUE[hue];

  if (!items.length) {
    return <div className="h-full flex items-center justify-center text-sm text-ink-muted">{emptyLabel}</div>;
  }
  const scale = max ?? Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="h-full overflow-y-auto pr-1 flex flex-col justify-center gap-2.5">
      {items.map((it) => {
        const w = Math.max((it.value / scale) * 100, it.value > 0 ? 3 : 0);
        return (
          <div key={it.label} className="flex items-center gap-3">
            <div className="w-[38%] shrink-0 text-xs text-ink-secondary truncate" title={it.label}>
              {it.label}
            </div>
            <div className="flex-1 h-5 rounded-md bg-surface-subtle overflow-hidden">
              <div className="h-full rounded-md transition-all duration-500 ease-out" style={{ width: `${w}%`, background: color }} />
            </div>
            <div className="w-10 shrink-0 text-right text-xs font-semibold text-ink tabular-nums">
              {unit === "/5" ? it.value.toFixed(1) : fmtInt(it.value)}
              {unit === "/5" && <span className="text-ink-muted font-normal">/5</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
