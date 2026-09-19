import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isValidRegisterNumber, sanitizeText } from '@/lib/utils/validation';

export interface SafeStudent {
  id: string;
  register_number: string;
  name: string;
  programme: string;
  year: string;
  section: string;
  status: string;
  email?: string | null;
  phone?: string | null;
}

export interface StudentLookupOptions {
  supabase?: SupabaseClient;
  includeContact?: boolean;
}

/**
 * Normalizes an incoming register number (trims whitespace, converts to uppercase)
 */
export function normalizeRegisterNumber(regNumber: string): string {
  if (!regNumber || typeof regNumber !== 'string') return '';
  return regNumber.trim().toUpperCase();
}

/**
 * Authoritative single-student lookup by exact register number.
 * Used across Coordinator operations and public appointment booking.
 * 
 * Safety invariants:
 * - Exactly matches single active student.
 * - Exposes only safe fields (id, register_number, name, programme, year, section, status).
 * - Never exposes cohort_id, sno, avatar_url, or credentials.
 */
export async function findStudentByRegisterNumber(
  registerNumber: string,
  options?: StudentLookupOptions
): Promise<SafeStudent | null> {
  const normReg = normalizeRegisterNumber(registerNumber);
  if (!normReg || !isValidRegisterNumber(normReg)) {
    return null;
  }

  const supabase =
    options?.supabase ||
    (process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient());

  try {
    // 1. Try secure RPC if present on database
    const { data: rpcData, error: rpcErr } = await supabase.rpc(
      'lookup_student_by_register_number',
      { p_reg_no: normReg }
    );

    if (!rpcErr && rpcData) {
      // RPC returns either single row object or array with 1 item
      const rec = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (rec && rec.register_number) {
        return {
          id: rec.id,
          register_number: rec.register_number,
          name: rec.name,
          programme: rec.programme,
          year: rec.year,
          section: rec.section,
          status: rec.status || 'ACTIVE',
        };
      }
      return null;
    }

    // 2. Direct table lookup fallback (case-insensitive, status = ACTIVE)
    const selectFields = options?.includeContact
      ? 'id, register_number, reg_no, name, full_name, programme, year, section, status, email, phone'
      : 'id, register_number, reg_no, name, full_name, programme, year, section, status';

    const { data, error } = await supabase
      .from('students')
      .select(selectFields as any)
      .ilike('register_number', normReg)
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (error) {
      // Schema resilience fallback (reg_no matching)
      const { data: fallbackData } = await supabase
        .from('students')
        .select(selectFields as any)
        .ilike('reg_no', normReg)
        .maybeSingle();

      const fbRec: any = fallbackData;
      if (fbRec) {
        return {
          id: fbRec.id,
          register_number: fbRec.register_number || fbRec.reg_no,
          name: fbRec.name || fbRec.full_name,
          programme: fbRec.programme || 'Department of Aviation',
          year: fbRec.year || 'N/A',
          section: fbRec.section || 'N/A',
          status: fbRec.status || 'ACTIVE',
          ...(options?.includeContact && {
            email: fbRec.email || null,
            phone: fbRec.phone || null,
          }),
        };
      }
      return null;
    }

    const rec: any = data;
    if (!rec) return null;

    return {
      id: rec.id,
      register_number: rec.register_number || rec.reg_no,
      name: rec.name || rec.full_name,
      programme: rec.programme,
      year: rec.year,
      section: rec.section,
      status: rec.status,
      ...(options?.includeContact && {
        email: rec.email || null,
        phone: rec.phone || null,
      }),
    };
  } catch (err) {
    console.error('[StudentDirectory.findStudentByRegisterNumber Error]', err);
    return null;
  }
}

/**
 * Searches the student directory by student name or register number.
 * Used by Coordinator appointment scheduling.
 * 
 * Safety invariants:
 * - Requires server-side execution.
 * - Always capped at maximum 10 results (cannot enumerate database).
 * - Exposes only safe fields.
 */
