"use client";

import { useRouter } from "next/navigation";
import { GanttBar } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

const PRIORITY_FILL: Record<string, string> = {
  CRITICAL: "bg-rose-500",
  HIGH: "bg-amber-500",
  MEDIUM: "bg-blue-500",
  LOW: "bg-stone-400 dark:bg-stone-500",
};

const t = (d: string) => new Date(d + "T00:00:00").getTime();
const fmt = (d: string) => {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
  } catch {
    return d;
  }
};

export function PoaGantt({ bars, studentId }: { bars: GanttBar[]; studentId: string }) {
  const router = useRouter();
  if (bars.length === 0) {
    return <div className="h-full flex items-center justify-center text-sm text-ink-muted">No plans of action yet.</div>;
  }

  const today = new Date().toISOString().split("T")[0];
  const min = Math.min(...bars.map((b) => t(b.start)), t(today));
  const max = Math.max(...bars.map((b) => t(b.end || b.start)), t(today));
  const span = max - min || 1;
  const pct = (ms: number) => ((ms - min) / span) * 100; // 0–100 within a track
  const todayPct = pct(t(today));

  return (
    <div className="h-full flex flex-col">
      {/* Scale header */}
      <div className="flex items-center gap-3 mb-2 px-0.5">
        <div className="w-[38%] shrink-0 text-[10px] font-mono uppercase tracking-wider text-ink-muted">Plan</div>
        <div className="flex-1 flex justify-between text-[10px] text-ink-muted">
          <span>{fmt(new Date(min).toISOString().split("T")[0])}</span>
          <span>{fmt(new Date(max).toISOString().split("T")[0])}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {bars.map((b) => {
          const left = pct(t(b.start));
          const width = Math.max(pct(t(b.end || today)) - left, 2);
          return (
            <button
              key={b.id}
              onClick={() => router.push(`/mentor-os/students/${studentId}`)}
              className="w-full flex items-center gap-3 group text-left"
              title={`${b.title} · ${fmt(b.start)} → ${b.end ? fmt(b.end) : "no target"} · ${b.progress}%`}
            >
              <div className="w-[38%] shrink-0 min-w-0">
                <div className="text-xs font-medium text-ink truncate group-hover:text-accent-emerald">{b.title}</div>
                <div className="text-[10px] text-ink-muted">
                  {b.progress}% · {b.priority.toLowerCase()}
                  {b.overdue && <span className="text-rose-500 font-medium"> · overdue</span>}
                </div>
              </div>
              <div className="relative flex-1 h-6 rounded bg-surface-subtle overflow-hidden">
                {/* today marker */}
                <div className="absolute top-0 bottom-0 w-px bg-rose-400/70 z-10" style={{ left: `${todayPct}%` }} />
                {/* bar with progress fill */}
                <div
                  className={cn("absolute top-1 bottom-1 rounded bg-surface-hover overflow-hidden", b.overdue && "ring-1 ring-rose-400", !b.end && "opacity-70")}
                  style={{ left: `${left}%`, width: `${width}%`, minWidth: 6 }}
                >
                  <div
                    className={cn("h-full", PRIORITY_FILL[b.priority] || PRIORITY_FILL.MEDIUM)}
                    style={{ width: `${b.progress}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
