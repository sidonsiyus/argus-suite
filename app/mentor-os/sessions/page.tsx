import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SessionsDirectory } from "@/components/sessions/SessionsDirectory";
import { getSessions } from "@/lib/data/sessions";
import { getTopBarHeaderData } from "@/lib/data/topbar";

export const metadata = {
  title: "Mentoring Sessions | MENTOR OS",
  description: "Manage 1-on-1 mentoring conversations, follow-up commitments, and action plans.",
};

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const [sessionsRes, topBarData] = await Promise.all([
    getSessions({ status: "all" }),
    getTopBarHeaderData(),
  ]);

  const searchIndex = topBarData.searchIndex;
  const attentionCount = topBarData.attentionCount;
  const allCadets = topBarData.searchIndex;

  return (
    <AppShell
      title="Mentoring Sessions"
      subtitle="1-on-1 developmental sessions, follow-up commitments & action tracking"
      attentionCount={attentionCount}
      studentsIndex={searchIndex}
    >
      <SessionsDirectory
        initialSessions={sessionsRes.data || []}
        allStudents={allCadets}
      />
    </AppShell>
  );
}
