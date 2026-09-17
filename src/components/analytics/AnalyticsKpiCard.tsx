import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtDelta } from "@/lib/charts/format";

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

const ACCENT: Record<string, { text: string; chip: string; bar: string; stroke: string }> = {
  emerald: { text: "text-emerald-700 dark:text-emerald-400", chip: "bg-emerald-50 dark:bg-emerald-500/10", bar: "from-emerald-400/70", stroke: "var(--accent-emerald)" },
  amber: { text: "text-amber-700 dark:text-amber-400", chip: "bg-amber-50 dark:bg-amber-500/10", bar: "from-amber-400/70", stroke: "var(--accent-amber)" },
  blue: { text: "text-blue-700 dark:text-blue-400", chip: "bg-blue-50 dark:bg-blue-500/10", bar: "from-blue-400/70", stroke: "var(--accent-blue)" },
  rose: { text: "text-rose-700 dark:text-rose-400", chip: "bg-rose-50 dark:bg-rose-500/10", bar: "from-rose-400/70", stroke: "var(--accent-rose)" },
};

function Sparkline({ data, stroke }: { data: number[]; stroke: string }) {
  if (!data || data.length < 2) return null;
  const w = 104;
  const h = 30;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const area = `0,${h} ${pts.join(" ")} ${w},${h}`;
  const last = pts.at(-1)!.split(",");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" aria-hidden>
      <polygon points={area} fill={stroke} opacity={0.08} />
      <polyline points={pts.join(" ")} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={Number(last[0])} cy={Number(last[1])} r={2.6} fill={stroke} />
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
    <div className="relative bg-surface border border-border rounded-2xl shadow-card overflow-hidden transition-all duration-200 hover:border-border-strong hover:shadow-md hover:-translate-y-0.5">
      <div className={cn("h-0.5 w-full bg-gradient-to-r to-transparent", a.bar)} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{label}</span>
          <div className={cn("p-2 rounded-xl", a.chip)}>
            <Icon className={cn("w-4 h-4", a.text)} />
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[34px] leading-none font-bold tracking-tight text-ink tabular-nums">{value}</span>
              {suffix && <span className="text-base font-semibold text-ink-muted">{suffix}</span>}
            </div>
            {trend !== undefined && (
              <div className={cn("mt-2 inline-flex items-center gap-1 text-xs font-medium", trendColor)}>
                <TrendIcon className="w-3.5 h-3.5" />
                <span className="tabular-nums">{fmtDelta(trend)}{trendUnit}</span>
                <span className="text-ink-muted font-normal">vs last week</span>
              </div>
            )}
          </div>
          {spark && <Sparkline data={spark} stroke={a.stroke} />}
        </div>
      </div>
    </div>
  );
}
