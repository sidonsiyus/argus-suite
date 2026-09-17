"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CalendarPlus,
  Clock,
  MessageSquareQuote,
  CalendarClock,
  Play,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Student360Data } from "@/lib/data/student-detail";
import { ScheduleSessionModal } from "@/components/sessions/ScheduleSessionModal";

interface StudentSessionsLogProps {
  sessions: Student360Data["sessions"];
  studentId?: string;
  studentName?: string;
  regNo?: string;
}

export function StudentSessionsLog({
  sessions,
  studentId,
  studentName,
  regNo,
}: StudentSessionsLogProps) {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const upcomingSessions = sessions.filter(
    (s) => s.status === "PLANNED" || s.status === "IN_PROGRESS"
  );
  const pastSessions = sessions.filter(
    (s) => s.status !== "PLANNED" && s.status !== "IN_PROGRESS"
  );

  return (
    <Card className="border-border bg-surface">
      <CardHeader
        title="Mentoring Sessions & Follow-ups"
        subtitle={`${sessions.length} sessions logged (${upcomingSessions.length} active/scheduled)`}
        action={
          studentId && studentName && regNo ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScheduleOpen(true)}
              className="text-xs h-7 px-2.5"
            >
              <CalendarPlus className="w-3.5 h-3.5 mr-1 text-accent-emerald" />
              <span>Schedule Session</span>
            </Button>
          ) : (
            <Badge variant="stone" size="sm">
              {sessions.length} Logged
            </Badge>
          )
        }
      />
      <CardContent className="space-y-5">
        {/* Active / Scheduled Sessions Banner */}
        {upcomingSessions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Upcoming / Active Sessions</span>
            </h4>
            <div className="space-y-2">
              {upcomingSessions.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-ink">{s.focus_area}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                        {s.status === "IN_PROGRESS" ? "In Progress" : "Planned"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-ink-muted font-mono">
                      <span>{s.session_date}</span>
                      {s.scheduled_at && (
                        <span>
                          {new Date(s.scheduled_at).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Kolkata",
                          })}
                        </span>
                      )}
                      <span>{s.duration_minutes} mins</span>
                    </div>
                  </div>

                  <Link
                    href="/mentor-os/sessions"
                    className="self-start sm:self-auto px-3 py-1 rounded-lg bg-accent-emerald text-white text-xs font-semibold hover:bg-emerald-800 transition-colors inline-flex items-center gap-1"
                  >
                    <span>Manage Session</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline of Past & Historical Sessions */}
        {pastSessions.length === 0 && upcomingSessions.length === 0 ? (
          <div className="py-8 text-center text-stone-400">
            <CalendarCheck className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-stone-600">No Mentoring Sessions Logged</p>
            <p className="text-xs text-stone-400 mt-1">
              No previous 1-on-1 mentoring discussions have been documented for this cadet.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {pastSessions.map((session) => (
              <div key={session.id} className="relative group">
                {/* Timeline Bullet */}
                <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-emerald-900 border-2 border-surface shadow-sm" />

                {/* Session Card */}
                <div className="p-4 rounded-xl bg-workspace border border-border space-y-3 hover:border-emerald-800/30 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink">
                        {session.session_date}
                      </span>
                      {session.duration_minutes > 0 && (
                        <span className="flex items-center gap-1 text-xs text-stone-500 font-mono">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>{session.duration_minutes} mins</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {session.focus_area && (
                        <Badge variant="emerald" size="sm">
                          {session.focus_area}
                        </Badge>
                      )}
                      {session.is_historical ? (
                        <Badge variant="stone" size="sm" className="font-mono text-[10px]">
                          Historical Record
                        </Badge>
                      ) : (
                        <Badge variant="stone" size="sm" className="text-[10px]">
                          {session.status}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Mentor Observations */}
                  {session.observations && (
                    <div className="bg-surface p-3 rounded-lg border border-border/60 text-xs text-stone-700 leading-relaxed">
                      <div className="flex items-center gap-1.5 text-stone-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                        <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-800" />
                        <span>Mentor Observations & Discussion Notes</span>
                      </div>
                      <p className="whitespace-pre-line">{session.observations}</p>
                    </div>
                  )}

                  {/* Outcome */}
                  {session.outcome && (
                    <div className="text-xs text-ink-muted">
                      <span className="font-semibold text-ink">Outcome:</span> {session.outcome}
                    </div>
                  )}

                  {/* Follow-up banner */}
                  {session.follow_up_date && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[11px] flex items-center gap-2">
                      <CalendarClock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Follow-up Date: {session.follow_up_date}</span>
                      {session.follow_up_notes && (
                        <span className="italic truncate text-[10px]">
                          ({session.follow_up_notes})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Schedule Modal for this student */}
      {studentId && studentName && regNo && (
        <ScheduleSessionModal
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          students={[{ id: studentId, full_name: studentName, reg_no: regNo }]}
          initialStudentId={studentId}
        />
      )}
    </Card>
  );
}
