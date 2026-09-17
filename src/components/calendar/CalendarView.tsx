"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarPlus,
  Clock,
  ExternalLink,
  Target,
  Briefcase,
  CalendarClock,
  X,
  User,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  CalendarEvent,
  CalendarEventType,
  CalendarViewMode,
} from "@/lib/sessions/types";
import { ScheduleSessionModal } from "@/components/sessions/ScheduleSessionModal";

interface SimpleCadet {
  id: string;
  full_name: string;
  reg_no: string;
  career_goal?: string | null;
}

interface CalendarViewProps {
  initialEvents: CalendarEvent[];
  allStudents: SimpleCadet[];
}

export function CalendarView({ initialEvents, allStudents }: CalendarViewProps) {
  // Current view date (starts at current date)
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");

  // Filter types
  const [enabledTypes, setEnabledTypes] = useState<Record<CalendarEventType, boolean>>({
    SESSION: true,
    FOLLOW_UP: true,
    MILESTONE: true,
    INTERNSHIP_DEADLINE: true,
  });

  // Selected event modal
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Schedule modal
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Date Navigation
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") {
      next.setMonth(next.getMonth() - 1);
    } else if (viewMode === "week") {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") {
      next.setMonth(next.getMonth() + 1);
    } else if (viewMode === "week") {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Toggle filter
  const toggleType = (t: CalendarEventType) => {
    setEnabledTypes((prev) => ({ ...prev, [t]: !prev[t] }));
  };

  // Filter events by enabled types
  const visibleEvents = initialEvents.filter((e) => enabledTypes[e.type]);

  // Month label
  const monthYearLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Today string YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];

  // ---------------------------------------------------------------------------
  // Helper: Month Grid Generation
  // ---------------------------------------------------------------------------
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month (0 = Sun, 1 = Mon ... adjust to Mon start)
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: Array<{
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }> = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const pDate = new Date(year, month - 1, d);
    const dateStr = pDate.toISOString().split("T")[0];
    calendarDays.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      d
    ).padStart(2, "0")}`;
    calendarDays.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month leading days (to complete 35 or 42 grid cells)
  const totalCells = calendarDays.length > 35 ? 42 : 35;
  const remaining = totalCells - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    const nDate = new Date(year, month + 1, d);
    const dateStr = nDate.toISOString().split("T")[0];
    calendarDays.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Map events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  visibleEvents.forEach((ev) => {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  });

  // Week View Days (Monday to Sunday around currentDate)
  const currentDayOfWeek = (currentDate.getDay() + 6) % 7;
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDayOfWeek);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    return {
      date: d,
      dateStr,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      isToday: dateStr === todayStr,
    };
  });

  const getBadgeClass = (type: CalendarEventType) => {
    switch (type) {
      case "SESSION":
        return "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100";
      case "FOLLOW_UP":
        return "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100";
      case "MILESTONE":
        return "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100";
      case "INTERNSHIP_DEADLINE":
        return "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100";
    }
  };

  const getTypeIcon = (type: CalendarEventType) => {
    switch (type) {
      case "SESSION":
        return <CalendarIcon className="w-2.5 h-2.5 text-emerald-700 shrink-0" />;
      case "FOLLOW_UP":
        return <CalendarClock className="w-2.5 h-2.5 text-amber-700 shrink-0" />;
      case "MILESTONE":
        return <Target className="w-2.5 h-2.5 text-blue-700 shrink-0" />;
      case "INTERNSHIP_DEADLINE":
        return <Briefcase className="w-2.5 h-2.5 text-purple-700 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight flex items-center gap-2.5">
            <span>Faculty Calendar</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-emerald/10 text-accent-emerald font-mono font-medium">
              {visibleEvents.length} events
            </span>
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Integrated schedule of mentoring sessions, follow-ups, milestones, and internship deadlines
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

      {/* Control Bar */}
      <div className="bg-surface p-3 rounded-2xl border border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-workspace p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-surface text-ink-muted hover:text-ink transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-surface text-ink transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-surface text-ink-muted hover:text-ink transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-sm font-bold text-ink ml-2 min-w-[150px]">
            {monthYearLabel}
          </h2>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-1 bg-workspace p-1 rounded-xl border border-border">
            {(["month", "week", "day"] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  viewMode === mode
                    ? "bg-accent-emerald text-white shadow-xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-ink-muted text-[11px] font-semibold flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </span>

        <button
          type="button"
          onClick={() => toggleType("SESSION")}
          className={`px-2.5 py-1 rounded-full border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
            enabledTypes.SESSION
              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
              : "bg-surface text-ink-muted border-border opacity-50"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span>Sessions</span>
        </button>

        <button
          type="button"
          onClick={() => toggleType("FOLLOW_UP")}
          className={`px-2.5 py-1 rounded-full border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
            enabledTypes.FOLLOW_UP
              ? "bg-amber-50 text-amber-800 border-amber-300"
              : "bg-surface text-ink-muted border-border opacity-50"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-600" />
          <span>Follow-ups</span>
        </button>

        <button
          type="button"
          onClick={() => toggleType("MILESTONE")}
          className={`px-2.5 py-1 rounded-full border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
            enabledTypes.MILESTONE
              ? "bg-blue-50 text-blue-800 border-blue-300"
              : "bg-surface text-ink-muted border-border opacity-50"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span>Milestones Due</span>
        </button>

        <button
          type="button"
          onClick={() => toggleType("INTERNSHIP_DEADLINE")}
          className={`px-2.5 py-1 rounded-full border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
            enabledTypes.INTERNSHIP_DEADLINE
              ? "bg-purple-50 text-purple-800 border-purple-300"
              : "bg-surface text-ink-muted border-border opacity-50"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-600" />
          <span>Internship Deadlines</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. MONTH VIEW */}
      {/* ------------------------------------------------------------------ */}
      {viewMode === "month" && (
        <Card className="overflow-hidden border-border bg-surface p-0 shadow-xs">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-border bg-workspace/50 text-center py-2.5 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-border">
            {calendarDays.map((day, idx) => {
              const dayEvents = eventsByDate[day.dateStr] || [];

              return (
                <div
                  key={idx}
                  className={`min-h-[105px] p-2 flex flex-col justify-between transition-colors ${
                    day.isCurrentMonth
                      ? "bg-surface hover:bg-surface-subtle/50"
                      : "bg-workspace/30 text-ink-muted/50"
                  } ${day.isToday ? "bg-accent-emerald/5" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                        day.isToday
                          ? "bg-accent-emerald text-white"
                          : day.isCurrentMonth
                          ? "text-ink"
                          : "text-ink-muted/50"
                      }`}
                    >
                      {day.dayNum}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-mono text-ink-muted">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events Pills */}
                  <div className="mt-1.5 space-y-1 overflow-hidden flex-1">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setSelectedEvent(ev)}
                        className={`w-full text-left px-1.5 py-0.5 rounded-md border text-[10px] font-medium truncate flex items-center gap-1 transition-all ${getBadgeClass(
                          ev.type
                        )}`}
                      >
                        {getTypeIcon(ev.type)}
                        <span className="truncate">{ev.title}</span>
                      </button>
                    ))}

                    {dayEvents.length > 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentDate(new Date(day.dateStr));
                          setViewMode("day");
                        }}
                        className="text-[10px] text-ink-muted hover:text-accent-emerald font-semibold pl-1"
                      >
                        +{dayEvents.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. WEEK VIEW */}
      {/* ------------------------------------------------------------------ */}
      {viewMode === "week" && (
        <Card className="overflow-hidden border-border bg-surface p-0 shadow-xs">
          <div className="grid grid-cols-7 border-b border-border bg-workspace/50 text-center divide-x divide-border">
            {weekDays.map((wd) => (
              <div
                key={wd.dateStr}
                className={`py-3 px-2 ${wd.isToday ? "bg-accent-emerald/10" : ""}`}
              >
                <p className="text-[10px] uppercase font-semibold text-ink-muted tracking-wider">
                  {wd.dayName}
                </p>
                <p
                  className={`text-base font-bold mt-0.5 ${
                    wd.isToday ? "text-accent-emerald" : "text-ink"
                  }`}
                >
                  {wd.dayNum}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-border min-h-[400px]">
            {weekDays.map((wd) => {
              const dayEvents = eventsByDate[wd.dateStr] || [];

              return (
                <div
                  key={wd.dateStr}
                  className={`p-2 space-y-2 ${
                    wd.isToday ? "bg-accent-emerald/5" : "bg-surface"
                  }`}
                >
                  {dayEvents.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-ink-muted/50">
                      No events
                    </div>
                  ) : (
                    dayEvents.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setSelectedEvent(ev)}
                        className={`w-full text-left p-2 rounded-xl border text-xs flex flex-col gap-1 transition-all ${getBadgeClass(
                          ev.type
                        )}`}
                      >
                        <div className="flex items-center gap-1 text-[10px] font-semibold">
                          {getTypeIcon(ev.type)}
                          <span className="uppercase tracking-wider">
                            {ev.type.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="font-bold text-xs line-clamp-2">{ev.title}</p>
                        {ev.start && (
                          <p className="text-[10px] opacity-75 font-mono">
                            {new Date(ev.start).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                              timeZone: "Asia/Kolkata",
                            })}
                          </p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. DAY VIEW */}
      {/* ------------------------------------------------------------------ */}
      {viewMode === "day" && (
        <Card className="p-6 space-y-4 border-border bg-surface">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-ink">
                {currentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <p className="text-xs text-ink-muted">
                {(eventsByDate[currentDate.toISOString().split("T")[0]] || []).length} scheduled events
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScheduleOpen(true)}
            >
              <CalendarPlus className="w-3.5 h-3.5 mr-1 text-accent-emerald" />
              <span>Schedule Session for Today</span>
            </Button>
          </div>

          <div className="space-y-3">
            {(eventsByDate[currentDate.toISOString().split("T")[0]] || []).length === 0 ? (
              <div className="py-12 text-center text-xs text-ink-muted">
                No events scheduled for this day
              </div>
            ) : (
              (eventsByDate[currentDate.toISOString().split("T")[0]] || []).map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${getBadgeClass(
                    ev.type
                  )}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70">
                        {ev.type.replace(/_/g, " ")}
                      </span>
                      {ev.start && (
                        <span className="text-xs font-mono font-medium">
                          {new Date(ev.start).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Kolkata",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-sm">{ev.title}</p>
                    {ev.studentName && (
                      <p className="text-xs text-ink-muted font-mono">
                        Cadet: {ev.studentName} ({ev.regNo})
                      </p>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-accent-emerald hover:underline">
                    View Details →
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Event Details Slide-out / Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div
            className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-workspace/50">
              <div className="flex items-center gap-2">
                <Badge
                  variant={selectedEvent.type === "SESSION" ? "emerald" : "stone"}
                  size="sm"
                  className="text-[10px]"
                >
                  {selectedEvent.type.replace(/_/g, " ")}
                </Badge>
                <span className="text-xs font-mono text-ink-muted">
                  {selectedEvent.date}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-subtle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <h3 className="text-sm font-bold text-ink">{selectedEvent.title}</h3>
                {selectedEvent.studentName && (
                  <p className="text-ink-muted mt-1 font-mono text-[11px]">
                    Cadet: {selectedEvent.studentName} · Reg No: {selectedEvent.regNo}
                  </p>
                )}
              </div>

              {selectedEvent.details && (
                <div className="p-3 rounded-xl bg-workspace border border-border space-y-1.5 text-xs text-ink">
                  {selectedEvent.details.focusArea && (
                    <p>
                      <span className="text-ink-muted">Focus Area:</span>{" "}
                      <span className="font-medium">{selectedEvent.details.focusArea}</span>
                    </p>
                  )}
                  {selectedEvent.details.durationMinutes && (
                    <p>
                      <span className="text-ink-muted">Duration:</span>{" "}
                      <span className="font-medium">
                        {selectedEvent.details.durationMinutes} minutes
                      </span>
                    </p>
                  )}
                  {selectedEvent.details.notes && (
                    <p className="italic text-ink-muted mt-1">
                      &ldquo;{selectedEvent.details.notes}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {/* Action Link to Relevant Section */}
              <div className="pt-2 flex items-center justify-end gap-2">
                {selectedEvent.studentId && (
                  <Link
                    href={`/mentor-os/students/${selectedEvent.studentId}`}
                    className="px-3 py-1.5 rounded-xl border border-border bg-surface text-ink text-xs font-semibold hover:bg-surface-subtle inline-flex items-center gap-1"
                  >
                    <span>Student 360</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}

                {selectedEvent.type === "SESSION" && (
                  <Link
                    href="/mentor-os/sessions"
                    className="px-3 py-1.5 rounded-xl bg-accent-emerald text-white text-xs font-semibold hover:bg-emerald-800 inline-flex items-center gap-1"
                  >
                    <span>Go to Sessions</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}

                {selectedEvent.type === "INTERNSHIP_DEADLINE" && (
                  <Link
                    href="/mentor-os/internships"
                    className="px-3 py-1.5 rounded-xl bg-accent-emerald text-white text-xs font-semibold hover:bg-emerald-800 inline-flex items-center gap-1"
                  >
                    <span>Go to Internships</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      <ScheduleSessionModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        students={allStudents}
      />
    </div>
  );
}
