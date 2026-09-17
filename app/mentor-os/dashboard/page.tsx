import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CommandCenterKpis } from "@/components/dashboard/CommandCenterKpis";
import { NextSessionHighlight } from "@/components/dashboard/NextSessionHighlight";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { OperationalAttentionGrid } from "@/components/dashboard/OperationalAttentionGrid";
import { ExplainableAttentionQueue } from "@/components/dashboard/ExplainableAttentionQueue";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { QuickActionsBar } from "@/components/dashboard/QuickActionsBar";
import { CareerDistribution } from "@/components/dashboard/CareerDistribution";
import { getCommandCenterData } from "@/lib/data/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data } = await getCommandCenterData();

  const kpis = data?.kpis || {
    todaySessionsCount: 0,
    followUpsDueCount: 0,
    overdueMilestonesCount: 0,
    pendingAiRecommendationsCount: 0,
    totalStudents: 0,
    activeMilestonesCount: 0,
  };

  return (
    <AppShell
      title="Daily Command Center"
      subtitle="B.Sc. Aeronautical Science · Batch 2025–2028"
      attentionCount={data?.needingAttention.length || 0}
      studentsIndex={data?.searchIndex || []}
    >
      <div className="space-y-6">
        {/* 1. Header & Context */}
        <DashboardHeader
          totalStudents={kpis.totalStudents}
          todaySessionsCount={kpis.todaySessionsCount}
        />

        {/* 2. Quick Shortcuts */}
        <QuickActionsBar />

        {/* 3. 4 Operational KPI Cards (Zero opaque scores) */}
        <CommandCenterKpis kpis={kpis} />

        {/* 4. Next Session Highlight / Today's Status */}
        <NextSessionHighlight nextSession={data?.nextSession || null} />

        {/* 5. Full Today Schedule (if > 1 session) */}
        {data?.todaySessions && data.todaySessions.length > 1 && (
          <TodaySchedule sessions={data.todaySessions} />
        )}

        {/* 6. Operational Attention Grid (Follow-ups, Milestones, Internships, AI) */}
        <OperationalAttentionGrid
          followUps={data?.followUps || { overdue: [], today: [], upcoming: [], all: [] }}
          milestones={data?.milestones || { overdue: [], approaching: [] }}
          internships={data?.internships || { approachingDeadlines: [] }}
          aiRecommendations={data?.aiRecommendations || []}
        />

        {/* 7. 2-Column Operational Attention & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Explainable Attention Queue */}
          <div className="lg:col-span-7 space-y-6">
            <ExplainableAttentionQueue items={data?.needingAttention || []} />
          </div>

          {/* Right Column: Career Distribution & Recent Activity Feed */}
          <div className="lg:col-span-5 space-y-6">
            <CareerDistribution
              items={data?.careerDistribution || []}
              totalStudents={kpis.totalStudents}
            />
            <RecentActivityFeed activities={data?.recentActivity || []} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
