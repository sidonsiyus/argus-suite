import React from "react";
import Link from "next/link";
import { RoadmapReport } from "@/components/roadmaps/RoadmapReport";
import { getCohortRoadmaps } from "@/lib/data/roadmaps";

export const dynamic = "force-dynamic";

export default async function RoadmapReportPage() {
  const { data } = await getCohortRoadmaps();

  return (
    <div style={{ background: "#f0efec", minHeight: "100vh", paddingTop: 16, paddingBottom: 40 }}>
      <div className="no-print" style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px" }}>
        <Link href="/mentor-os/roadmaps" style={{ fontSize: 12, color: "#575653" }}>← Back to roadmaps</Link>
      </div>
      {data ? (
        <RoadmapReport data={data} />
      ) : (
        <p style={{ textAlign: "center", color: "#575653", marginTop: 40 }}>Report is unavailable right now.</p>
      )}
    </div>
  );
}
