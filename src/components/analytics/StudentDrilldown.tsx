"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { StudentAnalytics } from "@/lib/analytics/types";
import { StudentAnalyticsPanel } from "./StudentAnalyticsPanel";

export function StudentDrilldown({ data }: { data: StudentAnalytics }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/mentor-os/analytics" className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent-emerald mb-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to cohort
          </Link>
          <h2 className="text-lg font-semibold text-ink">{data.name}</h2>
          <p className="text-xs text-ink-muted">{data.regNo}</p>
        </div>
        <Link
          href={`/mentor-os/students/${data.studentId}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-accent-emerald text-white hover:opacity-90 transition-opacity"
        >
          Full profile <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <StudentAnalyticsPanel data={data} />
    </div>
  );
}
