"use client";

import { RouteErrorBoundary } from "@/components/ui/RouteErrorBoundary";

export default function DashboardError({
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
      title="Unable to Load Command Center"
      description="We encountered an issue fetching today's sessions, follow-ups, and operational metrics. Please try again."
    />
  );
}
