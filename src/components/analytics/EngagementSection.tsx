"use client";

import { useRouter } from "next/navigation";
import { CalendarRange, PieChart, BellRing, MoonStar, Users } from "lucide-react";
import { CohortEngagement } from "@/lib/analytics/types";
import { ChartCard } from "@/components/ui/ChartCard";
import { TrendBars } from "./TrendBars";
import { CountBars } from "./CountBars";
import { fmtInt } from "@/lib/charts/format";

function BigStat({ value, label, tone }: { value: number; label: string; tone: "rose" | "blue" }) {
  const color = tone === "rose" ? "text-rose-600 dark:text-rose-400" : "text-blue-600 dark:text-blue-400";
  return (
    <div className="flex-1 text-center">
      <div className={`text-3xl font-bold tabular-nums ${color}`}>{fmtInt(value)}</div>
      <div className="text-xs text-ink-muted mt-1">{label}</div>
    </div>
  );
}

export function EngagementSection({ data }: { data: CohortEngagement }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <ChartCard
        eyebrow="Cadence"
        title="Sessions per week"
        subtitle={`Last 12 weeks · ${data.avgSessionsPerCadet} sessions per cadet on average`}
        icon={CalendarRange}
        accent="blue"
        height={260}
        empty={data.weekly.every((w) => w.count === 0)}
        emptyLabel="No sessions logged yet"
      >
        <TrendBars data={data.weekly} hue="blue" />
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard eyebrow="Types" title="Session mix" subtitle="By session type" icon={PieChart} accent="emerald" height={240} empty={data.typeMix.length === 0}>
          <CountBars items={data.typeMix.map((t) => ({ label: t.label, value: t.count }))} hue="emerald" />
        </ChartCard>

        <ChartCard eyebrow="Follow-ups" title="Follow-up health" subtitle="Scheduled follow-ups" icon={BellRing} accent="amber" height={240}>
          <div className="h-full flex items-center justify-center gap-4">
            <BigStat value={data.followUps.overdue} label="Overdue" tone="rose" />
            <div className="w-px h-12 bg-border" />
            <BigStat value={data.followUps.upcoming} label="Upcoming" tone="blue" />
          </div>
        </ChartCard>

        <ChartCard
          eyebrow="At risk"
          title="Gone quiet"
          subtitle="No activity in 21+ days"
          icon={MoonStar}
          accent="rose"
          height={240}
          bodyClassName="px-3 py-2"
          empty={data.goneQuiet.length === 0}
          emptyLabel="Everyone's been active recently"
        >
          <div className="h-full overflow-y-auto space-y-0.5">
            {data.goneQuiet.map((c) => (
              <button
                key={c.studentId}
                onClick={() => router.push(`/mentor-os/analytics/${c.studentId}`)}
                className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-subtle text-left"
              >
                <div className="min-w-0">
                  <div className="text-xs font-medium text-ink truncate">{c.name}</div>
                  <div className="text-[10px] text-ink-muted">{c.regNo}</div>
                </div>
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 tabular-nums shrink-0">
                  {c.days === null ? "never" : `${c.days}d`}
                </span>
              </button>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
