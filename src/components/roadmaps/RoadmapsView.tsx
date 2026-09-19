"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Users, Flag, GraduationCap } from "lucide-react";
import { CohortRoadmaps, TrackCluster, RoadmapStudent } from "@/lib/data/roadmaps";
import { roadmapForSlug } from "@/lib/mentor-os/roadmaps";
import { cn } from "@/lib/utils";

function StudentChip({ s }: { s: RoadmapStudent }) {
  return (
    <Link
      href={`/mentor-os/students/${s.id}`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border hover:border-accent-emerald hover:text-accent-emerald transition-colors text-xs"
      title={`${s.name} · ${s.regNo}`}
    >
      <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[9px] font-bold">
        {s.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
      </span>
      <span className="truncate max-w-[110px]">{s.name}</span>
    </Link>
  );
}

function ClusterCard({ track, onOpen }: { track: TrackCluster; onOpen: () => void }) {
  const pct = track.stageCount > 1 ? Math.round((track.avgStageIndex / (track.stageCount - 1)) * 100) : 0;
  return (
    <button
      onClick={onOpen}
      className="text-left bg-surface border border-border rounded-2xl shadow-card p-5 transition-all duration-200 hover:border-border-strong hover:shadow-md hover:-translate-y-0.5 group"
    >
      <div className="h-0.5 -mx-5 -mt-5 mb-4 rounded-t-2xl bg-gradient-to-r from-emerald-400/60 to-transparent" />
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl">{track.icon}</span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-ink truncate">{track.title}</h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent-emerald">{track.authority}</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-accent-emerald transition-colors shrink-0" />
      </div>
      <p className="text-xs text-ink-muted mt-3 leading-relaxed line-clamp-2">{track.summary}</p>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 text-ink-secondary">
          <Users className="w-3.5 h-3.5 text-ink-muted" /> <b className="text-ink tabular-nums">{track.studentCount}</b> cadets
        </span>
        <span className="text-ink-muted">{track.stageCount} stages</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-surface-subtle overflow-hidden">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(pct, 3)}%` }} />
      </div>
      <p className="mt-1 text-[10px] text-ink-muted">Avg cohort progress · {pct}%</p>
    </button>
  );
}

function TrackDetail({ track, onBack }: { track: TrackCluster; onBack: () => void }) {
  const rm = roadmapForSlug(track.slug === "generic" ? null : track.slug);
  const byStage = new Map<number, RoadmapStudent[]>();
  track.students.forEach((s) => {
    if (!byStage.has(s.stageIndex)) byStage.set(s.stageIndex, []);
    byStage.get(s.stageIndex)!.push(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent-emerald mb-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> All career tracks
          </button>
          <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
            <span>{rm.icon}</span> {rm.title}
          </h2>
          <p className="text-xs text-ink-muted mt-0.5 max-w-2xl">{rm.summary}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs">
            <Users className="w-3.5 h-3.5 text-accent-emerald" /> <b className="text-ink">{track.studentCount}</b> cadets
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs">
            <Flag className="w-3.5 h-3.5 text-accent-emerald" /> {rm.stages.length} stages
          </span>
        </div>
      </div>

      {/* Roadmap stepper */}
      <div className="relative">
        {/* connecting line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" aria-hidden />
        <div className="space-y-4">
          {rm.stages.map((stage, i) => {
            const here = byStage.get(i) || [];
            return (
              <div key={stage.key} className="relative flex gap-4">
                {/* node */}
                <div className="relative z-10 shrink-0">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2",
                    here.length > 0
                      ? "bg-emerald-500 text-white border-emerald-600"
                      : "bg-surface text-ink-muted border-border"
                  )}>
                    {i + 1}
                  </div>
                </div>
                {/* body */}
                <div className="flex-1 bg-surface border border-border rounded-xl p-4 mb-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-ink">{stage.title}</h3>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">{stage.phase}</span>
                      </div>
                      <p className="text-xs text-ink-muted mt-1 leading-relaxed">{stage.objective}</p>
                    </div>
                    {here.length > 0 && (
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 shrink-0">
                        {here.length} here
                      </span>
                    )}
                  </div>

                  {stage.criteria.length > 0 && (
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                      {stage.criteria.map((c, ci) => (
                        <li key={ci} className="inline-flex items-center gap-1 text-[11px] text-ink-secondary bg-surface-subtle border border-border rounded-md px-2 py-0.5">
                          <GraduationCap className="w-3 h-3 text-ink-muted" /> {c}
                        </li>
                      ))}
                    </ul>
                  )}

                  {here.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/70">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-2">Cadets at this stage · auto-estimated</p>
                      <div className="flex flex-wrap gap-1.5">
                        {here.map((s) => <StudentChip key={s.id} s={s} />)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-ink-muted">
        Stage placement is auto-estimated from readiness, milestones and achievements. Mentor confirmation & material attachment arrive next.
      </p>
    </div>
  );
}

export function RoadmapsView({ data }: { data: CohortRoadmaps }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const track = data.tracks.find((t) => t.slug === openSlug) || null;

  if (track) return <TrackDetail track={track} onBack={() => setOpenSlug(null)} />;

  return (
    <div className="space-y-5">
      <p className="text-xs text-ink-muted">
        {data.tracks.length} career tracks across {data.totalStudents} cadets. Open a track to see its roadmap and where each cadet stands.
      </p>
      <div className="mos-rise grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.tracks.map((t) => (
          <ClusterCard key={t.slug} track={t} onOpen={() => setOpenSlug(t.slug)} />
        ))}
      </div>
    </div>
  );
}
