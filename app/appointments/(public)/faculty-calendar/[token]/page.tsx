'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Plane,
  Calendar as CalendarIcon,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Shield,
  AlertCircle,
  FileText,
  MapPin,
  Mail,
  Phone,
  HelpCircle,
  Sparkles,
  Loader2,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from 'date-fns';
import { AppointmentStatusBadge } from '@/components/ui/Badge';
import { formatTime12Hour } from '@/lib/utils/slots';

interface FacultyCalendarProps {
  params: Promise<{
    token: string;
  }>;
}

export default function FacultyCalendarPage({ params }: FacultyCalendarProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [faculty, setFaculty] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  useEffect(() => {
    async function loadCalendar() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/faculty-calendar/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load faculty calendar.');
          return;
        }

        setFaculty(data.faculty);
        setAppointments(data.appointments || []);
      } catch (err: any) {
        setError(err.message || 'Unable to load calendar.');
      } finally {
        setLoading(false);
      }
    }
    loadCalendar();
  }, [token]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-aviation-800" />
        <span className="text-xs font-medium text-gray-500">
          Accessing secure faculty calendar...
        </span>
      </div>
    );
  }

  if (error || !faculty) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-surface-border p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-aviation-950 mb-2">Access Restricted</h2>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            {error || 'This calendar link is invalid or has been revoked by the Coordinator.'}
          </p>
          <div className="text-[11px] text-gray-400 border-t border-surface-border pt-4">
            Department of Aviation &bull; Please contact the department coordinator if you require a new link.
          </div>
        </div>
      </div>
    );
  }

  // Filter appointments for month/week/day
  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter((apt) => apt.date === dateStr);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header with Aviation branding and Faculty details */}
      <header className="border-b border-surface-border bg-white px-6 py-4 shadow-xs sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-aviation flex items-center justify-center text-white shadow-sm shrink-0">
              <Plane className="w-6 h-6 text-aviation-200" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-aviation-600">
                Department of Aviation &bull; Faculty Calendar (Read-Only)
              </div>
              <h1 className="text-base font-bold text-aviation-950 leading-tight">
                {faculty.name}
              </h1>
              <p className="text-xs text-gray-500">
                {faculty.designation} &bull; {faculty.employee_id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            {faculty.room && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-aviation-700" />
                <span>{faculty.room}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-aviation-50 text-aviation-800 text-[11px] font-medium border border-aviation-100">
              <Shield className="w-3 h-3 text-aviation-600" />
              Private Calendar
            </div>
          </div>
        </div>
      </header>

      {/* Main Calendar View Area */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 flex-1 w-full flex flex-col">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white p-4 rounded-xl border border-surface-border shadow-2xs">
          {/* Navigation */}
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
              {viewMode === 'agenda' && 'All Scheduled Appointments'}
            </span>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center bg-surface p-1 rounded-lg border border-surface-border self-start sm:self-auto">
            {(['month', 'week', 'day', 'agenda'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1 rounded text-xs font-medium capitalize transition-all ${
                  viewMode === m
                    ? 'bg-aviation text-white shadow-2xs font-semibold'
                    : 'text-gray-600 hover:text-aviation-950'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* View: Month View */}
        {viewMode === 'month' && (
          <div className="bg-white rounded-xl border border-surface-border shadow-2xs overflow-hidden flex-1 flex flex-col">
            <div className="grid grid-cols-7 border-b border-surface-border bg-surface/60 text-center text-xs font-semibold text-gray-500 py-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 grid-rows-5 flex-1 min-h-[520px]">
              {eachDayOfInterval({
                start: startOfWeek(startOfMonth(currentDate)),
                end: endOfWeek(endOfMonth(currentDate)),
              }).map((day, idx) => {
                const dayApts = getAppointmentsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={idx}
                    className={`border-b border-r border-surface-border p-2 flex flex-col justify-between transition-colors min-h-[95px] ${
                      !isCurrentMonth ? 'bg-surface/40 text-gray-300' : 'bg-white'
                    } ${isToday ? 'bg-aviation-50/40' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
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

                    <div className="space-y-1 flex-1 overflow-y-auto max-h-20">
                      {dayApts.slice(0, 3).map((apt) => (
                        <button
                          key={apt.id}
                          onClick={() => setSelectedAppointment(apt)}
                          className="w-full text-left p-1 rounded bg-aviation-50 hover:bg-aviation-100/80 border border-aviation-200/50 text-[10px] text-aviation-900 truncate block transition-colors"
                        >
                          <span className="font-semibold font-mono mr-1">
                            {formatTime12Hour(apt.start_time).split(' ')[0]}
                          </span>
                          <span>{apt.student?.name || 'Student'}</span>
                        </button>
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

        {/* View: Week View */}
        {viewMode === 'week' && (
          <div className="bg-white rounded-xl border border-surface-border shadow-2xs overflow-hidden flex-1">
            <div className="grid grid-cols-7 border-b border-surface-border bg-surface/60 text-center py-2">
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

            <div className="grid grid-cols-7 min-h-[480px] divide-x divide-surface-border">
              {eachDayOfInterval({
                start: startOfWeek(currentDate),
                end: endOfWeek(currentDate),
              }).map((day, idx) => {
                const dayApts = getAppointmentsForDay(day);
                return (
                  <div key={idx} className="p-2 space-y-2">
                    {dayApts.length === 0 ? (
                      <div className="text-[10px] text-gray-300 text-center mt-4">
                        No meetings
                      </div>
                    ) : (
                      dayApts.map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => setSelectedAppointment(apt)}
                          className="p-2 rounded-lg bg-surface hover:bg-aviation-50 border border-surface-border text-xs cursor-pointer transition-all"
                        >
                          <div className="font-mono font-semibold text-aviation-800 text-[11px]">
                            {formatTime12Hour(apt.start_time)}
                          </div>
                          <div className="font-bold text-aviation-950 truncate mt-0.5">
                            {apt.student?.name}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate">
                            {apt.reason}
                          </div>
                          <div className="mt-1">
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

        {/* View: Day View */}
        {viewMode === 'day' && (
          <div className="bg-white rounded-xl border border-surface-border shadow-2xs p-6 flex-1">
            <h3 className="text-sm font-bold text-aviation-950 mb-4 pb-2 border-b border-surface-border">
              Appointments for {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </h3>

            {getAppointmentsForDay(currentDate).length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                No appointments scheduled for this day.
              </div>
            ) : (
              <div className="space-y-3">
                {getAppointmentsForDay(currentDate).map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => setSelectedAppointment(apt)}
                    className="p-4 rounded-xl border border-surface-border hover:border-aviation-300 bg-surface/50 hover:bg-white transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="font-mono text-xs font-bold text-aviation-800 bg-white px-3 py-1.5 rounded-lg border border-surface-border">
                        {formatTime12Hour(apt.start_time)} – {formatTime12Hour(apt.end_time)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-aviation-950">
                          {apt.student?.name} ({apt.student?.register_number})
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          {apt.reason} &bull; {apt.student?.programme}
                        </p>
                      </div>
                    </div>
                    <AppointmentStatusBadge status={apt.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* View: Agenda / List View */}
        {viewMode === 'agenda' && (
          <div className="bg-white rounded-xl border border-surface-border shadow-2xs p-6 flex-1">
            <div className="space-y-6">
              {appointments.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  No appointments currently recorded.
                </div>
              ) : (
                <div className="divide-y divide-surface-border">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => setSelectedAppointment(apt)}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-surface/40 p-2 rounded-lg transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-aviation-950">
                            {apt.date}
                          </span>
                          <span className="text-gray-400">&bull;</span>
                          <span className="font-mono text-xs text-gray-600">
                            {formatTime12Hour(apt.start_time)} – {formatTime12Hour(apt.end_time)}
                          </span>
                          <AppointmentStatusBadge status={apt.status} />
                        </div>
                        <div className="text-xs font-semibold text-aviation-950">
                          {apt.student?.name} — {apt.student?.register_number}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {apt.reason}
                          {apt.notes && ` (Notes: ${apt.notes})`}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-gray-400 block">
                          {apt.appointment_id}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {apt.student?.programme}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointment Details Modal (Read-Only) */}
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-aviation-950/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-surface-border shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-surface-border">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block">
                    {selectedAppointment.appointment_id}
                  </span>
                  <h3 className="text-sm font-bold text-aviation-950">
                    Appointment Details
                  </h3>
                </div>
                <AppointmentStatusBadge status={selectedAppointment.status} />
              </div>

              <div className="my-4 space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 text-[10px] block">STUDENT</span>
                  <p className="font-bold text-aviation-950">
                    {selectedAppointment.student?.name}
                  </p>
                  <p className="text-gray-500 text-[11px]">
                    Reg No: {selectedAppointment.student?.register_number} &bull;{' '}
                    {selectedAppointment.student?.programme}
                  </p>
                  {selectedAppointment.student?.email && (
                    <p className="text-gray-500 text-[11px]">
                      Email: {selectedAppointment.student?.email}
                    </p>
                  )}
                  {selectedAppointment.student?.phone && (
                    <p className="text-gray-500 text-[11px]">
                      Phone: {selectedAppointment.student?.phone}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400 text-[10px] block">DATE</span>
                    <p className="font-semibold text-gray-800">
                      {selectedAppointment.date}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">TIME</span>
                    <p className="font-mono font-semibold text-gray-800">
                      {formatTime12Hour(selectedAppointment.start_time)} –{' '}
                      {formatTime12Hour(selectedAppointment.end_time)}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 text-[10px] block">REASON</span>
                  <p className="text-gray-800 font-medium">
                    {selectedAppointment.reason}
                  </p>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <span className="text-gray-400 text-[10px] block">STUDENT NOTES</span>
                    <p className="text-gray-600 bg-surface p-2 rounded border border-surface-border text-[11px]">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-surface-border flex justify-end">
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 bg-surface hover:bg-aviation-50 text-aviation-950 rounded-lg text-xs font-semibold border border-surface-border transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-white py-4 px-6 text-center text-xs text-gray-400">
        Department of Aviation &bull; Read-Only Faculty Schedule
      </footer>
    </div>
  );
}
