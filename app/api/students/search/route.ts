import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { searchStudentsByName } from '@/lib/students/student-directory';
import { sanitizeText } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database is not configured yet.' },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const nameQuery = searchParams.get('name') || searchParams.get('q') || '';
  const cleanTerm = sanitizeText(nameQuery.trim(), 100);

  if (!cleanTerm || cleanTerm.length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Limit to maximum 10 results; returns strictly safe fields
    const students = await searchStudentsByName(cleanTerm, 10);

    return NextResponse.json({
      results: students.map((s) => ({
        id: s.id,
        register_number: s.register_number,
        name: s.name,
        programme: s.programme,
        year: s.year,
        section: s.section,
        status: s.status,
      })),
    });
  } catch (err: any) {
    console.error('[Public Student Search API Error]', err);
    return NextResponse.json(
      { error: err.message || 'Error searching student directory' },
      { status: 500 }
    );
  }
}
