import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { CalendarEvent, CalendarEventType } from "@/lib/sessions/types";

export interface CalendarQueryFilters {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  types?: CalendarEventType[];
  studentId?: string;
}

export const getCalendarEvents = cache(async function getCalendarEvents(
  filters: CalendarQueryFilters
): Promise<{ data: CalendarEvent[]; error: any }> {
  try {
    const supabase = createServerSupabase();
    const events: CalendarEvent[] = [];

    const activeTypes = filters.types || [
      "SESSION",
      "FOLLOW_UP",
      "MILESTONE",
      "INTERNSHIP_DEADLINE",
    ];

    // Concurrently fetch sessions, milestones, and internship deadlines
    const shouldFetchSessions = activeTypes.includes("SESSION") || activeTypes.includes("FOLLOW_UP");
    const shouldFetchMilestones = activeTypes.includes("MILESTONE");
    const shouldFetchInternships = activeTypes.includes("INTERNSHIP_DEADLINE");

    let sessionsPromise: PromiseLike<any> = Promise.resolve({ data: [] });
    if (shouldFetchSessions) {
      let query = supabase
        .from("sessions")
        .select("id, student_id, mentor_id, scheduled_at, session_date, duration_minutes, status, session_type, focus_area, follow_up_date, follow_up_notes, students(id, full_name, reg_no)");
      if (filters.studentId) {
        query = query.eq("student_id", filters.studentId);
      }
      sessionsPromise = query;
    }

    let milestonesPromise: PromiseLike<any> = Promise.resolve({ data: [] });
    if (shouldFetchMilestones) {
      let mQuery = supabase
        .from("milestones")
        .select("id, student_id, title, target_date, status, priority, students(id, full_name, reg_no)")
        .not("target_date", "is", null)
        .gte("target_date", filters.startDate)
        .lte("target_date", filters.endDate);
      if (filters.studentId) {
        mQuery = mQuery.eq("student_id", filters.studentId);
      }
      milestonesPromise = mQuery;
    }

    let internshipsPromise: PromiseLike<any> = Promise.resolve({ data: [] });
    if (shouldFetchInternships) {
      internshipsPromise = supabase
        .from("internship_opportunities")
        .select("id, organization, title, application_deadline, work_mode")
        .not("application_deadline", "is", null)
        .gte("application_deadline", filters.startDate)
        .lte("application_deadline", filters.endDate)
        .eq("is_active", true);
    }

    const [
      { data: sessionRows, error: sErr },
      { data: milestoneRows, error: mErr },
      { data: oppRows, error: oErr },
    ] = await Promise.all([sessionsPromise, milestonesPromise, internshipsPromise]);

    // 1. Process Mentoring Sessions & Follow-ups
    if (!sErr && sessionRows) {
      for (const row of sessionRows) {
        const studentName = (row.students as any)?.full_name || "Cadet";
        const regNo = (row.students as any)?.reg_no || "";

        // A. Scheduled / Conducted Session Event
        if (activeTypes.includes("SESSION")) {
          const dateStr = row.session_date || (row.scheduled_at ? row.scheduled_at.split("T")[0] : null);
          if (dateStr && dateStr >= filters.startDate && dateStr <= filters.endDate) {
            const startIso = row.scheduled_at || `${dateStr}T10:00:00+05:30`;
            const durationMs = (row.duration_minutes || 30) * 60000;
            const endIso = new Date(new Date(startIso).getTime() + durationMs).toISOString();

            const sessionStatus = row.status || "HISTORICAL";

            events.push({
              id: `sess-${row.id}`,
              type: "SESSION",
              title: `${row.focus_area || row.session_type || "Mentoring"} · ${studentName}`,
              date: dateStr,
              start: startIso,
              end: endIso,
              studentId: row.student_id,
              studentName,
              regNo,
              sourceId: row.id,
              status: sessionStatus,
              details: {
                sessionType: row.session_type,
                durationMinutes: row.duration_minutes,
                focusArea: row.focus_area,
              },
            });
          }
        }

        // B. Follow-up Event (derived from session follow_up_date)
        if (activeTypes.includes("FOLLOW_UP") && row.follow_up_date) {
          const fDate = row.follow_up_date;
          if (fDate >= filters.startDate && fDate <= filters.endDate) {
            events.push({
              id: `followup-${row.id}`,
              type: "FOLLOW_UP",
              title: `Follow-up: ${studentName}`,
              date: fDate,
              start: `${fDate}T09:30:00+05:30`,
              end: `${fDate}T10:00:00+05:30`,
              studentId: row.student_id,
              studentName,
              regNo,
              sourceId: row.id,
              status: "FOLLOW_UP",
              details: {
                notes: row.follow_up_notes,
                originalSessionDate: row.session_date,
              },
            });
          }
        }
      }
    }

    // 2. Process Milestones Due Dates
    if (!mErr && milestoneRows) {
      for (const m of milestoneRows) {
        const studentName = (m.students as any)?.full_name || "Cadet";
        const regNo = (m.students as any)?.reg_no || "";
        events.push({
          id: `mile-${m.id}`,
          type: "MILESTONE",
          title: `Due: ${m.title} · ${studentName}`,
          date: m.target_date,
          start: `${m.target_date}T18:00:00+05:30`,
          end: `${m.target_date}T18:30:00+05:30`,
          studentId: m.student_id,
          studentName,
          regNo,
          sourceId: m.id,
          status: m.status,
          details: {
            priority: m.priority,
          },
        });
      }
    }

    // 3. Process Internship Deadlines
    if (!oErr && oppRows) {
      for (const opp of oppRows) {
        events.push({
          id: `opp-${opp.id}`,
          type: "INTERNSHIP_DEADLINE",
          title: `Deadline: ${opp.organization} (${opp.title})`,
          date: opp.application_deadline,
          start: `${opp.application_deadline}T23:59:00+05:30`,
          end: `${opp.application_deadline}T23:59:59+05:30`,
          sourceId: opp.id,
          status: "DEADLINE",
          details: {
            organization: opp.organization,
            workMode: opp.work_mode,
          },
        });
      }
    }

    // Sort events deterministically by date, then start timestamp
    events.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.start.localeCompare(b.start);
    });

    return { data: events, error: null };
  } catch (err: any) {
    console.error("Calendar aggregation error:", err);
    return { data: [], error: err?.message || "Failed to load calendar events" };
  }
});
