import { SupabaseClient } from '@supabase/supabase-js';

export interface AuditEventParams {
  actor_user_id?: string | null;
  action: string;
  entity_type: 'APPOINTMENT' | 'STUDENT' | 'FACULTY' | 'SESSION' | 'SETTINGS' | 'IMPORT';
  entity_id?: string | null;
  metadata?: Record<string, any>;
}

/**
 * Persists an administrative audit event for production compliance and traceability.
 * Does not throw if logging fails, preserving the main operation.
 */
export async function logAuditEvent(
  supabase: SupabaseClient,
  params: AuditEventParams
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      actor_user_id: params.actor_user_id || null,
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id || null,
      metadata: params.metadata || null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    // Non-blocking for primary application operation
    console.error('[AUDIT LOG ERROR]', err);
  }
}
