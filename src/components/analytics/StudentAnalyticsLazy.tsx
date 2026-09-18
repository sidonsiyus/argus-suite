"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";
import { StudentAnalytics } from "@/lib/analytics/types";
import { getStudentAnalyticsAction } from "@/app/actions/analytics";

// Dynamically import the (Recharts-heavy) panel so it — and Recharts — are kept
// out of the Student 360 route bundle and only fetched when this tab is opened.
const StudentAnalyticsPanel = dynamic(
  () => import("./StudentAnalyticsPanel").then((m) => m.StudentAnalyticsPanel),
  { ssr: false }
);

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-surface-subtle border border-border" />
        ))}
      </div>
      <div className="h-40 rounded-2xl bg-surface-subtle border border-border" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl bg-surface-subtle border border-border" />
        <div className="h-64 rounded-2xl bg-surface-subtle border border-border" />
      </div>
    </div>
  );
}

/**
 * Lazy loader for the Student 360 "Analytics" tab. Mounts only when the tab is
 * opened (the workspace renders tab content on demand), then fetches the
 * analytics via a server action and renders the dynamically-imported panel.
 */
export function StudentAnalyticsLazy({ studentId }: { studentId: string }) {
  const [data, setData] = useState<StudentAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    getStudentAnalyticsAction(studentId)
      .then((res) => {
        if (!alive) return;
        if (res.data) setData(res.data);
        else setError(res.error || "Failed to load cadet analytics.");
      })
      .catch(() => alive && setError("Failed to load cadet analytics."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [studentId, attempt]);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center">
        <p className="text-sm text-ink-secondary mb-3">{error}</p>
        <button
          onClick={() => setAttempt((a) => a + 1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-accent-emerald text-white hover:opacity-90"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Try again
        </button>
      </div>
    );
  }

  return data ? <StudentAnalyticsPanel data={data} /> : null;
}
