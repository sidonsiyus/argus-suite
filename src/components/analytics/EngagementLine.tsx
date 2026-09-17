"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { EngagementPoint, MilestoneFlag } from "@/lib/analytics/types";
import { useChartPalette } from "@/lib/charts/palette";
import { fmtDayMonth as fmt } from "@/lib/charts/format";

export function EngagementLine({
  points,
  flags,
}: {
  points: EngagementPoint[];
  flags: MilestoneFlag[];
}) {
  const palette = useChartPalette();

  const data = useMemo(
    () => points.map((p) => ({ x: new Date(p.date + "T00:00:00").getTime(), y: p.cumulativeSessions })),
    [points]
  );
  const flagX = useMemo(
    () => flags.map((f) => new Date(f.date + "T00:00:00").getTime()).filter((t) => !isNaN(t)),
    [flags]
  );

  if (data.length === 0) {
    return <div className="h-full flex items-center justify-center text-sm text-ink-muted">No engagement history yet.</div>;
  }

  const axisTick = { fill: palette.muted, fontSize: 11 };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: -8 }}>
        <defs>
          <linearGradient id="engFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.emerald} stopOpacity={0.35} />
            <stop offset="100%" stopColor={palette.emerald} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="x"
          type="number"
          domain={["dataMin", "dataMax"]}
          scale="time"
          tickFormatter={fmt}
          tick={axisTick}
          stroke={palette.grid}
        />
        <YAxis allowDecimals={false} tick={axisTick} stroke={palette.grid} width={32} />
        {flagX.map((x, i) => (
          <ReferenceLine key={i} x={x} stroke={palette.emerald} strokeDasharray="2 3" strokeOpacity={0.55} />
        ))}
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as { x: number; y: number };
            return (
              <div className="bg-surface border border-border-strong rounded-lg shadow-md px-3 py-2 text-xs">
                <div className="font-semibold text-ink">{fmt(p.x)}</div>
                <div className="text-ink-secondary">Sessions to date: <b className="text-ink">{p.y}</b></div>
              </div>
            );
          }}
        />
        <Area
          type="stepAfter"
          dataKey="y"
          stroke={palette.emerald}
          strokeWidth={2}
          fill="url(#engFill)"
          dot={{ r: 2.5, fill: palette.emerald, strokeWidth: 0 }}
          activeDot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
