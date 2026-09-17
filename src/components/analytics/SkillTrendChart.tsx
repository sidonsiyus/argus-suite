"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SkillTrendSeries } from "@/lib/analytics/types";
import { useChartPalette } from "@/lib/charts/palette";
import { fmtDayMonth } from "@/lib/charts/format";

const MAX_SERIES = 8; // categorical palette is fixed-order, 8 slots

export function SkillTrendChart({ series }: { series: SkillTrendSeries[] }) {
  const palette = useChartPalette();

  // Keep skills that actually have history; prefer those that changed.
  const shown = useMemo(() => {
    const withPoints = series.filter((s) => s.points.length > 0);
    const changed = withPoints.filter((s) => new Set(s.points.map((p) => p.rating)).size > 1);
    const rest = withPoints.filter((s) => !changed.includes(s));
    return [...changed, ...rest].slice(0, MAX_SERIES);
  }, [series]);

  const { data, keys } = useMemo(() => {
    const dateSet = new Set<number>();
    shown.forEach((s) => s.points.forEach((p) => dateSet.add(new Date(p.date + "T00:00:00").getTime())));
    const dates = Array.from(dateSet).sort((a, b) => a - b);
    const rows = dates.map((ts) => {
      const row: Record<string, number> = { x: ts };
      shown.forEach((s) => {
        const pt = s.points.find((p) => new Date(p.date + "T00:00:00").getTime() === ts);
        if (pt) row[s.name] = pt.rating;
      });
      return row;
    });
    return { data: rows, keys: shown.map((s) => s.name) };
  }, [shown]);

  const anyChange = shown.some((s) => new Set(s.points.map((p) => p.rating)).size > 1);

  if (shown.length === 0 || data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center gap-1 px-6">
        <span className="text-sm font-medium text-ink-secondary">No skill history yet</span>
        <span className="text-xs text-ink-muted">
          Log skill progress after a session and the development curve builds here.
        </span>
      </div>
    );
  }

  const axisTick = { fill: palette.muted, fontSize: 11 };

  return (
    <div className="h-full flex flex-col">
      {!anyChange && data.length === 1 && (
        <p className="text-[11px] text-ink-muted px-3 pb-1">
          One assessment so far — the trend appears once you re-rate skills after sessions.
        </p>
      )}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: -12 }}>
            <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="x"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(t) => fmtDayMonth(t)}
              tick={axisTick}
              stroke={palette.grid}
            />
            <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={axisTick} stroke={palette.grid} width={28} />
            <Tooltip
              labelFormatter={(t) => fmtDayMonth(Number(t))}
              contentStyle={{
                background: palette.surface,
                border: `1px solid ${palette.grid}`,
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {keys.map((k, i) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                stroke={palette.categorical[i % palette.categorical.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
