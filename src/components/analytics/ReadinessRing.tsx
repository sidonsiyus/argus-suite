"use client";

import { cn } from "@/lib/utils";

type Cell = "READY" | "PARTIAL" | "MISSING";

const CELL_VAR: Record<Cell, string> = {
  READY: "var(--accent-emerald)",
  PARTIAL: "var(--accent-amber)",
  MISSING: "var(--border-strong)",
};
const CELL_DOT: Record<Cell, string> = {
  READY: "bg-emerald-500",
  PARTIAL: "bg-amber-400",
  MISSING: "bg-stone-300 dark:bg-surface-hover",
};
const CELL_WORD: Record<Cell, string> = { READY: "Ready", PARTIAL: "In progress", MISSING: "Missing" };

export function ReadinessRing({
  columns,
  cells,
  readyCount,
}: {
  columns: string[];
  cells: Cell[];
  readyCount: number;
}) {
  const n = columns.length || 1;
  const seg = 360 / n;
  const gap = 2; // degrees of surface between segments
  const stops: string[] = [];
  cells.forEach((c, i) => {
    const start = i * seg;
    const end = (i + 1) * seg;
    stops.push(`${CELL_VAR[c]} ${start + gap / 2}deg ${end - gap / 2}deg`);
    stops.push(`var(--bg-surface) ${end - gap / 2}deg ${end + gap / 2}deg`);
  });
  const ring = `conic-gradient(from -90deg, ${stops.join(", ")})`;

  return (
    <div className="h-full flex items-center justify-center gap-6 px-2">
      {/* Donut */}
      <div className="relative flex-none" style={{ width: 132, height: 132 }}>
        <div className="w-full h-full rounded-full" style={{ background: ring }} />
        <div className="absolute inset-[18px] rounded-full bg-surface flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-ink tabular-nums leading-none">
            {readyCount}
            <span className="text-base text-ink-muted font-semibold">/{n}</span>
          </span>
          <span className="text-[10px] uppercase tracking-wider text-ink-muted mt-1">Ready</span>
        </div>
      </div>
      {/* Legend */}
      <div className="min-w-0 space-y-1.5">
        {columns.map((col, i) => (
          <div key={col} className="flex items-center gap-2 text-xs">
            <span className={cn("w-2 h-2 rounded-full shrink-0", CELL_DOT[cells[i]])} />
            <span className="text-ink-secondary w-16 shrink-0 truncate">{col}</span>
            <span className="text-ink-muted">{CELL_WORD[cells[i]]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
