"use client";

import { RouteErrorBoundary } from "@/components/ui/RouteErrorBoundary";

export default function RoadmapsError({
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
      title="Unable to Load Roadmaps"
      description="We encountered an issue building the career roadmaps. Please try again."
    />
  );
}
