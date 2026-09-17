import React from "react";
import Link from "next/link";
import { Clock, CheckCircle2, AlertCircle, PlayCircle, ExternalLink, Calendar } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DashboardSessionItem } from "@/lib/dashboard/types";

interface TodayScheduleProps {
  sessions: DashboardSessionItem[];
}

export function TodaySchedule({ sessions }: TodayScheduleProps) {
  if (sessions.length <= 1) {
    // If 0 or 1 session, NextSessionHighlight already covers the details
    return null;
  }

  return (
    <Card>
      <CardHeader className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-800">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Today's Complete Schedule</h3>
              <p className="text-xs text-ink-muted">
                {sessions.length} sessions scheduled across the day
              </p>
            </div>
          </div>
          <Link href="/mentor-os/sessions" className="text-xs font-medium text-emerald-800 hover:text-emerald-900">
            View All Sessions →
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-border/60">
        {sessions.map((sess) => {
          const isDone = sess.status === "COMPLETED";
          const isLive = sess.status === "IN_PROGRESS";

          return (
            <div
              key={sess.id}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-subtle/50 transition-colors ${
                sess.isNext ? "bg-emerald-50/20" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-20 text-xs font-mono font-medium text-ink flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-ink-muted" />
                  {sess.timeStr || "TBD"}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/students/${sess.studentId}`}
                      className="text-sm font-medium text-ink hover:text-emerald-800 transition-colors"
                    >
                      {sess.studentName}
                    </Link>
                    <span className="text-xs font-mono text-ink-muted">{sess.regNo}</span>
                    {sess.isNext && (
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Next
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-muted mt-0.5">
                    {sess.sessionType.replace(/_/g, " ")}
                    {sess.focusArea && ` · Focus: ${sess.focusArea}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                  isDone
                    ? "bg-stone-50 text-stone-700 border-stone-200"
                    : isLive
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}>
                  {sess.status}
                </span>

                <Link href={`/mentor-os/sessions?open=${sess.id}`}>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    {isDone ? "Review" : "Open"}
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
