'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  Calendar,
  Clock,
  BookOpen,
  Plus,
  ArrowRight,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import { Header } from '@/components/coordinator/Header';
import { AppointmentStatusBadge, SourceBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppointmentModal } from '@/components/coordinator/AppointmentModal';
import { AppointmentDetailDrawer } from '@/components/coordinator/AppointmentDetailDrawer';
import { CSVImportModal } from '@/components/coordinator/CSVImportModal';
import { formatTime12Hour } from '@/lib/utils/slots';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SetupRequired } from '@/components/ui/SetupRequired';

export default function CoordinatorDashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    todayAppointmentsCount: 0,
    upcomingAppointmentsCount: 0,
    sessionsCount: 0,
  });

  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Drawer controls
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const todayStr = new Date().toISOString().split('T')[0];

      const [studentsRes, facultyRes, aptsRes, sessionsRes] = await Promise.all([
        fetch('/api/coordinator/students?status=ACTIVE'),
        fetch('/api/coordinator/faculty?status=ACTIVE'),
        fetch('/api/coordinator/appointments'),
        fetch('/api/coordinator/sessions'),
      ]);

      const [stuData, facData, aptData, sessData] = await Promise.all([
        studentsRes.json(),
        facultyRes.json(),
        aptsRes.json(),
        sessionsRes.json(),
      ]);

      const allApts: any[] = aptData.appointments || [];
      const todayList = allApts.filter((a) => a.date === todayStr);
      const upcomingList = allApts
        .filter((a) => a.date >= todayStr && a.status === 'SCHEDULED')
        .slice(0, 5);

      setTodayAppointments(todayList);
      setUpcomingAppointments(upcomingList);
      setRecentSessions((sessData.sessions || []).slice(0, 5));

      setStats({
        totalStudents: (stuData.students || []).length,
        totalFaculty: (facData.faculty || []).length,
        todayAppointmentsCount: todayList.length,
        upcomingAppointmentsCount: allApts.filter(
          (a) => a.date >= todayStr && a.status === 'SCHEDULED'
        ).length,
        sessionsCount: (sessData.sessions || []).length,
      });
    } catch (err) {
      console.error('Error loading dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (!isSupabaseConfigured()) {
    return <SetupRequired title="Coordinator Dashboard — Database Setup Required" />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Department Coordinator Dashboard"
        subtitle="Department of Aviation — Faculty–Student Appointment Portal"
        onNewAppointment={() => setIsNewAppointmentOpen(true)}
      />

      <main className="p-6 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        {/* Quick Action Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-xl border border-surface-border shadow-2xs">
          <div className="text-xs font-bold text-aviation-950">
            Administrative Quick Actions:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsNewAppointmentOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-aviation hover:bg-aviation-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Appointment
            </button>
            <Link
              href="/appointments/coordinator/students?action=new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-surface border border-surface-border text-aviation-950 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Student
            </Link>
            <Link
              href="/appointments/coordinator/faculty?action=new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-surface border border-surface-border text-aviation-950 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Faculty
            </Link>
            <Link
              href="/appointments/coordinator/sessions?action=new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-surface border border-surface-border text-aviation-950 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Record Session
            </Link>
            <button
              onClick={() => setIsCsvImportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-aviation-50 hover:bg-aviation-100 text-aviation-900 border border-aviation-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Import Students
            </button>
          </div>
        </div>

        {/* Top 5 Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-surface-border shadow-2xs">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Aviation Students
              </span>
              <GraduationCap className="w-4 h-4 text-aviation-700" />
            </div>
            <div className="text-2xl font-extrabold text-aviation-950">
              {stats.totalStudents}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              Active student directory
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-surface-border shadow-2xs">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Aviation Faculty
              </span>
              <Users className="w-4 h-4 text-aviation-700" />
            </div>
            <div className="text-2xl font-extrabold text-aviation-950">
              {stats.totalFaculty}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              Active instructional roster
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-surface-border shadow-2xs">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Today&apos;s Appointments
              </span>
              <Clock className="w-4 h-4 text-aviation-700" />
            </div>
            <div className="text-2xl font-extrabold text-aviation-950">
              {stats.todayAppointmentsCount}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              Meetings on today&apos;s schedule
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-surface-border shadow-2xs">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Upcoming Total
              </span>
              <Calendar className="w-4 h-4 text-aviation-700" />
            </div>
            <div className="text-2xl font-extrabold text-aviation-950">
              {stats.upcomingAppointmentsCount}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              Scheduled future slots
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-surface-border shadow-2xs col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Sessions Held
              </span>
              <BookOpen className="w-4 h-4 text-aviation-700" />
            </div>
            <div className="text-2xl font-extrabold text-aviation-950">
              {stats.sessionsCount}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              Recorded interactions
            </span>
          </div>
        </div>

        {/* Today's Appointments Section */}
        <section className="bg-white rounded-xl border border-surface-border shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface/30">
            <div>
              <h3 className="text-sm font-bold text-aviation-950">
                Today&apos;s Appointments
              </h3>
              <p className="text-[11px] text-gray-500">
                Scheduled meetings outside class hours for today
              </p>
            </div>
            <Link
              href="/appointments/coordinator/appointments"
              className="text-xs font-semibold text-aviation-700 hover:text-aviation-950 flex items-center gap-1"
            >
              View All Appointments &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center text-xs text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No appointments scheduled for today.
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt)}
                  className="p-4 hover:bg-surface/50 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors text-xs"
                >
                  <div className="flex items-center gap-4">
                    <div className="font-mono font-bold text-aviation-800 bg-surface px-2.5 py-1 rounded border border-surface-border">
                      {formatTime12Hour(apt.start_time)} – {formatTime12Hour(apt.end_time)}
                    </div>
                    <div>
                      <div className="font-bold text-aviation-950">
                        {apt.student?.name} ({apt.student?.register_number})
                        <span className="text-gray-400 font-normal mx-1.5">&rarr;</span>
                        <span className="text-aviation-800">{apt.faculty?.name}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {apt.reason} &bull; {apt.student?.programme}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <SourceBadge source={apt.source} />
                    <AppointmentStatusBadge status={apt.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Two-Column Grid: Upcoming Appointments & Recent Sessions */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <section className="bg-white rounded-xl border border-surface-border shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface/30">
                <h3 className="text-sm font-bold text-aviation-950">
                  Upcoming Appointments
                </h3>
                <Link
                  href="/appointments/coordinator/calendar"
                  className="text-xs font-semibold text-aviation-700 hover:text-aviation-950"
                >
                  Master Calendar &rarr;
                </Link>
              </div>

              {upcomingAppointments.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  No upcoming scheduled appointments.
                </div>
              ) : (
                <div className="divide-y divide-surface-border">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => setSelectedAppointment(apt)}
                      className="p-3.5 hover:bg-surface/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="font-bold text-aviation-950">
                          {apt.date} &bull; {formatTime12Hour(apt.start_time)}
                        </div>
                        <div className="text-gray-600 mt-0.5">
                          {apt.student?.name} with {apt.faculty?.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <AppointmentStatusBadge status={apt.status} />
                        <span className="text-[10px] text-gray-400 block mt-1 font-mono">
                          {apt.appointment_id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Recent Sessions */}
          <section className="bg-white rounded-xl border border-surface-border shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface/30">
                <h3 className="text-sm font-bold text-aviation-950">
                  Recent Conducted Sessions
                </h3>
                <Link
                  href="/appointments/coordinator/sessions"
                  className="text-xs font-semibold text-aviation-700 hover:text-aviation-950"
                >
                  Sessions Directory &rarr;
                </Link>
              </div>

              {recentSessions.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  No sessions recorded in directory yet.
                </div>
              ) : (
                <div className="divide-y divide-surface-border">
                  {recentSessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-aviation-950">{sess.title}</div>
                        <div className="text-gray-500 mt-0.5">
                          {sess.faculty?.name} &bull; {sess.date}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-aviation-50 text-aviation-800 border border-aviation-100">
                          {sess.student_count} student{sess.student_count > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Appointment Create/Edit Modal */}
      <AppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => {
          setIsNewAppointmentOpen(false);
          setEditingAppointment(null);
        }}
        onSuccess={loadDashboardData}
        initialAppointment={editingAppointment}
      />

      {/* Appointment Detail Drawer */}
      <AppointmentDetailDrawer
        isOpen={Boolean(selectedAppointment)}
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onEdit={(apt) => {
          setSelectedAppointment(null);
          setEditingAppointment(apt);
          setIsNewAppointmentOpen(true);
        }}
        onRefresh={loadDashboardData}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  );
}
