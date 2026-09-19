'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  Calendar,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Header } from '@/components/coordinator/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { SessionRecord } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SetupRequired } from '@/components/ui/SetupRequired';

const STANDARD_TITLES = [
  'Academic Guidance Session',
  'Career & Flight Training Guidance',
  'Aeronautical Science Project Discussion',
  'Internship & Industrial Review',
  'Placement Preparation & Mock Debrief',
  'Student Mentorship & Support',
  'Aviation Safety & Air Law Workshop',
  'Flight Navigation Charting Practicum',
  'Avionics Lab Review',
  'Other Aviation Department Session',
];

function CoordinatorSessionsContent() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get('action');

  const [sessions, setSessions] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(initialAction === 'new');
  const [editingSession, setEditingSession] = useState<any | null>(null);
  const [deletingSession, setDeletingSession] = useState<any | null>(null);

  // Form states
  const [title, setTitle] = useState(STANDARD_TITLES[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [facultyId, setFacultyId] = useState('');
  const [studentCount, setStudentCount] = useState('1');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/coordinator/sessions?';
      if (filterFaculty !== 'all') url += `faculty_id=${filterFaculty}&`;
      if (filterDate) url += `date=${filterDate}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const [sessRes, facRes] = await Promise.all([
        fetch(url),
        fetch('/api/coordinator/faculty?status=ACTIVE'),
      ]);

      const [sessData, facData] = await Promise.all([sessRes.json(), facRes.json()]);

      if (sessData.sessions) setSessions(sessData.sessions);
      if (facData.faculty) {
        setFacultyList(facData.faculty);
        if (facData.faculty.length > 0) {
          setFacultyId((prev) => prev || facData.faculty[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterFaculty, filterDate, searchTerm]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const openAddModal = () => {
    setEditingSession(null);
    setTitle(STANDARD_TITLES[0]);
    setCustomTitle('');
    setSessionDate(new Date().toISOString().split('T')[0]);
    if (facultyList.length > 0) setFacultyId(facultyList[0].id);
    setStudentCount('1');
    setDescription('');
    setNotes('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sess: any) => {
    setEditingSession(sess);
    setTitle(sess.title);
    setCustomTitle('');
    setSessionDate(sess.date);
    setFacultyId(sess.faculty_id);
    setStudentCount(String(sess.student_count));
    setDescription(sess.description || '');
    setNotes(sess.notes || '');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const finalTitle = customTitle.trim() ? customTitle.trim() : title;

    if (!finalTitle || !sessionDate || !facultyId) {
      setModalError('Title, date, and faculty member are required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        title: finalTitle,
        date: sessionDate,
        faculty_id: facultyId,
        student_count: Number(studentCount) || 1,
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const url = '/api/coordinator/sessions';
      const method = editingSession ? 'PUT' : 'POST';

      if (editingSession) {
        payload.id = editingSession.id;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error || 'Failed to save session.');
        setSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      loadSessions();
    } catch (err: any) {
      setModalError(err.message || 'Error occurred while saving session.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!deletingSession) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/coordinator/sessions?id=${deletingSession.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeletingSession(null);
        loadSessions();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isSupabaseConfigured()) {
    return <SetupRequired title="Sessions Directory — Database Setup Required" />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Sessions Directory"
        subtitle="Department of Aviation — Log of Conducted Group, Mentorship, and Lab Sessions"
        onSearch={(t) => setSearchTerm(t)}
      />

      <main className="p-6 space-y-4 flex-1 max-w-7xl w-full mx-auto">
        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-surface-border shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
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

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-aviation-950 focus:outline-hidden"
            />

            {(filterFaculty !== 'all' || filterDate || searchTerm) && (
              <button
                onClick={() => {
                  setFilterFaculty('all');
                  setFilterDate('');
                  setSearchTerm('');
                }}
                className="text-gray-500 hover:text-aviation-950 font-medium underline px-1 text-[11px]"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-aviation hover:bg-aviation-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Session
          </button>
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-xl border border-surface-border shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-aviation-700" />
              Loading sessions directory...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={BookOpen}
                title="No sessions recorded yet."
                description="Record group guidance, project reviews, or workshops held by Aviation faculty."
                actionLabel="Add Session"
                onAction={openAddModal}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface/70 border-b border-surface-border text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Session Title</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Faculty Member</th>
                    <th className="py-3 px-4">Students Attended</th>
                    <th className="py-3 px-4">Description &amp; Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {sessions.map((sess) => (
                    <tr key={sess.id} className="hover:bg-surface/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-aviation-950">
                        {sess.title}
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-gray-700 whitespace-nowrap">
                        {sess.date}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-aviation-950">
                          {sess.faculty?.name}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {sess.faculty?.designation}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-aviation-50 text-aviation-800 border border-aviation-100">
                          {sess.student_count} student{sess.student_count > 1 ? 's' : ''}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-gray-600 max-w-sm">
                        <div className="truncate">{sess.description || '—'}</div>
                        {sess.notes && (
                          <div className="text-[11px] text-gray-400 truncate">
                            Notes: {sess.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(sess)}
                            className="p-1 rounded text-gray-400 hover:text-aviation-950 hover:bg-surface"
                            title="Edit session"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingSession(sess)}
                            className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete session"
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

      {/* Add / Edit Session Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSession ? 'Edit Session Record' : '+ Add Conducted Session'}
        subtitle="Department of Aviation &bull; Sessions Directory"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveSession} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
              {modalError}
            </div>
          )}

          <div>
            <label className="block font-semibold text-aviation-950 mb-1">
              Session Title <span className="text-rose-500">*</span>
            </label>
            <select
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg mb-2"
            >
              {STANDARD_TITLES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or enter custom session title..."
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-aviation-950 mb-1">
                Session Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-aviation-950 mb-1">
                Students Count <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={studentCount}
                onChange={(e) => setStudentCount(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-aviation-950 mb-1">
              Faculty In-Charge <span className="text-rose-500">*</span>
            </label>
            <select
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
            >
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} — {f.designation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-aviation-950 mb-1">
              Description / Objectives
            </label>
            <textarea
              rows={2}
              placeholder="Summary of topics discussed, practical drills conducted..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-aviation-950 mb-1">
              Coordinator Notes
            </label>
            <textarea
              rows={2}
              placeholder="Internal remarks or outcomes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
            />
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
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Session'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deletingSession && (
        <Modal
          isOpen={Boolean(deletingSession)}
          onClose={() => setDeletingSession(null)}
          title="Delete Session Record"
          maxWidth="max-w-md"
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  Delete &ldquo;{deletingSession.title}&rdquo;?
                </p>
                <p className="mt-1 text-[11px]">
                  This will permanently remove this recorded interaction from the sessions directory.
                </p>
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeletingSession(null)}
                className="px-3 py-1.5 bg-surface border border-surface-border rounded-lg text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSession}
                disabled={submitting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function CoordinatorSessionsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-400">Loading sessions directory...</div>}>
      <CoordinatorSessionsContent />
    </Suspense>
  );
}

