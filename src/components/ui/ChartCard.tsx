import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  /** Small mono eyebrow above the title (e.g. "COHORT"). */
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  /** Right-aligned header slot — legend, filter, toggle. */
  action?: React.ReactNode;
  /** Body height in px (ResponsiveContainer needs a sized parent). Default 280. */
  height?: number;
  /** Render an empty state instead of children. */
  empty?: boolean;
  emptyLabel?: string;
  className?: string;
  bodyClassName?: string;
  children?: React.ReactNode;
}

/**
 * Shared shell for every analytics chart: consistent header (mono eyebrow +
 * title + subtitle + action), a sized body for Recharts' ResponsiveContainer,
 * and a themed empty state. Pairs with the CHART tokens / useChartPalette bridge.
 */
export function ChartCard({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  action,
  height = 280,
  empty = false,
  emptyLabel = "No data yet",
  className,
  bodyClassName,
  children,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-xl shadow-card overflow-hidden",
        "transition-all duration-150 hover:border-border-strong hover:shadow-md",
        className
      )}
    >
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3 border-b border-border/70">
        <div className="min-w-0">
          {eyebrow && (
            <div className="flex items-center gap-1.5 mb-1">
              {Icon && <Icon className="w-3.5 h-3.5 text-accent-emerald" />}
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-emerald">
                {eyebrow}
              </span>
            </div>
          )}
          <h3 className="text-sm font-semibold text-ink truncate">{title}</h3>
          {subtitle && (
            <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-none">{action}</div>}
      </div>

      <div
        className={cn("px-3 py-4", bodyClassName)}
        style={{ height }}
      >
        {empty ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-1">
            <span className="text-sm font-medium text-ink-secondary">{emptyLabel}</span>
            <span className="text-xs text-ink-muted">
              Data will appear here as sessions and plans progress.
            </span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
