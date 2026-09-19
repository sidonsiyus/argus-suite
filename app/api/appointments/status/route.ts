import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  normalizeTrackingCode,
  isValidTrackingCode,
  hashTrackingCode,
} from '@/lib/utils/tracking-token';
import { checkTrackingRateLimitPersistent, getClientIp } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database is not configured yet.' },
      { status: 503 }
    );
  }

  const clientIp = getClientIp(request.headers);

  // 1. Initial Rate Limit Check (persistent across distributed serverless instances)
  const rateLimitCheck = await checkTrackingRateLimitPersistent(clientIp, false);
  if (!rateLimitCheck.success) {
    return NextResponse.json(
      { error: rateLimitCheck.error || 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawCode = searchParams.get('token') || searchParams.get('code');

  // 2. Validate Code Format (accepts AVN-XXXXXX 6-char, or legacy formats)
  if (!rawCode || !isValidTrackingCode(rawCode)) {
    // Record failed attempt for rate limiting & brute force prevention
    await checkTrackingRateLimitPersistent(clientIp, true);
    return NextResponse.json(
      { error: 'Appointment not found' },
      { status: 404 }
    );
  }

  const normalizedCode = normalizeTrackingCode(rawCode);

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    // 3. Resolve appointment record by student-facing tracking_code
    // to retrieve the internal secure tracking_token_hash
    let targetTokenHash: string | null = null;

    try {
      const { data: codeRecord, error: codeErr } = await supabase
        .from('appointments')
        .select('tracking_token_hash')
        .eq('tracking_code', normalizedCode)
        .limit(1)
        .maybeSingle();

      if (!codeErr && codeRecord?.tracking_token_hash) {
        targetTokenHash = codeRecord.tracking_token_hash;
      } else {
        // Check if code matches a legacy hash directly (backward compatibility)
        const legacyHash = hashTrackingCode(normalizedCode);
        const { data: legacyRecord } = await supabase
          .from('appointments')
          .select('tracking_token_hash')
          .eq('tracking_token_hash', legacyHash)
          .limit(1)
          .maybeSingle();

        if (legacyRecord?.tracking_token_hash) {
          targetTokenHash = legacyRecord.tracking_token_hash;
        }
      }
    } catch {
      // Column may not exist before migration
    }

    if (!targetTokenHash) {
      // Record failed attempt for persistent rate limiting
      await checkTrackingRateLimitPersistent(clientIp, true);
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // 4. Try secure RPC lookup by SHA-256 token hash
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'get_appointment_status_by_token',
      { p_token_hash: targetTokenHash }
    );

    if (!rpcError && rpcData && rpcData.length > 0) {
      const apt = rpcData[0];
      return NextResponse.json({
        success: true,
        appointment: {
          appointment_id: apt.appointment_id,
          status: apt.status,
          student_name: apt.student_name,
          faculty_name: apt.faculty_name,
          date: apt.date,
          start_time: apt.start_time,
          end_time: apt.end_time,
          decline_reason: apt.status === 'DECLINED' ? apt.decline_reason : null,
        },
      });
    }

    // 5. Application-level fallback lookup (supports rollout before RPC migration)
    const { data: dbData, error: dbError } = await supabase
      .from('appointments')
      .select(`
        appointment_id,
        status,
        date,
        start_time,
        end_time,
        decline_reason,
        student:students (name, full_name),
        faculty:faculty (name)
      `)
      .eq('tracking_token_hash', targetTokenHash)
      .limit(1)
      .maybeSingle();

    if (!dbError && dbData) {
      const studentName =
        (dbData.student as any)?.name ||
        (dbData.student as any)?.full_name ||
        'Student';
      const facultyName = (dbData.faculty as any)?.name || 'Faculty Member';

      return NextResponse.json({
        success: true,
        appointment: {
          appointment_id: dbData.appointment_id,
          status: dbData.status,
          student_name: studentName,
          faculty_name: facultyName,
          date: dbData.date,
          start_time: dbData.start_time,
          end_time: dbData.end_time,
          decline_reason: dbData.status === 'DECLINED' ? dbData.decline_reason : null,
        },
      });
    }

    // 6. If no record found, record a failed attempt and return generic 404
    await checkTrackingRateLimitPersistent(clientIp, true);
    return NextResponse.json(
      { error: 'Appointment not found' },
      { status: 404 }
    );
  } catch {
    await checkTrackingRateLimitPersistent(clientIp, true);
    return NextResponse.json(
      { error: 'Appointment not found' },
      { status: 404 }
    );
  }
}
