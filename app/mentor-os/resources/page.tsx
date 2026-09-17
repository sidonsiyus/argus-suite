import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ResourceLibrary } from "@/components/resources/ResourceLibrary";
import { getResources } from "@/lib/data/resources";
import { getTopBarHeaderData } from "@/lib/data/topbar";

export const metadata = {
  title: "Resource Library | MENTOR OS",
  description: "Curated learning and career resources for aeronautical science faculty mentoring.",
};

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const [resources, topBarData] = await Promise.all([
    getResources({ status: "active" }),
    getTopBarHeaderData(),
  ]);

  const searchIndex = topBarData.searchIndex;
  const attentionCount = topBarData.attentionCount;

  return (
    <AppShell
      title="Resources"
      subtitle="Curated learning materials & career preparation repository"
      attentionCount={attentionCount}
      studentsIndex={searchIndex}
    >
      <ResourceLibrary
        initialResources={resources}
        studentsIndex={searchIndex}
      />
    </AppShell>
  );
}
