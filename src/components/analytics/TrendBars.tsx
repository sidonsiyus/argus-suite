"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useChartPalette } from "@/lib/charts/palette";

/** Vertical magnitude bars over an ordered category axis (e.g. weeks). One hue. */
export function TrendBars({
  data,
  hue = "blue",
}: {
  data: Array<{ label: string; count: number }>;
  hue?: "blue" | "emerald" | "amber";
}) {
  const palette = useChartPalette();
  const color = hue === "emerald" ? palette.emerald : hue === "amber" ? palette.amber : palette.blue;
  const axisTick = { fill: palette.muted, fontSize: 11 };

  if (!data.length) {
    return <div className="h-full flex items-center justify-center text-sm text-ink-muted">No data yet</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
        <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={axisTick} stroke={palette.grid} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} tick={axisTick} stroke={palette.grid} width={32} />
        <Tooltip
          cursor={{ fill: palette.grid, fillOpacity: 0.25 }}
          contentStyle={{ background: palette.surface, border: `1px solid ${palette.grid}`, borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={34}>
          {data.map((_, i) => (
            <Cell key={i} fill={color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
