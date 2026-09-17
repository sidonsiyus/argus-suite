"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  UserMinus,
  Edit2,
  Archive,
  RotateCcw,
  ArrowLeft,
  Calendar,
  ExternalLink,
  Search,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  GroupDetailItem,
  GroupCategory,
  GroupStatus,
  GROUP_CATEGORIES,
} from "@/lib/groups/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { GroupFormModal } from "./GroupFormModal";
import { AddStudentsModal } from "./AddStudentsModal";
import {
  archiveGroupAction,
  removeStudentFromGroupAction,
} from "@/app/actions/groups";

interface CadetSummary {
  id: string;
  full_name: string;
  reg_no: string;
  career_goal?: string;
}

interface GroupDetailViewProps {
  group: GroupDetailItem;
  allStudents: CadetSummary[];
}

export function GroupDetailView({ group, allStudents }: GroupDetailViewProps) {
  const router = useRouter();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddStudentsOpen, setIsAddStudentsOpen] = useState(false);
  const [rosterSearch, setRosterSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoryMeta =
    GROUP_CATEGORIES.find((c) => c.value === group.category) || {
      label: group.category,
      description: "",
    };

  const existingStudentIds = (group.members || []).map((m) => m.student_id);

  // Filter roster by student name or reg_no only (Privacy rule)
  const filteredMembers = (group.members || []).filter((m) => {
    if (!rosterSearch.trim()) return true;
    const q = rosterSearch.toLowerCase().trim();
    return (
      m.student_name.toLowerCase().includes(q) ||
      m.reg_no.toLowerCase().includes(q) ||
      (m.career_goal && m.career_goal.toLowerCase().includes(q))
    );
  });

  const handleToggleArchive = async () => {
    const nextStatus: GroupStatus = group.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
    setActionLoadingId("archive");
    setErrorMessage(null);
    try {
      const res = await archiveGroupAction(group.id, nextStatus);
      if (res.success) {
        window.location.reload();
      } else {
        setErrorMessage(res.error || "Failed to update group status.");
      }
    } catch {
      setErrorMessage("An unexpected network error occurred.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Remove "${studentName}" from "${group.name}"?`)) return;
    setActionLoadingId(studentId);
    setErrorMessage(null);
    try {
      const res = await removeStudentFromGroupAction(group.id, studentId);
      if (res.success) {
        window.location.reload();
      } else {
        setErrorMessage(res.error || "Failed to remove student from group.");
      }
    } catch {
      setErrorMessage("An unexpected network error occurred.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back to Directory Link */}
      <div>
        <Link
          href="/mentor-os/groups"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Groups</span>
        </Link>
      </div>

      {/* Error notification banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-900 font-medium ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Group Detail Header Card */}
      <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="stone" size="sm">
                {categoryMeta.label}
              </Badge>
              {group.status === "ACTIVE" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Group
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                  Archived
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-ink tracking-tight">
              {group.name}
            </h1>

            {group.description && (
              <p className="text-xs text-ink-muted leading-relaxed max-w-2xl">
                {group.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-ink-muted font-mono pt-1">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-accent-emerald" />
                <strong className="text-ink">{group.members?.length || 0}</strong> students enrolled
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-ink-muted/70" />
                Created {new Date(group.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setIsAddStudentsOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Students</span>
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-ink bg-surface hover:bg-surface-subtle border border-border rounded-xl transition-colors shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={handleToggleArchive}
              disabled={actionLoadingId === "archive"}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-subtle border border-border rounded-xl transition-colors disabled:opacity-50"
            >
              {group.status === "ACTIVE" ? (
                <>
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Roster Section */}
      <div className="space-y-3">
        {/* Roster Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-ink">Group Roster</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-workspace border border-border font-mono text-ink-muted">
              {filteredMembers.length}
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={rosterSearch}
              onChange={(e) => setRosterSearch(e.target.value)}
              placeholder="Filter roster by student name or reg no..."
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            />
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Roster Table */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
          {filteredMembers.length === 0 ? (
            <div className="p-12 text-center text-xs text-ink-muted">
              {group.members?.length === 0 ? (
                <div className="space-y-2">
                  <Users className="w-8 h-8 text-ink-muted/50 mx-auto" />
                  <p className="font-medium text-ink">No students in this group yet.</p>
                  <p className="text-[11px]">
                    Add cadets from across cohorts to begin managing this intervention group.
                  </p>
                  <button
                    onClick={() => setIsAddStudentsOpen(true)}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-accent-emerald rounded-xl hover:bg-accent-emerald/90 transition-all shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Students Now</span>
                  </button>
                </div>
              ) : (
                <p>No cadets matching &ldquo;{rosterSearch}&rdquo;.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-workspace/70 text-ink-muted uppercase font-medium tracking-wider text-[10px]">
                    <th className="py-3 px-4">Cadet Name</th>
                    <th className="py-3 px-4">Register Number</th>
                    <th className="py-3 px-4">Target Career Goal</th>
                    <th className="py-3 px-4">Membership Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMembers.map((member) => {
                    const isLoading = actionLoadingId === member.student_id;

                    return (
                      <tr
                        key={member.student_id}
                        className="hover:bg-surface-subtle/60 transition-colors"
                      >
                        {/* Cadet Name */}
                        <td className="py-3.5 px-4 font-semibold text-ink">
                          <div className="flex items-center gap-2">
                            <span>{member.student_name}</span>
                            <Link
                              href={`/mentor-os/students/${member.student_id}`}
                              className="text-accent-emerald hover:underline text-[11px] font-normal inline-flex items-center gap-0.5"
                            >
                              <span>360</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        </td>

                        {/* Register Number */}
                        <td className="py-3.5 px-4 font-mono text-ink-muted">
                          {member.reg_no}
                        </td>

                        {/* Career Goal */}
                        <td className="py-3.5 px-4 text-ink-muted">
                          {member.career_goal || "Aviation Track"}
                        </td>

                        {/* Joined Date */}
                        <td className="py-3.5 px-4 font-mono text-ink-muted text-[11px]">
                          {new Date(member.joined_at).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() =>
                              handleRemoveStudent(member.student_id, member.student_name)
                            }
                            disabled={isLoading}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors disabled:opacity-50"
                            title="Remove student from this group (does not delete student)"
                          >
                            {isLoading ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <UserMinus className="w-3 h-3" />
                            )}
                            <span>Remove</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Group Modal */}
      {isEditModalOpen && (
        <GroupFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          groupToEdit={group}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}

      {/* Add Students Modal */}
      {isAddStudentsOpen && (
        <AddStudentsModal
          isOpen={isAddStudentsOpen}
          onClose={() => setIsAddStudentsOpen(false)}
          groupId={group.id}
          groupName={group.name}
          allStudents={allStudents}
          existingStudentIds={existingStudentIds}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
