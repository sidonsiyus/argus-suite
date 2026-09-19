import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { generateSecureToken } from '@/lib/utils/appointment-id';
import { verifyCoordinatorSession } from '@/lib/auth/require-coordinator';

export async function POST(request: NextRequest) {
  const authCheck = await verifyCoordinatorSession();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const { faculty_id } = await request.json();

    if (!faculty_id) {
      return NextResponse.json({ error: 'Faculty ID is required' }, { status: 400 });
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

    return NextResponse.json({
      success: true,
      faculty_id: updated.id,
      name: updated.name,
      calendar_token: updated.calendar_token,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error regenerating faculty token' },
      { status: 500 }
    );
  }
}
