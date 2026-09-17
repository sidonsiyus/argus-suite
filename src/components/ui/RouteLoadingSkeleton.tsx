import React from "react";
import { Skeleton } from "./LoadingSkeleton";

interface RouteLoadingSkeletonProps {
  title?: string;
  cardsCount?: number;
}

export function RouteLoadingSkeleton({
  title = "Loading data...",
  cardsCount = 4,
}: RouteLoadingSkeletonProps) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Header Skeleton */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-card space-y-3">
        <Skeleton className="h-4 w-32 bg-stone-200/80 dark:bg-surface-subtle/80" />
        <Skeleton className="h-7 w-64 bg-stone-200/90 dark:bg-surface-subtle/90" />
        <Skeleton className="h-3.5 w-96 max-w-full bg-stone-200/60 dark:bg-surface-subtle/60" />
      </div>

      {/* KPI Cards Row Skeleton */}
      {cardsCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: cardsCount }).map((_, idx) => (
            <div key={idx} className="bg-surface border border-border rounded-xl p-5 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-24 bg-stone-200/70 dark:bg-surface-subtle/70" />
                <Skeleton className="h-8 w-8 rounded-lg bg-stone-200/80 dark:bg-surface-subtle/80" />
              </div>
              <Skeleton className="h-8 w-16 bg-stone-200/90 dark:bg-surface-subtle/90" />
              <Skeleton className="h-3 w-32 bg-stone-200/60 dark:bg-surface-subtle/60" />
            </div>
          ))}
        </div>
      )}

      {/* Main Content Skeleton (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card space-y-4">
            <Skeleton className="h-5 w-48 bg-stone-200/80 dark:bg-surface-subtle/80" />
            <div className="space-y-3">
              <Skeleton className="h-14 w-full rounded-lg bg-stone-100 dark:bg-surface-subtle" />
              <Skeleton className="h-14 w-full rounded-lg bg-stone-100 dark:bg-surface-subtle" />
              <Skeleton className="h-14 w-full rounded-lg bg-stone-100 dark:bg-surface-subtle" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card space-y-4">
            <Skeleton className="h-5 w-40 bg-stone-200/80 dark:bg-surface-subtle/80" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-lg bg-stone-100 dark:bg-surface-subtle" />
              <Skeleton className="h-10 w-full rounded-lg bg-stone-100 dark:bg-surface-subtle" />
              <Skeleton className="h-10 w-full rounded-lg bg-stone-100 dark:bg-surface-subtle" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
