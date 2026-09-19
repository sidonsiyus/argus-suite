'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Loader2,
  AlertTriangle,
  UserCheck,
  UserX,
  MapPin,
  Mail,
  Phone,
  Clock,
} from 'lucide-react';
import { Header } from '@/components/coordinator/Header';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { FacultyAvailabilityModal } from '@/components/coordinator/FacultyAvailabilityModal';
import { Faculty } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SetupRequired } from '@/components/ui/SetupRequired';

function CoordinatorFacultyContent() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get('action');

  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals & Actions
  const [isModalOpen, setIsModalOpen] = useState(initialAction === 'new');
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [deletingFaculty, setDeletingFaculty] = useState<Faculty | null>(null);
  const [regeneratingFaculty, setRegeneratingFaculty] = useState<Faculty | null>(null);
  const [managingAvailabilityFaculty, setManagingAvailabilityFaculty] = useState<Faculty | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [room, setRoom] = useState('');
  const [campus, setCampus] = useState('Aerospace Campus');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  const loadFaculty = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/coordinator/faculty?';
      if (filterStatus !== 'all') url += `status=${filterStatus}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.faculty) {
        setFacultyList(data.faculty);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    loadFaculty();
  }, [loadFaculty]);

  const openAddModal = () => {
    setEditingFaculty(null);
    setName('');
    setEmployeeId('');
    setDesignation('');
    setEmail('');
    setPhone('');
    setRoom('');
    setCampus('Aerospace Campus');
    setStatus('ACTIVE');
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (fac: Faculty) => {
    setEditingFaculty(fac);
    setName(fac.name);
    setEmployeeId(fac.employee_id);
    setDesignation(fac.designation);
    setEmail(fac.email);
    setPhone(fac.phone || '');
    setRoom(fac.room || '');
    setCampus(fac.campus || 'Aerospace Campus');
    setStatus(fac.status);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!name.trim() || !employeeId.trim() || !designation.trim() || !email.trim()) {
      setModalError('Name, employee ID, designation, and email are required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        name: name.trim(),
        employee_id: employeeId.trim(),
        designation: designation.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        room: room.trim() || undefined,
        campus: campus.trim(),
        status,
      };

      const url = '/api/coordinator/faculty';
      const method = editingFaculty ? 'PUT' : 'POST';

      if (editingFaculty) {
        payload.id = editingFaculty.id;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error || 'Failed to save faculty member.');
        setSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      loadFaculty();
    } catch (err: any) {
      setModalError(err.message || 'Error occurred while saving faculty.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (fac: Faculty) => {
    const newStatus = fac.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await fetch('/api/coordinator/faculty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fac.id, status: newStatus }),
      });
      loadFaculty();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFaculty = async () => {
    if (!deletingFaculty) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/coordinator/faculty?id=${deletingFaculty.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete faculty.');
        setSubmitting(false);
        return;
      }
      setDeletingFaculty(null);
      loadFaculty();
    } catch (e: any) {
      alert(e.message || 'Error deleting faculty.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegenerateToken = async () => {
    if (!regeneratingFaculty) return;
    try {
      setSubmitting(true);
      const res = await fetch('/api/coordinator/faculty/regenerate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faculty_id: regeneratingFaculty.id }),
      });
      if (res.ok) {
        setRegeneratingFaculty(null);
        loadFaculty();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const copyCalendarLink = (token: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${origin}/faculty-calendar/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  if (!isSupabaseConfigured()) {
    return <SetupRequired title="Faculty Roster — Database Setup Required" />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Aviation Faculty Roster"
        subtitle="Department of Aviation — Instructional Staff Directory & Private Calendars"
        onSearch={(t) => setSearchTerm(t)}
      />

      <main className="p-6 space-y-4 flex-1 max-w-7xl w-full mx-auto">
        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-surface-border shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-aviation-950 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active (Available for booking)</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            {(filterStatus !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setSearchTerm('');
                }}
                className="text-gray-500 hover:text-aviation-950 font-medium underline px-1 text-[11px]"
              >
                Clear Filters
              </button>
            )}
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-aviation hover:bg-aviation-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Faculty
          </button>
        </div>

        {/* Faculty Table */}
        <div className="bg-white rounded-xl border border-surface-border shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-aviation-700" />
              Loading faculty roster...
            </div>
          ) : facultyList.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Users}
                title="No active Aviation faculty members have been added yet."
                description="Add faculty members to allow students to schedule appointments outside class hours."
                actionLabel="Add Faculty"
                onAction={openAddModal}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface/70 border-b border-surface-border text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Faculty Member</th>
                    <th className="py-3 px-4">Employee ID</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Contact &amp; Room</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Upcoming</th>
                    <th className="py-3 px-4">Private Calendar Link</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {facultyList.map((fac) => (
                    <tr key={fac.id} className="hover:bg-surface/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-aviation-950">{fac.name}</div>
                        <div className="text-[11px] text-gray-400">{fac.campus}</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-aviation-950">
                        {fac.employee_id}
                      </td>

                      <td className="py-3 px-4 text-gray-700 max-w-xs truncate">
                        {fac.designation}
                      </td>

                      <td className="py-3 px-4 text-gray-500">
                        <div className="truncate">{fac.email}</div>
                        <div className="text-[11px] text-gray-400">
                          {fac.room ? `Room: ${fac.room}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={fac.status} />
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-aviation-950">
                        {fac.upcoming_count || 0}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => copyCalendarLink(fac.calendar_token, fac.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-surface hover:bg-aviation-50 text-aviation-950 border border-surface-border rounded text-[11px] font-medium transition-colors"
                            title="Copy private calendar URL"
                          >
                            {copiedTokenId === fac.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-gray-400" /> Copy Link
                              </>
                            )}
                          </button>
                          <a
                            href={`/faculty-calendar/${fac.calendar_token}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-gray-400 hover:text-aviation-950 hover:bg-surface rounded"
                            title="Open faculty calendar"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setManagingAvailabilityFaculty(fac)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-aviation-900 bg-aviation-50 hover:bg-aviation-100 hover:text-aviation-950 transition-colors border border-aviation-100 shadow-2xs mr-1"
                            title="Manage faculty appointment availability windows"
                          >
                            <Clock className="w-3.5 h-3.5 text-aviation-600" />
                            Manage Availability
                          </button>
                          <button
                            onClick={() => openEditModal(fac)}
                            className="p-1 rounded text-gray-400 hover:text-aviation-950 hover:bg-surface"
                            title="Edit faculty member"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRegeneratingFaculty(fac)}
                            className="p-1 rounded text-gray-400 hover:text-aviation-950 hover:bg-surface"
                            title="Regenerate secure calendar token"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(fac)}
                            className={`p-1 rounded transition-colors ${
                              fac.status === 'ACTIVE'
                                ? 'text-gray-400 hover:text-amber-700 hover:bg-amber-50'
                                : 'text-gray-400 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={
                              fac.status === 'ACTIVE' ? 'Disable faculty' : 'Reactivate faculty'
                            }
                          >
                            {fac.status === 'ACTIVE' ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setDeletingFaculty(fac)}
                            className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete faculty member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Faculty Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaculty ? 'Edit Faculty Details' : '+ Add Aviation Faculty Member'}
        subtitle="Department of Aviation &bull; Instructional Staff Directory"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveFaculty} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
              {modalError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-aviation-950 mb-1">
                Faculty Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Capt. Rajesh Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-aviation-950 mb-1">
                Employee ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AV-101"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full font-mono uppercase px-3 py-2 bg-surface border border-surface-border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-aviation-950 mb-1">
              Designation <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chief Flight Instructor / Professor of Navigation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-aviation-950 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="faculty@aviation.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-aviation-950 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98401 23456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-aviation-950 mb-1">
                Office / Room Location
              </label>
              <input
                type="text"
                placeholder="e.g. Hangar A-102 or Aero Lab 204"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-aviation-950 mb-1">
                Campus
              </label>
              <input
                type="text"
                placeholder="Aerospace Campus"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-aviation-950 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
            >
              <option value="ACTIVE">ACTIVE (Available for Student Booking)</option>
              <option value="INACTIVE">INACTIVE (Hidden from Student Booking)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-surface-border flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-surface hover:bg-aviation-50 text-aviation-950 rounded-lg text-xs font-semibold border border-surface-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-aviation hover:bg-aviation-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Faculty'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Token Regeneration Modal */}
      {regeneratingFaculty && (
        <Modal
          isOpen={Boolean(regeneratingFaculty)}
          onClose={() => setRegeneratingFaculty(null)}
          title="Regenerate Private Calendar Link"
          maxWidth="max-w-md"
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950">
              <RefreshCw className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  Regenerate token for {regeneratingFaculty.name}?
                </p>
                <p className="mt-1 text-[11px] text-amber-900 leading-relaxed">
                  The previous private calendar URL will immediately stop working. The faculty member must be sent the new link.
                </p>
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <button
                onClick={() => setRegeneratingFaculty(null)}
                className="px-3 py-1.5 bg-surface border border-surface-border rounded-lg text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerateToken}
                disabled={submitting}
                className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg shadow-xs"
              >
                Regenerate Token
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingFaculty && (
        <Modal
          isOpen={Boolean(deletingFaculty)}
          onClose={() => setDeletingFaculty(null)}
          title="Delete Faculty Member"
          maxWidth="max-w-md"
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  Delete {deletingFaculty.name} ({deletingFaculty.employee_id})?
                </p>
                <p className="mt-1 text-[11px]">
                  If this faculty member has past appointments or sessions recorded, deletion will be blocked to protect historical audit integrity. Use Disable instead.
                </p>
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeletingFaculty(null)}
                className="px-3 py-1.5 bg-surface border border-surface-border rounded-lg text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFaculty}
                disabled={submitting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Faculty Availability Configuration Modal */}
      <FacultyAvailabilityModal
        isOpen={Boolean(managingAvailabilityFaculty)}
        onClose={() => setManagingAvailabilityFaculty(null)}
        faculty={managingAvailabilityFaculty}
        onSaved={loadFaculty}
      />
    </div>
  );
}

export default function CoordinatorFacultyPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-400">Loading faculty roster...</div>}>
      <CoordinatorFacultyContent />
    </Suspense>
  );
}

