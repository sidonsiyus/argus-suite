import React from "react";
import Link from "next/link";
import { Calendar, Users, PlusCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DashboardHeaderProps {
  totalStudents: number;
  todaySessionsCount: number;
}

export function DashboardHeader({ totalStudents, todaySessionsCount }: DashboardHeaderProps) {
  // Format today's date in IST
  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-5">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100/80 text-emerald-900 border border-emerald-300/60">
            Faculty Command Center
          </span>
          <span className="text-xs text-ink-muted">·</span>
          <span className="text-xs font-mono text-ink-muted">{todayFormatted} (IST)</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Operational Command Center
        </h1>
        <p className="text-xs text-ink-muted leading-relaxed">
          B.Sc. Aeronautical Science · Batch 2025–2028 · Section A ·{" "}
          <span className="font-semibold text-ink-secondary">{totalStudents} Verified Cadets</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Link href="/mentor-os/calendar">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-ink-muted" />
            Calendar View
          </Button>
        </Link>
        <Link href="/mentor-os/students">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
            <Users className="w-3.5 h-3.5 text-ink-muted" />
            Cadet Directory
          </Button>
        </Link>
        <Link href="/mentor-os/sessions?action=new">
          <Button variant="primary" size="sm" className="gap-1.5 text-xs font-medium bg-emerald-800 hover:bg-emerald-900 text-white">
            <PlusCircle className="w-3.5 h-3.5" />
            Schedule Session
          </Button>
        </Link>
      </div>
    </div>
  );
}
