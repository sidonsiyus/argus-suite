"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Users, GraduationCap, SlidersHorizontal, Sparkles, UserPlus, X, Paperclip, FileText, ExternalLink } from "lucide-react";
import { CohortRoadmaps, TrackCluster, RoadmapStudent, StageMaterial } from "@/lib/data/roadmaps";
import { setStudentRoadmapStageAction, setStudentTrackAction, detachStageResourceAction } from "@/app/actions/roadmaps";
import { getResourceFileUrlAction } from "@/app/actions/resources";
import { ROADMAPS } from "@/lib/mentor-os/roadmaps";
import { RoadmapAiReview } from "./RoadmapAiReview";
import { AttachMaterialModal } from "./AttachMaterialModal";
import { cn } from "@/lib/utils";

const TRACK_OPTIONS = Object.values(ROADMAPS).map((r) => ({ slug: r.slug, title: r.title, icon: r.icon }));

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

interface Candidate extends RoadmapStudent {
  fromTitle: string;
}

function AddCadetPicker({
  currentSlug,
  currentTitle,
  candidates,
  onClose,
  onAdded,
}: {
  currentSlug: string;
  currentTitle: string;
  candidates: Candidate[];
  onClose: () => void;
  onAdded: (c: Candidate) => void;
}) {
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ql = q.trim().toLowerCase();
  const list = ql ? candidates.filter((c) => (c.name + " " + c.regNo).toLowerCase().includes(ql)) : candidates;

  async function pick(c: Candidate) {
    setBusyId(c.id);
    setError(null);
    const res = await setStudentTrackAction({ studentId: c.id, trackSlug: currentSlug });
    setBusyId(null);
    if (res.success) onAdded(c);
    else setError(res.error || "Couldn't change track.");
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md max-h-[80vh] flex flex-col bg-surface border border-border-strong rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-ink">Add cadet to {currentTitle}</h3>
            <p className="text-xs text-ink-muted">Reassigns their primary career goal to this track.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-subtle" aria-label="Close"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-3 border-b border-border">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cadets on other tracks…" className="w-full text-sm bg-surface-subtle border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-accent-emerald" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <div className="p-6 text-center text-sm text-ink-muted">No cadets on other tracks.</div>
          ) : (
            list.map((c) => (
              <button key={c.id} onClick={() => pick(c)} disabled={busyId === c.id} className="w-full flex items-center justify-between gap-2 px-5 py-2.5 hover:bg-surface-subtle text-left disabled:opacity-50">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink truncate">{c.name}</div>
                  <div className="text-[10px] text-ink-muted">{c.regNo} · now on {c.fromTitle}</div>
                </div>
                <UserPlus className="w-4 h-4 text-accent-emerald shrink-0" />
              </button>
            ))
          )}
        </div>
        {error && <p className="px-5 py-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      </div>
    </div>
  );
}

