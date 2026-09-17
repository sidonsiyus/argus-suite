import React from "react";
import Link from "next/link";
import { CalendarCheck, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

interface RecentSessionsFeedProps {
  sessions: Array<{
    id: string;
    session_date: string;
    focus_area: string;
    observations: string;
    students: {
      id: string;
      full_name: string;
      reg_no: string;
    } | null;
  }>;
}

export function RecentSessionsFeed({ sessions }: RecentSessionsFeedProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-800">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Recent Mentoring Log</h3>
            <p className="text-xs text-ink-muted">Historical session observations & discussions</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 divide-y divide-border">
        {sessions.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No Mentoring Sessions" description="No mentoring sessions logged yet." />
          </div>
        ) : (
          sessions.map((sess) => (
            <div key={sess.id} className="p-4 hover:bg-surface-hover/60 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-1">
                {sess.students ? (
                  <Link
                    href={`/students/${sess.students.id}`}
                    className="text-xs font-semibold text-ink hover:text-emerald-800 transition-colors truncate"
                  >
                    {sess.students.full_name}
                  </Link>
                ) : (
                  <span className="text-xs font-semibold text-ink">Cadet</span>
                )}
                <span className="text-[11px] font-mono text-ink-muted">
                  {formatDate(sess.session_date)}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="stone" size="sm">
                  {sess.focus_area || "General Mentoring"}
                </Badge>
                {sess.students && (
                  <span className="text-[10px] font-mono text-ink-muted">
                    {sess.students.reg_no}
                  </span>
                )}
              </div>

              <p className="text-xs text-ink-secondary leading-relaxed line-clamp-2">
                {sess.observations}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
