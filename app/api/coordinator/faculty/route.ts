import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { generateSecureToken } from '@/lib/utils/appointment-id';
import { verifyCoordinatorSession } from '@/lib/auth/require-coordinator';
import { isValidUUID, isValidEmail, sanitizeText } from '@/lib/utils/validation';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const authCheck = await verifyCoordinatorSession();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status || 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.trim().toLowerCase();

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();
    let query = supabase.from('faculty').select('*').order('name');

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: facultyList, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let results = facultyList || [];
    if (search) {
      results = results.filter((f) => {
        return (
          f.name.toLowerCase().includes(search) ||
          f.employee_id.toLowerCase().includes(search) ||
          f.designation.toLowerCase().includes(search) ||
          (f.room && f.room.toLowerCase().includes(search))
        );
      });
    }

    // Attach upcoming appointments count for each faculty member
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: upcomingApts } = await supabase
      .from('appointments')
      .select('faculty_id')
      .gte('date', todayStr)
      .eq('status', 'SCHEDULED');

    const countMap: Record<string, number> = {};
    if (upcomingApts) {
      upcomingApts.forEach((a) => {
        countMap[a.faculty_id] = (countMap[a.faculty_id] || 0) + 1;
      });
    }

    const enriched = results.map((f) => ({
      ...f,
      upcoming_count: countMap[f.id] || 0,
    }));

    return NextResponse.json({ faculty: enriched });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error fetching faculty' },
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
    const { name, employee_id, designation, email, phone, room, campus = 'Aerospace Campus', status = 'ACTIVE' } = body;

    if (!name || !employee_id || !designation || !email) {
      return NextResponse.json(
        { error: 'Name, employee ID, designation, and email are required.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid faculty email address format.' },
        { status: 400 }
      );
    }

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    // Check duplicate employee_id
    const { data: existing } = await supabase
      .from('faculty')
      .select('id')
      .ilike('employee_id', employee_id.trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Faculty with Employee ID ${employee_id} already exists.` },
        { status: 409 }
      );
    }

    const calendarToken = generateSecureToken();

    const { data: newFaculty, error } = await supabase
      .from('faculty')
      .insert({
        name: sanitizeText(name, 100),
        employee_id: sanitizeText(employee_id, 30),
        designation: sanitizeText(designation, 100),
        email: sanitizeText(email, 100),
        phone: phone ? sanitizeText(phone, 25) : null,
        room: room ? sanitizeText(room, 50) : null,
        campus: sanitizeText(campus, 100) || 'Aerospace Campus',
        status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
        calendar_token: calendarToken,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log Audit Event
    await logAuditEvent(supabase, {
      actor_user_id: authCheck.user?.id,
      action: 'FACULTY_CREATED',
      entity_type: 'FACULTY',
      entity_id: newFaculty.id,
      metadata: {
        employee_id: newFaculty.employee_id,
        name: newFaculty.name,
        designation: newFaculty.designation,
      },
    });

    return NextResponse.json({ faculty: newFaculty });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error creating faculty' },
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
    const { id, name, employee_id, designation, email, phone, room, campus, status } = body;

    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'Valid Faculty ID required' }, { status: 400 });
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid faculty email address format' }, { status: 400 });
    }

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name) updatePayload.name = sanitizeText(name, 100);
    if (employee_id) updatePayload.employee_id = sanitizeText(employee_id, 30);
    if (designation) updatePayload.designation = sanitizeText(designation, 100);
    if (email) updatePayload.email = sanitizeText(email, 100);
    if (phone !== undefined) updatePayload.phone = phone ? sanitizeText(phone, 25) : null;
    if (room !== undefined) updatePayload.room = room ? sanitizeText(room, 50) : null;
    if (campus) updatePayload.campus = sanitizeText(campus, 100);
    if (status) updatePayload.status = status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const { data: updated, error } = await supabase
      .from('faculty')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log Audit Event
    await logAuditEvent(supabase, {
      actor_user_id: authCheck.user?.id,
      action: status ? `FACULTY_STATUS_${status}` : 'FACULTY_UPDATED',
      entity_type: 'FACULTY',
      entity_id: id,
      metadata: {
        employee_id: updated.employee_id,
        name: updated.name,
        status: updated.status,
      },
    });

    return NextResponse.json({ faculty: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error updating faculty' },
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
    return NextResponse.json({ error: 'Valid Faculty ID required' }, { status: 400 });
  }

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    // Check if faculty has appointments or sessions
    const { count: aptCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('faculty_id', id);

    const { count: sessionCount } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('faculty_id', id);

    if ((aptCount && aptCount > 0) || (sessionCount && sessionCount > 0)) {
      return NextResponse.json(
        {
          error:
            'Cannot permanently delete faculty with existing appointments or sessions. Please deactivate (set to INACTIVE) instead to preserve historical records.',
        },
        { status: 400 }
      );
    }

    const { data: facToDelete } = await supabase
      .from('faculty')
      .select('employee_id, name')
      .eq('id', id)
      .single();

    const { error } = await supabase.from('faculty').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log Audit Event
    await logAuditEvent(supabase, {
      actor_user_id: authCheck.user?.id,
      action: 'FACULTY_DELETED',
      entity_type: 'FACULTY',
      entity_id: id,
      metadata: {
        employee_id: facToDelete?.employee_id,
        name: facToDelete?.name,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error deleting faculty' },
      { status: 500 }
    );
  }
}
