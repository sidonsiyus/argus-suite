import React from "react";
import { LayoutGrid, CalendarRange, Radar } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AnalyticsTabs } from "@/components/analytics/AnalyticsTabs";
import { CohortOverview } from "@/components/analytics/CohortOverview";
import { EngagementSection } from "@/components/analytics/EngagementSection";
import { SkillsSection } from "@/components/analytics/SkillsSection";
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
        <AnalyticsTabs
          tabs={[
            { id: "overview", label: "Overview", icon: LayoutGrid, content: <CohortOverview analytics={data} /> },
            { id: "engagement", label: "Engagement", icon: CalendarRange, content: <EngagementSection data={data.engagement} /> },
            { id: "skills", label: "Skills", icon: Radar, content: <SkillsSection data={data.skills} /> },
          ]}
        />
      ) : (
        <div className="text-sm text-ink-muted">Analytics are unavailable right now.</div>
      )}
    </AppShell>
  );
}
