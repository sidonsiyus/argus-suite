import React from "react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { GroupDetailView } from "@/components/groups/GroupDetailView";
import { getGroupById } from "@/lib/data/groups";
import { getTopBarHeaderData } from "@/lib/data/topbar";

export const dynamic = "force-dynamic";

interface GroupDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: GroupDetailPageProps) {
  const { id } = await params;
  const group = await getGroupById(id);
  return {
    title: group ? `${group.name} | MENTOR OS` : "Group Detail | MENTOR OS",
  };
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { id } = await params;

  const [group, topBarData] = await Promise.all([
    getGroupById(id),
    getTopBarHeaderData(),
  ]);

  if (!group) {
    notFound();
  }

  const searchIndex = topBarData.searchIndex;
  const attentionCount = topBarData.attentionCount;
  const allCadets = topBarData.searchIndex;

  return (
    <AppShell
      title={group.name}
      subtitle="Functional intervention group roster & member management"
      attentionCount={attentionCount}
      studentsIndex={searchIndex}
      breadcrumbs={[
        { label: "Intervention Groups", href: "/groups" },
        { label: group.name },
      ]}
    >
      <GroupDetailView group={group} allStudents={allCadets} />
    </AppShell>
  );
}
