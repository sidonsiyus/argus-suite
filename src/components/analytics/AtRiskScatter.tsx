"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Cell,
} from "recharts";
import { ScatterPoint } from "@/lib/analytics/types";
import { useChartPalette } from "@/lib/charts/palette";

const NO_ACTIVITY = 60; // cap the Y axis; null activity plots at the ceiling

export function AtRiskScatter({ points }: { points: ScatterPoint[] }) {
  const router = useRouter();
  const palette = useChartPalette();

  const data = useMemo(
    () =>
      points.map((p) => ({
        ...p,
        y: p.daysSinceActivity === null ? NO_ACTIVITY : Math.min(p.daysSinceActivity, NO_ACTIVITY),
        z: p.openCritical + 1,
      })),
    [points]
  );

  const axisTick = { fill: palette.muted, fontSize: 11 };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 4 }}>
        <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" />
        {/* At-risk quadrant: low progress + long silence */}
        <ReferenceArea
          x1={0}
          x2={40}
          y1={14}
          y2={NO_ACTIVITY}
          fill={palette.rose}
          fillOpacity={0.06}
          stroke={palette.rose}
          strokeOpacity={0.25}
          strokeDasharray="4 4"
        />
        <XAxis
          type="number"
          dataKey="progress"
          name="Progress"
          unit="%"
          domain={[-4, 104]}
          ticks={[0, 25, 50, 75, 100]}
          tick={axisTick}
          stroke={palette.grid}
          label={{ value: "Progression →", position: "insideBottom", offset: -12, fill: palette.muted, fontSize: 11 }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Days since activity"
          domain={[0, NO_ACTIVITY]}
          tick={axisTick}
          stroke={palette.grid}
          label={{ value: "Days quiet →", angle: -90, position: "insideLeft", fill: palette.muted, fontSize: 11 }}
        />
        <ZAxis type="number" dataKey="z" range={[40, 340]} name="Open critical" />
        <Tooltip
          cursor={{ strokeDasharray: "3 3", stroke: palette.grid }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as ScatterPoint & { y: number };
            return (
              <div className="bg-surface border border-border-strong rounded-lg shadow-md px-3 py-2 text-xs">
                <div className="font-semibold text-ink">{p.name}</div>
                <div className="text-ink-muted">{p.regNo}</div>
                <div className="mt-1.5 space-y-0.5 text-ink-secondary">
                  <div>Progress: <b className="text-ink">{p.progress}%</b></div>
                  <div>
                    Last activity:{" "}
                    <b className="text-ink">
                      {p.daysSinceActivity === null ? "none yet" : `${p.daysSinceActivity}d ago`}
                    </b>
                  </div>
                  <div>Open critical: <b className="text-ink">{p.openCritical}</b></div>
                </div>
                {p.atRisk && <div className="mt-1.5 text-rose-600 dark:text-rose-400 font-medium">⚠ Needs attention</div>}
                <div className="mt-1 text-[10px] text-ink-muted">Click to open profile</div>
              </div>
            );
          }}
        />
        <Scatter
          data={data}
          onClick={(d: any) => d?.studentId && router.push(`/mentor-os/students/${d.studentId}`)}
          className="cursor-pointer"
        >
          {data.map((p) => (
            <Cell
              key={p.studentId}
              fill={p.atRisk ? palette.rose : p.stage === "Placed" ? palette.blue : palette.emerald}
              fillOpacity={0.7}
              stroke={p.atRisk ? palette.rose : palette.emerald}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
