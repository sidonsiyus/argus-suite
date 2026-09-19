import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { generateSecureToken } from '@/lib/utils/appointment-id';
import { verifyCoordinatorSession } from '@/lib/auth/require-coordinator';
import { isValidUUID } from '@/lib/utils/validation';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: NextRequest) {
  const authCheck = await verifyCoordinatorSession();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const { faculty_id } = await request.json();

    if (!faculty_id || !isValidUUID(faculty_id)) {
      return NextResponse.json({ error: 'Valid Faculty ID is required' }, { status: 400 });
    }

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();
    const newToken = generateSecureToken();

    const { data: updated, error } = await supabase
      .from('faculty')
      .update({
        calendar_token: newToken,
        updated_at: new Date().toISOString(),
      })
      .eq('id', faculty_id)
      .select('id, name, calendar_token')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log Audit Event (Never log the token value)
    await logAuditEvent(supabase, {
      actor_user_id: authCheck.user?.id,
      action: 'FACULTY_TOKEN_REGENERATED',
      entity_type: 'FACULTY',
      entity_id: updated.id,
      metadata: {
        faculty_name: updated.name,
      },
    });

    return NextResponse.json({
      success: true,
      faculty_id: updated.id,
      name: updated.name,
      calendar_token: updated.calendar_token,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error regenerating token' },
      { status: 500 }
    );
  }
}
