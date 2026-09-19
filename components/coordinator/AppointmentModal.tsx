'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  AlertTriangle,
  Clock,
  Calendar as CalendarIcon,
  User,
  Users,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Search,
  X,
} from 'lucide-react';
import { AppointmentStatus } from '@/types';

interface FacultyOption {
  id: string;
  name: string;
  designation: string;
}

interface SelectedStudent {
  id: string;
  name: string;
  register_number: string;
  programme: string;
  year?: string;
  section?: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialAppointment?: any | null; // If editing
  defaultDate?: string;
  defaultTime?: string;
}

const REASON_OPTIONS = [
  'Academic Guidance',
  'Project Discussion',
  'Career Guidance',
  'Internship Guidance',
  'Placement Guidance',
  'Subject Discussion',
  'Student Support',
  'Outside Portal Verbal Arrangement',
  'Historical Session Record',
  'Other',
];

export function AppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  initialAppointment,
  defaultDate,
  defaultTime,
}: AppointmentModalProps) {
  const isEditing = Boolean(initialAppointment);

  // Student states & dual-mode lookup
  const [studentId, setStudentId] = useState('');
  const [studentSelectionMode, setStudentSelectionMode] = useState<'search' | 'reg_no' | 'new'>('search');
  const [selectedStudent, setSelectedStudent] = useState<SelectedStudent | null>(null);

  // Mode A: Search Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SelectedStudent[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mode B: Enter Register Number
  const [regLookupQuery, setRegLookupQuery] = useState('');
  const [regLookupLoading, setRegLookupLoading] = useState(false);
  const [regLookupMessage, setRegLookupMessage] = useState<string | null>(null);

  // Mode C: Quick Register New Student
  const [newRegNumber, setNewRegNumber] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newProgramme, setNewProgramme] = useState('B.Sc Aeronautical Science');
  const [newYear, setNewYear] = useState('II');
  const [newSection, setNewSection] = useState('A');

  const [facultyId, setFacultyId] = useState('');
  const [date, setDate] = useState(
    defaultDate || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(defaultTime || '09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [reason, setReason] = useState(REASON_OPTIONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<AppointmentStatus>('SCHEDULED');

  // Faculty list (only active faculty loaded server-side)
  const [facultyList, setFacultyList] = useState<FacultyOption[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Conflict state
  const [conflictData, setConflictData] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Debounced directory search (Mode A: 300ms, max 10 results)
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(
          `/api/coordinator/students/search?q=${encodeURIComponent(searchQuery.trim())}`
        );
        const data = await res.json();
        if (data.students) {
          setSearchResults(data.students);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Error searching students:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Exact register number lookup (Mode B)
  const handleRegLookup = async () => {
    const cleanReg = regLookupQuery.trim().toUpperCase();
    if (!cleanReg) return;

    try {
      setRegLookupLoading(true);
      setRegLookupMessage(null);
      const res = await fetch(
        `/api/coordinator/students/search?reg=${encodeURIComponent(cleanReg)}`
      );
      const data = await res.json();

      if (data.found && data.student) {
        setSelectedStudent(data.student);
        setStudentId(data.student.id);
        setRegLookupMessage(null);
      } else {
        setRegLookupMessage(
          `Student with Register No "${cleanReg}" not found in directory. Use Quick Register to add them.`
        );
      }
    } catch (err) {
      setRegLookupMessage('Error verifying register number.');
    } finally {
      setRegLookupLoading(false);
    }
  };

  const handleSelectStudent = (student: SelectedStudent) => {
    setSelectedStudent(student);
    setStudentId(student.id);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClearSelectedStudent = () => {
    setSelectedStudent(null);
    setStudentId('');
    setRegLookupMessage(null);
  };

  // Load lists on open (loads ONLY faculty, ZERO bulk student load)
  useEffect(() => {
    if (!isOpen) return;

    async function loadDropdowns() {
      try {
        setLoadingData(true);
        const facRes = await fetch('/api/coordinator/faculty?status=ACTIVE');
        const facData = await facRes.json();

        if (facData.faculty) setFacultyList(facData.faculty);

        if (initialAppointment) {
          setStudentId(initialAppointment.student_id);
          setSelectedStudent({
            id: initialAppointment.student_id,
            name: initialAppointment.student_name || '—',
            register_number: initialAppointment.register_number || '—',
            programme: initialAppointment.programme || 'Department of Aviation',
          });
          setFacultyId(initialAppointment.faculty_id);
          setDate(initialAppointment.date);
          setStartTime(initialAppointment.start_time.slice(0, 5));
          setEndTime(initialAppointment.end_time.slice(0, 5));
          setReason(initialAppointment.reason);
          setNotes(initialAppointment.notes || '');
          setStatus(initialAppointment.status);
        } else {
          if (facData.faculty && facData.faculty.length > 0) {
            setFacultyId(facData.faculty[0].id);
          }
          if (defaultDate) setDate(defaultDate);
          if (defaultTime) {
            setStartTime(defaultTime);
            // Default 30 min duration
            const [h, m] = defaultTime.split(':').map(Number);
            const totalMins = h * 60 + m + 30;
            const endH = Math.floor(totalMins / 60)
              .toString()
              .padStart(2, '0');
            const endM = (totalMins % 60).toString().padStart(2, '0');
            setEndTime(`${endH}:${endM}`);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingData(false);
      }
    }

    loadDropdowns();
  }, [isOpen, initialAppointment, defaultDate, defaultTime]);

  const handleSubmit = async (overrideConflict = false) => {
    setErrorMsg(null);
    setConflictData(null);

    let finalStudentId = studentId;

    // If new student entered directly in modal
    if (studentSelectionMode === 'new') {
      if (!newRegNumber.trim() || !newStudentName.trim()) {
        setErrorMsg('Please provide the new student Register Number and Name.');
        return;
      }
      try {
        setSubmitting(true);
        const stuCreateRes = await fetch('/api/coordinator/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            register_number: newRegNumber.trim().toUpperCase(),
            name: newStudentName.trim(),
            programme: newProgramme,
            year: newYear,
            section: newSection,
          }),
        });
        const stuCreateData = await stuCreateRes.json();
        if (!stuCreateRes.ok) {
          setErrorMsg(stuCreateData.error || 'Failed to create new student.');
          setSubmitting(false);
          return;
        }
        finalStudentId = stuCreateData.student.id;
      } catch (err: any) {
        setErrorMsg(err.message || 'Error registering student.');
        setSubmitting(false);
        return;
      }
    } else {
      finalStudentId = selectedStudent?.id || studentId;
      if (!finalStudentId) {
        setErrorMsg('Please select a student from the directory or verify a register number.');
        return;
      }
    }

    if (!finalStudentId || !facultyId || !date || !startTime || !endTime) {
      setErrorMsg('Please fill in all required appointment details.');
      return;
    }

    if (endTime <= startTime) {
      setErrorMsg('End time must be strictly after start time.');
      return;
    }

    const finalReason =
      reason === 'Other' && customReason.trim()
        ? `Other: ${customReason.trim()}`
        : customReason.trim()
        ? `${reason} — ${customReason.trim()}`
        : reason;

    const payload: any = {
      student_id: finalStudentId,
      faculty_id: facultyId,
      date,
      start_time: startTime,
      end_time: endTime,
      reason: finalReason,
      notes: notes.trim() || undefined,
      status,
      override_conflict: overrideConflict,
    };

    if (isEditing) {
      payload.id = initialAppointment.id;
    }

    try {
      setSubmitting(true);
      const url = '/api/coordinator/appointments';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 409 && data.conflict) {
        // Show conflict warning dialog
        setConflictData(data);
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save appointment.');
        setSubmitting(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Appointment' : '+ New Appointment'}
      subtitle={
        isEditing
          ? `Editing ${initialAppointment?.appointment_id} &bull; Full Coordinator CRUD Control`
          : 'Manually schedule future, current, or historical appointment outside or inside working hours'
      }
      maxWidth="max-w-xl"
    >
      {/* Conflict Warning Alert with Admin Override */}
      {conflictData && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-amber-950 text-sm mb-1">
                Scheduling Conflict Detected
              </h4>
              <p className="text-amber-900 leading-relaxed mb-2">
                This requested time overlaps with an existing appointment:
              </p>
              {conflictData.conflictingAppointment && (
                <div className="bg-white p-3 rounded-lg border border-amber-200 text-gray-800 space-y-1 mb-3">
                  <div className="font-semibold text-aviation-950">
                    {conflictData.conflictingAppointment.appointment_id}
                  </div>
                  <div>
                    Time: {conflictData.conflictingAppointment.start_time} –{' '}
                    {conflictData.conflictingAppointment.end_time}
                  </div>
                  <div>
                    Student: {conflictData.conflictingAppointment.student_name}
                  </div>
                  <div>
                    Faculty: {conflictData.conflictingAppointment.faculty_name}
                  </div>
                  <div>
                    Reason: {conflictData.conflictingAppointment.reason}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConflictData(null)}
                  className="px-3 py-1.5 bg-white border border-surface-border text-gray-700 rounded-lg font-medium hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit(true)}
                  className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold shadow-xs transition-colors"
                >
                  Create Anyway (Override Conflict)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {errorMsg}
        </div>
      )}

      <div className="space-y-4 text-xs">
        {/* Student Selector / Creator */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-aviation-950">
              Student <span className="text-rose-500">*</span>
            </label>

            {/* Mode selection toggles */}
            <div className="flex items-center gap-1 bg-surface-border/40 p-0.5 rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setStudentSelectionMode('search');
                  handleClearSelectedStudent();
                }}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  studentSelectionMode === 'search'
                    ? 'bg-white text-aviation-950 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Search Directory
              </button>
              <button
                type="button"
                onClick={() => {
                  setStudentSelectionMode('reg_no');
                  handleClearSelectedStudent();
                }}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  studentSelectionMode === 'reg_no'
                    ? 'bg-white text-aviation-950 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Enter Reg No
              </button>
              <button
                type="button"
                onClick={() => {
                  setStudentSelectionMode('new');
                  handleClearSelectedStudent();
                }}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  studentSelectionMode === 'new'
                    ? 'bg-white text-aviation-950 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                + Quick Register
              </button>
            </div>
          </div>

          {/* If a student is already selected */}
          {selectedStudent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-aviation-950 text-xs">
                    <span className="font-mono text-aviation-800">{selectedStudent.register_number}</span> — {selectedStudent.name}
                  </div>
                  <div className="text-[11px] text-gray-600">
                    {selectedStudent.programme} {selectedStudent.year && selectedStudent.year !== 'N/A' ? `• Year ${selectedStudent.year}` : ''} {selectedStudent.section && selectedStudent.section !== 'N/A' ? `Sec ${selectedStudent.section}` : ''}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearSelectedStudent}
                className="text-xs text-aviation-700 hover:text-aviation-950 font-medium underline px-2 py-1 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Change
              </button>
            </div>
          )}

          {/* Mode A: Search Directory */}
          {!selectedStudent && studentSelectionMode === 'search' && (
            <div className="relative">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or register number (e.g. 23BAS001, Rahul)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-surface border border-surface-border rounded-lg text-xs focus:outline-hidden focus:border-aviation focus:ring-1 focus:ring-aviation"
                />
                {isSearching && (
                  <Loader2 className="w-3.5 h-3.5 text-aviation-600 animate-spin absolute right-3 top-2.5" />
                )}
                {searchQuery && !isSearching && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="mt-1 bg-white border border-surface-border rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-100 z-10">
                  {searchResults.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectStudent(s)}
                      className="w-full px-3 py-2 text-left hover:bg-aviation-50/50 flex items-center justify-between transition-colors group"
                    >
                      <div>
                        <div className="font-semibold text-aviation-950 text-xs group-hover:text-aviation">
                          <span className="font-mono text-aviation-700">{s.register_number}</span> — {s.name}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {s.programme} {s.year && s.year !== 'N/A' ? `• Yr ${s.year}` : ''} {s.section && s.section !== 'N/A' ? `Sec ${s.section}` : ''}
                        </div>
                      </div>
                      <span className="text-[10px] text-aviation-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Select &rarr;
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-xs">
                  No students found matching &quot;{searchQuery}&quot;.
                  <button
                    type="button"
                    onClick={() => {
                      setStudentSelectionMode('reg_no');
                      setRegLookupQuery(searchQuery.trim().toUpperCase());
                    }}
                    className="ml-1 text-aviation-700 font-medium underline"
                  >
                    Try Enter Reg No
                  </button>
                  {' or '}
                  <button
                    type="button"
                    onClick={() => {
                      setStudentSelectionMode('new');
                      setNewStudentName(searchQuery.trim());
                    }}
                    className="text-aviation-700 font-medium underline"
                  >
                    Quick Register
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mode B: Enter Register Number */}
          {!selectedStudent && studentSelectionMode === 'reg_no' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Register Number (e.g. 23BAS001)"
                  value={regLookupQuery}
                  onChange={(e) => {
                    setRegLookupQuery(e.target.value);
                    if (regLookupMessage) setRegLookupMessage(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleRegLookup();
                    }
                  }}
                  className="flex-1 px-3 py-2 uppercase bg-surface border border-surface-border rounded-lg font-mono text-xs focus:outline-hidden focus:border-aviation"
                />
                <button
                  type="button"
                  onClick={handleRegLookup}
                  disabled={regLookupLoading || !regLookupQuery.trim()}
                  className="px-4 py-2 bg-aviation hover:bg-aviation-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {regLookupLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  Verify
                </button>
              </div>
              {regLookupMessage && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-start justify-between gap-2">
                  <span>{regLookupMessage}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentSelectionMode('new');
                      setNewRegNumber(regLookupQuery.trim().toUpperCase());
                    }}
                    className="font-semibold text-aviation-800 underline whitespace-nowrap"
                  >
                    + Register Student
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mode C: Quick Register New Student */}
          {!selectedStudent && studentSelectionMode === 'new' && (
            <div className="p-3 bg-surface rounded-lg border border-surface-border space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Register No (e.g. 23BAS099)"
                  value={newRegNumber}
                  onChange={(e) => setNewRegNumber(e.target.value)}
                  className="px-2.5 py-1.5 uppercase bg-white border border-surface-border rounded font-mono text-xs"
                />
                <input
                  type="text"
                  placeholder="Student Name"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-surface-border rounded text-xs"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={newProgramme}
                  onChange={(e) => setNewProgramme(e.target.value)}
                  className="px-2 py-1 bg-white border border-surface-border rounded text-[11px]"
                >
                  <option value="B.Sc Aeronautical Science">B.Sc Aeronautical Science</option>
                  <option value="B.Sc Aviation Management">B.Sc Aviation Management</option>
                  <option value="B.Tech Aerospace Engineering">B.Tech Aerospace</option>
                  <option value="Commercial Pilot Training">Commercial Pilot</option>
                </select>
                <select
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="px-2 py-1 bg-white border border-surface-border rounded text-[11px]"
                >
                  <option value="I">Year I</option>
                  <option value="II">Year II</option>
                  <option value="III">Year III</option>
                  <option value="IV">Year IV</option>
                </select>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  className="px-2 py-1 bg-white border border-surface-border rounded text-[11px]"
                >
                  <option value="A">Sec A</option>
                  <option value="B">Sec B</option>
                  <option value="C">Sec C</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Faculty Selector */}
        <div>
          <label className="block font-semibold text-aviation-950 mb-1">
            Faculty Member <span className="text-rose-500">*</span>
          </label>
          <select
            value={facultyId}
            onChange={(e) => setFacultyId(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg focus:outline-hidden focus:border-aviation"
          >
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} — {f.designation}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Times */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-aviation-950 mb-1">
              Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-2.5 py-2 bg-surface border border-surface-border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-aviation-950 mb-1">
              Start Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-2.5 py-2 bg-surface border border-surface-border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-aviation-950 mb-1">
              End Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-2.5 py-2 bg-surface border border-surface-border rounded-lg"
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block font-semibold text-aviation-950 mb-1">
            Reason / Topic <span className="text-rose-500">*</span>
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg mb-2"
          >
            {REASON_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Specific Topic / Remarks"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block font-semibold text-aviation-950 mb-1">
            Coordinator Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Administrative remarks, venue specifics, verbal arrangement details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
          />
        </div>

        {/* Status & Source */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block font-semibold text-aviation-950 mb-1">
              Initial Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
            >
              <option value="SCHEDULED">SCHEDULED (Upcoming)</option>
              <option value="COMPLETED">COMPLETED (Historical/Conducted)</option>
              <option value="DECLINED">DECLINED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="NO_SHOW">NO_SHOW</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-aviation-950 mb-1">
              Record Source
            </label>
            <input
              type="text"
              readOnly
              value="ADMIN (Coordinator Entry)"
              className="w-full px-3 py-2 bg-surface/50 border border-surface-border rounded-lg text-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-surface hover:bg-aviation-50 text-aviation-950 rounded-lg text-xs font-semibold border border-surface-border transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => handleSubmit(false)}
          className="px-5 py-2 bg-aviation hover:bg-aviation-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            'Save Changes'
          ) : (
            'Create Appointment'
          )}
        </button>
      </div>
    </Modal>
  );
}
