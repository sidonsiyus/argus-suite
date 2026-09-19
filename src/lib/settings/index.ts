import { PortalSettings, WorkingHours } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { start: '08:30', end: '16:30', closed: false },
  tuesday: { start: '08:30', end: '16:30', closed: false },
  wednesday: { start: '08:30', end: '16:30', closed: false },
  thursday: { start: '08:30', end: '16:30', closed: false },
  friday: { start: '08:30', end: '16:30', closed: false },
  saturday: { start: '08:30', end: '13:00', closed: false },
  sunday: { start: '08:30', end: '13:00', closed: true },
};

export const DEFAULT_SETTINGS: PortalSettings = {
  working_hours: DEFAULT_WORKING_HOURS,
  appointment_duration: 30,
  portal_info: {
    name: 'Department of Aviation — Faculty–Student Appointment Portal',
    instructions:
      'Use this portal to schedule an appointment with a faculty member outside regular class hours.',
  },
};

export async function getPortalSettings(supabase: SupabaseClient): Promise<PortalSettings> {
  try {
    const { data, error } = await supabase.from('settings').select('key, value');

    if (error || !data || data.length === 0) {
      return DEFAULT_SETTINGS;
    }

    const settingsMap: Record<string, any> = {};
    data.forEach((row) => {
      settingsMap[row.key] = row.value;
    });

    return {
      working_hours: settingsMap['working_hours'] || DEFAULT_WORKING_HOURS,
      appointment_duration: Number(settingsMap['appointment_duration']) || 30,
      portal_info: settingsMap['portal_info'] || DEFAULT_SETTINGS.portal_info,
    };
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}
