import React from "react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getStudent360 } from "@/lib/data/student-detail";
import { getTopBarHeaderData } from "@/lib/data/topbar";
import { Student360Header } from "@/components/student-detail/Student360Header";
import { Student360Workspace } from "@/components/student-detail/Student360Workspace";
import { CareerGoalCard } from "@/components/student-detail/CareerGoalCard";
import { SkillsMatrix } from "@/components/student-detail/SkillsMatrix";
import { ReadinessChecklist } from "@/components/student-detail/ReadinessChecklist";
import { POARoadmap } from "@/components/student-detail/POARoadmap";
import { StudentSessionsLog } from "@/components/student-detail/StudentSessionsLog";
import { HistoricalProfileCard } from "@/components/student-detail/HistoricalProfileCard";
import { StudentAchievementsCard } from "@/components/student-detail/StudentAchievementsCard";
import { StudentInternshipsCard } from "@/components/student-detail/StudentInternshipsCard";
import { StudentGroupsCard } from "@/components/student-detail/StudentGroupsCard";
import { AICopilotCard } from "@/components/student-detail/AICopilotCard";
import { StudentDocumentsTab } from "@/components/student-detail/StudentDocumentsTab";
import { StudentAnalyticsPanel } from "@/components/analytics/StudentAnalyticsPanel";
import { getStudentRecommendations } from "@/lib/data/ai-copilot";
import { getInternshipOpportunities } from "@/lib/data/internships";
import { getStudentDocuments } from "@/lib/data/documents";
import { getStudentAnalytics } from "@/lib/data/analytics";

export const dynamic = "force-dynamic";

interface StudentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params;

  // Concurrently fetch 360 data, opportunities, topbar search index, AI recommendations, and documents
  const [studentData, opportunities, topBarData, initialRecommendations, documents, studentAnalytics] = await Promise.all([
    getStudent360(id),
    getInternshipOpportunities({ status: "active" }),
    getTopBarHeaderData(),
    getStudentRecommendations(id),
    getStudentDocuments(id),
    getStudentAnalytics(id),
  ]);

  if (!studentData) {
    notFound();
  }

  return (
    <AppShell
      title={studentData.student.full_name}
      subtitle={`Student 360° Profile · ${studentData.student.reg_no}`}
      attentionCount={topBarData.attentionCount}
      studentsIndex={topBarData.searchIndex}
      breadcrumbs={[
        { label: "Cadet Directory", href: "/students" },
        { label: studentData.student.full_name },
      ]}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Student Identity Banner */}
        <Student360Header data={studentData} />

        {/* Tabbed Mentor Workspace */}
        <Student360Workspace
          milestonesCount={studentData.milestones?.length || 0}
          sessionsCount={studentData.sessions?.length || 0}
          careerItemsCount={(studentData.internships?.length || 0) + (studentData.achievements?.length || 0)}
          documentsCount={documents.length}
          analyticsContent={studentAnalytics ? <StudentAnalyticsPanel data={studentAnalytics} /> : undefined}
          overviewContent={
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-6">
                <CareerGoalCard
                  careerGoal={studentData.careerGoal}
                  profile={studentData.profile}
                />
                <ReadinessChecklist readiness={studentData.readiness} />
              </div>
              <div className="lg:col-span-5 space-y-6">
                <HistoricalProfileCard
                  profile={studentData.profile}
                  historicalStrengths={studentData.historicalStrengths}
                  historicalWeaknesses={studentData.historicalWeaknesses}
                />
                <StudentGroupsCard
                  groups={studentData.groups || []}
                  studentId={studentData.student.id}
                />
              </div>
            </div>
          }
          developmentContent={
            <div className="space-y-6">
              <POARoadmap
                milestones={studentData.milestones}
                studentId={studentData.student.id}
                studentName={studentData.student.full_name}
                careerGoalTitle={studentData.careerGoal?.title}
              />
              <div className="pt-4 border-t border-border">
                <SkillsMatrix skills={studentData.skills} />
              </div>
            </div>
          }
          sessionsContent={
            <div className="space-y-6">
              <StudentSessionsLog
                sessions={studentData.sessions}
                studentId={studentData.student.id}
                studentName={studentData.student.full_name}
                regNo={studentData.student.reg_no}
              />
            </div>
          }
          careerContent={
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 space-y-6">
                <StudentInternshipsCard
                  internships={studentData.internships || []}
                  studentId={studentData.student.id}
                  studentName={studentData.student.full_name}
                  opportunities={opportunities || []}
                  documents={documents}
                  milestones={studentData.milestones || []}
                />
              </div>
              <div className="lg:col-span-6 space-y-6">
                <StudentAchievementsCard
                  achievements={studentData.achievements || []}
                  studentId={studentData.student.id}
                />
              </div>
            </div>
          }
          documentsContent={
            <StudentDocumentsTab
              studentId={studentData.student.id}
              studentName={studentData.student.full_name}
              initialDocuments={documents}
              internships={studentData.internships || []}
              milestones={studentData.milestones || []}
            />
          }
          copilotContent={
            <AICopilotCard
              studentId={studentData.student.id}
              studentName={studentData.student.full_name}
              initialRecommendations={initialRecommendations}
            />
          }
        />
      </div>
    </AppShell>
  );
}
