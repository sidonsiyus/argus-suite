import React from "react";
import Link from "next/link";
import {
  ClockAlert,
  Target,
  Briefcase,
  Sparkles,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  DashboardFollowUpItem,
  DashboardMilestoneItem,
  DashboardInternshipItem,
  DashboardAIRecommendationItem,
} from "@/lib/dashboard/types";

interface OperationalAttentionGridProps {
  followUps: {
    overdue: DashboardFollowUpItem[];
    today: DashboardFollowUpItem[];
    upcoming: DashboardFollowUpItem[];
    all: DashboardFollowUpItem[];
  };
  milestones: {
    overdue: DashboardMilestoneItem[];
    approaching: DashboardMilestoneItem[];
  };
  internships: {
    approachingDeadlines: DashboardInternshipItem[];
  };
  aiRecommendations: DashboardAIRecommendationItem[];
}

export function OperationalAttentionGrid({
  followUps,
  milestones,
  internships,
  aiRecommendations,
}: OperationalAttentionGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Follow-up Tracker */}
      <Card className="flex flex-col">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-800">
                <ClockAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">Follow-up Commitments</h3>
                <p className="text-xs text-ink-muted">
                  {followUps.overdue.length} overdue · {followUps.today.length} due today
                </p>
              </div>
            </div>
            <Link href="/mentor-os/sessions" className="text-xs font-medium text-emerald-800 hover:text-emerald-900">
              Manage →
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-border/50 flex-1">
          {followUps.all.length === 0 ? (
            <div className="p-6 text-center text-xs text-ink-muted">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-1.5 text-emerald-600/70" />
              <p className="font-medium text-ink">No Pending Follow-ups</p>
              <p className="mt-0.5">All mentor session commitments are up to date.</p>
            </div>
          ) : (
            followUps.all.slice(0, 4).map((f) => {
              const isOverdue = f.daysDiff < 0;
              const isToday = f.daysDiff === 0;

              return (
                <div key={f.sessionId} className="p-3.5 hover:bg-surface-subtle/50 transition-colors flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink truncate">
                        {f.studentName}
                      </span>
                      <span className="text-[10px] font-mono text-ink-muted">{f.regNo}</span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                          isOverdue
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : isToday
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-stone-50 text-stone-700 border-stone-200"
                        }`}
                      >
                        {isOverdue
                          ? `${Math.abs(f.daysDiff)}d overdue`
                          : isToday
                          ? "Due today"
                          : `In ${f.daysDiff}d`}
                      </span>
                    </div>
                    {f.followUpNotes && (
                      <p className="text-[11px] text-ink-muted truncate">
                        {f.followUpNotes}
                      </p>
                    )}
                  </div>

                  <Link href={`/mentor-os/sessions?open=${f.sessionId}`}>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      Session
                    </Button>
                  </Link>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* 2. Overdue & Approaching Milestones */}
      <Card className="flex flex-col">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200/60 text-rose-800">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">Milestones Watchlist</h3>
                <p className="text-xs text-ink-muted">
                  {milestones.overdue.length} overdue · {milestones.approaching.length} due this week
                </p>
              </div>
            </div>
            <Link href="/mentor-os/students" className="text-xs font-medium text-emerald-800 hover:text-emerald-900">
              Directory →
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-border/50 flex-1">
          {milestones.overdue.length === 0 && milestones.approaching.length === 0 ? (
            <div className="p-6 text-center text-xs text-ink-muted">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-1.5 text-emerald-600/70" />
              <p className="font-medium text-ink">All Milestones On Track</p>
              <p className="mt-0.5">No overdue or near-deadline cadet action plans.</p>
            </div>
          ) : (
            milestones.overdue.concat(milestones.approaching).slice(0, 5).map((m) => {
              return (
                <div key={m.id} className="p-3.5 hover:bg-surface-subtle/50 transition-colors flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/students/${m.studentId}`}
                        className="text-xs font-semibold text-ink hover:text-emerald-800 transition-colors truncate"
                      >
                        {m.studentName}
                      </Link>
                      <span className="text-[10px] font-mono text-ink-muted">{m.regNo}</span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                          m.isOverdue
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {m.isOverdue
                          ? `${Math.abs(m.daysDiff)}d overdue`
                          : `Due in ${m.daysDiff}d`}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-secondary truncate font-medium">
                      {m.title}
                    </p>
                  </div>

                  <Link href={`/mentor-os/students/${m.studentId}`}>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      View 360
                    </Button>
                  </Link>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* 3. Internship Deadlines (Next 14 Days) */}
      <Card className="flex flex-col">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-800">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">Internship Deadlines</h3>
                <p className="text-xs text-ink-muted">
                  Opportunities closing in the next 14 days
                </p>
              </div>
            </div>
            <Link href="/mentor-os/internships" className="text-xs font-medium text-emerald-800 hover:text-emerald-900">
              All Internships →
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-border/50 flex-1">
          {internships.approachingDeadlines.length === 0 ? (
            <div className="p-6 text-center text-xs text-ink-muted">
              <Calendar className="w-6 h-6 mx-auto mb-1.5 text-ink-muted/50" />
              <p className="font-medium text-ink">No Urgent Deadlines</p>
              <p className="mt-0.5">No open opportunities closing within the next two weeks.</p>
            </div>
          ) : (
            internships.approachingDeadlines.slice(0, 4).map((opp) => {
              const isUrgent = opp.daysRemaining <= 3;
              return (
                <div key={opp.id} className="p-3.5 hover:bg-surface-subtle/50 transition-colors flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink truncate">
                        {opp.companyName}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                          isUrgent
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : "bg-blue-50 text-blue-800 border-blue-200"
                        }`}
                      >
                        {opp.daysRemaining === 0
                          ? "Closes today"
                          : `${opp.daysRemaining}d remaining`}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-muted truncate">
                      {opp.roleTitle} {opp.location ? `· ${opp.location}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-ink-secondary bg-surface-subtle px-2 py-0.5 rounded border border-border">
                      {opp.pursuitsCount} applied
                    </span>
                    <Link href={`/mentor-os/internships`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* 4. Pending AI Recommendations */}
      <Card className="flex flex-col">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-800">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">Pending AI Proposals</h3>
                <p className="text-xs text-ink-muted">
                  Copilot recommendations awaiting mentor decision
                </p>
              </div>
            </div>
            <Link href="/mentor-os/students" className="text-xs font-medium text-emerald-800 hover:text-emerald-900">
              Copilot →
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-border/50 flex-1">
          {aiRecommendations.length === 0 ? (
            <div className="p-6 text-center text-xs text-ink-muted">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-1.5 text-emerald-600/70" />
              <p className="font-medium text-ink">All Proposals Reviewed</p>
              <p className="mt-0.5">No pending AI copilot recommendations at this time.</p>
            </div>
          ) : (
            aiRecommendations.slice(0, 4).map((rec) => {
              return (
                <div key={rec.id} className="p-3.5 hover:bg-surface-subtle/50 transition-colors flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/mentor-os/students/${rec.studentId}`}
                        className="text-xs font-semibold text-ink hover:text-emerald-800 transition-colors truncate"
                      >
                        {rec.studentName}
                      </Link>
                      <span className="text-[10px] font-mono text-ink-muted">{rec.regNo}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {rec.recommendationType.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-secondary truncate font-medium">
                      "{rec.suggestedTitle}"
                    </p>
                  </div>

                  <Link href={`/mentor-os/students/${rec.studentId}`}>
                    <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-emerald-800 border-emerald-200 hover:bg-emerald-50">
                      Decide
                    </Button>
                  </Link>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
