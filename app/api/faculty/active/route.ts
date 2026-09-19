import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database is not configured yet.' },
      { status: 503 }
    );
  }

  try {
    const supabase = createClient();

    // 1. Fetch active faculty from roster
    const { data: faculty, error } = await supabase
      .from('faculty')
      .select('id, name, employee_id, designation, room, campus')
      .eq('status', 'ACTIVE')
      .order('name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Query faculty with at least one active availability window
    const { data: activeAvail, error: availErr } = await supabase
      .from('faculty_availability')
      .select('faculty_id')
      .eq('is_active', true);

    let bookableFaculty = faculty || [];

    if (!availErr && activeAvail && activeAvail.length > 0) {
      const activeFacultyIds = new Set(activeAvail.map((a: any) => a.faculty_id));
      bookableFaculty = (faculty || []).filter((f: any) => activeFacultyIds.has(f.id));
    }

    return NextResponse.json({ faculty: bookableFaculty });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error fetching active faculty' },
      { status: 500 }
    );
  }
}

