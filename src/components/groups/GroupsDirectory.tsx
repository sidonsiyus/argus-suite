"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  ArrowRight,
  Archive,
  RotateCcw,
  Edit2,
  AlertCircle,
  FolderKanban,
} from "lucide-react";
import {
  GroupItem,
  GroupCategory,
  GroupStatus,
  GROUP_CATEGORIES,
} from "@/lib/groups/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { GroupFormModal } from "./GroupFormModal";
import { archiveGroupAction } from "@/app/actions/groups";

interface GroupsDirectoryProps {
  initialGroups: GroupItem[];
}

export function GroupsDirectory({ initialGroups }: GroupsDirectoryProps) {
  const [groups, setGroups] = useState<GroupItem[]>(initialGroups);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "ACTIVE" | "ARCHIVED">("ACTIVE");

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<GroupItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtered Groups
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      // Status Filter
      if (statusFilter !== "all" && g.status !== statusFilter) return false;

      // Category Filter
      if (selectedCategory !== "all" && g.category !== selectedCategory) return false;

      // Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = g.name.toLowerCase().includes(q);
        const matchesDesc = g.description?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [groups, searchQuery, selectedCategory, statusFilter]);

  const handleToggleArchive = async (group: GroupItem) => {
    const nextStatus: GroupStatus = group.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
    try {
      const res = await archiveGroupAction(group.id, nextStatus);
      if (res.success) {
        setGroups((prev) =>
          prev.map((g) => (g.id === group.id ? { ...g, status: nextStatus } : g))
        );
      } else {
        setErrorMessage(res.error || "Failed to update group status.");
      }
    } catch {
      setErrorMessage("An unexpected network error occurred.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <h1 className="text-xl font-bold text-ink tracking-tight">Functional Intervention Groups</h1>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Cohort-independent development, DGCA ground school tutoring, aviation English & placement support groups.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setGroupToEdit(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Group</span>
          </button>
        </div>
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

      {/* Filter and Search Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups by name or mentoring scope..."
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            />
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-60">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            >
              <option value="all">All Focus Categories</option>
              {GROUP_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-border text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === "ACTIVE"
                  ? "bg-accent-emerald text-white"
                  : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
              }`}
            >
              Active Groups
            </button>
            <button
              onClick={() => setStatusFilter("ARCHIVED")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === "ARCHIVED"
                  ? "bg-stone-600 text-white"
                  : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
              }`}
            >
              Archived
            </button>
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-accent-emerald text-white"
                  : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
              }`}
            >
              All Records ({groups.length})
            </button>
          </div>

          <div className="text-xs text-ink-muted font-mono">
            Showing {filteredGroups.length} of {groups.length} groups
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      {filteredGroups.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={groups.length === 0 ? "No functional groups created yet." : "No matching groups found."}
          description={
            groups.length === 0
              ? "Organize cadets around shared intervention needs such as DGCA exam tutoring, resume workshops, or airline interview coaching."
              : "Try adjusting your search criteria or resetting filters."
          }
          action={
            groups.length === 0 ? (
              <button
                onClick={() => {
                  setGroupToEdit(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-accent-emerald rounded-xl hover:bg-accent-emerald/90 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Group</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setStatusFilter("ACTIVE");
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-ink bg-surface border border-border rounded-xl hover:bg-surface-subtle transition-colors"
              >
                Reset Filters
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => {
            const categoryMeta =
              GROUP_CATEGORIES.find((c) => c.value === group.category) || {
                label: group.category,
              };

            return (
              <Card
                key={group.id}
                className={`flex flex-col justify-between p-5 hover:border-border-strong transition-all duration-150 ${
                  group.status === "ARCHIVED" ? "opacity-75 bg-surface-subtle/30" : ""
                }`}
              >
                <div className="space-y-3">
                  {/* Category & Status Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="stone" size="sm">
                      {categoryMeta.label}
                    </Badge>
                    <div>
                      {group.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                          Archived
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Group Title */}
                  <h3 className="text-sm font-semibold text-ink leading-snug">
                    {group.name}
                  </h3>

                  {/* Description */}
                  {group.description && (
                    <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                      {group.description}
                    </p>
                  )}

                  {/* Member Count Pill */}
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted pt-1">
                    <Users className="w-3.5 h-3.5 text-accent-emerald shrink-0" />
                    <span className="font-semibold text-ink">{group.member_count || 0}</span>
                    <span>students enrolled</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3.5 mt-3.5 border-t border-border flex items-center justify-between">
                  <Link
                    href={`/groups/${group.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent-emerald hover:underline"
                  >
                    <span>View Group Roster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setGroupToEdit(group);
                        setIsFormOpen(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors"
                      title="Edit Group"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(group)}
                      className="p-1.5 rounded-lg hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors"
                      title={group.status === "ACTIVE" ? "Archive Group" : "Restore Group"}
                    >
                      {group.status === "ACTIVE" ? (
                        <Archive className="w-3.5 h-3.5" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {isFormOpen && (
        <GroupFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setGroupToEdit(null);
          }}
          groupToEdit={groupToEdit}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
