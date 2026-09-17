import React from "react";
import { History, Activity, Calendar, Target, BookOpen, Award, Users, Sparkles } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { DashboardActivityItem } from "@/lib/dashboard/types";

interface RecentActivityFeedProps {
  activities: DashboardActivityItem[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  function getIcon(entityType: string) {
    switch (entityType.toLowerCase()) {
      case "sessions":
        return <Calendar className="w-3.5 h-3.5 text-emerald-700" />;
      case "milestones":
        return <Target className="w-3.5 h-3.5 text-blue-700" />;
      case "resources":
        return <BookOpen className="w-3.5 h-3.5 text-indigo-700" />;
      case "achievements":
        return <Award className="w-3.5 h-3.5 text-amber-700" />;
      case "groups":
        return <Users className="w-3.5 h-3.5 text-teal-700" />;
      case "ai_recommendations":
        return <Sparkles className="w-3.5 h-3.5 text-purple-700" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-ink-muted" />;
    }
  }

  function formatTime(isoStr: string) {
    try {
      const dt = new Date(isoStr);
      return dt.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoStr;
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="py-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-surface-subtle border border-border text-ink-muted">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Recent Operational Log</h3>
            <p className="text-xs text-ink-muted">
              System events & faculty actions
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-border/50">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-xs text-ink-muted">
            <p className="font-medium text-ink">No Recent Operations</p>
            <p className="mt-0.5">Faculty actions will automatically appear in this feed.</p>
          </div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="p-3 hover:bg-surface-subtle/40 transition-colors flex items-start gap-3">
              <div className="p-1.5 rounded bg-surface-subtle border border-border shrink-0 mt-0.5">
                {getIcon(act.entityType)}
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-ink truncate">
                    {act.title}
                  </span>
                  <span className="text-[10px] font-mono text-ink-muted shrink-0">
                    {formatTime(act.timestamp)}
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted truncate">
                  {act.description}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
