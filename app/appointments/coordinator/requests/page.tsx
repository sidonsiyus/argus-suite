'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  GraduationCap,
  Building2,
  AlertCircle,
  Loader2,
  Sparkles,
  FileText,
  Search,
  Filter,
} from 'lucide-react';
import { Header } from '@/components/coordinator/Header';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Appointment } from '@/types';
import { formatTime12Hour } from '@/lib/utils/slots';

function CoordinatorRequestsContent() {
  const [pendingList, setPendingList] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Approval Modal State
  const [approvingApt, setApprovingApt] = useState<Appointment | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Decline Modal State
  const [decliningApt, setDecliningApt] = useState<Appointment | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [isDeclining, setIsDeclining] = useState(false);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');

  const loadPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/coordinator/appointments?status=PENDING');
      const data = await res.json();
      if (data.appointments) {
        setPendingList(data.appointments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingRequests();
  }, [loadPendingRequests]);

  const handleApprove = async () => {
    if (!approvingApt) return;

    try {
      setIsApproving(true);
      setActionError(null);

      const res = await fetch('/api/coordinator/appointments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: approvingApt.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Failed to approve appointment.');
        return;
      }

      setActionSuccess(`Appointment ${approvingApt.appointment_id} confirmed successfully.`);
      setApprovingApt(null);
      loadPendingRequests();
    } catch (err: any) {
      setActionError(err.message || 'Error processing approval.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleDecline = async () => {
    if (!decliningApt) return;

    try {
      setIsDeclining(true);
      setActionError(null);

      const res = await fetch('/api/coordinator/appointments/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: decliningApt.id,
          reason: declineReason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Failed to decline appointment.');
        return;
      }

      setActionSuccess(`Appointment ${decliningApt.appointment_id} declined. Slot has been freed.`);
      setDecliningApt(null);
      setDeclineReason('');
      loadPendingRequests();
    } catch (err: any) {
      setActionError(err.message || 'Error processing decline.');
    } finally {
      setIsDeclining(false);
    }
  };

  const filteredRequests = pendingList.filter((apt) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const stuName = apt.student?.name?.toLowerCase() || '';
    const regNo = apt.student?.register_number?.toLowerCase() || '';
    const facName = apt.faculty?.name?.toLowerCase() || '';
    const aptId = apt.appointment_id?.toLowerCase() || '';
    const reason = apt.reason?.toLowerCase() || '';
    return (
      stuName.includes(term) ||
      regNo.includes(term) ||
      facName.includes(term) ||
      aptId.includes(term) ||
      reason.includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header
        title="Pending Appointment Requests"
        subtitle="Review, approve, or decline public student bookings"
        onSearch={(term) => setSearchTerm(term)}
      />

      <main className="p-6 max-w-6xl mx-auto w-full flex-1">
        {/* Status Alerts */}
        {actionError && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-rose-600 hover:text-rose-900 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {actionSuccess && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-emerald-600 hover:text-emerald-900 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Top Summary Banner */}
        <div className="p-4 bg-white rounded-xl border border-surface-border shadow-2xs mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-aviation-950">
                Awaiting Coordinator Action
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {pendingList.length} {pendingList.length === 1 ? 'request' : 'requests'} pending verification. Slots are reserved until approved or declined.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 font-semibold border border-amber-200">
              {pendingList.length} Pending
            </span>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-xs text-gray-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-aviation" />
            <span>Loading pending appointment requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={searchTerm ? 'No matching requests found' : 'All caught up!'}
            description={
              searchTerm
                ? `No pending requests matched "${searchTerm}".`
                : 'There are currently no appointment requests awaiting coordinator review.'
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredRequests.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-xl border border-surface-border p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-aviation-800 bg-aviation-50 px-2.5 py-0.5 rounded-md border border-aviation-100">
                        {apt.appointment_id}
                      </span>
                      {apt.tracking_code && (
                        <span className="font-mono text-[10px] text-gray-500 bg-surface px-2 py-0.5 rounded border border-surface-border">
                          {apt.tracking_code}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" />
                      PENDING APPROVAL
                    </span>
                  </div>

                  {/* Student Details */}
                  <div className="mb-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Student
                    </span>
                    <div className="text-sm font-bold text-aviation-950 flex items-center gap-1.5">
                      {apt.student?.name || 'Unknown Student'}
                      <span className="text-xs font-mono font-semibold text-gray-500">
                        ({apt.student?.register_number || '—'})
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-600 mt-0.5 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-aviation-600 shrink-0" />
                      <span>{apt.student?.programme || 'Department of Aviation'}</span>
                      <span>&bull;</span>
                      <span>
                        Year {apt.student?.year || '—'} | Sec {apt.student?.section || '—'}
                      </span>
                    </div>
                  </div>

                  {/* Faculty & Schedule */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-surface rounded-lg border border-surface-border text-xs mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">
                        Assigned Faculty
                      </span>
                      <span className="font-semibold text-aviation-950 block truncate">
                        {apt.faculty?.name || 'Aviation Faculty'}
                      </span>
                      <span className="text-[10px] text-gray-500 block truncate">
                        {apt.faculty?.designation || 'Faculty'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">
                        Date &amp; Time
                      </span>
                      <span className="font-semibold text-aviation-950 block">
                        {apt.date}
                      </span>
                      <span className="text-[11px] text-aviation-700 font-medium block">
                        {formatTime12Hour(apt.start_time)} – {formatTime12Hour(apt.end_time)}
                      </span>
                    </div>
                  </div>

                  {/* Purpose & Notes */}
                  <div className="text-xs mb-4">
                    <div className="flex items-start gap-1.5 text-gray-700">
                      <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-aviation-950">Purpose: </span>
                        <span>{apt.reason}</span>
                      </div>
                    </div>
                    {apt.notes && (
                      <p className="text-[11px] text-gray-500 mt-1 pl-5 italic">
                        &ldquo;{apt.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setDecliningApt(apt);
                      setDeclineReason('');
                      setActionError(null);
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    DECLINE
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setApprovingApt(apt);
                      setActionError(null);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-aviation hover:bg-aviation-900 text-white text-xs font-semibold transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    APPROVE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Confirmation Modal: APPROVE */}
      <Modal
        isOpen={Boolean(approvingApt)}
        onClose={() => setApprovingApt(null)}
        title="Approve Appointment Request?"
        subtitle="Department of Aviation &bull; Coordinator Interaction Confirmation"
        maxWidth="max-w-md"
      >
        {approvingApt && (
          <div className="space-y-4 text-xs">
            <p className="text-gray-600">
              Confirming this appointment will change its status to <strong className="text-emerald-700 font-bold">CONFIRMED</strong> and notify the student.
            </p>

            <div className="p-3.5 bg-surface rounded-xl border border-surface-border space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Student:</span>
                <span className="font-bold text-aviation-950">
                  {approvingApt.student?.name} ({approvingApt.student?.register_number})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Faculty:</span>
                <span className="font-semibold text-aviation-950">
                  {approvingApt.faculty?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date &amp; Time:</span>
                <span className="font-semibold text-aviation-950">
                  {approvingApt.date} &bull; {formatTime12Hour(approvingApt.start_time)} – {formatTime12Hour(approvingApt.end_time)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setApprovingApt(null)}
                disabled={isApproving}
                className="px-3.5 py-1.5 rounded-lg border border-surface-border text-gray-700 hover:bg-surface font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isApproving}
                className="px-4 py-1.5 bg-aviation hover:bg-aviation-900 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Approving...
                  </>
                ) : (
                  'Approve Appointment'
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal: DECLINE */}
      <Modal
        isOpen={Boolean(decliningApt)}
        onClose={() => setDecliningApt(null)}
        title="Decline Appointment Request?"
        subtitle="Department of Aviation &bull; The reserved slot will be freed immediately"
        maxWidth="max-w-md"
      >
        {decliningApt && (
          <div className="space-y-4 text-xs">
            <p className="text-gray-600">
              Declining this request will update its status to <strong className="text-rose-700 font-bold">DECLINED</strong>. The faculty time slot will become available for other students to book.
            </p>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-950">
              <div className="font-semibold">
                {decliningApt.student?.name} &bull; {decliningApt.date} ({formatTime12Hour(decliningApt.start_time)})
              </div>
            </div>

            <div>
              <label className="block font-semibold text-aviation-950 mb-1">
                Reason for Declining (Optional):
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Faculty unavailable due to official departmental meeting, please re-book for tomorrow..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-aviation text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDecliningApt(null)}
                disabled={isDeclining}
                className="px-3.5 py-1.5 rounded-lg border border-surface-border text-gray-700 hover:bg-surface font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDecline}
                disabled={isDeclining}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeclining ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Declining...
                  </>
                ) : (
                  'Decline Appointment'
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function CoordinatorRequestsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-400">Loading requests...</div>}>
      <CoordinatorRequestsContent />
    </Suspense>
  );
}
