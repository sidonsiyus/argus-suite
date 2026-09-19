import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { verifyCoordinatorSession } from '@/lib/auth/require-coordinator';
import { isValidUUID } from '@/lib/utils/validation';

export async function GET() {
  const authCheck = await verifyCoordinatorSession();
  if (!authCheck.authorized) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status || 401 }
    );
  }

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    // Query notifications joined with appointment details
    let query = supabase
      .from('notifications')
      .select(`
        id,
        type,
        title,
        message,
        appointment_id,
        recipient_user_id,
        is_read,
        created_at,
        appointment:appointments (
          id,
          appointment_id,
          date,
          start_time,
          end_time,
          status,
          reason,
          student:students (name, register_number, programme, year, section),
          faculty:faculty (name, designation)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(30);

    if (authCheck.user?.id) {
      query = query.or(`recipient_user_id.is.null,recipient_user_id.eq.${authCheck.user.id}`);
    }

    const { data: notifications, error } = await query;

    if (error) {
      if (error.code === '42P01') {
        // Table not created yet
        return NextResponse.json({ unreadCount: 0, notifications: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const unreadCount = (notifications || []).filter((n: any) => !n.is_read).length;

    return NextResponse.json({
      unreadCount,
      notifications: notifications || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error fetching notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const authCheck = await verifyCoordinatorSession();
  if (!authCheck.authorized) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status || 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, markAllRead, appointment_id } = body;

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    if (markAllRead) {
      let query = supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (authCheck.user?.id) {
        query = query.or(`recipient_user_id.is.null,recipient_user_id.eq.${authCheck.user.id}`);
      }

      const { error } = await query;

      if (error && error.code !== '42P01') {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (id && isValidUUID(id)) {
      let query = supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (authCheck.user?.id) {
        query = query.or(`recipient_user_id.is.null,recipient_user_id.eq.${authCheck.user.id}`);
      }

      const { error } = await query;

      if (error && error.code !== '42P01') {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    if (appointment_id && isValidUUID(appointment_id)) {
      let query = supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('appointment_id', appointment_id);

      if (authCheck.user?.id) {
        query = query.or(`recipient_user_id.is.null,recipient_user_id.eq.${authCheck.user.id}`);
      }

      const { error } = await query;

      if (error && error.code !== '42P01') {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    return NextResponse.json(
      { error: 'Provide valid notification id, appointment_id, or markAllRead: true' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error updating notification status' },
      { status: 500 }
    );
  }
}
