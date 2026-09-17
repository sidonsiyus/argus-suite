import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, UserCheck, Clock, MessageSquare } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { AttentionItem } from "@/lib/data/dashboard";

interface AttentionQueueProps {
  items: AttentionItem[];
}

export function AttentionQueue({ items }: AttentionQueueProps) {
  const getSignalIcon = (type: AttentionItem["signal_type"]) => {
    switch (type) {
      case "ATTENDANCE":
        return <Clock className="w-3.5 h-3.5 text-amber-600" />;
      case "COMMUNICATION":
        return <MessageSquare className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <Card id="attention" className="h-full flex flex-col">
      <CardHeader className="py-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-700">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Needs Attention</h3>
            <p className="text-xs text-ink-muted">
              Traceable development, attendance, and milestone signals
            </p>
          </div>
        </div>
        <Badge variant="amber" size="sm">
          {items.length} Flagged
        </Badge>
      </CardHeader>

      <CardContent className="p-0 flex-1 divide-y divide-border">
        {items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={UserCheck}
              title="All Cadets On Track"
              description="No urgent attendance or communication intervention flags recorded."
            />
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.student_id}
              className="p-4 hover:bg-surface-hover/60 transition-colors flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Link
                    href={`/students/${item.student_id}`}
                    className="text-xs font-semibold text-ink hover:text-emerald-800 transition-colors truncate"
                  >
                    {item.full_name}
                  </Link>
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-surface-subtle border border-border text-ink-secondary">
                    {item.reg_no}
                  </span>
                  <Badge variant="stone" size="sm">
                    {item.career_goal}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-secondary mt-1">
                  {getSignalIcon(item.signal_type)}
                  <span className="truncate">{item.reason}</span>
                </div>
              </div>

              <Link
                href={`/students/${item.student_id}`}
                className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-emerald-800 hover:text-emerald-950 px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-subtle transition-colors shadow-sm"
              >
                <span>Profile</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
