"use client";

import { RouteErrorBoundary } from "@/components/ui/RouteErrorBoundary";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-workspace flex items-center justify-center p-6">
      <RouteErrorBoundary
        error={error}
        reset={reset}
        title="Application Encountered an Error"
        description="We couldn't render this page. Please try refreshing or return to the Command Center."
      />
    </div>
  );
}
