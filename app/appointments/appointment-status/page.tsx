'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plane,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RotateCw,
  Printer,
  Calendar,
  User,
  ShieldCheck,
  Building2,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';
import { formatTime12Hour } from '@/lib/utils/slots';
import { normalizeTrackingCode, isValidTrackingCode } from '@/lib/utils/tracking-token';
import { PublicAppointmentStatus } from '@/types';

function AppointmentStatusContent({ initialToken }: { initialToken?: string }) {
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const router = useRouter();

  const routeToken = (routeParams?.token as string) ? decodeURIComponent(routeParams.token as string) : '';
  const tokenParam = initialToken || routeToken || searchParams.get('code') || searchParams.get('token') || '';

  const [inputToken, setInputToken] = useState<string>(tokenParam);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<PublicAppointmentStatus | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchStatus = useCallback(
    async (codeToFetch: string) => {
      const clean = normalizeTrackingCode(codeToFetch);
      if (!clean) {
        setError('Please enter your Tracking Code (e.g. AVN-7K4P92).');
        return;
      }

      if (!isValidTrackingCode(clean)) {
        setError('Invalid Tracking Code format. Expected format: AVN-7K4P92');
        setAppointment(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/appointments/status?token=${encodeURIComponent(clean)}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Appointment not found. Please verify your Tracking Code.');
          setAppointment(null);
        } else if (data.appointment) {
          setAppointment(data.appointment);
          setLastChecked(new Date());
          setError(null);
        } else {
          setError('Appointment not found.');
          setAppointment(null);
        }
      } catch (err: any) {
        setError(err.message || 'Unable to retrieve status. Please try again.');
        setAppointment(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial load if token is provided in URL
  useEffect(() => {
    if (tokenParam) {
      setInputToken(tokenParam);
      fetchStatus(tokenParam);
    }
  }, [tokenParam, fetchStatus]);

  // Modest background polling (30s) if appointment is currently PENDING
  useEffect(() => {
    if (!appointment || appointment.status !== 'PENDING') return;

    const interval = setInterval(() => {
      if (inputToken) {
        fetchStatus(inputToken);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [appointment, inputToken, fetchStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeTrackingCode(inputToken);
    if (!clean) return;

    // Update URL query parameter without full reload
    router.replace(`/appointment-status?token=${encodeURIComponent(clean)}`);
    fetchStatus(clean);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const status = appointment?.status;
  const isPending = status === 'PENDING';
  const isConfirmed = status === 'CONFIRMED' || status === 'SCHEDULED';
  const isDeclined = status === 'DECLINED';
  const isCancelled = status === 'CANCELLED';

  // Format date display
  const formattedDate = (() => {
    if (!appointment?.date) return '';
    try {
      const [y, m, d] = appointment.date.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return appointment.date;
    }
  })();

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-surface-border bg-white px-6 py-4 no-print shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-aviation flex items-center justify-center text-white shadow-sm">
              <Plane className="w-5 h-5 text-aviation-200" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-aviation-600">
                Department of Aviation
              </div>
              <h1 className="text-xs font-semibold text-aviation-950">
                Faculty–Student Appointment Portal
              </h1>
            </div>
          </Link>
          <Link
            href="/appointments/book"
            className="text-xs font-medium text-aviation-800 hover:text-aviation-950 px-3 py-1.5 rounded-lg border border-surface-border hover:bg-surface"
          >
            New Booking
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-4 py-10 flex-1 w-full flex flex-col justify-center">
        {/* Tracking Input Card */}
        <div className="bg-white rounded-2xl border border-surface-border shadow-xs p-6 mb-6 no-print">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-aviation-50 text-aviation-800 border border-aviation-150 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-aviation-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-aviation-950">Track Your Appointment</h2>
              <p className="text-[11px] text-gray-500">
                Enter your tracking code to check your appointment status.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-aviation-950 mb-1">
                Tracking Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                  placeholder="AVN-7K4P92"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-surface border border-surface-border rounded-xl text-xs font-mono font-bold tracking-wider text-aviation-950 uppercase placeholder:text-gray-400 focus:outline-hidden focus:border-aviation focus:ring-1 focus:ring-aviation"
                />
                <KeyRound className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-aviation hover:bg-aviation-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-aviation-200" />
                  Checking Status...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Track Appointment
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3 no-print">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-950">Appointment Not Found</p>
              <p className="mt-0.5">{error}</p>
              <p className="text-[11px] text-rose-700 mt-1">
                Note: Appointment Reference IDs (e.g. APT-001) cannot be used for status lookup. Only the tracking code (e.g. AVN-1234) issued during booking is valid.
              </p>
            </div>
          </div>
        )}

        {/* Appointment Status Display Card */}
        {appointment && (
          <div className="bg-white rounded-2xl border border-surface-border shadow-sm p-6 sm:p-8 print:p-0 print:border-none print:shadow-none">
            {/* Status Header Banner */}
            <div className="text-center pb-6 border-b border-surface-border">
              {isPending && (
                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Clock className="w-8 h-8" />
                </div>
              )}
              {isConfirmed && (
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              )}
              {isDeclined && (
                <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <XCircle className="w-8 h-8" />
                </div>
              )}
              {isCancelled && (
                <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-600 border border-gray-300 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <AlertCircle className="w-8 h-8" />
                </div>
              )}

              <div className="text-xs font-bold uppercase tracking-widest text-aviation-600 mb-1">
                Department of Aviation
              </div>

              <h2 className="text-xl font-extrabold text-aviation-950 tracking-tight">
                {isPending && 'Appointment Request Submitted'}
                {isConfirmed && 'Appointment Confirmed'}
                {isDeclined && 'Appointment Request Declined'}
                {isCancelled && 'Appointment Cancelled'}
              </h2>

              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold">
                {isPending && (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    PENDING APPROVAL
                  </span>
                )}
                {isConfirmed && (
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    CONFIRMED
                  </span>
                )}
                {isDeclined && (
                  <span className="bg-rose-100 text-rose-900 border border-rose-300 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-700" />
                    DECLINED
                  </span>
                )}
                {isCancelled && (
                  <span className="bg-gray-100 text-gray-800 border border-gray-300 px-2.5 py-0.5 rounded-full">
                    CANCELLED
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-600 mt-3 max-w-md mx-auto leading-relaxed">
                {isPending &&
                  'Your appointment request has been received and your selected time slot is currently held. It is awaiting coordinator approval.'}
                {isConfirmed &&
                  'Your appointment has been approved by the Department of Aviation Coordinator.'}
                {isDeclined &&
                  'Your appointment request could not be approved by the Department of Aviation Coordinator.'}
                {isCancelled &&
                  'This scheduled appointment was cancelled.'}
              </p>
            </div>

            {/* Decline Reason Callout */}
            {isDeclined && appointment.decline_reason && (
              <div className="my-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                <div className="font-bold text-rose-950 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  Coordinator Remarks / Reason:
                </div>
                <p className="text-rose-900 leading-relaxed font-medium">
                  {appointment.decline_reason}
                </p>
              </div>
            )}

            {/* Reference IDs Box */}
            <div className="my-5 p-4 rounded-xl bg-aviation-50/70 border border-aviation-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-aviation-600 block">
                  Appointment Reference ID
                </span>
                <span className="text-base font-mono font-bold text-aviation-950">
                  {appointment.appointment_id}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-aviation-600 block">
                  Tracking Code
                </span>
                <span className="text-base font-mono font-bold text-aviation-950">
                  {normalizeTrackingCode(inputToken)}
                </span>
              </div>
            </div>

            {/* Details Table */}
            <div className="divide-y divide-surface-border text-xs">
              <div className="py-3 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Faculty Member</span>
                <span className="font-bold text-aviation-950 text-right">
                  {appointment.faculty_name}
                </span>
              </div>

              <div className="py-3 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Student Name</span>
                <span className="font-semibold text-aviation-950">
                  {appointment.student_name}
                </span>
              </div>

              <div className="py-3 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Appointment Date</span>
                <span className="font-semibold text-aviation-950">
                  {formattedDate}
                </span>
              </div>

              <div className="py-3 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Scheduled Time</span>
                <span className="font-semibold text-aviation-950 font-mono">
                  {formatTime12Hour(appointment.start_time)} – {formatTime12Hour(appointment.end_time)}
                </span>
              </div>
            </div>

            {/* Live refresh & timestamp info */}
            <div className="mt-5 pt-4 border-t border-surface-border flex items-center justify-between text-[11px] text-gray-500 no-print">
              <span>
                {lastChecked
                  ? `Last checked: ${lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                  : 'Live status verified'}
              </span>
              <button
                type="button"
                onClick={() => fetchStatus(inputToken)}
                disabled={loading}
                className="inline-flex items-center gap-1 text-aviation-700 hover:text-aviation-950 font-semibold transition-colors"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh Status
              </button>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between gap-3 no-print">
              <Link
                href="/appointments/book"
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-aviation-950 px-3 py-2 rounded-lg border border-surface-border hover:bg-surface transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Book Another
              </Link>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-aviation hover:bg-aviation-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Confirmation
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-white py-4 px-6 text-center text-xs text-gray-400 no-print">
        Department of Aviation &bull; Institutional Appointment Tracking System
      </footer>
    </div>
  );
}

export default function AppointmentStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-xs text-gray-500">Loading appointment tracking...</div>}>
      <AppointmentStatusContent />
    </Suspense>
  );
}
