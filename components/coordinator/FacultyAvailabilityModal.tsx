'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Copy,
} from 'lucide-react';
import { Faculty, FacultyAvailability } from '@/types';
import { formatTime12Hour } from '@/lib/utils/slots';

interface FacultyAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  faculty: Faculty | null;
  onSaved?: () => void;
}

interface WindowDraft {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
}

const DAYS = [
  { day: 1, name: 'Monday' },
  { day: 2, name: 'Tuesday' },
  { day: 3, name: 'Wednesday' },
  { day: 4, name: 'Thursday' },
  { day: 5, name: 'Friday' },
  { day: 6, name: 'Saturday' },
  { day: 0, name: 'Sunday' },
];

const DURATION_OPTIONS = [15, 30, 45, 60];

export function FacultyAvailabilityModal({
  isOpen,
  onClose,
  faculty,
  onSaved,
}: FacultyAvailabilityModalProps) {
  const [windowsByDay, setWindowsByDay] = useState<{ [day: number]: WindowDraft[] }>({
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch current availability on modal open
  useEffect(() => {
    if (!isOpen || !faculty) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    async function fetchAvailability() {
      try {
        setLoading(true);
        const res = await fetch(`/api/coordinator/faculty/availability?faculty_id=${faculty?.id}`);
        const data = await res.json();

        const initialMap: { [day: number]: WindowDraft[] } = {
          0: [],
          1: [],
          2: [],
          3: [],
          4: [],
          5: [],
          6: [],
        };

        if (data.availability && Array.isArray(data.availability)) {
          data.availability.forEach((rec: FacultyAvailability) => {
            const dow = rec.day_of_week;
            if (initialMap[dow]) {
              initialMap[dow].push({
                id: rec.id,
                day_of_week: rec.day_of_week,
                start_time: rec.start_time.substring(0, 5),
                end_time: rec.end_time.substring(0, 5),
                slot_duration_minutes: rec.slot_duration_minutes || 30,
                is_active: rec.is_active !== false,
              });
            }
          });
        }

        setWindowsByDay(initialMap);
      } catch (err: any) {
        setErrorMessage('Failed to load faculty availability.');
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [isOpen, faculty]);

  const handleAddWindow = (day: number) => {
    setWindowsByDay((prev) => {
      const existing = prev[day] || [];
      // Default to 09:00–12:00 or after the last window
      let defaultStart = '09:00';
      let defaultEnd = '12:00';

      if (existing.length > 0) {
        const lastWin = existing[existing.length - 1];
        if (lastWin.end_time < '17:00') {
          defaultStart = lastWin.end_time >= '13:00' ? lastWin.end_time : '14:00';
          defaultEnd = '17:00';
        }
      }

      return {
        ...prev,
        [day]: [
          ...existing,
          {
            day_of_week: day,
            start_time: defaultStart,
            end_time: defaultEnd,
            slot_duration_minutes: 30,
            is_active: true,
          },
        ],
      };
    });
  };

  const handleUpdateWindow = (
    day: number,
    index: number,
    field: keyof WindowDraft,
    value: any
  ) => {
    setWindowsByDay((prev) => {
      const dayList = [...(prev[day] || [])];
      dayList[index] = { ...dayList[index], [field]: value };
      return { ...prev, [day]: dayList };
    });
  };

  const handleDeleteWindow = (day: number, index: number) => {
    setWindowsByDay((prev) => {
      const dayList = prev[day].filter((_, i) => i !== index);
      return { ...prev, [day]: dayList };
    });
  };

  // Convenience action: Copy Monday windows to all other weekdays (Tue - Fri)
  const handleCopyMondayToWeekdays = () => {
    const mondayWindows = windowsByDay[1] || [];
    if (mondayWindows.length === 0) {
      setErrorMessage('Configure Monday windows first before copying to weekdays.');
      return;
    }
    setWindowsByDay((prev) => {
      const updated = { ...prev };
      [2, 3, 4, 5].forEach((d) => {
        updated[d] = mondayWindows.map((w) => ({
          ...w,
          day_of_week: d,
          id: undefined,
        }));
      });
      return updated;
    });
    setSuccessMessage('Copied Monday schedule to Tuesday through Friday.');
  };

  const handleSaveAvailability = async () => {
    if (!faculty) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    // Flatten all windows and validate
    const allWindows: WindowDraft[] = [];
    for (const d of DAYS) {
      const dayWindows = windowsByDay[d.day] || [];
      for (let i = 0; i < dayWindows.length; i++) {
        const w = dayWindows[i];
        if (!w.start_time || !w.end_time) {
          setErrorMessage(`${d.name}: Please enter both start and end times.`);
          return;
        }
        if (w.start_time >= w.end_time) {
          setErrorMessage(
            `${d.name}: Start time (${w.start_time}) must be earlier than end time (${w.end_time}).`
          );
          return;
        }
        allWindows.push(w);
      }
    }

    try {
      setSaving(true);
      const res = await fetch('/api/coordinator/faculty/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faculty_id: faculty.id,
          availability: allWindows,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to save faculty availability.');
        return;
      }

      setSuccessMessage('Faculty availability saved successfully.');
      if (onSaved) onSaved();

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with server.');
    } finally {
      setSaving(false);
    }
  };

  if (!faculty) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Availability — ${faculty.name}`}
      subtitle={`${faculty.designation} • Department of Aviation`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 text-xs">
        {/* Banner */}
        <div className="p-3 bg-surface rounded-xl border border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-aviation-700" />
            <span className="text-gray-600 font-medium">
              Public booking slots are generated strictly from configured active windows.
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyMondayToWeekdays}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-aviation-900 bg-white border border-surface-border rounded-lg hover:bg-surface transition-colors shadow-2xs"
            title="Copy Monday's windows to Tue, Wed, Thu, Fri"
          >
            <Copy className="w-3.5 h-3.5 text-aviation-600" />
            Copy Mon to Weekdays
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-aviation" />
            <span>Loading configured availability...</span>
          </div>
        ) : (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            {DAYS.map((d) => {
              const windows = windowsByDay[d.day] || [];
              const hasWindows = windows.length > 0;

              return (
                <div
                  key={d.day}
                  className="p-3.5 rounded-xl border border-surface-border bg-white shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-aviation-950">
                        {d.name}
                      </span>
                      {hasWindows ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-100">
                          {windows.length} {windows.length === 1 ? 'window' : 'windows'}
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">
                          No availability (Closed)
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddWindow(d.day)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-aviation-800 bg-surface border border-surface-border rounded-lg hover:bg-aviation-50 hover:text-aviation-950 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-aviation-600" />
                      Add Time Window
                    </button>
                  </div>

                  {/* Windows List */}
                  {hasWindows && (
                    <div className="space-y-2 mt-2">
                      {windows.map((win, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg border flex flex-wrap items-center justify-between gap-2.5 transition-colors ${
                            win.is_active
                              ? 'bg-surface border-surface-border'
                              : 'bg-gray-50 border-gray-200 opacity-60'
                          }`}
                        >
                          {/* Time Inputs */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">
                                From
                              </label>
                              <input
                                type="time"
                                value={win.start_time}
                                onChange={(e) =>
                                  handleUpdateWindow(d.day, idx, 'start_time', e.target.value)
                                }
                                className="px-2 py-1 bg-white border border-surface-border rounded-md text-xs font-semibold text-aviation-950 focus:outline-none focus:ring-1 focus:ring-aviation"
                              />
                            </div>
                            <span className="text-gray-400 font-bold">→</span>
                            <div className="flex items-center gap-1.5">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">
                                To
                              </label>
                              <input
                                type="time"
                                value={win.end_time}
                                onChange={(e) =>
                                  handleUpdateWindow(d.day, idx, 'end_time', e.target.value)
                                }
                                className="px-2 py-1 bg-white border border-surface-border rounded-md text-xs font-semibold text-aviation-950 focus:outline-none focus:ring-1 focus:ring-aviation"
                              />
                            </div>
                          </div>

                          {/* Duration & Actions */}
                          <div className="flex items-center gap-2.5 ml-auto">
                            <div className="flex items-center gap-1.5">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">
                                Slot:
                              </label>
                              <select
                                value={win.slot_duration_minutes}
                                onChange={(e) =>
                                  handleUpdateWindow(
                                    d.day,
                                    idx,
                                    'slot_duration_minutes',
                                    Number(e.target.value)
                                  )
                                }
                                className="px-2 py-1 bg-white border border-surface-border rounded-md text-xs font-semibold text-aviation-950 focus:outline-none focus:ring-1 focus:ring-aviation"
                              >
                                {DURATION_OPTIONS.map((dur) => (
                                  <option key={dur} value={dur}>
                                    {dur} min
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Active Toggle */}
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateWindow(d.day, idx, 'is_active', !win.is_active)
                              }
                              className={`p-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                                win.is_active
                                  ? 'text-emerald-700 hover:bg-emerald-50'
                                  : 'text-gray-400 hover:bg-gray-200'
                              }`}
                              title={win.is_active ? 'Active window' : 'Inactive window'}
                            >
                              {win.is_active ? (
                                <span className="flex items-center gap-1 text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Active
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                  Paused
                                </span>
                              )}
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteWindow(d.day, idx)}
                              className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete this time window"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-surface-border text-xs font-semibold text-gray-700 hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAvailability}
            disabled={saving || loading}
            className="px-5 py-2 rounded-lg bg-aviation text-white text-xs font-semibold hover:bg-aviation-900 transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              'SAVE AVAILABILITY'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
