import { SupabaseClient } from '@supabase/supabase-js';
import { timeToMinutes } from '@/lib/utils/slots';

export interface ConflictCheckResult {
  hasConflict: boolean;
  type?: 'FACULTY' | 'STUDENT';
  conflictingAppointment?: {
    id: string;
    appointment_id: string;
    start_time: string;
    end_time: string;
    date: string;
    student_name?: string;
    faculty_name?: string;
    reason?: string;
  };
  message?: string;
}

export async function checkAppointmentConflict(
  supabase: SupabaseClient,
  params: {
    faculty_id: string;
    date: string;
    start_time: string;
    end_time: string;
    student_id?: string;
    excludeAppointmentId?: string;
  }
): Promise<ConflictCheckResult> {
  const reqStart = timeToMinutes(params.start_time);
  const reqEnd = timeToMinutes(params.end_time);

  // 1. Check Faculty Conflict
  let facultyQuery = supabase
    .from('appointments')
    .select(`
      id,
      appointment_id,
      date,
      start_time,
      end_time,
      reason,
      status,
      student:students(name, register_number),
      faculty:faculty(name)
    `)
    .eq('faculty_id', params.faculty_id)
    .eq('date', params.date)
    .not('status', 'in', '("CANCELLED","DECLINED")');

  if (params.excludeAppointmentId) {
    facultyQuery = facultyQuery.neq('id', params.excludeAppointmentId);
  }

  const { data: facultyAppointments, error: facErr } = await facultyQuery;
  if (!facErr && facultyAppointments) {
    for (const apt of facultyAppointments) {
      const aptStart = timeToMinutes(apt.start_time);
      const aptEnd = timeToMinutes(apt.end_time);

      // Overlap condition
      if (reqStart < aptEnd && reqEnd > aptStart) {
        return {
          hasConflict: true,
          type: 'FACULTY',
          conflictingAppointment: {
            id: apt.id,
            appointment_id: apt.appointment_id,
            start_time: apt.start_time,
            end_time: apt.end_time,
            date: apt.date,
            student_name: (apt.student as any)?.name || 'Student',
            faculty_name: (apt.faculty as any)?.name || 'Faculty',
            reason: apt.reason,
          },
          message: `Faculty member is already booked from ${apt.start_time.slice(0, 5)} to ${apt.end_time.slice(0, 5)} (${apt.appointment_id}).`,
        };
      }
    }
  }

  // 2. Check Student Conflict (if student_id provided)
  if (params.student_id) {
    let studentQuery = supabase
      .from('appointments')
      .select(`
        id,
        appointment_id,
        date,
        start_time,
        end_time,
        reason,
        status,
        faculty:faculty(name)
      `)
      .eq('student_id', params.student_id)
      .eq('date', params.date)
      .not('status', 'in', '("CANCELLED","DECLINED")');

    if (params.excludeAppointmentId) {
      studentQuery = studentQuery.neq('id', params.excludeAppointmentId);
    }

    const { data: studentAppointments, error: stuErr } = await studentQuery;
    if (!stuErr && studentAppointments) {
      for (const apt of studentAppointments) {
        const aptStart = timeToMinutes(apt.start_time);
        const aptEnd = timeToMinutes(apt.end_time);

        if (reqStart < aptEnd && reqEnd > aptStart) {
          return {
            hasConflict: true,
            type: 'STUDENT',
            conflictingAppointment: {
              id: apt.id,
              appointment_id: apt.appointment_id,
              start_time: apt.start_time,
              end_time: apt.end_time,
              date: apt.date,
              faculty_name: (apt.faculty as any)?.name || 'Faculty',
              reason: apt.reason,
            },
            message: `Student already has an overlapping appointment with ${(apt.faculty as any)?.name || 'Faculty'} from ${apt.start_time.slice(0, 5)} to ${apt.end_time.slice(0, 5)}.`,
          };
        }
      }
    }
  }

  return { hasConflict: false };
}
