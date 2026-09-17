"use client";

import { RouteErrorBoundary } from "@/components/ui/RouteErrorBoundary";

export default function StudentDetailError({
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
      title="Unable to Load Cadet 360"
      description="We couldn't retrieve this cadet's mentoring profile, development milestones, or sessions. Please try again."
    />
  );
}
