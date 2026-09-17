import React from "react";
import Link from "next/link";
import { CalendarCheck, ClockAlert, Target, Sparkles, ArrowUpRight } from "lucide-react";
import { DashboardKpis } from "@/lib/dashboard/types";

interface CommandCenterKpisProps {
  kpis: DashboardKpis;
}

export function CommandCenterKpis({ kpis }: CommandCenterKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Today's Sessions */}
      <Link href="/mentor-os/sessions" className="block group">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-card hover:border-emerald-300/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">
              Today's Sessions
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/50 group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-ink">
              {kpis.todaySessionsCount}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-subtle text-ink-secondary border border-border/60">
              {kpis.todaySessionsCount > 0 ? "Scheduled Today" : "None Today"}
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-muted flex items-center gap-1 group-hover:text-emerald-800 transition-colors">
            <span>View session schedule</span>
            <ArrowUpRight className="w-3 h-3" />
          </p>
        </div>
      </Link>

      {/* 2. Follow-ups Due */}
      <Link href="/mentor-os/sessions" className="block group">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-card hover:border-amber-300/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">
              Follow-ups Due
            </span>
            <div className={`p-2 rounded-lg border transition-transform group-hover:scale-105 ${
              kpis.followUpsDueCount > 0
                ? "bg-amber-50 text-amber-800 border-amber-200/60"
                : "bg-surface-subtle text-ink-muted border-border"
            }`}>
              <ClockAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-ink">
              {kpis.followUpsDueCount}
            </span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
              kpis.followUpsDueCount > 0
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}>
              {kpis.followUpsDueCount > 0 ? "Pending Action" : "All Clear"}
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-muted flex items-center gap-1 group-hover:text-amber-800 transition-colors">
            <span>Review commitments</span>
            <ArrowUpRight className="w-3 h-3" />
          </p>
        </div>
      </Link>

      {/* 3. Overdue Milestones */}
      <Link href="/mentor-os/students" className="block group">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-card hover:border-rose-300/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">
              Overdue Milestones
            </span>
            <div className={`p-2 rounded-lg border transition-transform group-hover:scale-105 ${
              kpis.overdueMilestonesCount > 0
                ? "bg-rose-50 text-rose-800 border-rose-200/60"
                : "bg-emerald-50 text-emerald-800 border-emerald-200/60"
            }`}>
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-ink">
              {kpis.overdueMilestonesCount}
            </span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
              kpis.overdueMilestonesCount > 0
                ? "bg-rose-50 text-rose-800 border-rose-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}>
              {kpis.overdueMilestonesCount > 0 ? "Requires Attention" : "On Schedule"}
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-muted flex items-center gap-1 group-hover:text-rose-800 transition-colors">
            <span>Inspect action plans</span>
            <ArrowUpRight className="w-3 h-3" />
          </p>
        </div>
      </Link>

      {/* 4. Pending AI Recommendations */}
      <Link href="/mentor-os/students" className="block group">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-card hover:border-blue-300/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">
              Pending AI Proposals
            </span>
            <div className={`p-2 rounded-lg border transition-transform group-hover:scale-105 ${
              kpis.pendingAiRecommendationsCount > 0
                ? "bg-blue-50 text-blue-800 border-blue-200/60"
                : "bg-surface-subtle text-ink-muted border-border"
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-ink">
              {kpis.pendingAiRecommendationsCount}
            </span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
              kpis.pendingAiRecommendationsCount > 0
                ? "bg-blue-50 text-blue-800 border-blue-200"
                : "bg-surface-subtle text-ink-secondary border-border"
            }`}>
              {kpis.pendingAiRecommendationsCount > 0 ? "Review Awaiting" : "Decided"}
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-muted flex items-center gap-1 group-hover:text-blue-800 transition-colors">
            <span>Copilot proposals</span>
            <ArrowUpRight className="w-3 h-3" />
          </p>
        </div>
      </Link>
    </div>
  );
}
