"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RadarAxis } from "@/lib/analytics/types";
import { useChartPalette } from "@/lib/charts/palette";

export function SkillsRadar({ axes }: { axes: RadarAxis[] }) {
  const palette = useChartPalette();
  const hasEarlier = axes.some((a) => a.earlier !== null);

  if (axes.length === 0) {
    return <div className="h-full flex items-center justify-center text-sm text-ink-muted">No skill assessments yet.</div>;
  }

  // A radar needs ≥3 axes to form a shape; fall back to bars otherwise.
  if (axes.length < 3) {
    return (
      <div className="h-full flex flex-col justify-center gap-3 px-2">
        {axes.map((a) => (
          <div key={a.category}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-ink-secondary font-medium">{a.category}</span>
              <span className="text-ink tabular-nums">{a.current}/5</span>
            </div>
            <div className="h-2.5 rounded-full bg-surface-subtle overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(a.current / 5) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={axes} outerRadius="70%">
        <PolarGrid stroke={palette.grid} />
        <PolarAngleAxis dataKey="category" tick={{ fill: palette.muted, fontSize: 10 }} />
        <PolarRadiusAxis domain={[0, 5]} tick={{ fill: palette.muted, fontSize: 9 }} axisLine={false} />
        {hasEarlier && (
          <Radar name="Earlier" dataKey="earlier" stroke={palette.muted} fill={palette.muted} fillOpacity={0.12} strokeDasharray="4 3" />
        )}
        <Radar name="Current" dataKey="current" stroke={palette.emerald} fill={palette.emerald} fillOpacity={0.3} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
