import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "emerald" | "amber" | "blue" | "stone" | "rose" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "stone",
  size = "md",
  className,
  ...props
}: BadgeProps) {
  const variantStyles = {
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20 font-medium",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20 font-medium",
    blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/60 dark:border-blue-500/20 font-medium",
    stone: "bg-stone-100 dark:bg-surface-subtle text-stone-700 dark:text-ink-secondary border-stone-200/80 dark:border-border font-normal",
    rose: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200/60 dark:border-rose-500/20 font-medium",
    outline: "bg-transparent text-stone-600 dark:text-ink-muted border-stone-300 dark:border-border font-normal",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 rounded-md",
    md: "text-xs px-2.5 py-0.5 rounded-lg",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border leading-none transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
