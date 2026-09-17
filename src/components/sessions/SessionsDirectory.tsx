"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Calendar,
  CalendarCheck,
  CalendarPlus,
  Clock,
  Search,
  User,
  Filter,
  RefreshCw,
  XCircle,
  Play,
  CheckCircle2,
  CalendarClock,
  ExternalLink,
  History,
  Target,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  SessionItem,
  SessionStatus,
  SESSION_TYPES,
  SessionType,
} from "@/lib/sessions/types";
import { startSessionAction } from "@/app/actions/sessions";
import { ScheduleSessionModal } from "./ScheduleSessionModal";
import { RescheduleSessionModal } from "./RescheduleSessionModal";
import { SessionWorkspaceModal } from "./SessionWorkspaceModal";
import { CancelSessionModal } from "./CancelSessionModal";
import { DeleteSessionModal } from "./DeleteSessionModal";

interface SimpleCadet {
  id: string;
  full_name: string;
  reg_no: string;
  career_goal?: string | null;
}

interface SessionsDirectoryProps {
  initialSessions: SessionItem[];
  allStudents: SimpleCadet[];
}

export function SessionsDirectory({
  initialSessions,
  allStudents,
}: SessionsDirectoryProps) {
  const [isStarting, startSessionTransition] = useTransition();

  // Filters
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "today" | "completed" | "cancelled" | "all"
  >("upcoming");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [sessionsList, setSessionsList] = useState<SessionItem[]>(initialSessions);

  React.useEffect(() => {
    setSessionsList(initialSessions);
  }, [initialSessions]);

  // Modals state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedForReschedule, setSelectedForReschedule] =
    useState<SessionItem | null>(null);
  const [selectedForWorkspace, setSelectedForWorkspace] =
    useState<SessionItem | null>(null);
  const [selectedForCancel, setSelectedForCancel] =
    useState<SessionItem | null>(null);
  const [selectedForDelete, setSelectedForDelete] =
    useState<SessionItem | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  // Metrics
  const todayCount = sessionsList.filter(
    (s) => s.session_date === todayStr && s.status !== "CANCELLED"
  ).length;
  const upcomingCount = sessionsList.filter(
    (s) =>
      (s.status === "PLANNED" || s.status === "IN_PROGRESS") &&
      s.session_date >= todayStr
  ).length;
  const followUpsCount = sessionsList.filter(
    (s) => s.follow_up_date && s.follow_up_date >= todayStr
  ).length;

  // Filtered list
  const filteredSessions = sessionsList.filter((s) => {
    // 1. Tab filter
    if (activeTab === "upcoming") {
      if (s.status !== "PLANNED" && s.status !== "IN_PROGRESS") return false;
    } else if (activeTab === "today") {
      if (s.session_date !== todayStr) return false;
    } else if (activeTab === "completed") {
      if (s.status !== "COMPLETED" && !s.is_historical) return false;
    } else if (activeTab === "cancelled") {
      if (s.status !== "CANCELLED") return false;
    }

    // 2. Type filter
    if (typeFilter !== "ALL" && s.session_type !== typeFilter) {
      return false;
    }

    // 3. Search query (Cadet Name, Reg No, or Topic)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = s.student_name.toLowerCase().includes(q);
      const matchReg = s.reg_no.toLowerCase().includes(q);
      const matchTopic = s.focus_area.toLowerCase().includes(q);
      const matchNotes = s.notes ? s.notes.toLowerCase().includes(q) : false;
      if (!matchName && !matchReg && !matchTopic && !matchNotes) return false;
    }

    return true;
  });

  const handleStartSession = (session: SessionItem) => {
    startSessionTransition(async () => {
      await startSessionAction(session.id);
      setSelectedForWorkspace({ ...session, status: "IN_PROGRESS" });
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight flex items-center gap-2.5">
            <span>Mentoring Sessions</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-emerald/10 text-accent-emerald font-mono font-medium">
              {initialSessions.length} total
            </span>
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Conduct 1-on-1 mentoring, plan future discussions, and monitor cadet action items
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsScheduleOpen(true)}
          className="bg-accent-emerald text-white hover:bg-emerald-800 shadow-sm self-start sm:self-auto"
        >
          <CalendarPlus className="w-4 h-4 mr-1.5" />
          <span>Schedule Session</span>
        </Button>
      </div>

      {/* Metrics Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-border bg-surface flex items-center justify-between">
          <div>
            <p className="text-[11px] text-ink-muted uppercase tracking-wider font-semibold">
              Today&apos;s Sessions
            </p>
            <p className="text-lg font-bold text-ink mt-0.5">{todayCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-surface flex items-center justify-between">
          <div>
            <p className="text-[11px] text-ink-muted uppercase tracking-wider font-semibold">
              Upcoming
            </p>
            <p className="text-lg font-bold text-ink mt-0.5">{upcomingCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-surface flex items-center justify-between">
          <div>
            <p className="text-[11px] text-ink-muted uppercase tracking-wider font-semibold">
              Follow-ups Pending
            </p>
            <p className="text-lg font-bold text-ink mt-0.5">{followUpsCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <CalendarClock className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-surface flex items-center justify-between">
          <div>
            <p className="text-[11px] text-ink-muted uppercase tracking-wider font-semibold">
              Historical Records
            </p>
            <p className="text-lg font-bold text-ink mt-0.5">
              {initialSessions.filter((s) => s.is_historical).length}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center font-bold">
            <History className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Control Bar: Tabs, Search, and Type Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-surface p-2.5 rounded-2xl border border-border">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: "upcoming", label: "Upcoming" },
            { key: "today", label: "Today" },
            { key: "completed", label: "Completed" },
            { key: "cancelled", label: "Cancelled" },
            { key: "all", label: "All Sessions" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-accent-emerald text-white shadow-xs"
                  : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Category Select */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search cadet or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 px-2.5 rounded-xl border border-border bg-workspace text-ink text-xs focus:outline-hidden focus:ring-1 focus:ring-accent-emerald"
          >
            <option value="ALL">All Types</option>
            {SESSION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <div className="w-12 h-12 rounded-2xl bg-surface-subtle border border-border flex items-center justify-center text-ink-muted mx-auto mb-3">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-ink">No mentoring sessions found</h3>
          <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
            {searchQuery || typeFilter !== "ALL"
              ? "No sessions match your search criteria. Try adjusting filters."
              : "No mentoring sessions are currently scheduled for this view."}
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScheduleOpen(true)}
            >
              <CalendarPlus className="w-3.5 h-3.5 mr-1.5 text-accent-emerald" />
              <span>Schedule New Session</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map((session) => {
            const formattedTime = session.scheduled_at
              ? new Date(session.scheduled_at).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "Asia/Kolkata",
                })
              : null;

            return (
              <Card
                key={session.id}
                className="p-5 border-border hover:border-border-strong transition-all flex flex-col justify-between group space-y-4"
              >
                {/* Card Top: Cadet Info & Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald font-bold text-xs shrink-0">
                        {session.student_name[0]}
                      </div>
                      <div>
                        <Link
                          href={`/students/${session.student_id}`}
                          className="font-bold text-sm text-ink hover:text-accent-emerald hover:underline transition-colors inline-flex items-center gap-1"
                        >
                          <span>{session.student_name}</span>
                          <ExternalLink className="w-3 h-3 text-ink-muted" />
                        </Link>
                        <p className="text-[11px] font-mono text-ink-muted">
                          Reg No: {session.reg_no}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {session.is_historical ? (
                        <Badge variant="stone" size="sm" className="text-[10px] font-mono">
                          Historical
                        </Badge>
                      ) : session.status === "PLANNED" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3" />
                          <span>Planned</span>
                        </span>
                      ) : session.status === "IN_PROGRESS" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 animate-pulse">
                          <Play className="w-3 h-3 fill-emerald-600" />
                          <span>In Progress</span>
                        </span>
                      ) : session.status === "COMPLETED" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Focus Area / Topic */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-ink">
                        {session.focus_area}
                      </span>
                      <Badge variant="stone" size="sm" className="text-[10px]">
                        {session.session_type.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    {/* Time & Date Banner */}
                    <div className="flex items-center gap-3 text-xs text-ink-muted font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-accent-emerald" />
                        {session.session_date}
                      </span>
                      {formattedTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-accent-emerald" />
                          {formattedTime} ({session.duration_minutes}m)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Observations or Notes Preview */}
                  {(session.observations || session.notes) && (
                    <div className="p-3 rounded-xl bg-workspace text-xs text-ink-muted leading-relaxed line-clamp-2 border border-border/50">
                      &ldquo;{session.observations || session.notes}&rdquo;
                    </div>
                  )}

                  {/* Follow-up Reminder Banner */}
                  {session.follow_up_date && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[11px] flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <CalendarClock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Follow-up Due: {session.follow_up_date}</span>
                      </span>
                      {session.follow_up_notes && (
                        <span className="text-[10px] italic truncate max-w-[180px]">
                          {session.follow_up_notes}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Linked Milestones */}
                  {session.linked_milestones && session.linked_milestones.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                      <Target className="w-3 h-3 text-accent-emerald" />
                      <span>
                        {session.linked_milestones.length} linked milestone
                        {session.linked_milestones.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Bar */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <div className="text-[10px] font-mono text-ink-muted">
                    {session.provenance}
                  </div>

                  <div className="flex items-center gap-2">
                    {session.status === "PLANNED" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedForReschedule(session)}
                          className="px-2.5 py-1 rounded-lg text-xs text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Reschedule</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedForCancel(session)}
                          className="px-2 py-1 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStartSession(session)}
                          disabled={isStarting}
                          className="bg-accent-emerald text-white hover:bg-emerald-800 text-xs h-7 px-2.5"
                        >
                          <Play className="w-3 h-3 mr-1 fill-white" />
                          <span>Start Session</span>
                        </Button>
                      </>
                    )}

                    {session.status === "IN_PROGRESS" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedForWorkspace(session)}
                        className="bg-accent-emerald text-white hover:bg-emerald-800 text-xs h-7 px-3"
                      >
                        <Play className="w-3 h-3 mr-1 fill-white" />
                        <span>Open Workspace</span>
                      </Button>
                    )}

                    {(session.status === "COMPLETED" || session.is_historical) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedForWorkspace(session)}
                        className="text-xs h-7 px-2.5"
                      >
                        <MessageSquare className="w-3 h-3 mr-1 text-ink-muted" />
                        <span>View Notes</span>
                      </Button>
                    )}

                    {!session.is_historical && session.status !== "HISTORICAL" && (
                      <button
                        type="button"
                        onClick={() => setSelectedForDelete(session)}
                        className="px-2 py-1 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Schedule Modal */}
      <ScheduleSessionModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        students={allStudents}
      />

      {/* Reschedule Modal */}
      <RescheduleSessionModal
        isOpen={Boolean(selectedForReschedule)}
        onClose={() => setSelectedForReschedule(null)}
        session={selectedForReschedule}
      />

      {/* Session Workspace Modal */}
      <SessionWorkspaceModal
        isOpen={Boolean(selectedForWorkspace)}
        onClose={() => setSelectedForWorkspace(null)}
        session={selectedForWorkspace}
      />

      {/* Cancel Modal */}
      <CancelSessionModal
        isOpen={Boolean(selectedForCancel)}
        onClose={() => setSelectedForCancel(null)}
        session={selectedForCancel}
      />

      {/* Delete Modal */}
      <DeleteSessionModal
        isOpen={Boolean(selectedForDelete)}
        onClose={() => setSelectedForDelete(null)}
        session={selectedForDelete}
        onSuccess={() => {
          if (selectedForDelete) {
            const delId = selectedForDelete.id;
            setSessionsList((prev) => prev.filter((s) => s.id !== delId));
          }
        }}
      />
    </div>
  );
}
