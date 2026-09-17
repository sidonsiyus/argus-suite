"use client";

import { RouteErrorBoundary } from "@/components/ui/RouteErrorBoundary";

export default function ErrorBoundary({
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
      title="Unable to Load Mentoring Sessions"
      description="We couldn't load the mentoring sessions list. Please try again."
    />
  );
}
