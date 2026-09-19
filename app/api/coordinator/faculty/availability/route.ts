import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { verifyCoordinatorSession } from '@/lib/auth/require-coordinator';
import { isValidUUID, isValidTimeStr } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  const authCheck = await verifyCoordinatorSession();
  if (!authCheck.authorized) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status || 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const facultyId = searchParams.get('faculty_id');

  if (!facultyId || !isValidUUID(facultyId)) {
    return NextResponse.json(
      { error: 'Valid faculty_id UUID parameter is required' },
      { status: 400 }
    );
  }

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    const { data: availability, error } = await supabase
      .from('faculty_availability')
      .select('*')
      .eq('faculty_id', facultyId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      // Table might not exist yet if migration pending
      if (error.code === '42P01') {
        return NextResponse.json({ availability: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ availability: availability || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error fetching faculty availability' },
      { status: 500 }
    );
  }
}

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
    const { faculty_id, availability } = body;

    if (!faculty_id || !isValidUUID(faculty_id)) {
      return NextResponse.json(
        { error: 'Valid faculty_id UUID is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(availability)) {
      return NextResponse.json(
        { error: 'availability must be an array of time windows' },
        { status: 400 }
      );
    }

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    // Verify faculty exists in roster
    const { data: faculty, error: facErr } = await supabase
      .from('faculty')
      .select('id, name, status')
      .eq('id', faculty_id)
      .single();

    if (facErr || !faculty) {
      return NextResponse.json(
        { error: 'Faculty member not found in the official roster' },
        { status: 404 }
      );
    }

    // Validate each availability item
    const validWindows = [];
    for (let i = 0; i < availability.length; i++) {
      const item = availability[i];
      const dow = Number(item.day_of_week);
      if (isNaN(dow) || dow < 0 || dow > 6) {
        return NextResponse.json(
          { error: `Invalid day_of_week at index ${i}: must be between 0 (Sunday) and 6 (Saturday)` },
          { status: 400 }
        );
      }

      if (!item.start_time || !item.end_time || !isValidTimeStr(item.start_time) || !isValidTimeStr(item.end_time)) {
        return NextResponse.json(
          { error: `Invalid start_time or end_time format at index ${i}. Expected HH:MM` },
          { status: 400 }
        );
      }

      if (item.start_time >= item.end_time) {
        return NextResponse.json(
          { error: `Window at index ${i}: start_time (${item.start_time}) must be earlier than end_time (${item.end_time})` },
          { status: 400 }
        );
      }

      const duration = Number(item.slot_duration_minutes) || 30;
      if (![15, 30, 45, 60].includes(duration)) {
        return NextResponse.json(
          { error: `Invalid slot_duration_minutes at index ${i}: must be 15, 30, 45, or 60` },
          { status: 400 }
        );
      }

      validWindows.push({
        faculty_id,
        day_of_week: dow,
        start_time: item.start_time.length === 5 ? `${item.start_time}:00` : item.start_time,
        end_time: item.end_time.length === 5 ? `${item.end_time}:00` : item.end_time,
        slot_duration_minutes: duration,
        is_active: item.is_active !== false,
      });
    }

    // Delete existing availability for this faculty member and replace with the updated list
    const { error: deleteErr } = await supabase
      .from('faculty_availability')
      .delete()
      .eq('faculty_id', faculty_id);

    if (deleteErr && deleteErr.code !== '42P01') {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    let insertedData: any[] = [];
    if (validWindows.length > 0) {
      const { data: inserted, error: insertErr } = await supabase
        .from('faculty_availability')
        .insert(validWindows)
        .select('*');

      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }
      insertedData = inserted || [];
    }

    return NextResponse.json({
      success: true,
      message: `Availability configured successfully for ${faculty.name}`,
      count: insertedData.length,
      availability: insertedData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error saving faculty availability' },
      { status: 500 }
    );
  }
}
