"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface RouteErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}

export function RouteErrorBoundary({
  error,
  reset,
  title = "Something went wrong",
  description = "We couldn't load this section of the mentor console. Please try refreshing or retrying.",
}: RouteErrorBoundaryProps) {
  useEffect(() => {
    // Log sanitized error client-side without exposing to UI
    console.error("MENTOR OS Route Error:", error?.message || error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface border border-rose-200/80 rounded-2xl p-8 shadow-card text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/60 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold tracking-tight text-ink">
            {title}
          </h2>
          <p className="text-xs text-ink-muted leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Buttons: Retry and Dashboard */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => reset()}
            className="w-full sm:w-auto gap-1.5 text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </Button>

          <Link href="/mentor-os/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs font-medium"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-ink-muted" />
              <span>Command Center</span>
            </Button>
          </Link>
        </div>

        <p className="text-[10px] text-ink-muted/70 font-mono pt-2">
          Error Ref: {error?.digest ? error.digest.slice(0, 10) : "ERR_MENTOR_SAFE"}
        </p>
      </div>
    </div>
  );
}
