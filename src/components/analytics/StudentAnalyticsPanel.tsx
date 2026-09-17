"use client";

import { Route, Activity, Radar as RadarIcon, GanttChartSquare, FileCheck, ListTodo, PieChart, BarChart3 } from "lucide-react";
import { StudentAnalytics } from "@/lib/analytics/types";
import { ChartCard } from "@/components/ui/ChartCard";
import { StudentKpiStrip } from "./StudentKpiStrip";
import { SessionJourney } from "./SessionJourney";
import { EngagementLine } from "./EngagementLine";
import { PoaGantt } from "./PoaGantt";
import { SkillsRadar } from "./SkillsRadar";
import { ReadinessRing } from "./ReadinessRing";
import { CountBars } from "./CountBars";

/**
 * The full per-student analytics dashboard body (no page header) — shared by the
 * standalone drill-down route and the Student 360 "Analytics" tab.
 */
export function StudentAnalyticsPanel({ data }: { data: StudentAnalytics }) {
  return (
    <div className="space-y-6">
      <StudentKpiStrip data={data} />

      {/* Session journey */}
      <ChartCard
        eyebrow="Journey"
        title="Session timeline"
        subtitle="Each session over time · +N = tasks completed after it"
        icon={Route}
        accent="blue"
        height={170}
        bodyClassName="px-1 py-2"
        empty={data.journey.length === 0}
        emptyLabel="No sessions logged yet"
      >
        <SessionJourney nodes={data.journey} />
      </ChartCard>

      {/* Engagement + skills radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          eyebrow="Momentum"
          title="Engagement over time"
          subtitle="Cumulative sessions · dashed line = milestone completed"
          icon={Activity}
          accent="emerald"
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
          accent="violet"
          height={280}
          empty={data.radar.length === 0}
          emptyLabel="No skill assessments yet"
        >
          <SkillsRadar axes={data.radar} />
        </ChartCard>
      </div>

      {/* Readiness ring + POA status + session-type mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          eyebrow="Documents"
          title="Career readiness"
          subtitle="The six placement documents"
          icon={FileCheck}
          accent="rose"
          height={230}
          empty={data.readiness.columns.length === 0}
        >
          <ReadinessRing columns={data.readiness.columns} cells={data.readiness.cells} readyCount={data.readiness.readyCount} />
        </ChartCard>

        <ChartCard
          eyebrow="Plans"
          title="POA status"
          subtitle="Plans by state"
          icon={ListTodo}
          accent="emerald"
          height={230}
          empty={data.poaStatus.length === 0}
          emptyLabel="No plans yet"
        >
          <CountBars items={data.poaStatus.map((p) => ({ label: p.label, value: p.count }))} hue="emerald" />
        </ChartCard>

        <ChartCard
          eyebrow="Cadence"
          title="Session mix"
          subtitle="By session type"
          icon={PieChart}
          accent="blue"
          height={230}
          empty={data.sessionTypeMix.length === 0}
          emptyLabel="No sessions yet"
        >
          <CountBars items={data.sessionTypeMix.map((p) => ({ label: p.label, value: p.count }))} hue="blue" />
        </ChartCard>
      </div>

      {/* Skills bars + POA Gantt */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <ChartCard
          eyebrow="Skills"
          title="Skill ratings"
          subtitle="Ranked, out of 5"
          icon={BarChart3}
          accent="violet"
          height={300}
          className="lg:col-span-2"
          empty={data.skillsBars.length === 0}
          emptyLabel="No skill ratings yet"
        >
          <CountBars items={data.skillsBars.map((s) => ({ label: s.name, value: s.rating }))} max={5} unit="/5" hue="violet" />
        </ChartCard>

        <ChartCard
          eyebrow="Roadmap"
          title="Plans of action"
          subtitle="Created → target · fill = progress · priority-coloured"
          icon={GanttChartSquare}
          accent="amber"
          height={300}
          className="lg:col-span-3"
          empty={data.gantt.length === 0}
          emptyLabel="No plans of action yet"
        >
          <PoaGantt bars={data.gantt} studentId={data.studentId} />
        </ChartCard>
      </div>
    </div>
  );
}
