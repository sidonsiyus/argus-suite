"use client";

import { Gauge, CalendarCheck, CheckCircle2, AlertTriangle, Users, Activity } from "lucide-react";
import { CohortAnalytics } from "@/lib/analytics/types";
import { ChartCard } from "@/components/ui/ChartCard";
import { AnalyticsKpiCard } from "./AnalyticsKpiCard";
import { AtRiskScatter } from "./AtRiskScatter";
import { PipelineFunnel } from "./PipelineFunnel";
import { ReadinessHeatmap } from "./ReadinessHeatmap";

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-ink-muted">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export function CohortOverview({ analytics }: { analytics: CohortAnalytics }) {
  const { kpis, scatter, funnel, readinessMatrix } = analytics;

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsKpiCard label="Avg readiness" value={kpis.avgReadiness} suffix="%" icon={Gauge} accent="emerald" />
        <AnalyticsKpiCard
          label="Sessions this week"
          value={kpis.sessionsThisWeek}
          icon={CalendarCheck}
          accent="blue"
          trend={kpis.sessionsTrend}
          spark={kpis.sessionsSpark}
        />
        <AnalyticsKpiCard
          label="Tasks completed"
          value={kpis.tasksThisWeek}
          icon={CheckCircle2}
          accent="emerald"
          trend={kpis.tasksTrend}
          spark={kpis.tasksSpark}
        />
        <AnalyticsKpiCard label="Students at risk" value={kpis.atRiskCount} icon={AlertTriangle} accent="rose" />
      </div>

      {/* Scatter + funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          eyebrow="Cohort"
          title="Progress vs momentum"
          subtitle="Bubble size = open critical items · click a cadet to open"
          icon={Activity}
          height={340}
          className="lg:col-span-2"
          empty={scatter.length === 0}
          action={
            <div className="hidden sm:flex items-center gap-3">
              <LegendDot color="var(--accent-emerald)" label="On track" />
              <LegendDot color="var(--accent-rose)" label="At risk" />
              <LegendDot color="var(--accent-blue)" label="Placed" />
            </div>
          }
        >
          <AtRiskScatter points={scatter} />
        </ChartCard>

        <ChartCard eyebrow="Pipeline" title="Readiness funnel" subtitle="Where the cohort sits" icon={Users} height={340} empty={kpis.totalStudents === 0}>
          <PipelineFunnel funnel={funnel} />
        </ChartCard>
      </div>

      {/* Readiness matrix */}
      <ChartCard
        eyebrow="Documents"
        title="Career-readiness matrix"
        subtitle="Green = ready · amber = in progress · grey = missing. A pale column is a cohort-wide gap."
        icon={CheckCircle2}
        height={380}
        bodyClassName="px-3 py-2"
        empty={readinessMatrix.rows.length === 0}
      >
        <ReadinessHeatmap matrix={readinessMatrix} />
      </ChartCard>
    </div>
  );
}
