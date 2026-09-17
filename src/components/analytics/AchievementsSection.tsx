"use client";

import { Trophy, BadgeCheck, Clock, UserX, CalendarRange, Layers } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { CohortAchievements } from "@/lib/analytics/types";
import { ChartCard } from "@/components/ui/ChartCard";
import { CountBars } from "./CountBars";
import { TrendBars } from "./TrendBars";
import { fmtInt } from "@/lib/charts/format";
import { cn } from "@/lib/utils";

function Tile({ icon: Icon, label, value, accent }: { icon: LucideIcon; label: string; value: number; accent: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 transition-all duration-200 hover:border-border-strong hover:shadow-md">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", accent)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-ink tabular-nums leading-none">{fmtInt(value)}</div>
        <div className="text-[11px] text-ink-muted mt-1">{label}</div>
      </div>
    </div>
  );
}

export function AchievementsSection({ data }: { data: CohortAchievements }) {
  return (
    <div className="space-y-6">
      <div className="mos-rise grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile icon={Trophy} label="Total achievements" value={data.total} accent="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400" />
        <Tile icon={BadgeCheck} label="Verified" value={data.verified} accent="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" />
        <Tile icon={Clock} label="Pending review" value={data.pending} accent="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" />
        <Tile icon={UserX} label="Cadets with none" value={data.zeroCount} accent="bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard eyebrow="Categories" title="Achievements by category" subtitle="Across the cohort" icon={Layers} accent="amber" height={300} empty={data.byCategory.length === 0} emptyLabel="No achievements recorded yet">
          <CountBars items={data.byCategory.map((c) => ({ label: c.label, value: c.count }))} hue="amber" />
        </ChartCard>

        <ChartCard eyebrow="Over time" title="Achievements per week" subtitle="Last 12 weeks" icon={CalendarRange} accent="emerald" height={300} empty={data.weekly.every((w) => w.count === 0)} emptyLabel="No achievements recorded yet">
          <TrendBars data={data.weekly} hue="emerald" />
        </ChartCard>
      </div>
    </div>
  );
}
