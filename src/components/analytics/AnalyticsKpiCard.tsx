import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsKpiCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
  accent?: "emerald" | "amber" | "blue" | "rose";
  /** Trend delta vs previous week. Omit to hide. */
  trend?: number;
  trendUnit?: string;
  /** Sparkline series (e.g. last 8 weeks). Omit to hide. */
  spark?: number[];
}

const ACCENT: Record<string, { text: string; bg: string; stroke: string }> = {
  emerald: { text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", stroke: "var(--accent-emerald)" },
  amber: { text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", stroke: "var(--accent-amber)" },
  blue: { text: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", stroke: "var(--accent-blue)" },
  rose: { text: "text-rose-700 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10", stroke: "var(--accent-rose)" },
};

function Sparkline({ data, stroke }: { data: number[]; stroke: string }) {
  if (!data || data.length < 2) return null;
  const w = 96;
  const h = 28;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const last = pts.at(-1)!.split(",");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" aria-hidden>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
      <circle cx={Number(last[0])} cy={Number(last[1])} r={2.4} fill={stroke} />
    </svg>
  );
}

export function AnalyticsKpiCard({
  label,
  value,
  suffix,
  icon: Icon,
  accent = "emerald",
  trend,
  trendUnit = "",
  spark,
}: AnalyticsKpiCardProps) {
  const a = ACCENT[accent];
  const TrendIcon = trend === undefined ? Minus : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor =
    trend === undefined || trend === 0
      ? "text-ink-muted"
      : trend > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";

  return (
    <div className="bg-surface border border-border rounded-xl shadow-card p-5 transition-all duration-150 hover:border-border-strong hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">{label}</span>
        <div className={cn("p-2 rounded-lg border border-border/60", a.bg)}>
          <Icon className={cn("w-4 h-4", a.text)} />
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-semibold tracking-tight text-ink">{value}</span>
            {suffix && <span className="text-sm font-medium text-ink-muted">{suffix}</span>}
          </div>
          {trend !== undefined && (
            <div className={cn("mt-1.5 flex items-center gap-1 text-xs font-medium", trendColor)}>
              <TrendIcon className="w-3.5 h-3.5" />
              <span>
                {trend > 0 ? "+" : ""}
                {trend}
                {trendUnit} vs last week
              </span>
            </div>
          )}
        </div>
        {spark && <Sparkline data={spark} stroke={a.stroke} />}
      </div>
    </div>
  );
}
