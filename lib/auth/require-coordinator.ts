import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function verifyCoordinatorSession() {
  if (!isSupabaseConfigured()) {
    return {
      authorized: false,
      error: 'Database is not configured yet.',
      status: 503,
    };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        authorized: false,
        error: 'Unauthorized. An active Coordinator session is required to perform this action.',
        status: 401,
      };
    }

    // Verify coordinator or instructor role if profiles table exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile && !['instructor', 'admin', 'coordinator'].includes(profile.role)) {
      return {
        authorized: false,
        error: 'Forbidden. User does not possess coordinator or instructor privileges.',
        status: 403,
      };
    }

    return { authorized: true, user };
  } catch (err: any) {
    return {
      authorized: false,
      error: err.message || 'Authentication check failed',
      status: 401,
    };
  }
}
