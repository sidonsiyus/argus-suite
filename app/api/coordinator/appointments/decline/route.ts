import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { verifyCoordinatorSession } from '@/lib/auth/require-coordinator';
import { isValidUUID, sanitizeText } from '@/lib/utils/validation';
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
    const { appointment_id, reason } = body;

    if (!appointment_id || !isValidUUID(appointment_id)) {
      return NextResponse.json(
        { error: 'Valid appointment_id UUID is required' },
        { status: 400 }
      );
    }

    const cleanReason = reason ? sanitizeText(reason, 500) : null;
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    // 1. Try secure atomic decline RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'decline_appointment_atomic',
      {
        p_appointment_id: appointment_id,
        p_reason: cleanReason,
      }
    );

    if (!rpcError && rpcData?.success) {
      await logAuditEvent(supabase, {
        actor_user_id: authCheck.user?.id,
        action: 'APPOINTMENT_DECLINED',
        entity_type: 'APPOINTMENT',
        entity_id: appointment_id,
        metadata: {
          appointment_id: rpcData.appointment_id,
          decline_reason: cleanReason,
          new_status: 'DECLINED',
        },
      });

      return NextResponse.json({
        success: true,
        message: rpcData.message || 'Appointment declined.',
        appointment_id: rpcData.appointment_id,
      });
    }

    if (rpcError) {
      const isFunctionNotFound =
        rpcError.code === 'PGRST202' ||
        rpcError.code === '42883' ||
        (rpcError.message?.toLowerCase().includes('function') && rpcError.message?.toLowerCase().includes('does not exist'));

      if (!isFunctionNotFound) {
        return NextResponse.json({ error: rpcError.message }, { status: 500 });
      }
      // Fall through to server-side fallback
    }

    // 2. Server-side fallback
    const { data: apt, error: fetchErr } = await supabase
      .from('appointments')
      .select('id, appointment_id, status')
      .eq('id', appointment_id)
      .single();

    if (fetchErr || !apt) {
      return NextResponse.json({ error: 'Appointment record not found' }, { status: 404 });
    }

    const { error: updateErr } = await supabase
      .from('appointments')
      .update({
        status: 'DECLINED',
        decline_reason: cleanReason,
        updated_at: new Date().toISOString(),
      })
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
      action: 'APPOINTMENT_DECLINED',
      entity_type: 'APPOINTMENT',
      entity_id: appointment_id,
      metadata: {
        appointment_id: apt.appointment_id,
        decline_reason: cleanReason,
        new_status: 'DECLINED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Appointment declined.',
      appointment_id: apt.appointment_id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error processing appointment decline' },
      { status: 500 }
    );
  }
}
