"use client";

import { RouteErrorBoundary } from "@/components/ui/RouteErrorBoundary";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorBoundary
      error={error}
      reset={reset}
      title="Unable to Load Analytics"
      description="We encountered an issue aggregating cohort progression data. Please try again."
    />
  );
}
