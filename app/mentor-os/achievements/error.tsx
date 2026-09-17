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
      title="Unable to Load Cadet Achievements Registry"
      description="We couldn't load the honors and achievements registry. Please try again."
    />
  );
}
