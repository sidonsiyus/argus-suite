'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Printer,
  Calendar,
  Clock,
  User,
  Plane,
  FileText,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  Search,
} from 'lucide-react';
import { formatTime12Hour } from '@/lib/utils/slots';

interface BookingSummary {
  id?: string;
  appointment_id: string;
  tracking_code?: string;
  status?: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
  faculty_name: string;
  faculty_designation?: string;
  student_name: string;
  register_number: string;
  programme?: string;
}

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const aptIdFromQuery = searchParams.get('id');
  const tokenFromQuery = searchParams.get('token');

  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('lastBooking');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (!aptIdFromQuery || parsed.appointment_id === aptIdFromQuery) {
            setBooking(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [aptIdFromQuery]);

  const trackingCode = booking?.tracking_code || tokenFromQuery || '';

  const handleCopyCode = async () => {
    if (!trackingCode) return;
    try {
      await navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const status = (booking?.status || 'PENDING').toUpperCase();
  const isPending = status === 'PENDING';
  const isConfirmed = status === 'CONFIRMED' || status === 'SCHEDULED';
  const isDeclined = status === 'DECLINED';

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

      {/* Main Confirmation Slip */}
      <main className="max-w-xl mx-auto px-4 py-12 flex-1 w-full flex flex-col justify-center">
        <div className="bg-white rounded-2xl border border-surface-border shadow-sm p-8 print:p-0 print:border-none print:shadow-none">
          {/* Institutional Stamp / Header */}
          <div className="text-center pb-6 border-b border-surface-border">
            {isPending ? (
              <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Clock className="w-8 h-8" />
              </div>
            ) : isConfirmed ? (
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-50 text-gray-600 border border-gray-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <FileText className="w-8 h-8" />
              </div>
            )}

            <div className="text-xs font-bold uppercase tracking-widest text-aviation-600 mb-1">
              Department of Aviation
            </div>
            <h2 className="text-xl font-extrabold text-aviation-950 tracking-tight">
              {isPending
                ? 'Appointment Request Submitted'
                : isConfirmed
                ? 'Appointment Scheduled Successfully ✓'
                : 'Appointment Request Status'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isPending
                ? 'Awaiting Coordinator Approval — Your appointment request has been sent to the coordinator.'
                : 'Outside Class Hours Faculty Meeting Authorization'}
            </p>
          </div>

          {/* Key Reference ID Box */}
          <div className="my-6 p-4 rounded-xl bg-aviation-50 border border-aviation-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-aviation-600 block">
                Appointment Reference ID
              </span>
              <span className="text-lg font-mono font-bold text-aviation-950">
                {booking?.appointment_id || aptIdFromQuery || 'APT-RECORD'}
              </span>
            </div>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isPending
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : isConfirmed
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isPending ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                  PENDING APPROVAL
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  {status}
                </>
              )}
            </div>
          </div>

          {/* Tracking Code Box */}
          {trackingCode && (
            <div className="my-5 p-5 rounded-xl bg-amber-50/90 border border-amber-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                    <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                    Tracking Code
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-aviation-950 tracking-wider mt-1">
                    {trackingCode}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 bg-white hover:bg-amber-100/60 text-amber-950 border border-amber-300 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-800" />
                      Copy Tracking Code
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-amber-900/85 mt-2 leading-relaxed">
                Use this code to check your appointment status. No student account, login, or email address required.
              </p>
              <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between">
                <Link
                  href={`/appointment-status?code=${encodeURIComponent(trackingCode)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-aviation-950 hover:text-aviation hover:underline"
                >
                  <Search className="w-3.5 h-3.5 text-aviation-700" />
                  Track Appointment &rarr;
                </Link>
                <span className="text-[10px] text-gray-500 font-medium">No Login Required</span>
              </div>
            </div>
          )}

          {/* Details Table */}
          <div className="divide-y divide-surface-border text-xs">
            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-500 font-medium">Faculty Member</span>
              <span className="font-bold text-aviation-950 text-right">
                {booking?.faculty_name || 'Department Faculty'}
                {booking?.faculty_designation && (
                  <span className="block text-[11px] font-normal text-gray-500">
                    {booking.faculty_designation}
                  </span>
                )}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-500 font-medium">Appointment Date</span>
              <span className="font-semibold text-aviation-950">
                {booking?.date || 'Scheduled Date'}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-500 font-medium">Allocated Time</span>
              <span className="font-semibold text-aviation-950 font-mono">
                {booking
                  ? `${formatTime12Hour(booking.start_time)} – ${formatTime12Hour(booking.end_time)}`
                  : 'Scheduled Time'}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-500 font-medium">Student Name</span>
              <span className="font-semibold text-aviation-950">
                {booking?.student_name || 'Aviation Student'}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-500 font-medium">Register Number</span>
              <span className="font-bold font-mono text-aviation-950">
                {booking?.register_number || 'REG-NO'}
              </span>
            </div>

            {booking?.programme && (
              <div className="py-3 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Programme</span>
                <span className="font-medium text-gray-700">{booking.programme}</span>
              </div>
            )}

            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-500 font-medium">Purpose / Reason</span>
              <span className="font-semibold text-aviation-900 text-right max-w-xs">
                {booking?.reason || 'Academic Discussion'}
              </span>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-6 p-3 rounded-lg bg-surface border border-surface-border text-[11px] text-gray-500 leading-relaxed">
            <p className="font-semibold text-gray-700 mb-0.5">Notice for Students:</p>
            {isPending ? (
              <p>
                Your appointment request has been recorded with status <strong className="text-amber-800">PENDING</strong> and the selected time slot has been temporarily reserved for you. The Department Coordinator will review and approve your request shortly. You can print or save this receipt as reference.
              </p>
            ) : (
              <p>
                Please keep your Appointment ID handy and report to the faculty member&apos;s designated
                room/hangar at least 5 minutes prior to your scheduled time.
              </p>
            )}
          </div>

          {/* Action Buttons (Hidden when printing) */}
          <div className="mt-6 pt-6 border-t border-surface-border flex flex-wrap items-center justify-between gap-3 no-print">
            <Link
              href="/appointments/book"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-aviation-950 px-3 py-2 rounded-lg border border-surface-border hover:bg-surface transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Book Another
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-surface-border text-aviation-950 hover:bg-surface rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-gray-600" />
                Print / Save Receipt
              </button>

              {trackingCode && (
                <Link
                  href={`/appointment-status/${encodeURIComponent(trackingCode)}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-aviation hover:bg-aviation-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  Track Appointment
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-white py-4 px-6 text-center text-xs text-gray-400 no-print">
        Department of Aviation &bull; Institutional Portal
      </footer>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-xs text-gray-500">Loading confirmation...</div>}>
      <BookingConfirmationContent />
    </Suspense>
  );
}

