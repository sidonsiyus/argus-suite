"use client";

import { CalendarCheck, Target, CheckCircle2, ListChecks, Gauge, FileCheck } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { StudentAnalytics } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

function Tile({ icon: Icon, label, value, accent }: { icon: LucideIcon; label: string; value: string; accent: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3.5 flex items-center gap-3 transition-all duration-200 hover:border-border-strong hover:shadow-md">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", accent)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-lg font-bold text-ink tabular-nums leading-none">{value}</div>
        <div className="text-[11px] text-ink-muted mt-1 truncate">{label}</div>
      </div>
    </div>
  );
}

export function StudentKpiStrip({ data }: { data: StudentAnalytics }) {
  const tiles = [
    { icon: CalendarCheck, label: "Sessions", value: String(data.totals.sessions), accent: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" },
    { icon: Target, label: "Plans", value: String(data.totals.milestones), accent: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
    { icon: CheckCircle2, label: "Completed", value: String(data.totals.completedMilestones), accent: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
    { icon: ListChecks, label: "Tasks done", value: `${data.taskTotals.completed}/${data.taskTotals.total}`, accent: "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400" },
    { icon: Gauge, label: "Skill avg", value: data.totals.skillAvg !== null ? `${data.totals.skillAvg}/5` : "—", accent: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400" },
    { icon: FileCheck, label: "Readiness", value: `${data.readiness.readyCount}/${data.readiness.columns.length}`, accent: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400" },
  ];
  return (
    <div className="mos-rise grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {tiles.map((t) => (
        <Tile key={t.label} {...t} />
      ))}
    </div>
  );
}
