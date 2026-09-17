"use client";

import { RouteErrorBoundary } from "@/components/ui/RouteErrorBoundary";

export default function StudentsError({
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
      title="Unable to Load Cadet Directory"
      description="We couldn't retrieve the cadet roster. Please try refreshing or retrying."
    />
  );
}
