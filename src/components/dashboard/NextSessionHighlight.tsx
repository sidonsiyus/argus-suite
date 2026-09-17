import React from "react";
import Link from "next/link";
import { Clock, PlayCircle, ExternalLink, Calendar, CheckCircle2, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DashboardSessionItem } from "@/lib/dashboard/types";

interface NextSessionHighlightProps {
  nextSession: DashboardSessionItem | null;
}

export function NextSessionHighlight({ nextSession }: NextSessionHighlightProps) {
  if (!nextSession) {
    return (
      <div className="bg-surface border border-border/80 rounded-xl p-6 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/50">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">No Sessions Scheduled Today</h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Your mentoring agenda is clear for today. You can schedule new sessions or review follow-ups below.
            </p>
          </div>
        </div>
        <Link href="/mentor-os/sessions?action=new">
          <Button variant="primary" size="sm" className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium">
            Schedule a Session
          </Button>
        </Link>
      </div>
    );
  }

  const isLive = nextSession.status === "IN_PROGRESS";

  return (
    <div className={`rounded-xl p-6 border shadow-card transition-all ${
      isLive
        ? "bg-amber-50/40 border-amber-300"
        : "bg-gradient-to-br from-emerald-50/30 to-surface border-emerald-200"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
              isLive
                ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                : "bg-emerald-100 text-emerald-900 border-emerald-300"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-amber-600" : "bg-emerald-600"}`} />
              {isLive ? "Session In Progress" : "Next Session Today"}
            </span>
            <span className="text-xs text-ink-muted">·</span>
            <span className="text-xs font-medium text-ink-secondary">
              {nextSession.sessionType.replace(/_/g, " ")}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              {nextSession.studentName}
            </h2>
            <span className="text-xs font-mono text-ink-muted">
              {nextSession.regNo}
            </span>
            {nextSession.careerGoal && (
              <span className="text-xs px-2 py-0.5 rounded bg-surface-subtle border border-border text-ink-muted">
                {nextSession.careerGoal}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted pt-1">
            <span className="flex items-center gap-1.5 font-medium text-ink">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              {nextSession.timeStr || "Scheduled Today"} ({nextSession.durationMinutes} mins)
            </span>
            {nextSession.focusArea && (
              <span>
                Focus: <span className="font-medium text-ink-secondary">{nextSession.focusArea}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:self-center">
          <Link href={`/mentor-os/students/${nextSession.studentId}`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <User className="w-3.5 h-3.5 text-ink-muted" />
              Cadet 360
            </Button>
          </Link>
          <Link href={`/mentor-os/sessions?open=${nextSession.id}`}>
            <Button variant="primary" size="sm" className="gap-1.5 text-xs bg-emerald-800 hover:bg-emerald-900 text-white">
              <PlayCircle className="w-3.5 h-3.5" />
              {isLive ? "Continue Workspace" : "Open Workspace"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
