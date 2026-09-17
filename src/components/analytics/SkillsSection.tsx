"use client";

import { Radar as RadarIcon, TrendingDown, Award } from "lucide-react";
import { CohortSkills } from "@/lib/analytics/types";
import { ChartCard } from "@/components/ui/ChartCard";
import { SkillsRadar } from "./SkillsRadar";
import { CountBars } from "./CountBars";

export function SkillsSection({ data }: { data: CohortSkills }) {
  const radarAxes = data.radar.map((r) => ({ category: r.category, current: r.avg, earlier: null }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          eyebrow="Profile"
          title="Cohort skills radar"
          subtitle={`Average rating by area · ${data.assessedCount} assessments`}
          icon={RadarIcon}
          accent="violet"
          height={320}
          empty={data.radar.length === 0}
          emptyLabel="No skill assessments yet"
        >
          <SkillsRadar axes={radarAxes} />
        </ChartCard>

        <ChartCard
          eyebrow="Focus"
          title="Weakest skills"
          subtitle="Lowest cohort averages — where to teach"
          icon={TrendingDown}
          accent="rose"
          height={320}
          empty={data.weakest.length === 0}
          emptyLabel="No skill ratings yet"
        >
          <CountBars items={data.weakest.map((s) => ({ label: s.name, value: s.avg }))} max={5} unit="/5" hue="amber" />
        </ChartCard>
      </div>

      <ChartCard
        eyebrow="Strengths"
        title="Strongest skills"
        subtitle="Highest cohort averages"
        icon={Award}
        accent="emerald"
        height={300}
        empty={data.strongest.length === 0}
        emptyLabel="No skill ratings yet"
      >
        <CountBars items={data.strongest.map((s) => ({ label: s.name, value: s.avg }))} max={5} unit="/5" hue="emerald" />
      </ChartCard>
    </div>
  );
}