function TrackDetail({ track, allTracks, onBack }: { track: TrackCluster; allTracks: TrackCluster[]; onBack: () => void }) {
  const stages = track.stages;
  const [students, setStudents] = useState<RoadmapStudent[]>(track.students);
  const [manage, setManage] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [materials, setMaterials] = useState<Record<string, StageMaterial[]>>(track.materials || {});
  const [attachKey, setAttachKey] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onMaterialAttached(stageKey: string, m: StageMaterial) {
    setMaterials((prev) => ({ ...prev, [stageKey]: [...(prev[stageKey] || []), m] }));
    setAttachKey(null);
  }
  async function detachMaterial(stageKey: string, linkId: string) {
    const prev = materials;
    setMaterials((cur) => ({ ...cur, [stageKey]: (cur[stageKey] || []).filter((m) => m.linkId !== linkId) }));
    const res = await detachStageResourceAction(linkId);
    if (!res.success) {
      setMaterials(prev);
      setError(res.error || "Couldn't remove material.");
    }
  }
  async function openMaterial(m: StageMaterial) {
    if (m.url && /^https?:\/\//.test(m.url)) {
      window.open(m.url, "_blank", "noopener");
      return;
    }
    const res = await getResourceFileUrlAction(m.resourceId);
    const url = (res as any)?.url;
    if (url) window.open(url, "_blank", "noopener");
  }

  const candidates: Candidate[] = allTracks
    .filter((t) => t.slug !== track.slug)
    .flatMap((t) => t.students.map((s) => ({ ...s, fromTitle: t.title })));

  function onAdded(c: Candidate) {
    setStudents((list) => (list.some((s) => s.id === c.id) ? list : [...list, { ...c, stageIndex: 0, stageKey: stages[0].key, estimated: true }]));
    setAddOpen(false);
  }

  async function changeTrack(studentId: string, newSlug: string) {
    if (newSlug === track.slug) return;
    const prev = students;
    setStudents((list) => list.filter((s) => s.id !== studentId)); // optimistic remove
    setSavingId(studentId);
    setError(null);
    const res = await setStudentTrackAction({ studentId, trackSlug: newSlug });
    setSavingId(null);
    if (!res.success) {
      setStudents(prev);
      setError(res.error || "Couldn't change track.");
    }
  }

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
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border text-ink-secondary hover:text-accent-emerald hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add cadet
          </button>
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
      {attachKey && (
        <AttachMaterialModal
          trackSlug={track.slug}
          stageKey={attachKey}
          stageTitle={stages.find((s) => s.key === attachKey)?.title || attachKey}
          onClose={() => setAttachKey(null)}
          onAttached={(m) => onMaterialAttached(attachKey, m)}
        />
      )}
      {addOpen && (
        <AddCadetPicker
          currentSlug={track.slug}
          currentTitle={track.title}
          candidates={candidates}
          onClose={() => setAddOpen(false)}
          onAdded={onAdded}
        />
      )}

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

                  {/* Support material */}
                  <div className="mt-3 pt-3 border-t border-border/70">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-ink-muted inline-flex items-center gap-1">
                        <Paperclip className="w-3 h-3" /> Support material
                      </p>
                      <button onClick={() => setAttachKey(stage.key)} className="text-[11px] font-semibold text-accent-emerald hover:underline">+ Attach</button>
                    </div>
                    {(materials[stage.key] || []).length === 0 ? (
                      <p className="text-[11px] text-ink-muted">No material yet — attach a link or upload a file.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {(materials[stage.key] || []).map((m) => (
                          <span key={m.linkId} className="inline-flex items-center gap-1 text-[11px] bg-surface-subtle border border-border rounded-md pl-2 pr-1 py-0.5">
                            <button onClick={() => openMaterial(m)} className="inline-flex items-center gap-1 text-ink-secondary hover:text-accent-emerald max-w-[170px] truncate">
                              {m.resourceType === "DOCUMENT" ? <FileText className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />} {m.title}
                            </button>
                            <button onClick={() => detachMaterial(stage.key, m.linkId)} className="text-ink-muted hover:text-rose-500" aria-label="Remove material"><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

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
                  value={track.slug}
                  disabled={savingId === s.id}
                  onChange={(e) => changeTrack(s.id, e.target.value)}
                  title="Change career track"
                  className="text-xs bg-surface-subtle border border-border rounded-lg px-2 py-1.5 text-ink-secondary focus:outline-none focus:border-accent-emerald max-w-[150px] disabled:opacity-50"
                >
                  {track.slug === "generic" && <option value="generic">Unassigned</option>}
                  {TRACK_OPTIONS.map((t) => (
                    <option key={t.slug} value={t.slug}>{t.icon} {t.title}</option>
                  ))}
                </select>
                <select
                  value={s.stageIndex}
                  disabled={savingId === s.id}
                  onChange={(e) => setStage(s.id, Number(e.target.value))}
                  className="text-xs bg-surface-subtle border border-border rounded-lg px-2.5 py-1.5 text-ink focus:outline-none focus:border-accent-emerald max-w-[200px] disabled:opacity-50"
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

  if (track) return <TrackDetail track={track} allTracks={data.tracks} onBack={() => setOpenSlug(null)} />;

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
