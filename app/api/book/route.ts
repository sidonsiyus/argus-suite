import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { checkAppointmentConflict } from '@/lib/appointments/conflict';
import { generateAppointmentId, formatSimpleAppointmentId } from '@/lib/utils/appointment-id';
import {
  generateSimpleTrackingCode,
  generateInternalTokenHash,
} from '@/lib/utils/tracking-token';
import { findStudentByRegisterNumber } from '@/lib/students/student-directory';
import {
  isValidUUID,
  isValidDateStr,
  isValidTimeStr,
  isValidEmail,
  isValidRegisterNumber,
  sanitizeText,
} from '@/lib/utils/validation';

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database is not configured yet. Please contact the Coordinator.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const {
      register_number,
      name,
      programme,
      year,
      section,
      email,
      phone,
      faculty_id,
      date,
      start_time,
      end_time,
      reason,
      notes,
    } = body;

    // Required fields validation
    if (
      !register_number ||
      !name ||
      !programme ||
      !year ||
      !section ||
      !faculty_id ||
      !date ||
      !start_time ||
      !end_time ||
      !reason
    ) {
      return NextResponse.json(
        { error: 'Missing required fields. Please fill in all necessary details.' },
        { status: 400 }
      );
    }

    // Strict schema and format validation
    if (!isValidRegisterNumber(register_number)) {
      return NextResponse.json(
        { error: 'Invalid Register Number format (alphanumeric, 2-30 characters).' },
        { status: 400 }
      );
    }

    if (!isValidUUID(faculty_id)) {
      return NextResponse.json(
        { error: 'Invalid Faculty ID specified.' },
        { status: 400 }
      );
    }

    if (!isValidDateStr(date)) {
      return NextResponse.json(
        { error: 'Invalid appointment date format (YYYY-MM-DD).' },
        { status: 400 }
      );
    }

    if (!isValidTimeStr(start_time) || !isValidTimeStr(end_time)) {
      return NextResponse.json(
        { error: 'Invalid time format (HH:MM).' },
        { status: 400 }
      );
    }

    if (start_time >= end_time) {
      return NextResponse.json(
        { error: 'Appointment end time must be after start time.' },
        { status: 400 }
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    // Validate that appointment date is not in the past
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      return NextResponse.json(
        { error: 'Cannot schedule appointments for past dates.' },
        { status: 400 }
      );
    }

    const cleanReason = sanitizeText(reason, 500);
    const cleanNotes = notes ? sanitizeText(notes, 1000) : null;

    const supabase = createClient();
    const normalizedReg = register_number.trim().toUpperCase();

    // Generate human-friendly 6-character alphanumeric tracking code (AVN-XXXXXX) with collision check
    let trackingCode = '';
    let tokenHash = '';
    const adminOrAnon = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : supabase;

    const MAX_RETRIES = 10;
    for (let i = 0; i < MAX_RETRIES; i++) {
      const candidate = generateSimpleTrackingCode();
      try {
        const { data: existing } = await adminOrAnon
          .from('appointments')
          .select('id')
          .eq('tracking_code', candidate)
          .maybeSingle();

        if (!existing) {
          trackingCode = candidate;
          tokenHash = generateInternalTokenHash();
          break;
        }
      } catch {
        // Table or column may not exist yet; candidate is safe
        trackingCode = candidate;
        tokenHash = generateInternalTokenHash();
        break;
      }
    }

    if (!trackingCode) {
      trackingCode = generateSimpleTrackingCode();
      tokenHash = generateInternalTokenHash();
    }

    // Try calling atomic RPC function (with pg_advisory_xact_lock concurrency serialization)
    const { data: rpcData, error: rpcError } = await supabase.rpc('book_appointment_atomic', {
      p_register_number: normalizedReg,
      p_name: sanitizeText(name, 100),
      p_programme: sanitizeText(programme, 100),
      p_year: sanitizeText(year, 10),
      p_section: sanitizeText(section, 10),
      p_email: email ? sanitizeText(email, 100) : null,
      p_phone: phone ? sanitizeText(phone, 25) : null,
      p_faculty_id: faculty_id,
      p_date: date,
      p_start_time: start_time,
      p_end_time: end_time,
      p_reason: cleanReason,
      p_notes: cleanNotes,
      p_is_coordinator_override: false,
      p_tracking_code: trackingCode,
      p_tracking_token_hash: tokenHash,
    });

    if (!rpcError && rpcData?.success) {
      return NextResponse.json({
        success: true,
        appointment: {
          ...rpcData.appointment,
          tracking_code: rpcData.appointment?.tracking_code || trackingCode,
        },
      });
    }

    if (rpcError) {
      const msg = rpcError.message || '';
      if (msg.includes('no longer available') || msg.includes('already have an appointment')) {
        return NextResponse.json({ error: msg }, { status: 409 });
      }
      if (
        msg.includes('FACULTY_NOT_AVAILABLE') ||
        msg.includes('outside the faculty member') ||
        msg.includes('outside faculty availability')
      ) {
        return NextResponse.json(
          { error: 'This time slot is outside the faculty member’s configured availability.' },
          { status: 400 }
        );
      }
      if (msg.includes('past dates') || msg.includes('unavailable') || msg.includes('End time must be after')) {
        return NextResponse.json({ error: msg }, { status: 400 });
      }

      const isFunctionNotFound =
        rpcError.code === 'PGRST202' ||
        rpcError.code === '42883' ||
        (msg.toLowerCase().includes('function') && msg.toLowerCase().includes('does not exist'));

      if (!isFunctionNotFound) {
        return NextResponse.json({ error: msg }, { status: 500 });
      }
      // If RPC is not present on database, fall through to application-level transactional flow
    }

    // 1. Verify Faculty exists and is ACTIVE
    const { data: faculty, error: facErr } = await supabase
      .from('faculty')
      .select('id, name, designation, status')
      .eq('id', faculty_id)
      .eq('status', 'ACTIVE')
      .single();

    if (facErr || !faculty) {
      return NextResponse.json(
        { error: 'Selected faculty member is not active or unavailable for booking.' },
        { status: 400 }
      );
    }

    // 1b. Verify Faculty Availability Window in application fallback
    const [yr, mo, dy] = date.split('-').map(Number);
    const dayOfWeekNum = new Date(yr, mo - 1, dy).getDay();
    const { data: availCheck } = await supabase
      .from('faculty_availability')
      .select('start_time, end_time')
      .eq('faculty_id', faculty_id)
      .eq('day_of_week', dayOfWeekNum)
      .eq('is_active', true);

    if (availCheck && availCheck.length > 0) {
      const fitsWindow = availCheck.some((w: any) => {
        const wStart = w.start_time.substring(0, 5);
        const wEnd = w.end_time.substring(0, 5);
        return wStart <= start_time && wEnd >= end_time;
      });

      if (!fitsWindow) {
        return NextResponse.json(
          { error: 'This time slot is outside the faculty member’s configured availability.' },
          { status: 400 }
        );
      }
    }


    // 2. Find or Create Student Record Server-Side
    let studentId: string;

    const existingStudent = await findStudentByRegisterNumber(normalizedReg);

    if (existingStudent) {
      studentId = existingStudent.id;
    } else {
      // Auto-create new student with source = 'BOOKING' and status = 'ACTIVE'
      const { data: newStudent, error: createStuErr } = await supabase
        .from('students')
        .insert({
          register_number: normalizedReg,
          name: name.trim(),
          programme: programme.trim(),
          year: year.trim(),
          section: section.trim(),
          email: email?.trim() || null,
          phone: phone?.trim() || null,
          status: 'ACTIVE',
          source: 'BOOKING',
        })
        .select('id')
        .single();

      if (createStuErr) {
        // In case of a concurrent insertion with identical register_number
        if (createStuErr.code === '23505') {
          const { data: retriedStudent } = await supabase
            .from('students')
            .select('id')
            .ilike('register_number', normalizedReg)
            .single();
          if (retriedStudent) {
            studentId = retriedStudent.id;
          } else {
            return NextResponse.json(
              { error: 'Failed to process student registration.' },
              { status: 500 }
            );
          }
        } else {
          return NextResponse.json(
            { error: `Failed to create student profile: ${createStuErr.message}` },
            { status: 500 }
          );
        }
      } else {
        studentId = newStudent.id;
      }
    }

    // 3. Strict Server-Side Conflict Detection
    const conflictResult = await checkAppointmentConflict(supabase, {
      faculty_id,
      date,
      start_time,
      end_time,
      student_id: studentId,
    });

    if (conflictResult.hasConflict) {
      return NextResponse.json(
        {
          error:
            conflictResult.type === 'STUDENT'
              ? 'You already have an appointment scheduled at this time. Please choose another slot.'
              : 'This appointment slot is no longer available. Please select another time.',
          conflictingAppointment: conflictResult.conflictingAppointment,
        },
        { status: 409 }
      );
    }

    // 4. Generate Simple Sequential Human-Readable Appointment ID (APT-001)
    const { data: existingApts } = await supabase
      .from('appointments')
      .select('appointment_id')
      .like('appointment_id', 'APT-%')
      .limit(100);

    let maxSeq = 0;
    if (existingApts) {
      for (const a of existingApts) {
        const match = a.appointment_id?.match(/^APT-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) maxSeq = num;
        }
      }
    }
    const appointmentId = formatSimpleAppointmentId(maxSeq + 1);

    // 5. Insert Appointment Record with status PENDING and tracking code
    const { data: appointment, error: aptInsertErr } = await supabase
      .from('appointments')
      .insert({
        appointment_id: appointmentId,
        student_id: studentId,
        faculty_id,
        date,
        start_time,
        end_time,
        reason: cleanReason,
        notes: cleanNotes,
        status: 'PENDING',
        source: 'ONLINE',
        tracking_code: trackingCode,
        tracking_token_hash: tokenHash,
      })
      .select('id, appointment_id, date, start_time, end_time, reason, notes, status, tracking_code')
      .single();

    if (aptInsertErr) {
      return NextResponse.json(
        { error: `Booking could not be finalized: ${aptInsertErr.message}` },
        { status: 500 }
      );
    }

    // Insert Coordinator Notification for Pending Request
    try {
      await supabase.from('notifications').insert({
        type: 'APPOINTMENT_REQUEST',
        title: 'New appointment request',
        message: `${name.trim()} requested an appointment with ${faculty.name} on ${date} at ${start_time}`,
        appointment_id: appointment.id,
        is_read: false,
      });
    } catch {
      // Non-blocking in fallback flow
    }

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        appointment_id: appointment.appointment_id,
        tracking_code: appointment.tracking_code || trackingCode,
        date: appointment.date,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        reason: appointment.reason,
        status: appointment.status,
        faculty_name: faculty.name,
        faculty_designation: faculty.designation,
        student_name: name.trim(),
        register_number: normalizedReg,
        programme: programme.trim(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error processing booking.' },
      { status: 500 }
    );
  }
}
