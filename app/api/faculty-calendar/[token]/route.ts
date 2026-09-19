import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database is not configured yet.' },
      { status: 503 }
    );
  }

  const { token } = await params;
  if (!token || token.length < 16) {
    return NextResponse.json(
      { error: 'Invalid faculty calendar token.' },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();

    // Verify token matches active faculty
    const { data: faculty, error: facErr } = await supabase
      .from('faculty')
      .select('id, name, employee_id, designation, email, phone, room, campus, status')
      .eq('calendar_token', token)
      .single();

    if (facErr || !faculty) {
      return NextResponse.json(
        { error: 'Faculty calendar not found or access token has been revoked.' },
        { status: 404 }
      );
    }

    // Fetch appointments for this faculty member
    const { data: appointments, error: aptErr } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_id,
        date,
        start_time,
        end_time,
        reason,
        notes,
        status,
        source,
        created_at,
        student:students(name, register_number, programme, year, section, email, phone)
      `)
      .eq('faculty_id', faculty.id)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (aptErr) {
      return NextResponse.json({ error: aptErr.message }, { status: 500 });
    }

    return NextResponse.json({
      faculty,
      appointments: appointments || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error loading calendar.' },
      { status: 500 }
    );
  }
}
