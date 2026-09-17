import React from "react";
import Link from "next/link";
import { AlertTriangle, Info, AlertCircle, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DashboardAttentionItem, AttentionUrgency } from "@/lib/dashboard/types";

interface ExplainableAttentionQueueProps {
  items: DashboardAttentionItem[];
}

export function ExplainableAttentionQueue({ items }: ExplainableAttentionQueueProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200/60 text-rose-800">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Action Items & Cadet Attention</h3>
              <p className="text-xs text-ink-muted">
                {items.length} cadets flagged with explainable operational signals
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-subtle text-ink-secondary border border-border">
              Deterministic Signals Only
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-border/60">
        {items.length === 0 ? (
          <div className="p-8 text-center text-xs text-ink-muted">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-600/80" />
            <p className="font-semibold text-ink text-sm">Attention Queue Clear</p>
            <p className="mt-1 max-w-sm mx-auto">
              All cadets are progressing normally with no overdue milestones, overdue follow-ups, or urgent signals.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const isHigh = item.urgency === "HIGH";
            const isMedium = item.urgency === "MEDIUM";

            return (
              <div
                key={item.studentId}
                className="p-4 hover:bg-surface-subtle/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/students/${item.studentId}`}
                      className="text-sm font-semibold text-ink hover:text-emerald-800 transition-colors"
                    >
                      {item.studentName}
                    </Link>
                    <span className="text-xs font-mono text-ink-muted">{item.regNo}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-surface-subtle text-ink-muted border border-border">
                      {item.careerGoal}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        isHigh
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : isMedium
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-blue-50 text-blue-800 border-blue-200"
                      }`}
                    >
                      {item.urgency} PRIORITY
                    </span>
                  </div>

                  {/* Explainable operational reasons */}
                  <div className="space-y-1 pl-1">
                    {item.reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-ink-secondary">
                        <span className="text-ink-muted mt-0.5">▪</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <Link href={`/students/${item.studentId}`}>
                    <Button variant="outline" size="sm" className="h-8 px-3 text-xs gap-1 font-medium">
                      <span>Cadet 360</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-ink-muted" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
