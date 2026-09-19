'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  GraduationCap,
  Search,
  Plus,
  Upload,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  UserX,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { Header } from '@/components/coordinator/Header';
import { StatusBadge, SourceBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { CSVImportModal } from '@/components/coordinator/CSVImportModal';
import { Student } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SetupRequired } from '@/components/ui/SetupRequired';

const PROGRAMMES = [
  'B.Sc Aeronautical Science',
  'B.Sc Aviation Management',
  'B.Tech Aerospace Engineering',
  'Diploma in Commercial Pilot Training',
  'Cabin Crew & Ground Operations',
];

function CoordinatorStudentsContent() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get('action');

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialAction === 'new');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form states
  const [formReg, setFormReg] = useState('');
  const [formName, setFormName] = useState('');
  const [formProg, setFormProg] = useState(PROGRAMMES[0]);
  const [formYear, setFormYear] = useState('I');
  const [formSection, setFormSection] = useState('A');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/coordinator/students?';
      if (filterYear !== 'all') url += `year=${filterYear}&`;
      if (filterStatus !== 'all') url += `status=${filterStatus}&`;
      if (filterSource !== 'all') url += `source=${filterSource}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.students) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterYear, filterStatus, filterSource, searchTerm]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormReg('');
    setFormName('');
    setFormProg(PROGRAMMES[0]);
    setFormYear('I');
    setFormSection('A');
    setFormEmail('');
    setFormPhone('');
    setFormStatus('ACTIVE');
    setModalError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (stu: Student) => {
    setEditingStudent(stu);
    setFormReg(stu.register_number);
    setFormName(stu.name);
    setFormProg(stu.programme);
    setFormYear(stu.year);
    setFormSection(stu.section);
    setFormEmail(stu.email || '');
    setFormPhone(stu.phone || '');
    setFormStatus(stu.status);
    setModalError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!formReg.trim() || !formName.trim()) {
      setModalError('Register number and name are required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        register_number: formReg.trim().toUpperCase(),
        name: formName.trim(),
        programme: formProg,
        year: formYear,
        section: formSection,
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        status: formStatus,
      };

      const url = '/api/coordinator/students';
      const method = editingStudent ? 'PUT' : 'POST';

      if (editingStudent) {
        payload.id = editingStudent.id;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error || 'Failed to save student.');
        setSubmitting(false);
        return;
      }

      setIsAddModalOpen(false);
      loadStudents();
    } catch (err: any) {
      setModalError(err.message || 'Error occurred while saving student.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (stu: Student) => {
    const newStatus = stu.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await fetch('/api/coordinator/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: stu.id, status: newStatus }),
      });
      loadStudents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deletingStudent) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/coordinator/students?id=${deletingStudent.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete student.');
        setSubmitting(false);
        return;
      }
      setDeletingStudent(null);
      loadStudents();
    } catch (e: any) {
      alert(e.message || 'Error deleting student.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isSupabaseConfigured()) {
    return <SetupRequired title="Student Database — Database Setup Required" />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Aviation Student Database"
        subtitle="Department of Aviation — Student Roster and Registration Controls"
        onSearch={(t) => setSearchTerm(t)}
      />

      <main className="p-6 space-y-4 flex-1 max-w-7xl w-full mx-auto">
        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-surface-border shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Year filter */}
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-aviation-950 focus:outline-hidden"
            >
              <option value="all">All Academic Years</option>
              <option value="I">Year I</option>
              <option value="II">Year II</option>
              <option value="III">Year III</option>
              <option value="IV">Year IV</option>
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-aviation-950 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            {/* Source filter */}
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-aviation-950 focus:outline-hidden"
            >
              <option value="all">All Sources</option>
              <option value="IMPORTED">Imported</option>
              <option value="BOOKING">Booking (Auto)</option>
              <option value="ADMIN">Admin</option>
            </select>

            {(filterYear !== 'all' ||
              filterStatus !== 'all' ||
              filterSource !== 'all' ||
              searchTerm) && (
              <button
                onClick={() => {
                  setFilterYear('all');
                  setFilterStatus('all');
                  setFilterSource('all');
                  setSearchTerm('');
                }}
                className="text-gray-500 hover:text-aviation-950 font-medium underline px-1 text-[11px]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCsvImportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-surface text-aviation-950 border border-surface-border rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Import CSV
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-aviation hover:bg-aviation-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Student
            </button>
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-xl border border-surface-border shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-aviation-700" />
              Loading student roster...
            </div>
          ) : students.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={GraduationCap}
                title="No Aviation students found."
                description="Import your student list via CSV or manually add students to the directory."
                actionLabel="Import Students"
                onAction={() => setIsCsvImportOpen(true)}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface/70 border-b border-surface-border text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Register Number</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Programme</th>
                    <th className="py-3 px-4">Year &amp; Section</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {students.map((stu) => (
                    <tr key={stu.id} className="hover:bg-surface/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-aviation-950">
                        {stu.register_number}
                      </td>
                      <td className="py-3 px-4 font-semibold text-aviation-950">
                        {stu.name}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{stu.programme}</td>
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        Year {stu.year} &bull; Sec {stu.section}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        <div>{stu.email || '—'}</div>
                        <div className="text-[10px]">{stu.phone || ''}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={stu.status} />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <SourceBadge source={stu.source} />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(stu)}
                            className="p-1 rounded text-gray-400 hover:text-aviation-950 hover:bg-surface"
                            title="Edit student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(stu)}
                            className={`p-1 rounded transition-colors ${
                              stu.status === 'ACTIVE'
                                ? 'text-gray-400 hover:text-amber-700 hover:bg-amber-50'
                                : 'text-gray-400 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={
                              stu.status === 'ACTIVE' ? 'Disable student' : 'Reactivate student'
                            }
                          >
                            {stu.status === 'ACTIVE' ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setDeletingStudent(stu)}
                            className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete student"
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

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingStudent ? 'Edit Student Details' : '+ Add Aviation Student'}
        subtitle="Department of Aviation &bull; Student Directory"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
              {modalError}
            </div>
          )}

          <div>
            <label className="block font-semibold text-aviation-950 mb-1">
              Register Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 23BAS001"
              value={formReg}
              onChange={(e) => setFormReg(e.target.value)}
              className="w-full font-mono uppercase px-3 py-2 bg-surface border border-surface-border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-aviation-950 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Student full name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-aviation-950 mb-1">
              Programme <span className="text-rose-500">*</span>
            </label>
            <select
              value={formProg}
              onChange={(e) => setFormProg(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
            >
              {PROGRAMMES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-aviation-950 mb-1">
                Year <span className="text-rose-500">*</span>
              </label>
              <select
                value={formYear}
                onChange={(e) => setFormYear(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
              >
                <option value="I">Year I</option>
                <option value="II">Year II</option>
                <option value="III">Year III</option>
                <option value="IV">Year IV</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-aviation-950 mb-1">
                Section <span className="text-rose-500">*</span>
              </label>
              <select
                value={formSection}
                onChange={(e) => setFormSection(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-aviation-950 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="student@aviation.edu"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-aviation-950 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-aviation-950 mb-1">Status</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="pt-4 border-t border-surface-border flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-surface hover:bg-aviation-50 text-aviation-950 rounded-lg text-xs font-semibold border border-surface-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-aviation hover:bg-aviation-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <Modal
          isOpen={Boolean(deletingStudent)}
          onClose={() => setDeletingStudent(null)}
          title="Delete Student Record"
          maxWidth="max-w-md"
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  Delete {deletingStudent.name} ({deletingStudent.register_number})?
                </p>
                <p className="mt-1 text-[11px]">
                  If this student has historical appointments, deletion will be blocked to maintain audit records (use Disable instead).
                </p>
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-3 py-1.5 bg-surface border border-surface-border rounded-lg text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                disabled={submitting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onSuccess={loadStudents}
      />
    </div>
  );
}

export default function CoordinatorStudentsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-400">Loading student roster...</div>}>
      <CoordinatorStudentsContent />
    </Suspense>
  );
}

