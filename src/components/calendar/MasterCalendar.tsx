'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Filter,
  Users,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from 'date-fns';
import { AppointmentStatusBadge, SourceBadge } from '@/components/ui/Badge';
import { formatTime12Hour } from '@/lib/utils/slots';

interface MasterCalendarProps {
  appointments: any[];
  facultyList: any[];
  onSelectAppointment: (apt: any) => void;
  onSlotClick: (dateStr: string, timeStr?: string) => void;
  selectedFaculty: string;
  onChangeFaculty: (id: string) => void;
  selectedStatus: string;
  onChangeStatus: (st: string) => void;
  selectedSource: string;
  onChangeSource: (src: string) => void;
}

export function MasterCalendar({
  appointments,
  facultyList,
  onSelectAppointment,
  onSlotClick,
  selectedFaculty,
  onChangeFaculty,
  selectedStatus,
  onChangeStatus,
  selectedSource,
  onChangeSource,
}: MasterCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDayAppointments = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return appointments.filter((apt) => apt.date === dayStr);
  };

  return (
    <div className="space-y-4 flex flex-col flex-1">
      {/* Filters and Navigation Bar */}
      <div className="bg-white p-4 rounded-xl border border-surface-border shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-lg border border-surface-border hover:bg-surface text-xs font-semibold text-aviation-950 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-l-lg border border-surface-border hover:bg-surface text-gray-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-r-lg border-y border-r border-surface-border hover:bg-surface text-gray-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm font-bold text-aviation-950 ml-2">
            {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
            {viewMode === 'week' &&
              `${format(startOfWeek(currentDate), 'MMM d')} – ${format(
                endOfWeek(currentDate),
                'MMM d, yyyy'
              )}`}
            {viewMode === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
            {viewMode === 'agenda' && 'All Appointments Agenda'}
          </span>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Faculty filter */}
          <select
            value={selectedFaculty}
            onChange={(e) => onChangeFaculty(e.target.value)}
            className="text-xs bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-aviation-950 focus:outline-hidden"
          >
            <option value="all">All Aviation Faculty</option>
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => onChangeStatus(e.target.value)}
            className="text-xs bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-aviation-950 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="DECLINED">Declined</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No-Show</option>
          </select>

          {/* Source filter */}
          <select
            value={selectedSource}
            onChange={(e) => onChangeSource(e.target.value)}
            className="text-xs bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-aviation-950 focus:outline-hidden"
          >
            <option value="all">All Sources</option>
            <option value="ONLINE">Online</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* View switcher */}
          <div className="flex items-center bg-surface p-1 rounded-lg border border-surface-border">
            {(['month', 'week', 'day', 'agenda'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1 rounded text-xs capitalize transition-all ${
                  viewMode === m
                    ? 'bg-aviation text-white shadow-2xs font-semibold'
                    : 'text-gray-600 hover:text-aviation-950 font-medium'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-xl border border-surface-border shadow-2xs overflow-hidden flex-1 flex flex-col">
          <div className="grid grid-cols-7 border-b border-surface-border bg-surface/70 text-center text-xs font-semibold text-gray-500 py-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 grid-rows-5 flex-1 min-h-[560px]">
            {eachDayOfInterval({
              start: startOfWeek(startOfMonth(currentDate)),
              end: endOfWeek(endOfMonth(currentDate)),
            }).map((day, idx) => {
              const dayApts = getDayAppointments(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const dateStr = format(day, 'yyyy-MM-dd');

              return (
                <div
                  key={idx}
                  onClick={(e) => {
                    // Click on empty space creates appointment
                    if (e.target === e.currentTarget) {
                      onSlotClick(dateStr, '09:00');
                    }
                  }}
                  className={`border-b border-r border-surface-border p-2 flex flex-col justify-between transition-colors min-h-[100px] cursor-pointer hover:bg-surface/50 ${
                    !isCurrentMonth ? 'bg-surface/40 text-gray-300' : 'bg-white'
                  } ${isToday ? 'bg-aviation-50/30' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1 pointer-events-none">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-aviation text-white'
                          : isCurrentMonth
                          ? 'text-aviation-950'
                          : 'text-gray-400'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayApts.length > 0 && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        {dayApts.length} apt{dayApts.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 flex-1 overflow-y-auto max-h-24">
                    {dayApts.slice(0, 3).map((apt) => (
                      <div
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAppointment(apt);
                        }}
                        className={`p-1 rounded text-[10px] truncate block border transition-colors ${
                          apt.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            : apt.status === 'DECLINED'
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : apt.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-900 border-rose-200'
                            : apt.status === 'NO_SHOW'
                            ? 'bg-gray-100 text-gray-700 border-gray-300'
                            : 'bg-aviation-50 text-aviation-950 border-aviation-200/60'
                        }`}
                      >
                        <span className="font-semibold font-mono mr-1">
                          {formatTime12Hour(apt.start_time).split(' ')[0]}
                        </span>
                        <span className="font-medium">
                          {apt.student?.name} &rarr; {apt.faculty?.name}
                        </span>
                      </div>
                    ))}
                    {dayApts.length > 3 && (
                      <div className="text-[10px] text-gray-500 font-semibold px-1">
                        +{dayApts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-xl border border-surface-border shadow-2xs overflow-hidden flex-1 flex flex-col">
          <div className="grid grid-cols-7 border-b border-surface-border bg-surface/70 text-center py-2">
            {eachDayOfInterval({
              start: startOfWeek(currentDate),
              end: endOfWeek(currentDate),
            }).map((day, idx) => (
              <div key={idx}>
                <div className="text-[11px] font-medium text-gray-500">
                  {format(day, 'EEE')}
                </div>
                <div
                  className={`text-sm font-bold mt-0.5 ${
                    isSameDay(day, new Date()) ? 'text-aviation-600' : 'text-aviation-950'
                  }`}
                >
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 min-h-[520px] divide-x divide-surface-border flex-1">
            {eachDayOfInterval({
              start: startOfWeek(currentDate),
              end: endOfWeek(currentDate),
            }).map((day, idx) => {
              const dayApts = getDayAppointments(day);
              const dateStr = format(day, 'yyyy-MM-dd');
              return (
                <div
                  key={idx}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) onSlotClick(dateStr, '09:00');
                  }}
                  className="p-2 space-y-2 cursor-pointer hover:bg-surface/30"
                >
                  {dayApts.length === 0 ? (
                    <div className="text-[10px] text-gray-300 text-center mt-6">
                      Click to schedule
                    </div>
                  ) : (
                    dayApts.map((apt) => (
                      <div
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAppointment(apt);
                        }}
                        className="p-2 rounded-lg bg-surface hover:bg-aviation-50 border border-surface-border text-xs cursor-pointer transition-all"
                      >
                        <div className="font-mono font-semibold text-aviation-800 text-[10px]">
                          {formatTime12Hour(apt.start_time)} – {formatTime12Hour(apt.end_time)}
                        </div>
                        <div className="font-bold text-aviation-950 truncate mt-0.5">
                          {apt.student?.name}
                        </div>
                        <div className="text-[10px] text-aviation-700 font-medium truncate">
                          with {apt.faculty?.name}
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <AppointmentStatusBadge status={apt.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-xl border border-surface-border shadow-2xs p-6 flex-1">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-surface-border">
            <h3 className="text-sm font-bold text-aviation-950">
              Appointments for {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <button
              onClick={() => onSlotClick(format(currentDate, 'yyyy-MM-dd'), '09:00')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-aviation-700 hover:text-aviation-950 px-2.5 py-1 rounded bg-surface border border-surface-border"
            >
              <Plus className="w-3.5 h-3.5" />
              Add on this day
            </button>
          </div>

          {getDayAppointments(currentDate).length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400">
              No appointments scheduled for this date.
            </div>
          ) : (
            <div className="space-y-3">
              {getDayAppointments(currentDate).map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => onSelectAppointment(apt)}
                  className="p-4 rounded-xl border border-surface-border hover:border-aviation-300 bg-surface/40 hover:bg-white transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-xs font-bold text-aviation-800 bg-white px-3 py-1.5 rounded-lg border border-surface-border">
                      {formatTime12Hour(apt.start_time)} – {formatTime12Hour(apt.end_time)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-aviation-950">
                        {apt.student?.name} ({apt.student?.register_number})
                        <span className="font-normal text-gray-500 ml-1.5">
                          &rarr; {apt.faculty?.name}
                        </span>
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        {apt.reason} &bull; {apt.student?.programme}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <SourceBadge source={apt.source} />
                    <AppointmentStatusBadge status={apt.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Agenda View */}
      {viewMode === 'agenda' && (
        <div className="bg-white rounded-xl border border-surface-border shadow-2xs p-6 flex-1">
          <h3 className="text-sm font-bold text-aviation-950 mb-4 pb-2 border-b border-surface-border">
            All Appointments Agenda
          </h3>
          {appointments.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400">
              No appointments match the active filters.
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => onSelectAppointment(apt)}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface/50 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-xs font-bold text-aviation-950 min-w-[90px]">
                      {apt.date}
                    </div>
                    <div className="font-mono text-xs text-gray-600 min-w-[110px]">
                      {formatTime12Hour(apt.start_time)} – {formatTime12Hour(apt.end_time)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-aviation-950">
                        {apt.student?.name} ({apt.student?.register_number}) &bull;{' '}
                        <span className="text-aviation-700">{apt.faculty?.name}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {apt.reason} &bull; {apt.student?.programme}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <SourceBadge source={apt.source} />
                    <AppointmentStatusBadge status={apt.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