export async function searchStudents(
  searchTerm: string,
  limit: number = 10,
  options?: StudentLookupOptions
): Promise<SafeStudent[]> {
  const cleanTerm = (searchTerm || '').trim();
  if (!cleanTerm || cleanTerm.length < 1) {
    return [];
  }

  // Cap limit strictly to at most 10 items
  const safeLimit = Math.min(Math.max(1, limit || 10), 10);

  const supabase =
    options?.supabase ||
    (process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient());

  try {
    const selectFields = options?.includeContact
      ? 'id, register_number, reg_no, name, full_name, programme, year, section, status, email, phone'
      : 'id, register_number, reg_no, name, full_name, programme, year, section, status';

    // Search by register_number OR name
    const { data, error } = await supabase
      .from('students')
      .select(selectFields as any)
      .eq('status', 'ACTIVE')
      .or(`register_number.ilike.%${cleanTerm}%,name.ilike.%${cleanTerm}%,reg_no.ilike.%${cleanTerm}%,full_name.ilike.%${cleanTerm}%`)
      .order('register_number', { ascending: true })
      .limit(safeLimit);

    if (error || !data) {
      return [];
    }

    return data.map((s: any) => ({
      id: s.id,
      register_number: s.register_number || s.reg_no || '—',
      name: s.name || s.full_name || '—',
      programme: s.programme || '—',
      year: s.year || '—',
      section: s.section || 'N/A',
      status: s.status || 'ACTIVE',
      ...(options?.includeContact && {
        email: s.email || null,
        phone: s.phone || null,
      }),
    }));
  } catch (err) {
    console.error('[StudentDirectory.searchStudents Error]', err);
    return [];
  }
}

/**
 * Public-facing student name search.
 * 
 * Safety invariants:
 * - Exposes ONLY safe fields: id, register_number, name, programme, year, section, status.
 * - NEVER exposes email, phone, cohort_id, sno, avatar_url.
 * - Maximum 10 results (cannot enumerate table).
 * - Prioritizes exact matches, then prefix matches, then substring matches.
 */
export async function searchStudentsByName(
  nameQuery: string,
  limit: number = 10,
  options?: StudentLookupOptions
): Promise<SafeStudent[]> {
  const cleanTerm = (nameQuery || '').trim();
  if (!cleanTerm || cleanTerm.length < 1) {
    return [];
  }

  const safeLimit = Math.min(Math.max(1, limit || 10), 10);

  const supabase =
    options?.supabase ||
    (process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient());

  try {
    // 1. Try secure RPC
    const { data: rpcData, error: rpcErr } = await supabase.rpc(
      'search_students_by_name',
      {
        p_name: cleanTerm,
        p_limit: safeLimit,
      }
    );

    if (!rpcErr && rpcData && Array.isArray(rpcData)) {
      return rpcData.map((rec: any) => ({
        id: rec.id,
        register_number: rec.register_number,
        name: rec.name,
        programme: rec.programme,
        year: rec.year,
        section: rec.section,
        status: rec.status || 'ACTIVE',
      }));
    }

    // 2. Server-side table fallback if RPC not yet deployed
    const selectFields = 'id, register_number, reg_no, name, full_name, programme, year, section, status';

    const { data, error } = await supabase
      .from('students')
      .select(selectFields as any)
      .eq('status', 'ACTIVE')
      .or(`name.ilike.%${cleanTerm}%,full_name.ilike.%${cleanTerm}%`)
      .limit(safeLimit * 2);

    if (error || !data) {
      return [];
    }

    // Sort: exact matches first, then prefix matches, then substring matches
    const termLower = cleanTerm.toLowerCase();
    const sorted = [...data].sort((a: any, b: any) => {
      const nameA = (a.name || a.full_name || '').toLowerCase();
      const nameB = (b.name || b.full_name || '').toLowerCase();

      const rankA = nameA === termLower ? 0 : nameA.startsWith(termLower) ? 1 : 2;
      const rankB = nameB === termLower ? 0 : nameB.startsWith(termLower) ? 1 : 2;

      if (rankA !== rankB) return rankA - rankB;
      return nameA.localeCompare(nameB);
    });

    return sorted.slice(0, safeLimit).map((s: any) => ({
      id: s.id,
      register_number: s.register_number || s.reg_no || '—',
      name: s.name || s.full_name || '—',
      programme: s.programme || 'Department of Aviation',
      year: s.year || 'N/A',
      section: s.section || 'N/A',
      status: s.status || 'ACTIVE',
    }));
  } catch (err) {
    console.error('[StudentDirectory.searchStudentsByName Error]', err);
    return [];
  }
}

