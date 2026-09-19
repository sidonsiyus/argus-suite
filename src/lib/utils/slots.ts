import { WorkingHours, WorkingHoursDay } from '@/types';

// Convert "HH:MM" or "HH:MM:SS" to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convert minutes from midnight to "HH:MM"
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Format "HH:MM" into "hh:mm a" (e.g. "09:00 AM", "02:30 PM")
export function formatTime12Hour(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function getDayOfWeekName(dateStr: string): keyof WorkingHours {
  // Parse date string (YYYY-MM-DD) carefully to avoid UTC shifting
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const days: (keyof WorkingHours)[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return days[date.getDay()];
}

export interface ExistingSlot {
  start_time: string;
  end_time: string;
  status?: string;
}

export function generateAvailableSlots(
  dateStr: string,
  workingHours: WorkingHours,
  durationMinutes: number,
  existingAppointments: ExistingSlot[],
  isPublicBooking: boolean = true
): { time: string; display: string; endTime: string }[] {
  const dayKey = getDayOfWeekName(dateStr);
  const dayConfig: WorkingHoursDay = workingHours[dayKey];

  if (!dayConfig || dayConfig.closed) {
    return [];
  }

  const dayStartMinutes = timeToMinutes(dayConfig.start);
  const dayEndMinutes = timeToMinutes(dayConfig.end);

  const activeBookings = existingAppointments.filter(
    (apt) => !apt.status || (apt.status !== 'CANCELLED' && apt.status !== 'DECLINED')
  );

  const slots: { time: string; display: string; endTime: string }[] = [];

  // Determine current time cutoff if date is today
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = dateStr === todayStr;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (
    let start = dayStartMinutes;
    start + durationMinutes <= dayEndMinutes;
    start += durationMinutes
  ) {
    const end = start + durationMinutes;

    // Filter out past slots for public bookings on current day
    if (isPublicBooking && isToday && start <= currentMinutes + 15) {
      continue;
    }

    // Check collision with existing appointments
    const hasCollision = activeBookings.some((apt) => {
      const aptStart = timeToMinutes(apt.start_time);
      const aptEnd = timeToMinutes(apt.end_time);
      // Overlap condition: start < aptEnd && end > aptStart
      return start < aptEnd && end > aptStart;
    });

    if (!hasCollision) {
      const startTimeStr = minutesToTime(start);
      const endTimeStr = minutesToTime(end);
      slots.push({
        time: startTimeStr,
        endTime: endTimeStr,
        display: `${formatTime12Hour(startTimeStr)} – ${formatTime12Hour(endTimeStr)}`,
      });
    }
  }

  return slots;
}
