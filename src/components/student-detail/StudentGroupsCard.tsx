"use client";

import React from "react";
import Link from "next/link";
import { Users, ExternalLink, Calendar } from "lucide-react";
import { StudentGroupItem, GROUP_CATEGORIES } from "@/lib/groups/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface StudentGroupsCardProps {
  groups: StudentGroupItem[];
  studentId: string;
}

export function StudentGroupsCard({ groups }: StudentGroupsCardProps) {
  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-ink">Functional Intervention Groups</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-subtle font-mono text-ink-muted">
                {groups.length}
              </span>
            </div>
            <p className="text-[11px] text-ink-muted">
              Targeted skill support, DGCA theory exam prep & placement coaching groups
            </p>
          </div>
        </div>

        <Link
          href="/mentor-os/groups"
          className="text-xs font-semibold text-accent-emerald hover:underline inline-flex items-center gap-1"
        >
          <span>All Groups</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Body List */}
      <div className="mt-4 space-y-3">
        {groups.length === 0 ? (
          <div className="text-center py-6 px-4 bg-workspace/50 rounded-xl border border-dashed border-border">
            <Users className="w-7 h-7 text-ink-muted/50 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-ink">Not enrolled in any functional groups</p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Mentors can assign this cadet to targeted intervention or development cohorts from the Groups directory.
            </p>
          </div>
        ) : (
          groups.map((g) => {
            const categoryMeta =
              GROUP_CATEGORIES.find((c) => c.value === g.category) || {
                label: g.category,
              };

            return (
              <div
                key={g.group_id}
                className="p-3.5 rounded-xl border border-border bg-surface hover:border-border-strong transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/groups/${g.group_id}`}
                      className="font-semibold text-sm text-ink hover:text-accent-emerald hover:underline transition-colors inline-flex items-center gap-1"
                    >
                      <span>{g.group_name}</span>
                      <ExternalLink className="w-3 h-3 text-ink-muted" />
                    </Link>

                    <Badge variant="stone" size="sm" className="text-[10px]">
                      {categoryMeta.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-ink-muted font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-ink-muted/70" />
                      Joined {new Date(g.joined_at).toLocaleDateString()}
                    </span>
                    {g.notes && (
                      <span className="text-ink-muted italic truncate max-w-xs">
                        &ldquo;{g.notes}&rdquo;
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {g.status === "ACTIVE" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-surface-subtle text-stone-600 dark:text-ink-secondary border border-stone-200 dark:border-border">
                      Archived
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
