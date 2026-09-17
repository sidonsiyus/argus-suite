"use client";

import { useRouter } from "next/navigation";
import { ReadinessMatrix } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

const CELL: Record<"READY" | "PARTIAL" | "MISSING", string> = {
  READY: "bg-emerald-500/85 dark:bg-emerald-500/70",
  PARTIAL: "bg-amber-400/80 dark:bg-amber-500/60",
  MISSING: "bg-stone-200 dark:bg-surface-hover",
};

export function ReadinessHeatmap({ matrix }: { matrix: ReadinessMatrix }) {
  const router = useRouter();
  const { columns, rows, columnReady } = matrix;

  if (rows.length === 0) {
    return <div className="h-full flex items-center justify-center text-sm text-ink-muted">No readiness data yet.</div>;
  }

  return (
    <div className="h-full overflow-auto">
      <div className="min-w-[520px]">
        {/* Header */}
        <div className="grid sticky top-0 z-10 bg-surface" style={{ gridTemplateColumns: `minmax(120px,1.4fr) repeat(${columns.length}, 1fr)` }}>
          <div className="px-2 py-2 text-[10px] font-mono uppercase tracking-wider text-ink-muted">Cadet</div>
          {columns.map((c, i) => (
            <div key={c} className="px-1 py-2 text-center">
              <div className="text-[10px] font-medium text-ink-secondary truncate">{c}</div>
              <div className="text-[10px] text-ink-muted tabular-nums">{columnReady[i]}/{rows.length}</div>
            </div>
          ))}
        </div>
        {/* Rows */}
        {rows.map((r) => (
          <button
            key={r.studentId}
            onClick={() => router.push(`/mentor-os/analytics/${r.studentId}`)}
            className="grid w-full items-center hover:bg-surface-subtle transition-colors text-left group"
            style={{ gridTemplateColumns: `minmax(120px,1.4fr) repeat(${columns.length}, 1fr)` }}
            title={`Open ${r.name}`}
          >
            <div className="px-2 py-1.5 min-w-0">
              <div className="text-xs font-medium text-ink truncate group-hover:text-accent-emerald">{r.name}</div>
              <div className="text-[10px] text-ink-muted truncate">{r.regNo}</div>
            </div>
            {r.cells.map((cell, i) => (
              <div key={i} className="px-1 py-1.5 flex items-center justify-center">
                <div
                  className={cn("w-full h-6 rounded", CELL[cell])}
                  title={`${columns[i]}: ${cell.toLowerCase()}`}
                />
              </div>
            ))}
          </button>
        ))}
      </div>
    </div>
  );
}
