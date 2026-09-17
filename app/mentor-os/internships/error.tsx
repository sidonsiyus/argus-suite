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
      title="Unable to Load Internship Opportunities"
      description="We couldn't load internship opportunities and student pursuits. Please try again."
    />
  );
}
