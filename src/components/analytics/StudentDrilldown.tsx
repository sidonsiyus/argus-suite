"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, CalendarCheck, Target, CheckCircle2, Gauge, Activity, Route, GanttChartSquare, Radar as RadarIcon } from "lucide-react";
import { StudentAnalytics } from "@/lib/analytics/types";
import { ChartCard } from "@/components/ui/ChartCard";
import { SessionJourney } from "./SessionJourney";
import { EngagementLine } from "./EngagementLine";
import { PoaGantt } from "./PoaGantt";
import { SkillsRadar } from "./SkillsRadar";

function Chip({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border">
      <Icon className="w-3.5 h-3.5 text-accent-emerald" />
      <span className="text-xs text-ink-muted">{label}</span>
      <span className="text-xs font-semibold text-ink tabular-nums">{value}</span>
    </div>
  );
}

export function StudentDrilldown({ data }: { data: StudentAnalytics }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/mentor-os/analytics" className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent-emerald mb-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to cohort
          </Link>
          <h2 className="text-lg font-semibold text-ink">{data.name}</h2>
          <p className="text-xs text-ink-muted">{data.regNo}</p>
        </div>
        <Link
          href={`/mentor-os/students/${data.studentId}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-accent-emerald text-white hover:opacity-90 transition-opacity"
        >
          Full profile <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Totals */}
      <div className="flex flex-wrap gap-2.5">
        <Chip icon={CalendarCheck} label="Sessions" value={data.totals.sessions} />
        <Chip icon={Target} label="Plans" value={data.totals.milestones} />
        <Chip icon={CheckCircle2} label="Completed" value={data.totals.completedMilestones} />
        <Chip icon={Gauge} label="Skill avg" value={data.totals.skillAvg !== null ? `${data.totals.skillAvg}/5` : "—"} />
      </div>

      {/* Session journey */}
      <ChartCard
        eyebrow="Journey"
        title="Session timeline"
        subtitle="Each session over time · +N = tasks completed after it"
        icon={Route}
        height={170}
        bodyClassName="px-1 py-2"
        empty={data.journey.length === 0}
        emptyLabel="No sessions logged yet"
      >
        <SessionJourney nodes={data.journey} />
      </ChartCard>

      {/* Engagement + radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          eyebrow="Momentum"
          title="Engagement over time"
          subtitle="Cumulative sessions · dashed line = milestone completed"
          icon={Activity}
          height={280}
          empty={data.engagement.length === 0}
          emptyLabel="No engagement history yet"
        >
          <EngagementLine points={data.engagement} flags={data.milestoneFlags} />
        </ChartCard>

        <ChartCard
          eyebrow="Skills"
          title="Skills profile"
          subtitle="Average rating by area · dashed = earlier assessment"
          icon={RadarIcon}
          height={280}
          empty={data.radar.length === 0}
          emptyLabel="No skill assessments yet"
        >
          <SkillsRadar axes={data.radar} />
        </ChartCard>
      </div>

      {/* POA Gantt */}
      <ChartCard
        eyebrow="Roadmap"
        title="Plans of action"
        subtitle="Timeline from created to target · fill = progress · priority-coloured"
        icon={GanttChartSquare}
        height={300}
        empty={data.gantt.length === 0}
        emptyLabel="No plans of action yet"
      >
        <PoaGantt bars={data.gantt} studentId={data.studentId} />
      </ChartCard>
    </div>
  );
}
