"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Users, GraduationCap, SlidersHorizontal, Sparkles } from "lucide-react";
import { CohortRoadmaps, TrackCluster, RoadmapStudent } from "@/lib/data/roadmaps";
import { setStudentRoadmapStageAction } from "@/app/actions/roadmaps";
import { RoadmapAiReview } from "./RoadmapAiReview";
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
  const stages = track.stages;
  const [students, setStudents] = useState<RoadmapStudent[]>(track.students);
  const [manage, setManage] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const byStage = new Map<number, RoadmapStudent[]>();
  students.forEach((s) => {
    if (!byStage.has(s.stageIndex)) byStage.set(s.stageIndex, []);
    byStage.get(s.stageIndex)!.push(s);
  });

  async function setStage(studentId: string, stageIndex: number) {
    const stageKey = stages[stageIndex]?.key;
    if (!stageKey) return;
    const prev = students;
    // optimistic
    setStudents((list) => list.map((s) => (s.id === studentId ? { ...s, stageIndex, stageKey, estimated: false } : s)));
    setSavingId(studentId);
    setError(null);
    const res = await setStudentRoadmapStageAction({ studentId, trackSlug: track.slug, stageKey });
    setSavingId(null);
    if (!res.success) {
      setStudents(prev); // rollback
      setError(res.error || "Couldn't save — the roadmap_progress table may not be migrated yet.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent-emerald mb-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> All career tracks
          </button>
          <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
            <span>{track.icon}</span> {track.title}
            {track.source && track.source !== "SEED" && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-1.5 py-0.5 rounded">
                {track.source === "AI_SUGGESTED" ? "AI-refined" : "edited"}
              </span>
            )}
          </h2>
          <p className="text-xs text-ink-muted mt-0.5 max-w-2xl">{track.summary}</p>
          {track.examGuidance && (
            <p className="text-[11px] text-ink-secondary mt-2 max-w-2xl bg-surface-subtle border border-border rounded-lg px-3 py-2">
              <b className="text-ink">Exam guidance:</b> {track.examGuidance}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs">
            <Users className="w-3.5 h-3.5 text-accent-emerald" /> <b className="text-ink">{track.studentCount}</b> cadets
          </span>
          <button
            onClick={() => setAiOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border text-ink-secondary hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-500/40 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> Suggest with AI
          </button>
          <button
            onClick={() => setManage((m) => !m)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              manage ? "bg-accent-emerald text-white" : "bg-surface border border-border text-ink-secondary hover:text-ink"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Manage stages
          </button>
        </div>
      </div>

      {aiOpen && <RoadmapAiReview trackSlug={track.slug} trackTitle={track.title} onClose={() => setAiOpen(false)} />}

      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}

      {/* Roadmap stepper */}
      <div className="relative">
        {/* connecting line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" aria-hidden />
        <div className="space-y-4">
          {stages.map((stage, i) => {
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
                      <p className="text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-2">Cadets at this stage</p>
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

      {/* Manage cadet stages */}
      {manage && (
        <div className="bg-surface border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-border/70">
            <div className="flex items-center gap-1.5 mb-0.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-accent-emerald" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-accent-emerald">Manage</span>
            </div>
            <h3 className="text-[15px] font-semibold text-ink">Cadet stages</h3>
            <p className="text-xs text-ink-muted mt-0.5">Confirm or move each cadet along the roadmap. Overrides the auto-estimate.</p>
          </div>
          <div className="divide-y divide-border/70">
            {students.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-2.5">
                <Link href={`/mentor-os/students/${s.id}`} className="flex-1 min-w-0 hover:text-accent-emerald">
                  <div className="text-sm font-medium text-ink truncate">{s.name}</div>
                  <div className="text-[10px] text-ink-muted">{s.regNo}</div>
                </Link>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full border shrink-0",
                  s.estimated
                    ? "bg-surface-subtle text-ink-muted border-border"
                    : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                )}>
                  {s.estimated ? "estimated" : "confirmed"}
                </span>
                <select
                  value={s.stageIndex}
                  disabled={savingId === s.id}
                  onChange={(e) => setStage(s.id, Number(e.target.value))}
                  className="text-xs bg-surface-subtle border border-border rounded-lg px-2.5 py-1.5 text-ink focus:outline-none focus:border-accent-emerald max-w-[220px] disabled:opacity-50"
                >
                  {stages.map((st, i) => (
                    <option key={st.key} value={i}>{i + 1}. {st.title}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] text-ink-muted">
        Stage placement is auto-estimated from readiness, milestones and achievements until a mentor confirms it. Use <b>Manage stages</b> to override.
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
