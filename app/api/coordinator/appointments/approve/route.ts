import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { verifyCoordinatorSession } from '@/lib/auth/require-coordinator';
import { isValidUUID } from '@/lib/utils/validation';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: NextRequest) {
  const authCheck = await verifyCoordinatorSession();
  if (!authCheck.authorized) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status || 401 }
    );
  }

  try {
    const body = await request.json();
    const { appointment_id } = body;

    if (!appointment_id || !isValidUUID(appointment_id)) {
      return NextResponse.json(
        { error: 'Valid appointment_id UUID is required' },
        { status: 400 }
      );
    }

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    // 1. Try secure atomic approval RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'approve_appointment_atomic',
      { p_appointment_id: appointment_id }
    );

    if (!rpcError && rpcData?.success) {
      // Log Audit Event
      await logAuditEvent(supabase, {
        actor_user_id: authCheck.user?.id,
        action: 'APPOINTMENT_APPROVED',
        entity_type: 'APPOINTMENT',
        entity_id: appointment_id,
        metadata: {
          appointment_id: rpcData.appointment_id,
          previous_status: 'PENDING',
          new_status: 'CONFIRMED',
        },
      });

      return NextResponse.json({
        success: true,
        message: rpcData.message || 'Appointment approved successfully.',
        appointment_id: rpcData.appointment_id,
      });
    }

    if (rpcError) {
      const msg = rpcError.message || '';
      if (msg.includes('SLOT_CONFLICT') || msg.includes('ALREADY_APPROVED') || msg.includes('CANNOT_APPROVE')) {
        return NextResponse.json({ error: msg }, { status: 409 });
      }

      const isFunctionNotFound =
        rpcError.code === 'PGRST202' ||
        rpcError.code === '42883' ||
        (msg.toLowerCase().includes('function') && msg.toLowerCase().includes('does not exist'));

      if (!isFunctionNotFound) {
        return NextResponse.json({ error: msg }, { status: 500 });
      }
      // Fall through to server-side transaction fallback
    }

    // 2. Server-side transaction fallback (if RPC not yet present)
    const { data: apt, error: fetchErr } = await supabase
      .from('appointments')
      .select('id, appointment_id, faculty_id, date, start_time, end_time, status')
      .eq('id', appointment_id)
      .single();

    if (fetchErr || !apt) {
      return NextResponse.json({ error: 'Appointment record not found' }, { status: 404 });
    }

    if (apt.status === 'CONFIRMED') {
      return NextResponse.json({ success: true, message: 'Appointment is already confirmed' });
    }

    if (apt.status === 'CANCELLED' || apt.status === 'DECLINED') {
      return NextResponse.json(
        { error: `Cannot approve an appointment with status: ${apt.status}` },
        { status: 400 }
      );
    }

    // Check for conflicting confirmed appointments
    const { data: conflicts } = await supabase
      .from('appointments')
      .select('id')
      .eq('faculty_id', apt.faculty_id)
      .eq('date', apt.date)
      .eq('status', 'CONFIRMED')
      .neq('id', apt.id)
      .lt('start_time', apt.end_time)
      .gt('end_time', apt.start_time);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Cannot approve: this slot conflicts with another confirmed appointment.' },
        { status: 409 }
      );
    }

    const { error: updateErr } = await supabase
      .from('appointments')
      .update({ status: 'CONFIRMED', updated_at: new Date().toISOString() })
      .eq('id', appointment_id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Mark notification read
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('appointment_id', appointment_id);

    await logAuditEvent(supabase, {
      actor_user_id: authCheck.user?.id,
      action: 'APPOINTMENT_APPROVED',
      entity_type: 'APPOINTMENT',
      entity_id: appointment_id,
      metadata: {
        appointment_id: apt.appointment_id,
        new_status: 'CONFIRMED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Appointment confirmed successfully.',
      appointment_id: apt.appointment_id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error processing appointment approval' },
      { status: 500 }
    );
  }
}
