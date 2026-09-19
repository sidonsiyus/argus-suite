import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCoordinatorSession } from '@/lib/auth/require-coordinator';
import {
  isValidUUID,
  isValidEmail,
  isValidRegisterNumber,
  sanitizeText,
} from '@/lib/utils/validation';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const authCheck = await verifyCoordinatorSession();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status || 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const source = searchParams.get('source');
  const year = searchParams.get('year');
  const search = searchParams.get('search')?.trim().toLowerCase();

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();
    let students: any[] = [];

    // Attempt query
    let query = supabase.from('students').select('*');
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (source && source !== 'all') {
      query = query.eq('source', source);
    }
    if (year && year !== 'all') {
      query = query.eq('year', year);
    }

    const { data, error } = await query;
    if (error) {
      // Fallback: Query all columns without filters if specific column does not exist
      const { data: rawData, error: rawError } = await supabase.from('students').select('*');
      if (rawError) {
        return NextResponse.json({ error: rawError.message }, { status: 500 });
      }
      students = rawData || [];
    } else {
      students = data || [];
    }

    // Normalize student records across MENTOR OS and Coordinator schemas
    let normalized = (students || []).map((s: any) => ({
      id: s.id,
      register_number: s.register_number || s.reg_no || '—',
      name: s.name || s.full_name || '—',
      programme: s.programme || 'Department of Aviation',
      year: s.year || 'N/A',
      section: s.section || 'N/A',
      email: s.email || null,
      phone: s.phone || null,
      status: s.status || (s.is_active ? 'ACTIVE' : 'INACTIVE'),
      source: s.source || 'BOOKING',
      created_at: s.created_at,
      updated_at: s.updated_at,
    }));

    // In-memory filters for safety
    if (status && status !== 'all') {
      normalized = normalized.filter((s) => s.status === status);
    }
    if (source && source !== 'all') {
      normalized = normalized.filter((s) => s.source === source);
    }
    if (year && year !== 'all') {
      normalized = normalized.filter((s) => s.year === year);
    }

    // Sort by name
    normalized.sort((a, b) => a.name.localeCompare(b.name));

    let results = normalized;
    if (search) {
      results = results.filter((s) => {
        return (
          s.register_number.toLowerCase().includes(search) ||
          s.name.toLowerCase().includes(search) ||
          s.programme.toLowerCase().includes(search) ||
          s.section.toLowerCase().includes(search)
        );
      });
    }

    return NextResponse.json({ students: results });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error loading students' },
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
    const { register_number, name, programme, year, section, email, phone, status = 'ACTIVE' } = body;

    if (!register_number || !name || !programme || !year || !section) {
      return NextResponse.json(
        { error: 'Register number, name, programme, year, and section are required.' },
        { status: 400 }
      );
    }

    if (!isValidRegisterNumber(register_number)) {
      return NextResponse.json(
        { error: 'Invalid Register Number format (alphanumeric, 2-30 characters).' },
        { status: 400 }
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    const normalizedReg = register_number.trim().toUpperCase();
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    // Check duplicate
    const { data: existing } = await supabase
      .from('students')
      .select('id')
      .ilike('register_number', normalizedReg)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Student with Register Number ${normalizedReg} already exists.` },
        { status: 409 }
      );
    }

    const { data: newStudent, error } = await supabase
      .from('students')
      .insert({
        register_number: normalizedReg,
        name: sanitizeText(name, 100),
        programme: sanitizeText(programme, 100),
        year: sanitizeText(year, 10),
        section: sanitizeText(section, 10),
        email: email ? sanitizeText(email, 100) : null,
        phone: phone ? sanitizeText(phone, 25) : null,
        status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
        source: 'ADMIN',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log Audit Event
    await logAuditEvent(supabase, {
      actor_user_id: authCheck.user?.id,
      action: 'STUDENT_CREATED',
      entity_type: 'STUDENT',
      entity_id: newStudent.id,
      metadata: {
        register_number: normalizedReg,
        name: newStudent.name,
        programme: newStudent.programme,
      },
    });

    return NextResponse.json({ student: newStudent });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error adding student' },
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
    const { id, register_number, name, programme, year, section, email, phone, status } = body;

    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'Valid Student ID required' }, { status: 400 });
    }

    if (register_number && !isValidRegisterNumber(register_number)) {
      return NextResponse.json(
        { error: 'Invalid Register Number format (alphanumeric, 2-30 characters)' },
        { status: 400 }
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (register_number) updatePayload.register_number = register_number.trim().toUpperCase();
    if (name) updatePayload.name = sanitizeText(name, 100);
    if (programme) updatePayload.programme = sanitizeText(programme, 100);
    if (year) updatePayload.year = sanitizeText(year, 10);
    if (section) updatePayload.section = sanitizeText(section, 10);
    if (email !== undefined) updatePayload.email = email ? sanitizeText(email, 100) : null;
    if (phone !== undefined) updatePayload.phone = phone ? sanitizeText(phone, 25) : null;
    if (status) updatePayload.status = status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const { data: updated, error } = await supabase
      .from('students')
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
      action: status ? `STUDENT_STATUS_${status}` : 'STUDENT_UPDATED',
      entity_type: 'STUDENT',
      entity_id: id,
      metadata: {
        register_number: updated.register_number,
        name: updated.name,
        status: updated.status,
      },
    });

    return NextResponse.json({ student: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error updating student' },
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
    return NextResponse.json({ error: 'Valid Student ID required' }, { status: 400 });
  }

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    // Check if student has appointments
    const { count } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', id);

    if (count && count > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot permanently delete student with existing appointments. Please disable (deactivate) the student instead to maintain audit integrity.',
        },
        { status: 400 }
      );
    }

    const { data: stuToDelete } = await supabase
      .from('students')
      .select('register_number, name')
      .eq('id', id)
      .single();

    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log Audit Event
    await logAuditEvent(supabase, {
      actor_user_id: authCheck.user?.id,
      action: 'STUDENT_DELETED',
      entity_type: 'STUDENT',
      entity_id: id,
      metadata: {
        register_number: stuToDelete?.register_number,
        name: stuToDelete?.name,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error deleting student' },
      { status: 500 }
    );
  }
}
