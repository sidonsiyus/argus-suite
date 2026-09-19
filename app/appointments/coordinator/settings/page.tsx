'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Clock,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Header } from '@/components/coordinator/Header';
import { WorkingHours, PortalSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/settings';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SetupRequired } from '@/components/ui/SetupRequired';

const DAYS_OF_WEEK: { key: keyof WorkingHours; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export default function CoordinatorSettingsPage() {
  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    DEFAULT_SETTINGS.working_hours
  );
  const [appointmentDuration, setAppointmentDuration] = useState<number>(
    DEFAULT_SETTINGS.appointment_duration
  );
  const [portalInfo, setPortalInfo] = useState(DEFAULT_SETTINGS.portal_info);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/coordinator/settings');
        const data = await res.json();
        if (data.settings) {
          setWorkingHours(data.settings.working_hours);
          setAppointmentDuration(data.settings.appointment_duration);
          setPortalInfo(data.settings.portal_info);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleWorkingHourChange = (
    day: keyof WorkingHours,
    field: 'start' | 'end' | 'closed',
    value: any
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      setSaving(true);
      const res = await fetch('/api/coordinator/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          working_hours: workingHours,
          appointment_duration: appointmentDuration,
          portal_info: portalInfo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to save settings.');
        return;
      }

      setSuccessMessage('Scheduling settings updated successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (!isSupabaseConfigured()) {
    return <SetupRequired title="Settings — Database Setup Required" />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Portal &amp; Scheduling Settings"
        subtitle="Department of Aviation — Operating Hours &amp; Slot Parameters"
      />

      <main className="p-6 space-y-6 flex-1 max-w-4xl w-full mx-auto">
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Section 1: Working Hours */}
          <section className="bg-white rounded-xl border border-surface-border shadow-2xs p-6">
            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-surface-border">
              <Clock className="w-5 h-5 text-aviation-700" />
              <div>
                <h3 className="text-sm font-bold text-aviation-950">
                  Authorized Outside-Class Scheduling Hours
                </h3>
                <p className="text-[11px] text-gray-500">
                  Public students will only see available slots generated inside these hours. (Coordinator can schedule outside hours at any time).
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center text-xs text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              <div className="divide-y divide-surface-border text-xs">
                {DAYS_OF_WEEK.map(({ key, label }) => {
                  const day = workingHours[key] || {
                    start: '08:30',
                    end: '16:30',
                    closed: false,
                  };
                  return (
                    <div
                      key={key}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="w-32 font-bold text-aviation-950">{label}</div>

                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-gray-600">
                          <input
                            type="checkbox"
                            checked={day.closed}
                            onChange={(e) =>
                              handleWorkingHourChange(key, 'closed', e.target.checked)
                            }
                            className="rounded border-gray-300 text-aviation focus:ring-aviation"
                          />
                          <span>Closed</span>
                        </label>

                        {!day.closed ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={day.start}
                              onChange={(e) =>
                                handleWorkingHourChange(key, 'start', e.target.value)
                              }
                              className="px-2.5 py-1.5 bg-surface border border-surface-border rounded-lg text-xs"
                            />
                            <span className="text-gray-400">to</span>
                            <input
                              type="time"
                              value={day.end}
                              onChange={(e) =>
                                handleWorkingHourChange(key, 'end', e.target.value)
                              }
                              className="px-2.5 py-1.5 bg-surface border border-surface-border rounded-lg text-xs"
                            />
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">
                            Department closed for student bookings
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 2: Appointment Duration */}
          <section className="bg-white rounded-xl border border-surface-border shadow-2xs p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
              <Calendar className="w-5 h-5 text-aviation-700" />
              <div>
                <h3 className="text-sm font-bold text-aviation-950">
                  Default Appointment Duration
                </h3>
                <p className="text-[11px] text-gray-500">
                  Length of each scheduled student interaction slot
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[15, 30, 45, 60].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setAppointmentDuration(dur)}
                  className={`p-3 rounded-xl border text-center transition-all text-xs font-semibold ${
                    appointmentDuration === dur
                      ? 'bg-aviation text-white border-aviation shadow-xs'
                      : 'bg-surface hover:bg-surface-muted border-surface-border text-aviation-950'
                  }`}
                >
                  {dur} Minutes
                </button>
              ))}
            </div>
          </section>

          {/* Section 3: Portal Info */}
          <section className="bg-white rounded-xl border border-surface-border shadow-2xs p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
              <ShieldCheck className="w-5 h-5 text-aviation-700" />
              <div>
                <h3 className="text-sm font-bold text-aviation-950">
                  Institutional Portal Identity
                </h3>
                <p className="text-[11px] text-gray-500">
                  Public student booking header and instructions
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-aviation-950 mb-1">
                  Portal Header Title
                </label>
                <input
                  type="text"
                  value={portalInfo.name}
                  onChange={(e) =>
                    setPortalInfo((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-aviation-950 mb-1">
                  Booking Page Instructions
                </label>
                <textarea
                  rows={3}
                  value={portalInfo.instructions}
                  onChange={(e) =>
                    setPortalInfo((prev) => ({ ...prev, instructions: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg"
                />
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-aviation hover:bg-aviation-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Portal Settings
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
