import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CalendarView } from "@/components/calendar/CalendarView";
import { getCalendarEvents } from "@/lib/data/calendar";
import { getTopBarHeaderData } from "@/lib/data/topbar";

export const metadata = {
  title: "Calendar & Schedule | MENTOR OS",
  description: "Unified institutional calendar of mentoring sessions, follow-ups, milestones, and deadlines.",
};

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  // Query 6-month window around current date (2 months past, 4 months future)
  const now = new Date();
  const startWindow = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    .toISOString()
    .split("T")[0];
  const endWindow = new Date(now.getFullYear(), now.getMonth() + 4, 0)
    .toISOString()
    .split("T")[0];

  const [calendarRes, topBarData] = await Promise.all([
    getCalendarEvents({ startDate: startWindow, endDate: endWindow }),
    getTopBarHeaderData(),
  ]);

  const searchIndex = topBarData.searchIndex;
  const attentionCount = topBarData.attentionCount;
  const allCadets = topBarData.searchIndex;

  return (
    <AppShell
      title="Calendar & Scheduling"
      subtitle="Unified operational timeline: mentoring sessions, follow-ups, milestones & internship deadlines"
      attentionCount={attentionCount}
      studentsIndex={searchIndex}
    >
      <CalendarView
        initialEvents={calendarRes.data || []}
        allStudents={allCadets}
      />
    </AppShell>
  );
}
