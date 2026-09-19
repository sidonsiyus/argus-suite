'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Loader2,
  FileDown,
} from 'lucide-react';
import { Header } from '@/components/coordinator/Header';
import { AppointmentStatusBadge, SourceBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppointmentModal } from '@/components/coordinator/AppointmentModal';
import { AppointmentDetailDrawer } from '@/components/coordinator/AppointmentDetailDrawer';
import { formatTime12Hour } from '@/lib/utils/slots';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SetupRequired } from '@/components/ui/SetupRequired';

export default function CoordinatorAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/coordinator/appointments?';
      if (filterFaculty !== 'all') url += `faculty_id=${filterFaculty}&`;
      if (filterStatus !== 'all') url += `status=${filterStatus}&`;
      if (filterSource !== 'all') url += `source=${filterSource}&`;
      if (filterDate) url += `date=${filterDate}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const [aptRes, facRes] = await Promise.all([
        fetch(url),
        fetch('/api/coordinator/faculty?status=ACTIVE'),
      ]);

      const [aptData, facData] = await Promise.all([aptRes.json(), facRes.json()]);

      if (aptData.appointments) setAppointments(aptData.appointments);
      if (facData.faculty) setFacultyList(facData.faculty);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterFaculty, filterStatus, filterSource, filterDate, searchTerm]);

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [loadData]);

  // Paginated records
  const totalPages = Math.ceil(appointments.length / itemsPerPage) || 1;
  const paginatedAppointments = appointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!isSupabaseConfigured()) {
    return <SetupRequired title="Appointments Directory — Database Setup Required" />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Appointments Management"
        subtitle="Department of Aviation — Full Administrative CRUD Schedule Control"
        onNewAppointment={() => {
          setEditingAppointment(null);
          setIsModalOpen(true);
        }}
        onSearch={(term) => setSearchTerm(term)}
      />

      <main className="p-6 space-y-4 flex-1 max-w-7xl w-full mx-auto">
        {/* Filters and Action Bar */}
        <div className="bg-white p-4 rounded-xl border border-surface-border shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Faculty filter */}
            <select
              value={filterFaculty}
              onChange={(e) => setFilterFaculty(e.target.value)}
              className="bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-aviation-950 focus:outline-hidden"
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-aviation-950 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending Approval</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="DECLINED">Declined</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No-Show</option>
            </select>

            {/* Source filter */}
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-aviation-950 focus:outline-hidden"
            >
              <option value="all">All Sources</option>
              <option value="ONLINE">Online</option>
              <option value="ADMIN">Admin</option>
            </select>

            {/* Date filter */}
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-aviation-950 focus:outline-hidden"
            />

            {(filterFaculty !== 'all' ||
              filterStatus !== 'all' ||
              filterSource !== 'all' ||
              filterDate ||
              searchTerm) && (
              <button
                onClick={() => {
                  setFilterFaculty('all');
                  setFilterStatus('all');
                  setFilterSource('all');
                  setFilterDate('');
                  setSearchTerm('');
                }}
                className="text-gray-500 hover:text-aviation-950 font-medium underline px-1 text-[11px]"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">
              Total: {appointments.length} record{appointments.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={() => {
                setEditingAppointment(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-aviation hover:bg-aviation-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Appointment
            </button>
          </div>
        </div>

        {/* Appointments Data Table */}
        <div className="bg-white rounded-xl border border-surface-border shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-aviation-700" />
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Clock}
                title="No appointments found for the selected filters."
                description="Create an appointment manually or adjust your filter and search criteria."
                actionLabel="New Appointment"
                onAction={() => setIsModalOpen(true)}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface/70 border-b border-surface-border text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Appointment ID</th>
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Faculty</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {paginatedAppointments.map((apt) => (
                    <tr
                      key={apt.id}
                      onClick={() => setSelectedAppointment(apt)}
                      className="hover:bg-surface/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-aviation-950 whitespace-nowrap">
                        {apt.appointment_id}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-aviation-950">{apt.date}</div>
                        <div className="text-gray-500 font-mono text-[11px]">
                          {formatTime12Hour(apt.start_time)} – {formatTime12Hour(apt.end_time)}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-aviation-950">
                          {apt.student?.name}
                        </div>
                        <div className="text-gray-500 text-[11px] font-mono">
                          {apt.student?.register_number} &bull; {apt.student?.programme}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-aviation-950">
                          {apt.faculty?.name}
                        </div>
                        <div className="text-gray-500 text-[11px]">
                          {apt.faculty?.designation}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-[200px] truncate text-gray-700">
                        {apt.reason}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <AppointmentStatusBadge status={apt.status} />
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <SourceBadge source={apt.source} />
                      </td>

                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedAppointment(apt)}
                            className="p-1 rounded text-gray-400 hover:text-aviation-950 hover:bg-surface"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingAppointment(apt);
                              setIsModalOpen(true);
                            }}
                            className="p-1 rounded text-gray-400 hover:text-aviation-950 hover:bg-surface"
                            title="Edit appointment"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-surface-border bg-surface/30 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded border border-surface-border bg-white hover:bg-surface disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded border border-surface-border bg-white hover:bg-surface disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAppointment(null);
        }}
        onSuccess={loadData}
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
          setIsModalOpen(true);
        }}
        onRefresh={loadData}
      />
    </div>
  );
}
