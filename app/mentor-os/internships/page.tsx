import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { InternshipsHub } from "@/components/internships/InternshipsHub";
import {
  getInternshipOpportunities,
  getStudentInternships,
} from "@/lib/data/internships";
import { getTopBarHeaderData } from "@/lib/data/topbar";

export const metadata = {
  title: "Internships & Opportunities | MENTOR OS",
  description: "Industry attachments, airline trainee roles, and student internship tracking hub.",
};

export const dynamic = "force-dynamic";

export default async function InternshipsPage() {
  const [opportunities, studentInternships, topBarData] = await Promise.all([
    getInternshipOpportunities(),
    getStudentInternships(),
    getTopBarHeaderData(),
  ]);

  const searchIndex = topBarData.searchIndex;
  const attentionCount = topBarData.attentionCount;

  return (
    <AppShell
      title="Internships & Opportunities"
      subtitle="Industry attachments, airline trainee roles & student application hub"
      attentionCount={attentionCount}
      studentsIndex={searchIndex}
    >
      <InternshipsHub
        initialOpportunities={opportunities}
        initialStudentInternships={studentInternships}
        studentsIndex={searchIndex}
      />
    </AppShell>
  );
}
