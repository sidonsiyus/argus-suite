import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GroupsDirectory } from "@/components/groups/GroupsDirectory";
import { getGroups } from "@/lib/data/groups";
import { getTopBarHeaderData } from "@/lib/data/topbar";

export const metadata = {
  title: "Functional Groups | MENTOR OS",
  description: "Targeted intervention, academic ground school tutoring, and student development groups.",
};

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const [groups, topBarData] = await Promise.all([
    getGroups(),
    getTopBarHeaderData(),
  ]);

  const searchIndex = topBarData.searchIndex;
  const attentionCount = topBarData.attentionCount;

  return (
    <AppShell
      title="Functional Intervention Groups"
      subtitle="Cohort-independent development, DGCA ground school tutoring & placement coaching"
      attentionCount={attentionCount}
      studentsIndex={searchIndex}
    >
      <GroupsDirectory initialGroups={groups} />
    </AppShell>
  );
}
