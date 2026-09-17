"use client";

import { FileCheck, Route, Grid3x3 } from "lucide-react";
import { CohortReadiness, ReadinessMatrix } from "@/lib/analytics/types";
import { ChartCard } from "@/components/ui/ChartCard";
import { CountBars } from "./CountBars";
import { ReadinessHeatmap } from "./ReadinessHeatmap";

export function ReadinessSection({ data, matrix }: { data: CohortReadiness; matrix: ReadinessMatrix }) {
  const total = data.byDocument[0]?.total || 0;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          eyebrow="Documents"
          title="Completion by document"
          subtitle="How many cadets have each placement document"
          icon={FileCheck}
          accent="rose"
          height={280}
          empty={data.byDocument.length === 0}
        >
          <CountBars
            items={data.byDocument.map((d) => ({ label: d.label, value: d.ready }))}
            max={total || 1}
            unit={`/${total}`}
            hue="emerald"
          />
        </ChartCard>

        <ChartCard
          eyebrow="Tracks"
          title="Readiness by career track"
          subtitle="Average document readiness per track"
          icon={Route}
          accent="blue"
          height={280}
          empty={data.byTrack.length === 0}
        >
          <CountBars
            items={data.byTrack.map((t) => ({ label: `${t.track} (${t.count})`, value: t.avg }))}
            max={100}
            unit="%"
            hue="blue"
          />
        </ChartCard>
      </div>

      <ChartCard
        eyebrow="Matrix"
        title="Career-readiness matrix"
        subtitle="Green = ready · amber = in progress · grey = missing. A pale column is a cohort-wide gap."
        icon={Grid3x3}
        accent="violet"
        height={420}
        bodyClassName="px-3 py-2"
        empty={matrix.rows.length === 0}
      >
        <ReadinessHeatmap matrix={matrix} />
      </ChartCard>
    </div>
  );
}
