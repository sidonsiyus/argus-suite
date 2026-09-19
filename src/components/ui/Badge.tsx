import React from "react";
import { cn } from "@/lib/utils";
import { AppointmentStatus, AppointmentSource, StudentSource, StudentStatus, FacultyStatus } from "@/types";

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

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  switch (status) {
    case "PENDING":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Pending Approval
        </span>
      );
    case "CONFIRMED":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Confirmed
        </span>
      );
    case "SCHEDULED":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          Scheduled
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Completed
        </span>
      );
    case "DECLINED":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Declined
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Cancelled
        </span>
      );
    case "NO_SHOW":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-300">
          No-Show
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
          {status}
        </span>
      );
  }
}

export function SourceBadge({ source }: { source: AppointmentSource | StudentSource }) {
  switch (source) {
    case "ONLINE":
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-150">
          Online
        </span>
      );
    case "ADMIN":
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-150">
          Admin
        </span>
      );
    case "IMPORTED":
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-50 text-teal-700 border border-teal-150">
          Imported
        </span>
      );
    case "BOOKING":
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-150">
          Auto (Booking)
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
          {source}
        </span>
      );
  }
}

export function StatusBadge({ status }: { status: StudentStatus | FacultyStatus }) {
  if (status === "ACTIVE") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Inactive
    </span>
  );
}
