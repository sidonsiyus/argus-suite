import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StudentTable } from "@/components/students/StudentTable";
import { getStudentsDirectory } from "@/lib/data/students";

export const dynamic = "force-dynamic";

interface StudentsPageProps {
  searchParams?: Promise<{
    track?: string;
    career?: string;
  }>;
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const initialTrack = resolvedParams.track || resolvedParams.career || "all";

  const { data: students } = await getStudentsDirectory();
  const studentList = students || [];

  const attentionCount = studentList.filter((s) => s.needs_attention).length;
  const searchIndex = studentList.map((s) => ({
    id: s.id,
    full_name: s.full_name,
    reg_no: s.reg_no,
  }));

  return (
    <AppShell
      title="Cadet Directory"
      subtitle={
        studentList.length > 0
          ? `Complete roster of ${studentList.length} enrolled cadets in Batch 2025–2028`
          : "Cadet roster in Batch 2025–2028"
      }
      attentionCount={attentionCount}
      studentsIndex={searchIndex}
    >
      <div className="space-y-6">
        <StudentTable students={studentList} initialTrack={initialTrack} />
      </div>
    </AppShell>
  );
}
