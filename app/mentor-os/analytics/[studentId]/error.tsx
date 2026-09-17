"use client";

import { RouteErrorBoundary } from "@/components/ui/RouteErrorBoundary";

export default function StudentAnalyticsError({
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
      title="Unable to Load Cadet Analytics"
      description="We encountered an issue building this cadet's progression view. Please try again."
    />
  );
}
