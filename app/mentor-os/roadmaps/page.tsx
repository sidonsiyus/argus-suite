import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RoadmapsView } from "@/components/roadmaps/RoadmapsView";
import { getCohortRoadmaps } from "@/lib/data/roadmaps";

export const dynamic = "force-dynamic";

export default async function RoadmapsPage() {
  const { data } = await getCohortRoadmaps();

  const searchIndex = (data?.tracks || []).flatMap((t) =>
    t.students.map((s) => ({ id: s.id, full_name: s.name, reg_no: s.regNo }))
  );

  return (
    <AppShell
      title="Career Roadmaps"
      subtitle="Milestone roadmaps by career goal — and where each cadet stands"
      studentsIndex={searchIndex}
    >
      {data ? (
        <RoadmapsView data={data} />
      ) : (
        <div className="text-sm text-ink-muted">Roadmaps are unavailable right now.</div>
      )}
    </AppShell>
  );
}
