import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AchievementsRegistry } from "@/components/achievements/AchievementsRegistry";
import { getAchievements } from "@/lib/data/achievements";
import { getTopBarHeaderData } from "@/lib/data/topbar";

export const metadata = {
  title: "Achievements & Honors | MENTOR OS",
  description: "Student certifications, aeronautical distinctions, and honors registry.",
};

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const [achievements, topBarData] = await Promise.all([
    getAchievements(),
    getTopBarHeaderData(),
  ]);

  const searchIndex = topBarData.searchIndex;
  const attentionCount = topBarData.attentionCount;

  return (
    <AppShell
      title="Achievements & Honors"
      subtitle="Cadet aeronautical certifications, flight distinctions & verified honors registry"
      attentionCount={attentionCount}
      studentsIndex={searchIndex}
    >
      <AchievementsRegistry
        initialAchievements={achievements}
        studentsIndex={searchIndex}
      />
    </AppShell>
  );
}
