import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CohortAnalyticsView } from "@/components/analytics/CohortAnalyticsView";
import { getCohortAnalytics } from "@/lib/data/analytics";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { data } = await getCohortAnalytics();

  const searchIndex = (data?.scatter || []).map((s) => ({
    id: s.studentId,
    full_name: s.name,
    reg_no: s.regNo,
  }));

  return (
    <AppShell
      title="Cohort Analytics"
      subtitle="Progression, engagement & readiness across the batch"
      attentionCount={data?.kpis.atRiskCount || 0}
      studentsIndex={searchIndex}
    >
      {data ? (
        <CohortAnalyticsView data={data} />
      ) : (
        <div className="text-sm text-ink-muted">Analytics are unavailable right now.</div>
      )}
    </AppShell>
  );
}
