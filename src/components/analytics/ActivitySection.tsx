"use client";

import { Activity, Boxes, Sparkles } from "lucide-react";
import { CohortActivity } from "@/lib/analytics/types";
import { ChartCard } from "@/components/ui/ChartCard";
import { CountBars } from "./CountBars";
import { TrendBars } from "./TrendBars";
import { fmtInt } from "@/lib/charts/format";

function AiStat({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <div className="flex-1 text-center">
      <div className={`text-2xl font-bold tabular-nums ${tone}`}>{fmtInt(value)}</div>
      <div className="text-[11px] text-ink-muted mt-1">{label}</div>
    </div>
  );
}

export function ActivitySection({ data }: { data: CohortActivity }) {
  const totalRecs = data.aiRecs.pending + data.aiRecs.approved + data.aiRecs.rejected;
  const approvalRate = totalRecs > 0 ? Math.round((data.aiRecs.approved / totalRecs) * 100) : 0;

  return (
    <div className="space-y-6">
      <ChartCard
        eyebrow="Activity"
        title="Mentor activity per week"
        subtitle="Logged actions across the console · last 12 weeks"
        icon={Activity}
        accent="blue"
        height={260}
        empty={data.weekly.every((w) => w.count === 0)}
        emptyLabel="No recorded activity yet"
      >
        <TrendBars data={data.weekly} hue="blue" />
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard eyebrow="Where" title="Activity by area" subtitle="Which records get the most attention" icon={Boxes} accent="violet" height={260} empty={data.byEntity.length === 0}>
          <CountBars items={data.byEntity.map((e) => ({ label: e.label, value: e.count }))} hue="violet" />
        </ChartCard>

        <ChartCard eyebrow="AI copilot" title="Recommendation review" subtitle={`${approvalRate}% approval rate`} icon={Sparkles} accent="emerald" height={260}>
          <div className="h-full flex items-center justify-center gap-3">
            <AiStat value={data.aiRecs.pending} label="Pending" tone="text-blue-600 dark:text-blue-400" />
            <div className="w-px h-12 bg-border" />
            <AiStat value={data.aiRecs.approved} label="Approved" tone="text-emerald-600 dark:text-emerald-400" />
            <div className="w-px h-12 bg-border" />
            <AiStat value={data.aiRecs.rejected} label="Rejected" tone="text-rose-600 dark:text-rose-400" />
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
