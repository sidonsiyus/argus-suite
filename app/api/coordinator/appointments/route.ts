import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { checkAppointmentConflict } from '@/lib/appointments/conflict';
import { generateAppointmentId } from '@/lib/utils/appointment-id';
import { verifyCoordinatorSession } from '@/lib/auth/require-coordinator';
import {
  isValidUUID,
  isValidDateStr,
  isValidTimeStr,
  sanitizeText,
} from '@/lib/utils/validation';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const authCheck = await verifyCoordinatorSession();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status || 401 });
  }

  const { searchParams } = new URL(request.url);
  const facultyId = searchParams.get('faculty_id');
  const status = searchParams.get('status');
  const source = searchParams.get('source');
  const date = searchParams.get('date');
  const search = searchParams.get('search')?.trim().toLowerCase();

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();
    let query = supabase
      .from('appointments')
      .select(`
        id,
        appointment_id,
        student_id,
        faculty_id,
        date,
        start_time,
        end_time,
        reason,
        notes,
        status,
        source,
        decline_reason,
        cancellation_reason,
        created_at,
        updated_at,
        student:students(id, register_number, name, programme, year, section, email, phone),
        faculty:faculty(id, name, employee_id, designation, email, phone, room, campus)
      `)
      .order('date', { ascending: false })
      .order('start_time', { ascending: true });

    if (facultyId && facultyId !== 'all') {
      if (!isValidUUID(facultyId)) {
        return NextResponse.json({ error: 'Invalid faculty ID filter' }, { status: 400 });
      }
      query = query.eq('faculty_id', facultyId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (source && source !== 'all') {
      query = query.eq('source', source);
    }
    if (date) {
      if (!isValidDateStr(date)) {
        return NextResponse.json({ error: 'Invalid date filter' }, { status: 400 });
      }
      query = query.eq('date', date);
    }

    const { data: appointments, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Perform search filtering if provided
    let results = appointments || [];
    if (search) {
      results = results.filter((apt: any) => {
        const aptIdMatch = apt.appointment_id?.toLowerCase().includes(search);
        const stuNameMatch = apt.student?.name?.toLowerCase().includes(search);
        const regMatch = apt.student?.register_number?.toLowerCase().includes(search);
        const facNameMatch = apt.faculty?.name?.toLowerCase().includes(search);
        const facIdMatch = apt.faculty?.employee_id?.toLowerCase().includes(search);
        const reasonMatch = apt.reason?.toLowerCase().includes(search);
        return (
          aptIdMatch ||
          stuNameMatch ||
          regMatch ||
          facNameMatch ||
          facIdMatch ||
          reasonMatch
        );
      });
    }

    return NextResponse.json({ appointments: results });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error fetching appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await verifyCoordinatorSession();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status || 401 });
  }

  try {
    const body = await request.json();
    const {
      student_id,
      faculty_id,
      date,
      start_time,
      end_time,
      reason,
      notes,
      status = 'SCHEDULED',
      override_conflict = false,
    } = body;

    if (!student_id || !faculty_id || !date || !start_time || !end_time || !reason) {
      return NextResponse.json(
        { error: 'All appointment fields are required.' },
        { status: 400 }
      );
    }

    if (!isValidUUID(student_id) || !isValidUUID(faculty_id)) {
      return NextResponse.json(
        { error: 'Invalid student ID or faculty ID.' },
        { status: 400 }
      );
    }

    if (!isValidDateStr(date)) {
      return NextResponse.json(
        { error: 'Invalid date format (YYYY-MM-DD).' },
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
        { error: 'End time must be after start time.' },
        { status: 400 }
      );
    }

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    // Check for conflict unless explicitly overridden
    if (!override_conflict) {
      const conflictCheck = await checkAppointmentConflict(supabase, {
        faculty_id,
        date,
        start_time,
        end_time,
        student_id,
      });

      if (conflictCheck.hasConflict) {
        return NextResponse.json(
          {
            conflict: true,
            message: 'Scheduling conflict detected.',
            conflictingAppointment: conflictCheck.conflictingAppointment,
          },
          { status: 409 }
        );
      }
    }

    // Sequence count for date
    const { count } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('date', date);

    const appointmentId = generateAppointmentId(date, (count || 0) + 1);

    const cleanReason = sanitizeText(reason, 500);
    const cleanNotes = notes ? sanitizeText(notes, 1000) : null;

    const { data: newAppointment, error } = await supabase
      .from('appointments')
      .insert({
        appointment_id: appointmentId,
        student_id,
        faculty_id,
        date,
        start_time,
        end_time,
        reason: cleanReason,
        notes: cleanNotes,
        status,
        source: 'ADMIN', // Coordinator manual appointments are always ADMIN
      })
      .select(`
        *,
        student:students(name, register_number, programme),
        faculty:faculty(name, designation)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log Audit Event
    await logAuditEvent(supabase, {
      actor_user_id: authCheck.user?.id,
      action: override_conflict ? 'APPOINTMENT_CREATE_OVERRIDDEN' : 'APPOINTMENT_CREATED',
      entity_type: 'APPOINTMENT',
      entity_id: newAppointment.id,
      metadata: {
        appointment_id: appointmentId,
        override_conflict: Boolean(override_conflict),
        status,
        date,
        start_time,
        end_time,
      },
    });

    return NextResponse.json({ appointment: newAppointment });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error creating appointment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authCheck = await verifyCoordinatorSession();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status || 401 });
  }

  try {
    const body = await request.json();
    const {
      id,
      student_id,
      faculty_id,
      date,
      start_time,
      end_time,
      reason,
      notes,
      status,
      decline_reason,
      cancellation_reason,
      override_conflict = false,
    } = body;

    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'Valid Appointment ID is required' }, { status: 400 });
    }

    if (student_id && !isValidUUID(student_id)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    if (faculty_id && !isValidUUID(faculty_id)) {
      return NextResponse.json({ error: 'Invalid faculty ID' }, { status: 400 });
    }

    if (date && !isValidDateStr(date)) {
      return NextResponse.json({ error: 'Invalid date format (YYYY-MM-DD)' }, { status: 400 });
    }

    if (start_time && !isValidTimeStr(start_time)) {
      return NextResponse.json({ error: 'Invalid start time format (HH:MM)' }, { status: 400 });
    }

    if (end_time && !isValidTimeStr(end_time)) {
      return NextResponse.json({ error: 'Invalid end time format (HH:MM)' }, { status: 400 });
    }

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    // If changing time or faculty or student, check conflict
    if (faculty_id && date && start_time && end_time && !override_conflict) {
      const conflictCheck = await checkAppointmentConflict(supabase, {
        faculty_id,
        date,
        start_time,
        end_time,
        student_id,
        excludeAppointmentId: id,
      });

      if (conflictCheck.hasConflict) {
        return NextResponse.json(
          {
            conflict: true,
            message: 'Scheduling conflict detected.',
            conflictingAppointment: conflictCheck.conflictingAppointment,
          },
          { status: 409 }
        );
      }
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (student_id) updatePayload.student_id = student_id;
    if (faculty_id) updatePayload.faculty_id = faculty_id;
    if (date) updatePayload.date = date;
    if (start_time) updatePayload.start_time = start_time;
    if (end_time) updatePayload.end_time = end_time;
    if (reason !== undefined) updatePayload.reason = sanitizeText(reason, 500);
    if (notes !== undefined) updatePayload.notes = notes ? sanitizeText(notes, 1000) : null;
    if (status) updatePayload.status = status;
    if (decline_reason !== undefined) updatePayload.decline_reason = decline_reason ? sanitizeText(decline_reason, 500) : null;
    if (cancellation_reason !== undefined) updatePayload.cancellation_reason = cancellation_reason ? sanitizeText(cancellation_reason, 500) : null;

    const { data: updated, error } = await supabase
      .from('appointments')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        student:students(name, register_number, programme),
        faculty:faculty(name, designation)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log Audit Event
    await logAuditEvent(supabase, {
      actor_user_id: authCheck.user?.id,
      action: status ? `APPOINTMENT_STATUS_${status}` : 'APPOINTMENT_UPDATED',
      entity_type: 'APPOINTMENT',
      entity_id: id,
      metadata: {
        appointment_id: updated.appointment_id,
        status: updated.status,
        decline_reason: updated.decline_reason,
        cancellation_reason: updated.cancellation_reason,
        date: updated.date,
        start_time: updated.start_time,
        end_time: updated.end_time,
      },
    });

    return NextResponse.json({ appointment: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error updating appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authCheck = await verifyCoordinatorSession();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status || 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id || !isValidUUID(id)) {
    return NextResponse.json({ error: 'Valid Appointment ID required' }, { status: 400 });
  }

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    // Fetch appointment before delete for audit logging
    const { data: aptToDelete } = await supabase
      .from('appointments')
      .select('appointment_id, date, start_time, end_time, student_id, faculty_id')
      .eq('id', id)
      .single();

    const { error } = await supabase.from('appointments').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log Audit Event
    await logAuditEvent(supabase, {
      actor_user_id: authCheck.user?.id,
      action: 'APPOINTMENT_DELETED',
      entity_type: 'APPOINTMENT',
      entity_id: id,
      metadata: {
        appointment_id: aptToDelete?.appointment_id,
        date: aptToDelete?.date,
        start_time: aptToDelete?.start_time,
        end_time: aptToDelete?.end_time,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error deleting appointment' },
      { status: 500 }
    );
  }
}
