import React from "react";
import Link from "next/link";
import { Target, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

interface ActiveMilestonesFeedProps {
  milestones: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    target_date: string | null;
    is_ai_suggested: boolean;
    students: {
      id: string;
      full_name: string;
      reg_no: string;
    } | null;
  }>;
}

export function ActiveMilestonesFeed({ milestones }: ActiveMilestonesFeedProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-700">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Active Action Plans (POAs)</h3>
            <p className="text-xs text-ink-muted">Historical milestones currently in progress</p>
          </div>
        </div>
        <Link
          href="/mentor-os/students"
          className="text-xs font-medium text-ink-muted hover:text-ink transition-colors inline-flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>

      <CardContent className="p-0 flex-1 divide-y divide-border">
        {milestones.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No Active Milestones" description="All historical milestones are completed or closed." />
          </div>
        ) : (
          milestones.map((m) => (
            <div key={m.id} className="p-4 hover:bg-surface-hover/60 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-ink leading-relaxed line-clamp-2">
                    {m.title}
                  </p>
                  {m.students && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <Link
                        href={`/students/${m.students.id}`}
                        className="text-[11px] text-emerald-800 hover:underline font-medium truncate"
                      >
                        {m.students.full_name}
                      </Link>
                      <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-surface-subtle border border-border text-ink-muted">
                        {m.students.reg_no}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Badge variant="blue" size="sm">
                    {m.status}
                  </Badge>
                  {m.is_ai_suggested && (
                    <span className="text-[10px] text-ink-muted font-mono">
                      AI Suggested
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
