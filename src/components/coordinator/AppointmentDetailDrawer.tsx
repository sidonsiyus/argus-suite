'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  GraduationCap,
  Users,
  MapPin,
  Mail,
  Phone,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { AppointmentStatusBadge, SourceBadge } from '@/components/ui/Badge';
import { formatTime12Hour } from '@/lib/utils/slots';

interface AppointmentDetailDrawerProps {
  appointment: any | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (apt: any) => void;
  onRefresh: () => void;
}

export function AppointmentDetailDrawer({
  appointment,
  isOpen,
  onClose,
  onEdit,
  onRefresh,
}: AppointmentDetailDrawerProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const [promptDecline, setPromptDecline] = useState(false);
  const [declineReasonText, setDeclineReasonText] = useState('');
  const [promptCancel, setPromptCancel] = useState(false);
  const [cancelReasonText, setCancelReasonText] = useState('');
  const [promptDelete, setPromptDelete] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !appointment) return null;

  const handleUpdateStatus = async (
    newStatus: string,
    extra?: { decline_reason?: string; cancellation_reason?: string }
  ) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/coordinator/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appointment.id,
          status: newStatus,
          ...extra,
        }),
      });

      if (res.ok) {
        setPromptDecline(false);
        setPromptCancel(false);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePermanent = async () => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/coordinator/appointments?id=${appointment.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPromptDelete(false);
        onClose();
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-aviation-950/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto border-l border-surface-border animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-surface-border bg-surface/30 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-aviation-950">
                  {appointment.appointment_id}
                </span>
                <AppointmentStatusBadge status={appointment.status} />
                <SourceBadge source={appointment.source} />
              </div>
              {appointment.tracking_code && (
                <div className="text-[11px] font-mono text-gray-500 mb-1">
                  Tracking Code: <span className="font-semibold text-aviation-900">{appointment.tracking_code}</span>
                </div>
              )}
              <h2 className="text-base font-bold text-aviation-950">
                Appointment Record
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close appointment details"
              className="p-1 rounded-md text-gray-400 hover:text-aviation-950 hover:bg-surface focus:outline-hidden focus:ring-2 focus:ring-aviation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 text-xs">
            {/* Action Confirmation Forms (Decline / Cancel / Delete) */}
            {promptDecline && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                <div className="font-bold text-amber-950">
                  Decline Appointment
                </div>
                <input
                  type="text"
                  placeholder="Optional reason (e.g. Faculty unavailable at the requested time)"
                  value={declineReasonText}
                  onChange={(e) => setDeclineReasonText(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setPromptDecline(false)}
                    className="px-3 py-1.5 bg-white border border-surface-border rounded-lg text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() =>
                      handleUpdateStatus('DECLINED', {
                        decline_reason: declineReasonText.trim() || undefined,
                      })
                    }
                    className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg"
                  >
                    Confirm Decline
                  </button>
                </div>
              </div>
            )}

            {promptCancel && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
                <div className="font-bold text-rose-950">
                  Cancel Appointment
                </div>
                <input
                  type="text"
                  placeholder="Optional cancellation reason"
                  value={cancelReasonText}
                  onChange={(e) => setCancelReasonText(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setPromptCancel(false)}
                    className="px-3 py-1.5 bg-white border border-surface-border rounded-lg text-gray-700"
                  >
                    Close
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() =>
                      handleUpdateStatus('CANCELLED', {
                        cancellation_reason: cancelReasonText.trim() || undefined,
                      })
                    }
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </div>
            )}

            {promptDelete && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-950">
                      Delete this appointment permanently?
                    </div>
                    <p className="text-[11px] text-rose-800 mt-1">
                      This action will completely remove the appointment record from the database.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setPromptDelete(false)}
                    className="px-3 py-1.5 bg-white border border-surface-border rounded-lg text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={handleDeletePermanent}
                    className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-lg shadow-xs"
                  >
                    Delete Appointment
                  </button>
                </div>
              </div>
            )}

            {/* Date & Time block */}
            <div className="p-4 rounded-xl bg-surface border border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-aviation-700" />
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">DATE</span>
                  <span className="font-bold text-aviation-950 text-sm">
                    {appointment.date}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 border-l border-surface-border pl-6">
                <Clock className="w-5 h-5 text-aviation-700" />
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">TIME</span>
                  <span className="font-bold text-aviation-950 text-sm font-mono">
                    {formatTime12Hour(appointment.start_time)} –{' '}
                    {formatTime12Hour(appointment.end_time)}
                  </span>
                </div>
              </div>
            </div>

            {/* Student Section */}
            <div className="border border-surface-border rounded-xl p-4 space-y-2">
              <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-aviation-600" />
                Student Information
              </div>
              <div className="text-sm font-bold text-aviation-950">
                {appointment.student?.name}
              </div>
              <div className="grid grid-cols-2 gap-2 text-gray-600">
                <div>
                  <span className="text-gray-400 text-[10px] block">REGISTER NUMBER</span>
                  <span className="font-mono font-semibold text-aviation-950">
                    {appointment.student?.register_number}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">PROGRAMME</span>
                  <span>{appointment.student?.programme}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">YEAR &amp; SECTION</span>
                  <span>
                    Year {appointment.student?.year} &bull; Section{' '}
                    {appointment.student?.section}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">CONTACT</span>
                  <span>{appointment.student?.email || appointment.student?.phone || '—'}</span>
                </div>
              </div>
            </div>

            {/* Faculty Section */}
            <div className="border border-surface-border rounded-xl p-4 space-y-2">
              <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-aviation-600" />
                Faculty Member
              </div>
              <div className="text-sm font-bold text-aviation-950">
                {appointment.faculty?.name}
              </div>
              <div className="text-gray-600 space-y-1">
                <p>{appointment.faculty?.designation}</p>
                <div className="flex items-center gap-4 text-gray-500 pt-1">
                  {appointment.faculty?.room && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-aviation-600" />
                      {appointment.faculty.room}
                    </span>
                  )}
                  {appointment.faculty?.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-aviation-600" />
                      {appointment.faculty.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Purpose & Notes */}
            <div className="border border-surface-border rounded-xl p-4 space-y-2">
              <div className="text-[10px] uppercase font-bold text-gray-400">
                Meeting Details
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block">REASON</span>
                <p className="font-semibold text-aviation-950 text-xs">
                  {appointment.reason}
                </p>
              </div>
              {appointment.notes && (
                <div className="pt-2">
                  <span className="text-gray-400 text-[10px] block">NOTES</span>
                  <p className="text-gray-600 bg-surface p-2 rounded border border-surface-border text-xs">
                    {appointment.notes}
                  </p>
                </div>
              )}
              {appointment.decline_reason && (
                <div className="pt-2">
                  <span className="text-amber-700 text-[10px] block font-semibold">
                    DECLINE REASON
                  </span>
                  <p className="text-amber-900 bg-amber-50 p-2 rounded border border-amber-200">
                    {appointment.decline_reason}
                  </p>
                </div>
              )}
              {appointment.cancellation_reason && (
                <div className="pt-2">
                  <span className="text-rose-700 text-[10px] block font-semibold">
                    CANCELLATION REASON
                  </span>
                  <p className="text-rose-900 bg-rose-50 p-2 rounded border border-rose-200">
                    {appointment.cancellation_reason}
                  </p>
                </div>
              )}
            </div>

            {/* Audit info */}
            <div className="text-[10px] text-gray-400 flex justify-between px-1">
              <span>Created: {new Date(appointment.created_at).toLocaleString()}</span>
              <span>Updated: {new Date(appointment.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 border-t border-surface-border bg-surface/40 flex flex-wrap gap-2 justify-between items-center shrink-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onEdit(appointment)}
              className="px-3 py-1.5 bg-white border border-surface-border hover:border-aviation-300 rounded-lg text-xs font-semibold text-aviation-950 flex items-center gap-1 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </button>

            {appointment.status === 'SCHEDULED' && (
              <>
                <button
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark Completed
                </button>
                <button
                  onClick={() => handleUpdateStatus('NO_SHOW')}
                  className="px-2.5 py-1.5 bg-white border border-surface-border hover:bg-surface text-gray-700 rounded-lg text-xs font-medium"
                >
                  Mark No-Show
                </button>
                <button
                  onClick={() => setPromptDecline(true)}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium"
                >
                  Decline
                </button>
                <button
                  onClick={() => setPromptCancel(true)}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
              </>
            )}

            {appointment.status !== 'SCHEDULED' && (
              <button
                onClick={() => handleUpdateStatus('SCHEDULED')}
                className="px-3 py-1.5 bg-white border border-surface-border hover:bg-surface text-aviation-900 rounded-lg text-xs font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Re-Open
              </button>
            )}
          </div>

          <button
            onClick={() => setPromptDelete(true)}
            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
            title="Delete permanently"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
