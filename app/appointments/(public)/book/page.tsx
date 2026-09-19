'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plane,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar as CalendarIcon,
  User,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Sparkles,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  ChevronDown,
  Check,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SetupRequired } from '@/components/ui/SetupRequired';

interface FacultyOption {
  id: string;
  name: string;
  employee_id: string;
  designation: string;
  room: string | null;
  campus: string;
}

interface SlotOption {
  time: string;
  endTime: string;
  display: string;
}

interface VerifiedStudentData {
  id?: string;
  register_number: string;
  name: string;
  programme: string;
  year: string;
  section: string;
  status: string;
}

const REASON_OPTIONS = [
  'Academic Guidance',
  'Project Discussion',
  'Career Guidance',
  'Internship Guidance',
  'Placement Guidance',
  'Subject Discussion',
  'Student Support',
  'Other',
];

const PROGRAMMES = [
  'B.Sc Aeronautical Science',
  'B.Sc Aviation Management',
  'B.Tech Aerospace Engineering',
  'Diploma in Commercial Pilot Training',
  'Cabin Crew & Ground Operations',
];

export default function StudentBookingPage() {
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // STEP 1: Faculty Selection
  // ---------------------------------------------------------------------------
  const [facultyList, setFacultyList] = useState<FacultyOption[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [loadingFaculty, setLoadingFaculty] = useState<boolean>(true);
  const [isFacultyDropdownOpen, setIsFacultyDropdownOpen] = useState<boolean>(false);
  const [facultySearchQuery, setFacultySearchQuery] = useState<string>('');

  // ---------------------------------------------------------------------------
  // STEP 2: Date Selection
  // ---------------------------------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];
  const [appointmentDate, setAppointmentDate] = useState<string>(todayStr);

  // ---------------------------------------------------------------------------
  // STEP 3: Available Time Slots
  // ---------------------------------------------------------------------------
  const [availableSlots, setAvailableSlots] = useState<SlotOption[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotMessage, setSlotMessage] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // STEP 4: Student Verification (Register Number OR Student Name)
  // ---------------------------------------------------------------------------
  const [verificationMode, setVerificationMode] = useState<'reg_no' | 'name'>('reg_no');
  const [regInput, setRegInput] = useState<string>('');
  const [isVerifyingReg, setIsVerifyingReg] = useState<boolean>(false);
  const [regError, setRegError] = useState<string | null>(null);

  const [nameSearchInput, setNameSearchInput] = useState<string>('');
  const [isSearchingName, setIsSearchingName] = useState<boolean>(false);
  const [nameSearchResults, setNameSearchResults] = useState<VerifiedStudentData[]>([]);

  const [verifiedStudent, setVerifiedStudent] = useState<VerifiedStudentData | null>(null);

  // Fallback manual registration for unlisted students
  const [isManualFallback, setIsManualFallback] = useState<boolean>(false);
  const [manualName, setManualName] = useState<string>('');
  const [manualReg, setManualReg] = useState<string>('');
  const [manualProgramme, setManualProgramme] = useState<string>(PROGRAMMES[0]);
  const [manualYear, setManualYear] = useState<string>('II');
  const [manualSection, setManualSection] = useState<string>('A');

  // ---------------------------------------------------------------------------
  // STEP 5: Contact Information & Purpose
  // ---------------------------------------------------------------------------
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [reasonCategory, setReasonCategory] = useState<string>(REASON_OPTIONS[0]);
  const [reasonDetail, setReasonDetail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // ---------------------------------------------------------------------------
  // STEP 6: Confirmation & Submission
  // ---------------------------------------------------------------------------
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Fetch Active Faculty on Mount
  useEffect(() => {
    async function fetchFaculty() {
      try {
        setLoadingFaculty(true);
        const res = await fetch('/api/faculty/active');
        const data = await res.json();
        if (data.faculty && Array.isArray(data.faculty)) {
          setFacultyList(data.faculty);
          if (data.faculty.length > 0) {
            setSelectedFacultyId(data.faculty[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load faculty roster', err);
      } finally {
        setLoadingFaculty(false);
      }
    }
    fetchFaculty();
  }, []);

  // 2. Fetch Available Slots whenever Faculty or Date changes
  useEffect(() => {
    if (!selectedFacultyId || !appointmentDate) return;

    async function fetchSlots() {
      try {
        setLoadingSlots(true);
        setSelectedSlot(null);
        setSlotMessage(null);

        const res = await fetch(
          `/api/slots?faculty_id=${selectedFacultyId}&date=${appointmentDate}`
        );
        const data = await res.json();

        if (data.dayClosed) {
          setAvailableSlots([]);
          setSlotMessage(
            data.message || 'No appointment times are available for this faculty on this date.'
          );
        } else if (data.slots) {
          setAvailableSlots(data.slots);
          if (data.slots.length === 0) {
            setSlotMessage('No appointment times are available for this faculty on this date.');
          }
        }
      } catch (err) {
        setSlotMessage('Unable to retrieve schedule for this date.');
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [selectedFacultyId, appointmentDate]);

  // 3. Debounced Student Name Search (300ms, max 10 results)
  useEffect(() => {
    if (verificationMode !== 'name' || verifiedStudent) {
      return;
    }

    const trimmed = nameSearchInput.trim();
    if (trimmed.length < 2) {
      setNameSearchResults([]);
      setIsSearchingName(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingName(true);
        const res = await fetch(`/api/students/search?name=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          setNameSearchResults(data.results);
        } else {
          setNameSearchResults([]);
        }
      } catch (err) {
        setNameSearchResults([]);
      } finally {
        setIsSearchingName(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [nameSearchInput, verificationMode, verifiedStudent]);

  // Handle Exact Register Number Verification
  const handleVerifyRegisterNumber = async () => {
    const reg = regInput.trim().toUpperCase();
    if (!reg) return;

    setIsVerifyingReg(true);
    setRegError(null);

    try {
      const res = await fetch(`/api/students/lookup?reg=${encodeURIComponent(reg)}`);
      const data = await res.json();

      if (data.found && data.student) {
        setVerifiedStudent(data.student);
        setIsManualFallback(false);
      } else {
        setRegError('Student not found in the official Department of Aviation directory.');
      }
    } catch (err) {
      setRegError('Failed to verify register number. Please check connection or try again.');
    } finally {
      setIsVerifyingReg(false);
    }
  };

  // Handle Selection from Name Search Results
  const handleSelectStudent = (student: VerifiedStudentData) => {
    setVerifiedStudent(student);
    setNameSearchResults([]);
    setNameSearchInput('');
    setIsManualFallback(false);
  };

  // Clear Verified Student to re-verify
  const handleClearVerifiedStudent = () => {
    setVerifiedStudent(null);
    setRegInput('');
    setNameSearchInput('');
    setNameSearchResults([]);
    setRegError(null);
  };

  // Form Submission
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!selectedFacultyId) {
      setErrorMessage('Please select an active faculty member.');
      return;
    }

    if (!selectedSlot) {
      setErrorMessage('Please select an available appointment time slot.');
      return;
    }

    // Determine student info
    let finalReg = '';
    let finalName = '';
    let finalProg = '';
    let finalYr = '';
    let finalSec = '';

    if (verifiedStudent) {
      finalReg = verifiedStudent.register_number.trim().toUpperCase();
      finalName = verifiedStudent.name.trim();
      finalProg = verifiedStudent.programme.trim();
      finalYr = verifiedStudent.year.trim();
      finalSec = verifiedStudent.section.trim();
    } else if (isManualFallback) {
      if (!manualReg.trim() || !manualName.trim()) {
        setErrorMessage('Please enter your Register Number and Full Name.');
        return;
      }
      finalReg = manualReg.trim().toUpperCase();
      finalName = manualName.trim();
      finalProg = manualProgramme.trim();
      finalYr = manualYear.trim();
      finalSec = manualSection.trim();
    } else {
      setErrorMessage('Please verify your student identity using Register Number or Student Name.');
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address or leave it blank.');
      return;
    }

    const finalReason =
      reasonCategory === 'Other' && reasonDetail.trim()
        ? `Other: ${reasonDetail.trim()}`
        : reasonDetail.trim()
        ? `${reasonCategory} — ${reasonDetail.trim()}`
        : reasonCategory;

    const payload = {
      register_number: finalReg,
      name: finalName,
      programme: finalProg,
      year: finalYr,
      section: finalSec,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      faculty_id: selectedFacultyId,
      date: appointmentDate,
      start_time: selectedSlot.time,
      end_time: selectedSlot.endTime,
      reason: finalReason,
      notes: notes.trim() || undefined,
    };

    try {
      setSubmitting(true);
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to schedule appointment.');
        // If conflict occurred, refresh slots
        if (res.status === 409) {
          setSelectedSlot(null);
          const slotRes = await fetch(
            `/api/slots?faculty_id=${selectedFacultyId}&date=${appointmentDate}`
          );
          const slotData = await slotRes.json();
          if (slotData.slots) setAvailableSlots(slotData.slots);
        }
        setSubmitting(false);
        return;
      }

      // Store confirmation in sessionStorage and redirect to confirmation page (STEP 7)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('lastBooking', JSON.stringify(data.appointment));
      }
      const trackingToken = data.appointment?.tracking_code || '';
      router.push(`/book/confirmation?id=${data.appointment.appointment_id}&token=${encodeURIComponent(trackingToken)}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while scheduling. Please try again.');
      setSubmitting(false);
    }
  };

  const selectedFaculty = facultyList.find((f) => f.id === selectedFacultyId);

  // Format date display for header & preview
  const formattedSelectedDate = (() => {
    try {
      const [y, m, d] = appointmentDate.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return appointmentDate;
    }
  })();

  if (!isSupabaseConfigured()) {
    return <SetupRequired title="Public Booking — Database Setup Required" />;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between">
      {/* Institutional Header */}
      <header className="border-b border-surface-border bg-white px-6 py-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-aviation flex items-center justify-center text-white shadow-sm">
              <Plane className="w-5 h-5 text-aviation-200" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-aviation-600">
                Department of Aviation
              </div>
              <h1 className="text-sm font-bold text-aviation-950 leading-tight">
                Faculty–Student Appointment Portal
              </h1>
            </div>
          </Link>
          <Link
            href="/login"
            className="text-xs font-semibold text-aviation-800 hover:text-aviation-950 px-3.5 py-1.5 rounded-lg border border-surface-border hover:bg-surface transition-colors"
          >
            Coordinator Sign In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Page Title & Instructions */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-aviation-50 text-aviation-900 border border-aviation-100 text-[11px] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-aviation-600" />
            Official Aviation Academic Interaction
          </div>
          <h2 className="text-2xl font-extrabold text-aviation-950 tracking-tight">
            Schedule an Appointment with Faculty
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Complete the steps below to reserve a scheduled interaction with an active Aviation faculty member.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-950 mb-0.5">Booking Unsuccessful</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitBooking} className="space-y-6">
          {/* ================================================================ */}
          {/* STEP 1: Select Faculty                                           */}
          {/* ================================================================ */}
          <section className="bg-white p-6 rounded-xl border border-surface-border shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
              <span className="w-6 h-6 rounded-full bg-aviation text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-aviation-950">
                Select Aviation Faculty Member
              </h3>
            </div>

            {loadingFaculty ? (
              <div className="py-8 flex flex-col items-center justify-center text-xs text-gray-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-aviation" />
                Loading active faculty roster...
              </div>
            ) : facultyList.length === 0 ? (
              <div className="p-4 rounded-lg bg-surface border border-surface-border text-center text-xs text-gray-500">
                No active faculty members are currently available for booking.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Searchable Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-aviation-950 mb-1">
                    Select Faculty <span className="text-rose-500">*</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsFacultyDropdownOpen(!isFacultyDropdownOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-surface border border-surface-border rounded-xl text-left text-xs text-aviation-950 hover:border-aviation-300 focus:outline-hidden focus:ring-1 focus:ring-aviation transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <User className="w-4 h-4 text-aviation-600 shrink-0" />
                      {selectedFaculty ? (
                        <div className="min-w-0">
                          <span className="font-bold text-aviation-950 block truncate">
                            {selectedFaculty.name}
                          </span>
                          <span className="text-[11px] text-gray-500 truncate block">
                            {selectedFaculty.designation} &bull; Department of Aviation
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-medium">
                          Select a Faculty
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${
                        isFacultyDropdownOpen ? 'rotate-180 text-aviation-700' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isFacultyDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsFacultyDropdownOpen(false)}
                      />
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-surface-border rounded-xl shadow-lg z-30 overflow-hidden text-xs max-h-72 flex flex-col">
                        {/* Search field within dropdown */}
                        <div className="p-2 border-b border-surface-border bg-surface sticky top-0">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={facultySearchQuery}
                              onChange={(e) => setFacultySearchQuery(e.target.value)}
                              placeholder="Search by name, designation, or room..."
                              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-surface-border rounded-lg focus:outline-hidden focus:border-aviation"
                              autoFocus
                            />
                          </div>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto divide-y divide-surface-border py-1">
                          {facultyList
                            .filter((fac) => {
                              const q = facultySearchQuery.toLowerCase();
                              return (
                                fac.name.toLowerCase().includes(q) ||
                                fac.designation.toLowerCase().includes(q) ||
                                (fac.room && fac.room.toLowerCase().includes(q)) ||
                                (fac.campus && fac.campus.toLowerCase().includes(q))
                              );
                            })
                            .map((fac) => {
                              const isSelected = selectedFacultyId === fac.id;
                              return (
                                <button
                                  key={fac.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedFacultyId(fac.id);
                                    setIsFacultyDropdownOpen(false);
                                    setFacultySearchQuery('');
                                  }}
                                  className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors ${
                                    isSelected
                                      ? 'bg-aviation-50 text-aviation-950 font-semibold'
                                      : 'hover:bg-surface text-gray-700'
                                  }`}
                                >
                                  <div>
                                    <div className="font-bold text-aviation-950">
                                      {fac.name}
                                    </div>
                                    <div className="text-[11px] text-aviation-700">
                                      {fac.designation}
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                      Department of Aviation &bull; {fac.campus}
                                      {fac.room ? ` &bull; Office: ${fac.room}` : ''}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-aviation-700 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          {facultyList.filter((fac) => {
                            const q = facultySearchQuery.toLowerCase();
                            return (
                              fac.name.toLowerCase().includes(q) ||
                              fac.designation.toLowerCase().includes(q) ||
                              (fac.room && fac.room.toLowerCase().includes(q)) ||
                              (fac.campus && fac.campus.toLowerCase().includes(q))
                            );
                          }).length === 0 && (
                            <div className="p-4 text-center text-gray-400 text-xs">
                              No matching faculty members found.
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Selected Faculty Details Card */}
                {selectedFaculty && (
                  <div className="p-4 rounded-xl bg-aviation-50/50 border border-aviation-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-aviation-950">
                          {selectedFaculty.name}
                        </h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Active Availability Configured
                        </span>
                      </div>
                      <p className="text-[11px] text-aviation-800 font-medium">
                        {selectedFaculty.designation}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-600 pt-0.5">
                        <span className="font-medium text-aviation-700">Department of Aviation</span>
                        <span>&bull;</span>
                        <span>Campus: {selectedFaculty.campus}</span>
                        {selectedFaculty.room && (
                          <>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1 font-medium text-gray-700">
                              <Building2 className="w-3 h-3 text-gray-400" />
                              Office: {selectedFaculty.room}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-gray-400">
                  Only verified and active Department of Aviation instructional staff with configured availability appear in this list.
                </p>
              </div>
            )}
          </section>

          {/* ================================================================ */}
          {/* STEP 2: Select Date                                              */}
          {/* ================================================================ */}
          <section className="bg-white p-6 rounded-xl border border-surface-border shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
              <span className="w-6 h-6 rounded-full bg-aviation text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-aviation-950">
                Select Appointment Date
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-aviation-950 mb-1">
                  Appointment Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-surface-border rounded-lg font-semibold text-aviation-950 focus:outline-none focus:border-aviation focus:ring-1 focus:ring-aviation"
                  />
                </div>
              </div>

              <div className="p-3 bg-surface rounded-xl border border-surface-border">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Selected Interaction Day
                </span>
                <span className="font-bold text-xs text-aviation-950">
                  {formattedSelectedDate}
                </span>
                {selectedFaculty && (
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    with {selectedFaculty.name}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* STEP 3: Show Available Time Slots                                */}
          {/* ================================================================ */}
          <section className="bg-white p-6 rounded-xl border border-surface-border shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-aviation text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-bold text-aviation-950">
                  Available Time Slots
                </h3>
              </div>
              <span className="text-[11px] text-gray-400">
                Coordinator-Configured Hours
              </span>
            </div>

            {loadingSlots ? (
              <div className="py-8 flex flex-col items-center justify-center text-xs text-gray-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-aviation" />
                Calculating available slots from faculty availability...
              </div>
            ) : slotMessage ? (
              <div className="p-4 rounded-xl bg-surface border border-surface-border text-center text-xs text-gray-500">
                <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
                {slotMessage}
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="p-4 rounded-xl bg-surface border border-surface-border text-center text-xs text-gray-500">
                No appointment times are available for this faculty on this date.
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot?.time === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-lg text-xs font-medium border text-center transition-all ${
                          isSelected
                            ? 'bg-aviation text-white border-aviation shadow-xs'
                            : 'bg-surface hover:bg-aviation-50/70 border-surface-border text-aviation-950'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-aviation-200' : 'text-gray-400'}`} />
                          <span className="font-semibold">{slot.display}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedSlot && (
                  <div className="mt-3 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Selected Slot: {selectedSlot.display}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ================================================================ */}
          {/* STEP 4: Verify Student (Register Number OR Student Name)         */}
          {/* ================================================================ */}
          <section className="bg-white p-6 rounded-xl border border-surface-border shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-aviation text-white text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h3 className="text-sm font-bold text-aviation-950">
                  Verify Aviation Student Identity
                </h3>
              </div>
              {verifiedStudent && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>

            {/* Case A: Already Verified Student Card (Locked & Readonly) */}
            {verifiedStudent ? (
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Verified Student Details
                  </div>
                  <button
                    type="button"
                    onClick={handleClearVerifiedStudent}
                    className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline"
                  >
                    Change Student
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-white/90 p-3.5 rounded-lg border border-emerald-100 shadow-2xs">
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold block uppercase">
                      Student Name
                    </span>
                    <span className="font-bold text-aviation-950 text-sm">
                      {verifiedStudent.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold block uppercase">
                      Register Number
                    </span>
                    <span className="font-mono font-bold text-aviation-950 text-sm">
                      {verifiedStudent.register_number}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold block uppercase">
                      Programme
                    </span>
                    <span className="font-medium text-gray-800">
                      {verifiedStudent.programme}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold block uppercase">
                      Academic Cohort
                    </span>
                    <span className="font-medium text-gray-800">
                      Year {verifiedStudent.year} &bull; Section {verifiedStudent.section}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Academic fields verified against official roster.
                </div>
              </div>
            ) : isManualFallback ? (
              /* Case B: Manual Registration Fallback for genuinely unlisted students */
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-950">Manual Student Registration</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Enter your details below. A new student record (status: ACTIVE, source: BOOKING) will be registered upon confirmation.
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-aviation-950 mb-1">
                      Register Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 23BAS999"
                      value={manualReg}
                      onChange={(e) => setManualReg(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-aviation uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-aviation-950 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-aviation"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-aviation-950 mb-1">
                      Programme <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={manualProgramme}
                      onChange={(e) => setManualProgramme(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-aviation"
                    >
                      {PROGRAMMES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-aviation-950 mb-1">
                        Year
                      </label>
                      <select
                        value={manualYear}
                        onChange={(e) => setManualYear(e.target.value)}
                        className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-aviation"
                      >
                        <option value="I">Year I</option>
                        <option value="II">Year II</option>
                        <option value="III">Year III</option>
                        <option value="IV">Year IV</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-aviation-950 mb-1">
                        Section
                      </label>
                      <select
                        value={manualSection}
                        onChange={(e) => setManualSection(e.target.value)}
                        className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-aviation"
                      >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsManualFallback(false)}
                    className="text-[11px] font-semibold text-aviation-700 hover:text-aviation-950"
                  >
                    ← Back to Directory Verification
                  </button>
                </div>
              </div>
            ) : (
              /* Case C: Verification Selector: Register Number OR Student Name */
              <div className="space-y-4">
                {/* Clean Radio Toggle */}
                <div className="flex items-center gap-4 pb-2 border-b border-surface-border">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-aviation-950">
                    <input
                      type="radio"
                      name="verify_mode"
                      checked={verificationMode === 'reg_no'}
                      onChange={() => {
                        setVerificationMode('reg_no');
                        setRegError(null);
                      }}
                      className="accent-aviation"
                    />
                    Register Number
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-aviation-950">
                    <input
                      type="radio"
                      name="verify_mode"
                      checked={verificationMode === 'name'}
                      onChange={() => {
                        setVerificationMode('name');
                        setRegError(null);
                      }}
                      className="accent-aviation"
                    />
                    Student Name
                  </label>
                </div>

                {/* Sub-flow A: Register Number Lookup */}
                {verificationMode === 'reg_no' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-aviation-950 mb-1">
                        Enter Register Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. 23BAS001"
                          value={regInput}
                          onChange={(e) => {
                            setRegInput(e.target.value.toUpperCase());
                            setRegError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleVerifyRegisterNumber();
                            }
                          }}
                          className="flex-1 px-3 py-2 text-xs uppercase bg-surface border border-surface-border rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-aviation"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyRegisterNumber}
                          disabled={isVerifyingReg || !regInput.trim()}
                          className="px-4 py-2 bg-aviation hover:bg-aviation-900 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-2xs"
                        >
                          {isVerifyingReg ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Search className="w-3.5 h-3.5" />
                          )}
                          Verify
                        </button>
                      </div>
                    </div>

                    {regError && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start justify-between gap-2">
                        <span>{regError}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setManualReg(regInput);
                            setIsManualFallback(true);
                          }}
                          className="text-[11px] font-bold text-aviation hover:underline shrink-0"
                        >
                          + Register Manually
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-flow B: Student Name Search (Debounced, Max 10 Results) */}
                {verificationMode === 'name' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-aviation-950 mb-1">
                        Search Student Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="e.g. Siddarth"
                          value={nameSearchInput}
                          onChange={(e) => setNameSearchInput(e.target.value)}
                          className="w-full pl-9 pr-8 py-2 text-xs bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-aviation"
                        />
                        {isSearchingName && (
                          <Loader2 className="w-4 h-4 text-aviation animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    </div>

                    {/* Results List */}
                    {nameSearchResults.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Matching Aviation Students ({nameSearchResults.length})
                        </span>
                        {nameSearchResults.map((s) => (
                          <div
                            key={s.id}
                            className="p-3 bg-white rounded-xl border border-surface-border hover:border-aviation/50 hover:bg-aviation-50/30 transition-all flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div>
                              <h4 className="font-bold text-xs text-aviation-950">
                                {s.name}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                                <span className="font-mono font-semibold text-aviation-800">
                                  {s.register_number}
                                </span>
                                <span>&bull;</span>
                                <span>{s.programme}</span>
                                <span>&bull;</span>
                                <span>
                                  Year {s.year} | Section {s.section}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSelectStudent(s)}
                              className="px-3 py-1.5 bg-aviation text-white rounded-lg text-xs font-semibold hover:bg-aviation-900 transition-colors shadow-2xs shrink-0"
                            >
                              SELECT
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      nameSearchInput.trim().length >= 2 &&
                      !isSearchingName && (
                        <div className="p-3 bg-surface border border-surface-border rounded-lg text-xs text-gray-500 flex items-center justify-between">
                          <span>No student matching &ldquo;{nameSearchInput.trim()}&rdquo; was found.</span>
                          <button
                            type="button"
                            onClick={() => {
                              setManualName(nameSearchInput.trim());
                              setIsManualFallback(true);
                            }}
                            className="text-[11px] font-bold text-aviation hover:underline"
                          >
                            + Register Manually
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ================================================================ */}
          {/* STEP 5: Enter Contact Information & Purpose                      */}
          {/* ================================================================ */}
          <section className="bg-white p-6 rounded-xl border border-surface-border shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
              <span className="w-6 h-6 rounded-full bg-aviation text-white text-xs font-bold flex items-center justify-center">
                5
              </span>
              <h3 className="text-sm font-bold text-aviation-950">
                Contact Information &amp; Appointment Purpose
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-aviation-950 mb-1">
                    Student Email Address <span className="text-gray-400 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="student@aviation.edu (optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-aviation"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Optional. You can track your appointment using your tracking code without an email.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-aviation-950 mb-1">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-aviation"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-aviation-950 mb-1">
                  Primary Interaction Reason <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-aviation"
                >
                  {REASON_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-aviation-950 mb-1">
                  Specific Topic / Context
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flight Navigation Charting, Avionics Lab Review, Project Synopsis"
                  value={reasonDetail}
                  onChange={(e) => setReasonDetail(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-aviation"
                />
              </div>

              <div>
                <label className="block font-semibold text-aviation-950 mb-1">
                  Preparation Notes for Faculty (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide any additional questions or context for the faculty member..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-aviation"
                />
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* STEP 6: Confirm Appointment                                      */}
          {/* ================================================================ */}
          <section className="bg-white p-6 rounded-xl border border-surface-border shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
              <span className="w-6 h-6 rounded-full bg-aviation text-white text-xs font-bold flex items-center justify-center">
                6
              </span>
              <h3 className="text-sm font-bold text-aviation-950">
                Review &amp; Confirm Interaction
              </h3>
            </div>

            {/* Appointment Summary Review Box */}
            <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-2 text-xs mb-4">
              <div className="flex justify-between items-center pb-2 border-b border-surface-border">
                <span className="text-gray-500">Faculty Member:</span>
                <span className="font-bold text-aviation-950">
                  {selectedFaculty ? `${selectedFaculty.name} (${selectedFaculty.designation})` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-surface-border">
                <span className="text-gray-500">Date &amp; Time:</span>
                <span className="font-bold text-aviation-950">
                  {formattedSelectedDate} &bull; {selectedSlot ? selectedSlot.display : 'No slot selected'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-surface-border">
                <span className="text-gray-500">Student:</span>
                <span className="font-bold text-aviation-950">
                  {verifiedStudent
                    ? `${verifiedStudent.name} (${verifiedStudent.register_number})`
                    : isManualFallback && manualName
                    ? `${manualName} (${manualReg || 'Manual'})`
                    : 'Not verified yet'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Purpose:</span>
                <span className="font-semibold text-aviation-900">
                  {reasonCategory}
                  {reasonDetail ? ` — ${reasonDetail}` : ''}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedSlot || (!verifiedStudent && !isManualFallback)}
              className="w-full py-3.5 px-6 rounded-xl bg-aviation hover:bg-aviation-900 text-white text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Finalizing Appointment with Department...
                </>
              ) : (
                <>
                  CONFIRM &amp; SCHEDULE APPOINTMENT
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-gray-400 mt-2">
              Step 7 will generate your official appointment confirmation slip.
            </p>
          </section>
        </form>
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-surface-border bg-white py-4 px-6 text-center text-xs text-gray-500">
        Department of Aviation &bull; Faculty–Student Appointment Portal
      </footer>
    </div>
  );
}
