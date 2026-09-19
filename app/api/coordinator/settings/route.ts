import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getPortalSettings } from '@/lib/settings';
import { verifyCoordinatorSession } from '@/lib/auth/require-coordinator';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const authCheck = await verifyCoordinatorSession();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status || 401 });
  }

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();
    const settings = await getPortalSettings(supabase);
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error fetching settings' },
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
    const { working_hours, appointment_duration, portal_info } = body;

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    if (appointment_duration !== undefined) {
      const parsedDur = Number(appointment_duration);
      if (![15, 30, 45, 60].includes(parsedDur)) {
        return NextResponse.json(
          { error: 'Appointment duration must be 15, 30, 45, or 60 minutes.' },
          { status: 400 }
        );
      }
      await supabase.from('settings').upsert({
        key: 'appointment_duration',
        value: parsedDur,
        updated_at: new Date().toISOString(),
      });
    }

    if (working_hours) {
      await supabase.from('settings').upsert({
        key: 'working_hours',
        value: working_hours,
        updated_at: new Date().toISOString(),
      });
    }

    if (portal_info) {
      await supabase.from('settings').upsert({
        key: 'portal_info',
        value: portal_info,
        updated_at: new Date().toISOString(),
      });
    }

    // Log Audit Event
    await logAuditEvent(supabase, {
      actor_user_id: authCheck.user?.id,
      action: 'SETTINGS_UPDATED',
      entity_type: 'SETTINGS',
      metadata: {
        appointment_duration: appointment_duration ? Number(appointment_duration) : undefined,
        working_hours_updated: Boolean(working_hours),
        portal_info_updated: Boolean(portal_info),
      },
    });

    const updatedSettings = await getPortalSettings(supabase);
    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error updating settings' },
      { status: 500 }
    );
  }
}
