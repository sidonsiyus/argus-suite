import React from "react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { StudentDrilldown } from "@/components/analytics/StudentDrilldown";
import { getStudentAnalytics } from "@/lib/data/analytics";

export const dynamic = "force-dynamic";

export default async function StudentAnalyticsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const data = await getStudentAnalytics(studentId);
  if (!data) notFound();

  return (
    <AppShell
      title={`${data.name} · Analytics`}
      subtitle="Progression, engagement & plans for this cadet"
      studentsIndex={[{ id: data.studentId, full_name: data.name, reg_no: data.regNo }]}
    >
      <StudentDrilldown data={data} />
    </AppShell>
  );
}
