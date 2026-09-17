"use client";

import { LayoutGrid, CalendarRange, Radar, FileCheck, Trophy, Activity } from "lucide-react";
import { CohortAnalytics } from "@/lib/analytics/types";
import { AnalyticsTabs } from "./AnalyticsTabs";
import { CohortOverview } from "./CohortOverview";
import { EngagementSection } from "./EngagementSection";
import { SkillsSection } from "./SkillsSection";
import { ReadinessSection } from "./ReadinessSection";
import { AchievementsSection } from "./AchievementsSection";
import { ActivitySection } from "./ActivitySection";

/**
 * Client wrapper for the cohort analytics tabs. Built as a client component so
 * the tab icons (component functions) never cross the server→client boundary —
 * only the serializable `data` does.
 */
export function CohortAnalyticsView({ data }: { data: CohortAnalytics }) {
  return (
    <AnalyticsTabs
      tabs={[
        { id: "overview", label: "Overview", icon: LayoutGrid, content: <CohortOverview analytics={data} /> },
        { id: "engagement", label: "Engagement", icon: CalendarRange, content: <EngagementSection data={data.engagement} /> },
        { id: "skills", label: "Skills", icon: Radar, content: <SkillsSection data={data.skills} /> },
        { id: "readiness", label: "Readiness", icon: FileCheck, content: <ReadinessSection data={data.readiness} matrix={data.readinessMatrix} /> },
        { id: "achievements", label: "Achievements", icon: Trophy, content: <AchievementsSection data={data.achievements} /> },
        { id: "activity", label: "Activity", icon: Activity, content: <ActivitySection data={data.activity} /> },
      ]}
    />
  );
}
