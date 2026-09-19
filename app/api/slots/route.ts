import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getPortalSettings } from '@/lib/settings';
import {
  generateAvailableSlots,
  getDayOfWeekName,
  formatTime12Hour,
  timeToMinutes,
  minutesToTime,
} from '@/lib/utils/slots';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database is not configured yet.' },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const facultyId = searchParams.get('faculty_id');
  const date = searchParams.get('date');

  if (!facultyId || !date) {
    return NextResponse.json(
      { error: 'faculty_id and date parameters are required' },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient();

    // 1. Verify that Faculty is ACTIVE
    const { data: faculty, error: facErr } = await supabase
      .from('faculty')
      .select('id, name, designation, status')
      .eq('id', facultyId)
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (facErr || !faculty) {
      return NextResponse.json({
        slots: [],
        dayClosed: true,
        message: 'The selected faculty member is currently unavailable or inactive.',
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = date === todayStr;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // 2. Query secure RPC: get_faculty_available_slots
    // SECURITY DEFINER RPC evaluates coordinator-controlled faculty_availability
    // and eliminates booked appointments (status NOT IN ('CANCELLED', 'DECLINED'))
    const { data: rpcSlots, error: rpcError } = await supabase.rpc(
      'get_faculty_available_slots',
      {
        p_faculty_id: facultyId,
        p_date: date,
      }
    );

    if (!rpcError && rpcSlots) {
      // Filter past slots for current day
      const validSlots = rpcSlots.filter((s: any) => {
        if (isToday) {
          const startMin = timeToMinutes(s.start_time);
          return startMin > currentMinutes + 15;
        }
        return true;
      });

      const formatted = validSlots.map((s: any) => {
        const startStr = s.start_time.substring(0, 5);
        const endStr = s.end_time.substring(0, 5);
        return {
          start_time: startStr,
          end_time: endStr,
          time: startStr,
          endTime: endStr,
          display: `${formatTime12Hour(startStr)} – ${formatTime12Hour(endStr)}`,
          available: true,
        };
      });

      return NextResponse.json({
        slots: formatted,
        dayClosed: formatted.length === 0,
        message:
          formatted.length === 0
            ? 'No appointment times are available for this faculty on this date.'
            : undefined,
      });
    }

    // 3. Fallback if RPC is not yet deployed: query faculty_availability directly via server
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday

    const { data: availWindows, error: availErr } = await supabase
      .from('faculty_availability')
      .select('*')
      .eq('faculty_id', facultyId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .order('start_time', { ascending: true });

    if (!availErr && availWindows) {
      if (availWindows.length === 0) {
        return NextResponse.json({
          slots: [],
          dayClosed: true,
          message: 'No appointment times are available for this faculty on this date.',
        });
      }

      // Fetch booked slots
      const { data: bookedSlots } = await supabase.rpc(
        'get_faculty_booked_slots',
        {
          p_faculty_id: facultyId,
          p_date: date,
        }
      );

      const activeBookings = bookedSlots || [];
      const slots: any[] = [];

      for (const win of availWindows) {
        const startMin = timeToMinutes(win.start_time);
        const endMin = timeToMinutes(win.end_time);
        const duration = win.slot_duration_minutes || 30;

        for (let s = startMin; s + duration <= endMin; s += duration) {
          const e = s + duration;

          if (isToday && s <= currentMinutes + 15) {
            continue;
          }

          const hasConflict = activeBookings.some((apt: any) => {
            const aptStart = timeToMinutes(apt.start_time);
            const aptEnd = timeToMinutes(apt.end_time);
            return s < aptEnd && e > aptStart;
          });

          if (!hasConflict) {
            const startStr = minutesToTime(s);
            const endStr = minutesToTime(e);
            slots.push({
              start_time: startStr,
              end_time: endStr,
              time: startStr,
              endTime: endStr,
              display: `${formatTime12Hour(startStr)} – ${formatTime12Hour(endStr)}`,
              available: true,
            });
          }
        }
      }

      return NextResponse.json({
        slots,
        dayClosed: slots.length === 0,
        message:
          slots.length === 0
            ? 'No appointment times are available for this faculty on this date.'
            : undefined,
      });
    }

    // 4. Default Legacy Settings Fallback (if faculty_availability table is not yet created)
    const settings = await getPortalSettings(supabase);
    const dayName = getDayOfWeekName(date);
    const dayConfig = settings.working_hours[dayName];

    if (!dayConfig || dayConfig.closed) {
      return NextResponse.json({
        slots: [],
        dayClosed: true,
        message: 'The Department of Aviation is closed for appointments on this day.',
      });
    }

    const { data: bookedSlots } = await supabase.rpc(
      'get_faculty_booked_slots',
      {
        p_faculty_id: facultyId,
        p_date: date,
      }
    );

    const legacySlots = generateAvailableSlots(
      date,
      settings.working_hours,
      settings.appointment_duration,
      bookedSlots || [],
      true
    );

    return NextResponse.json({
      slots: legacySlots.map((s) => ({
        ...s,
        start_time: s.time,
        end_time: s.endTime,
        available: true,
      })),
      dayClosed: false,
      duration: settings.appointment_duration,
      workingHours: `${dayConfig.start} – ${dayConfig.end}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error generating slots' },
      { status: 500 }
    );
  }
}

