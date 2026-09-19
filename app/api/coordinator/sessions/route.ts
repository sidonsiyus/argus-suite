import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCoordinatorSession } from '@/lib/auth/require-coordinator';
import { isValidUUID, isValidDateStr, sanitizeText } from '@/lib/utils/validation';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const authCheck = await verifyCoordinatorSession();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status || 401 });
  }

  const { searchParams } = new URL(request.url);
  const facultyId = searchParams.get('faculty_id');
  const date = searchParams.get('date');
  const search = searchParams.get('search')?.trim().toLowerCase();

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();
    let query = supabase
      .from('sessions')
      .select(`
        id,
        title,
        date,
        faculty_id,
        student_count,
        description,
        notes,
        created_at,
        updated_at,
        faculty:faculty(id, name, designation, employee_id)
      `)
      .order('date', { ascending: false });

    if (facultyId && facultyId !== 'all') {
      if (!isValidUUID(facultyId)) {
        return NextResponse.json({ error: 'Invalid faculty ID filter' }, { status: 400 });
      }
      query = query.eq('faculty_id', facultyId);
    }
    if (date) {
      if (!isValidDateStr(date)) {
        return NextResponse.json({ error: 'Invalid date filter' }, { status: 400 });
      }
      query = query.eq('date', date);
    }

    const { data: sessions, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let results = sessions || [];
    if (search) {
      results = results.filter((s: any) => {
        return (
          s.title.toLowerCase().includes(search) ||
          s.faculty?.name?.toLowerCase().includes(search) ||
          (s.description && s.description.toLowerCase().includes(search))
        );
      });
    }

    return NextResponse.json({ sessions: results });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error fetching sessions' },
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
    const { title, date, faculty_id, student_count = 1, description, notes } = body;

    if (!title || !date || !faculty_id) {
      return NextResponse.json(
        { error: 'Title, date, and faculty member are required.' },
        { status: 400 }
      );
    }

    if (!isValidUUID(faculty_id)) {
      return NextResponse.json({ error: 'Invalid Faculty ID' }, { status: 400 });
    }

    if (!isValidDateStr(date)) {
      return NextResponse.json({ error: 'Invalid date format (YYYY-MM-DD)' }, { status: 400 });
    }

    const parsedCount = Math.max(1, Math.min(10000, Number(student_count) || 1));

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();
    const { data: newSession, error } = await supabase
      .from('sessions')
      .insert({
        title: sanitizeText(title, 200),
        date,
        faculty_id,
        student_count: parsedCount,
        description: description ? sanitizeText(description, 2000) : null,
        notes: notes ? sanitizeText(notes, 2000) : null,
      })
      .select(`
        *,
        faculty:faculty(id, name, designation)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log Audit Event
    await logAuditEvent(supabase, {
      actor_user_id: authCheck.user?.id,
      action: 'SESSION_RECORDED',
      entity_type: 'SESSION',
      entity_id: newSession.id,
      metadata: {
        title: newSession.title,
        date: newSession.date,
        student_count: newSession.student_count,
      },
    });

    return NextResponse.json({ session: newSession });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error creating session' },
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
    const { id, title, date, faculty_id, student_count, description, notes } = body;

    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'Valid Session ID is required' }, { status: 400 });
    }

    if (faculty_id && !isValidUUID(faculty_id)) {
      return NextResponse.json({ error: 'Invalid Faculty ID' }, { status: 400 });
    }

    if (date && !isValidDateStr(date)) {
      return NextResponse.json({ error: 'Invalid date format (YYYY-MM-DD)' }, { status: 400 });
    }

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (title) updatePayload.title = sanitizeText(title, 200);
    if (date) updatePayload.date = date;
    if (faculty_id) updatePayload.faculty_id = faculty_id;
    if (student_count !== undefined) {
      updatePayload.student_count = Math.max(1, Math.min(10000, Number(student_count) || 1));
    }
    if (description !== undefined) {
      updatePayload.description = description ? sanitizeText(description, 2000) : null;
    }
    if (notes !== undefined) {
      updatePayload.notes = notes ? sanitizeText(notes, 2000) : null;
    }

    const { data: updated, error } = await supabase
      .from('sessions')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        faculty:faculty(id, name, designation)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log Audit Event
    await logAuditEvent(supabase, {
      actor_user_id: authCheck.user?.id,
      action: 'SESSION_UPDATED',
      entity_type: 'SESSION',
      entity_id: id,
      metadata: {
        title: updated.title,
        date: updated.date,
        student_count: updated.student_count,
      },
    });

    return NextResponse.json({ session: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error updating session' },
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
    return NextResponse.json({ error: 'Valid Session ID required' }, { status: 400 });
  }

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    const { data: sessionToDelete } = await supabase
      .from('sessions')
      .select('title, date, faculty_id')
      .eq('id', id)
      .single();

    const { error } = await supabase.from('sessions').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log Audit Event
    await logAuditEvent(supabase, {
      actor_user_id: authCheck.user?.id,
      action: 'SESSION_DELETED',
      entity_type: 'SESSION',
      entity_id: id,
      metadata: {
        title: sessionToDelete?.title,
        date: sessionToDelete?.date,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error deleting session' },
      { status: 500 }
    );
  }
}
