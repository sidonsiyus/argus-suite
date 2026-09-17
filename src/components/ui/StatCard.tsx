import React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "./Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: "emerald" | "amber" | "blue" | "stone" | "rose";
  };
  className?: string;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  badge,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("p-5 flex flex-col justify-between", className)}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
          {label}
        </span>
        <div className="p-2 rounded-lg bg-surface-subtle text-ink-secondary border border-border/60">
          <Icon className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-ink">
            {value}
          </span>
          {badge && (
            <span
              className={cn(
                "text-[11px] font-medium px-2 py-0.5 rounded-md border",
                badge.variant === "emerald" && "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
                badge.variant === "amber" && "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
                badge.variant === "blue" && "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
                badge.variant === "rose" && "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
                badge.variant === "stone" && "bg-stone-100 dark:bg-surface-subtle text-stone-600 dark:text-ink-secondary border-stone-200 dark:border-border"
              )}
            >
              {badge.text}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}
