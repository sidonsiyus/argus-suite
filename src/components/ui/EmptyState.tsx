import React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border bg-surface-subtle/50",
        className
      )}
    >
      <div className="p-3 rounded-xl bg-surface border border-border text-ink-muted mb-3">
        <Icon className="w-5 h-5 text-ink-muted" />
      </div>
      <h4 className="text-sm font-medium text-ink">{title}</h4>
      {description && (
        <p className="text-xs text-ink-muted max-w-sm mt-1 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
