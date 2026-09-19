'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/coordinator/Header';
import { MasterCalendar } from '@/components/calendar/MasterCalendar';
import { AppointmentModal } from '@/components/coordinator/AppointmentModal';
import { AppointmentDetailDrawer } from '@/components/coordinator/AppointmentDetailDrawer';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SetupRequired } from '@/components/ui/SetupRequired';

export default function CoordinatorCalendarPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>();
  const [prefilledTime, setPrefilledTime] = useState<string | undefined>();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/coordinator/appointments?';
      if (selectedFaculty !== 'all') url += `faculty_id=${selectedFaculty}&`;
      if (selectedStatus !== 'all') url += `status=${selectedStatus}&`;
      if (selectedSource !== 'all') url += `source=${selectedSource}&`;

      const [aptsRes, facRes] = await Promise.all([
        fetch(url),
        fetch('/api/coordinator/faculty?status=ACTIVE'),
      ]);

      const [aptData, facData] = await Promise.all([
        aptsRes.json(),
        facRes.json(),
      ]);

      if (aptData.appointments) setAppointments(aptData.appointments);
      if (facData.faculty) setFacultyList(facData.faculty);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedFaculty, selectedStatus, selectedSource]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEmptySlotClick = (dateStr: string, timeStr?: string) => {
    setPrefilledDate(dateStr);
    setPrefilledTime(timeStr || '09:00');
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  if (!isSupabaseConfigured()) {
    return <SetupRequired title="Master Calendar — Database Setup Required" />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Department Master Calendar"
        subtitle="Department of Aviation — Outside Class Hours Appointment Schedule"
        onNewAppointment={() => {
          setEditingAppointment(null);
          setPrefilledDate(undefined);
          setPrefilledTime(undefined);
          setIsModalOpen(true);
        }}
      />

      <main className="p-6 flex-1 flex flex-col max-w-7xl w-full mx-auto">
        <MasterCalendar
          appointments={appointments}
          facultyList={facultyList}
          selectedFaculty={selectedFaculty}
          onChangeFaculty={setSelectedFaculty}
          selectedStatus={selectedStatus}
          onChangeStatus={setSelectedStatus}
          selectedSource={selectedSource}
          onChangeSource={setSelectedSource}
          onSelectAppointment={(apt) => setSelectedAppointment(apt)}
          onSlotClick={handleEmptySlotClick}
        />
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
        defaultDate={prefilledDate}
        defaultTime={prefilledTime}
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
