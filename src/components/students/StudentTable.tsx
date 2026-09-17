"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  AlertCircle, 
  ChevronRight, 
  User, 
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { DirectoryStudent } from "@/lib/data/students";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StudentTableProps {
  students: DirectoryStudent[];
  initialTrack?: string;
}

type SortField = "sno" | "full_name" | "skill_avg" | "active_milestones_count";
type SortOrder = "asc" | "desc";

export function StudentTable({ students, initialTrack = "all" }: StudentTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<string>(initialTrack);
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>("sno");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Unique career tracks for filter dropdown
  const uniqueTracks = useMemo(() => {
    const tracks = new Set<string>();
    students.forEach((s) => {
      if (s.career_goal && s.career_goal !== "Unassigned") {
        tracks.add(s.career_goal);
      }
    });
    return Array.from(tracks).sort();
  }, [students]);

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        // Data Minimization Rule: Search only by full_name or reg_no
        const q = searchTerm.trim().toLowerCase();
        const matchesSearch =
          q === "" ||
          s.full_name.toLowerCase().includes(q) ||
          s.reg_no.toLowerCase().includes(q);

        // Track filter
        const matchesTrack =
          selectedTrack === "all" || s.career_goal === selectedTrack;

        // Attention filter
        const matchesAttention = !attentionOnly || s.needs_attention;

        return matchesSearch && matchesTrack && matchesAttention;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (valA === null || valA === undefined) valA = sortOrder === "asc" ? Infinity : -Infinity;
        if (valB === null || valB === undefined) valB = sortOrder === "asc" ? Infinity : -Infinity;

        if (typeof valA === "string") {
          return sortOrder === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return sortOrder === "asc" ? valA - valB : valB - valA;
      });
  }, [students, searchTerm, selectedTrack, attentionOnly, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const attentionCount = useMemo(
    () => students.filter((s) => s.needs_attention).length,
    [students]
  );

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <Card className="p-4 bg-surface border-border">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-stretch md:items-center">
          {/* Search Box - strictly student name and register number */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search cadet by name or registration number..."
              aria-label="Search cadet by name or registration number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-12 py-2 text-xs sm:text-sm bg-workspace border border-border rounded-lg text-ink placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search text"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 px-1 py-0.5"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Group */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Career Track Filter */}
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <Filter className="w-4 h-4 text-stone-400 shrink-0" />
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                aria-label="Filter cadets by career track"
                className="w-full sm:w-auto text-xs sm:text-sm bg-workspace border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
              >
                <option value="all">All Career Tracks ({students.length})</option>
                {uniqueTracks.map((track) => (
                  <option key={track} value={track}>
                    {track}
                  </option>
                ))}
              </select>
            </div>

            {/* Needs Attention Toggle */}
            <button
              type="button"
              onClick={() => setAttentionOnly(!attentionOnly)}
              aria-pressed={attentionOnly}
              aria-label="Toggle priority attention cadets only"
              className={cn(
                "inline-flex items-center gap-2 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg border transition-all cursor-pointer",
                attentionOnly
                  ? "bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/30 font-semibold"
                  : "bg-workspace text-stone-700 border-border hover:bg-stone-100"
              )}
            >
              <AlertCircle className={cn("w-4 h-4 shrink-0", attentionOnly ? "text-amber-700" : "text-amber-500")} />
              <span>Needs Attention</span>
              <span
                className={cn(
                  "text-[11px] px-1.5 py-0.2 rounded-full font-semibold",
                  attentionOnly ? "bg-amber-200 text-amber-900" : "bg-stone-200 text-stone-700"
                )}
              >
                {attentionCount}
              </span>
            </button>
          </div>
        </div>

        {/* Status Count Line */}
        <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-500 gap-2">
          <div>
            Showing <strong className="text-ink font-semibold">{filteredStudents.length}</strong> of{" "}
            <strong className="text-ink font-semibold">{students.length}</strong> enrolled cadets
            {selectedTrack !== "all" && <span> • Filtered by "{selectedTrack}"</span>}
            {attentionOnly && <span> • Attention queue only</span>}
            {searchTerm && <span> • Search: "{searchTerm}"</span>}
          </div>
          {(selectedTrack !== "all" || attentionOnly || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setSelectedTrack("all");
                setAttentionOnly(false);
                setSearchTerm("");
              }}
              className="text-emerald-800 hover:text-emerald-950 font-medium underline underline-offset-2 self-start sm:self-auto cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </Card>

      {/* 1. Mobile Card Layout (Visible on < md: screens) */}
      <div className="md:hidden space-y-3">
        {filteredStudents.length === 0 ? (
          <Card className="p-8 text-center text-stone-500 bg-surface">
            <User className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="font-semibold text-ink text-sm">No Cadets Match Search</p>
            <p className="text-xs text-stone-400 mt-1">
              Adjust search keywords or clear current filters.
            </p>
          </Card>
        ) : (
          filteredStudents.map((student) => {
            const [readyCount, totalReady] = student.readiness_ratio
              .split("/")
              .map((n) => parseInt(n.trim(), 10));
            const readyPercent = Math.round((readyCount / totalReady) * 100);

            return (
              <div
                key={student.id}
                onClick={() => router.push(`/mentor-os/students/${student.id}`)}
                className="bg-surface border border-border rounded-xl p-4 shadow-card hover:border-emerald-300/80 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-stone-400 font-medium">
                        #{student.sno}
                      </span>
                      <h3 className="font-bold text-sm text-ink hover:text-emerald-900 transition-colors">
                        {student.full_name}
                      </h3>
                      {student.needs_attention && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Needs Attention" />
                      )}
                    </div>
                    <p className="font-mono text-xs text-stone-400 mt-0.5">
                      {student.reg_no}
                    </p>
                  </div>

                  <Badge variant="stone" size="sm" className="font-medium max-w-[140px] truncate text-[11px]">
                    {student.career_goal}
                  </Badge>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                  <div>
                    <span className="text-[11px] text-stone-400">Skills Rating</span>
                    <p className="font-semibold text-ink mt-0.5">
                      {student.skill_avg !== null ? `${student.skill_avg.toFixed(1)} / 5.0` : "Not rated"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400">Readiness</span>
                    <p className="font-semibold text-ink mt-0.5">
                      {student.readiness_ratio} ({readyPercent}%)
                    </p>
                  </div>
                </div>

                {/* Attention Signal & View Action */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                  <div>
                    {student.needs_attention ? (
                      <Badge variant="amber" size="sm" className="gap-1 font-medium text-[11px]">
                        <AlertCircle className="w-3 h-3 text-amber-700 shrink-0" />
                        <span className="truncate max-w-[160px]">{student.attention_reason || "Attention"}</span>
                      </Badge>
                    ) : (
                      <Badge variant="emerald" size="sm" className="gap-1 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>On Track</span>
                      </Badge>
                    )}
                  </div>

                  <Link
                    href={`/mentor-os/students/${student.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 px-2 py-1 rounded hover:bg-emerald-50"
                  >
                    <span>View 360°</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Desktop Table Card (Visible on md: screens and above) */}
      <Card className="hidden md:block overflow-hidden border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse" aria-label="Cadet Roster Table">
            <thead>
              <tr className="border-b border-border bg-stone-50/70 text-xs font-medium text-stone-500 uppercase tracking-wider">
                <th
                  onClick={() => handleSort("sno")}
                  className="py-3 px-4 cursor-pointer hover:text-ink transition-colors w-16"
                  aria-label="Sort by serial number"
                >
                  <div className="flex items-center gap-1">
                    <span>S.No</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("full_name")}
                  className="py-3 px-4 cursor-pointer hover:text-ink transition-colors"
                  aria-label="Sort by cadet name"
                >
                  <div className="flex items-center gap-1">
                    <span>Cadet Name & Reg No</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Primary Career Goal</th>
                <th
                  onClick={() => handleSort("skill_avg")}
                  className="py-3 px-4 cursor-pointer hover:text-ink transition-colors"
                  aria-label="Sort by skills average"
                >
                  <div className="flex items-center gap-1">
                    <span>Skills Avg</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Readiness</th>
                <th
                  onClick={() => handleSort("active_milestones_count")}
                  className="py-3 px-4 cursor-pointer hover:text-ink transition-colors text-center"
                  aria-label="Sort by active milestones count"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Active POAs</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Last Session</th>
                <th className="py-3 px-4">Signal</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-500">
                    <User className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="font-medium text-ink">No students match your query</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Try adjusting your search criteria or clearing filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const [readyCount, totalReady] = student.readiness_ratio
                    .split("/")
                    .map((n) => parseInt(n.trim(), 10));
                  const readyPercent = Math.round((readyCount / totalReady) * 100);

                  return (
                    <tr
                      key={student.id}
                      onClick={() => router.push(`/mentor-os/students/${student.id}`)}
                      className="group cursor-pointer hover:bg-stone-50/80 transition-colors"
                    >
                      {/* S.No */}
                      <td className="py-3.5 px-4 font-mono text-xs text-stone-400">
                        #{student.sno}
                      </td>

                      {/* Cadet Name & Reg No */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-ink group-hover:text-emerald-900 transition-colors flex items-center gap-2">
                          <span>{student.full_name}</span>
                          {student.needs_attention && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Needs Attention" />
                          )}
                        </div>
                        <div className="font-mono text-xs text-stone-400 mt-0.5">
                          {student.reg_no}
                        </div>
                      </td>

                      {/* Career Pathway */}
                      <td className="py-3.5 px-4">
                        <Badge variant="stone" size="sm" className="font-medium max-w-[200px] truncate">
                          {student.career_goal}
                        </Badge>
                      </td>

                      {/* Skills Avg */}
                      <td className="py-3.5 px-4">
                        {student.skill_avg !== null ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-ink text-sm">
                              {student.skill_avg.toFixed(1)}
                            </span>
                            <span className="text-xs text-stone-400">/ 5.0</span>
                            <div className="w-16 h-1.5 rounded-full bg-stone-200 overflow-hidden hidden sm:block">
                              <div
                                className="h-full rounded-full bg-emerald-700"
                                style={{ width: `${(student.skill_avg / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400 italic">Not rated</span>
                        )}
                      </td>

                      {/* Readiness Ratio */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs text-ink">
                            {student.readiness_ratio}
                          </span>
                          <div className="w-14 h-1.5 rounded-full bg-stone-200 overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                readyPercent >= 80
                                  ? "bg-emerald-600"
                                  : readyPercent >= 50
                                  ? "bg-blue-600"
                                  : "bg-amber-500"
                              )}
                              style={{ width: `${readyPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Active POAs */}
                      <td className="py-3.5 px-4 text-center">
                        {student.active_milestones_count > 0 ? (
                          <Badge variant="blue" size="sm">
                            {student.active_milestones_count} active
                          </Badge>
                        ) : (
                          <span className="text-xs text-stone-400">—</span>
                        )}
                      </td>

                      {/* Last Session */}
                      <td className="py-3.5 px-4 text-xs text-stone-500">
                        {student.last_session_date ? (
                          <div className="flex items-center gap-1 text-stone-600">
                            <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>{student.last_session_date}</span>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic">No session</span>
                        )}
                      </td>

                      {/* Explainable Attention Signal */}
                      <td className="py-3.5 px-4">
                        {student.needs_attention ? (
                          <Badge variant="amber" size="sm" className="gap-1 font-medium">
                            <AlertCircle className="w-3 h-3 text-amber-700 shrink-0" />
                            <span>{student.attention_reason || "Attention"}</span>
                          </Badge>
                        ) : (
                          <Badge variant="emerald" size="sm" className="gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>On Track</span>
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/mentor-os/students/${student.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                          <span>View 360°</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
