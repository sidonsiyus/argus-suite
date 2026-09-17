"use client";

import React, { useState } from "react";
import {
  ListTodo,
  Calendar,
  Sparkles,
  BookOpen,
  ExternalLink,
  Plus,
  Trash2,
  Building,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Student360Data } from "@/lib/data/student-detail";
import { AttachResourceModal } from "./AttachResourceModal";
import { unlinkMilestoneResourceAction } from "@/app/actions/resources";
import { useToast } from "@/components/ui/ToastProvider";

interface StudentMilestonesProps {
  milestones: Student360Data["milestones"];
  studentId?: string;
}

export function StudentMilestones({ milestones, studentId }: StudentMilestonesProps) {
  const [modalMilestone, setModalMilestone] = useState<{ id: string; title: string } | null>(null);
  const [unlinkingKey, setUnlinkingKey] = useState<string | null>(null);
  const toast = useToast();

  const handleUnlink = async (milestoneId: string, resourceId: string) => {
    setUnlinkingKey(`${milestoneId}_${resourceId}`);
    try {
      await unlinkMilestoneResourceAction(milestoneId, resourceId, studentId);
      toast.info("Resource unlinked from milestone.");
    } catch (e) {
      toast.error("Failed to unlink resource.");
      console.error(e);
    } finally {
      setUnlinkingKey(null);
    }
  };

  return (
    <>
      <Card className="border-border bg-surface">
        <CardHeader
          title="Action Plans & Development Milestones (POAs)"
          subtitle={`${milestones.length} total recorded milestones`}
          action={
            <Badge variant="stone" size="sm">
              {milestones.filter((m) => m.status === "ACTIVE").length} Active
            </Badge>
          }
        />
        <CardContent>
          {milestones.length === 0 ? (
            <div className="py-8 text-center text-stone-400">
              <ListTodo className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-stone-600">No Action Plans Recorded</p>
              <p className="text-xs text-stone-400 mt-1">
                No historical POAs or active milestones have been assigned to this cadet yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map((m) => {
                const isActive = m.status === "ACTIVE";
                const linked = m.linked_resources || [];

                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-workspace border border-border space-y-3 hover:border-emerald-800/30 transition-colors"
                  >
                    {/* Title and Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-ink">{m.title}</h4>
                        {m.is_ai_suggested && (
                          <Badge variant="blue" size="sm" className="gap-1 text-[10px]">
                            <Sparkles className="w-3 h-3 text-blue-500" />
                            <span>AI Suggested</span>
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={isActive ? "emerald" : "stone"}
                          size="sm"
                          className="font-medium"
                        >
                          {m.status}
                        </Badge>
                        <Badge
                          variant={
                            m.priority === "HIGH" || m.priority === "URGENT"
                              ? "amber"
                              : "stone"
                          }
                          size="sm"
                        >
                          {m.priority}
                        </Badge>
                        <Badge variant="stone" size="sm" className="font-mono text-[10px]">
                          {m.provenance}
                        </Badge>
                      </div>
                    </div>

                    {/* Success Criteria */}
                    {m.success_criteria && (
                      <p className="text-xs text-stone-600 leading-relaxed bg-surface p-2.5 rounded-lg border border-border/60">
                        <strong className="text-stone-700 font-medium">Criteria:</strong>{" "}
                        {m.success_criteria}
                      </p>
                    )}

                    {/* Prescribed Learning Resources Section */}
                    <div className="pt-2 border-t border-border/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-accent-emerald" />
                          <span>Prescribed Learning Resources ({linked.length})</span>
                        </span>

                        {studentId && (
                          <button
                            type="button"
                            onClick={() => setModalMilestone({ id: m.id, title: m.title })}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-emerald hover:text-accent-emerald/80 px-2 py-0.5 rounded-md hover:bg-accent-emerald/10 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Prescribe Resource</span>
                          </button>
                        )}
                      </div>

                      {linked.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {linked.map((r) => (
                            <div
                              key={r.id}
                              className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="stone" size="sm" className="text-[9px] px-1.5">
                                    {r.resource_type}
                                  </Badge>
                                  {r.provider && (
                                    <span className="text-[10px] text-ink-muted truncate">
                                      {r.provider}
                                    </span>
                                  )}
                                </div>
                                <p className="font-medium text-ink truncate text-xs">{r.title}</p>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {r.url && (
                                  <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded hover:bg-surface-subtle text-accent-emerald transition-colors"
                                    title="Open resource"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {studentId && (
                                  <button
                                    type="button"
                                    onClick={() => handleUnlink(m.id, r.id)}
                                    disabled={unlinkingKey === `${m.id}_${r.id}`}
                                    className="p-1 rounded hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                                    title="Unlink resource"
                                    aria-label={`Unlink resource ${r.title}`}
                                  >
                                    {unlinkingKey === `${m.id}_${r.id}` ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer with target date & progress */}
                    <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-border/60">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>Target: {m.target_date || "No deadline set"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Completion: {m.completion_percentage}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {modalMilestone && studentId && (
        <AttachResourceModal
          isOpen={Boolean(modalMilestone)}
          onClose={() => setModalMilestone(null)}
          milestoneId={modalMilestone.id}
          milestoneTitle={modalMilestone.title}
          studentId={studentId}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
