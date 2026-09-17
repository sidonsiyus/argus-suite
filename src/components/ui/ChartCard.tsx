import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "emerald" | "blue" | "amber" | "rose" | "violet";

interface ChartCardProps {
  /** Small mono eyebrow above the title (e.g. "COHORT"). */
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  accent?: Accent;
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

const ACCENT: Record<Accent, { chip: string; text: string; bar: string }> = {
  emerald: { chip: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", text: "text-emerald-700 dark:text-emerald-400", bar: "from-emerald-400/60" },
  blue: { chip: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400", text: "text-blue-700 dark:text-blue-400", bar: "from-blue-400/60" },
  amber: { chip: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400", text: "text-amber-700 dark:text-amber-400", bar: "from-amber-400/60" },
  rose: { chip: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400", text: "text-rose-700 dark:text-rose-400", bar: "from-rose-400/60" },
  violet: { chip: "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400", text: "text-violet-700 dark:text-violet-400", bar: "from-violet-400/60" },
};

/**
 * Shared shell for every analytics chart: bolder header (icon chip + mono
 * eyebrow + title + subtitle + action), an accent hairline, a sized body for
 * Recharts' ResponsiveContainer, and a themed empty state.
 */
export function ChartCard({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  accent = "emerald",
  action,
  height = 280,
  empty = false,
  emptyLabel = "No data yet",
  className,
  bodyClassName,
  children,
}: ChartCardProps) {
  const a = ACCENT[accent];
  return (
    <div
      className={cn(
        "group relative bg-surface border border-border rounded-2xl shadow-card overflow-hidden",
        "transition-all duration-200 hover:border-border-strong hover:shadow-md",
        className
      )}
    >
      {/* Accent hairline at the very top */}
      <div className={cn("h-0.5 w-full bg-gradient-to-r to-transparent", a.bar)} />

      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3 border-b border-border/60">
        <div className="flex items-start gap-3 min-w-0">
          {Icon && (
            <div className={cn("mt-0.5 flex-none w-8 h-8 rounded-xl flex items-center justify-center", a.chip)}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <span className={cn("block font-mono text-[10px] font-bold uppercase tracking-[0.16em] mb-0.5", a.text)}>
                {eyebrow}
              </span>
            )}
            <h3 className="text-[15px] font-semibold text-ink leading-tight truncate">{title}</h3>
            {subtitle && <p className="text-xs text-ink-muted mt-1 leading-relaxed">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="flex-none">{action}</div>}
      </div>

      <div className={cn("px-3 py-4", bodyClassName)} style={{ height }}>
        {empty ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-1">
            <span className="text-sm font-medium text-ink-secondary">{emptyLabel}</span>
            <span className="text-xs text-ink-muted">Data appears here as sessions and plans progress.</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
