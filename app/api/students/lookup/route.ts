import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { isValidRegisterNumber } from '@/lib/utils/validation';
import { findStudentByRegisterNumber } from '@/lib/students/student-directory';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database is not configured yet.' },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const regNumber = searchParams.get('reg')?.trim();

  if (!regNumber || !isValidRegisterNumber(regNumber)) {
    return NextResponse.json(
      { error: 'Valid register number is required (alphanumeric, 2-30 characters)' },
      { status: 400 }
    );
  }

  try {
    const student = await findStudentByRegisterNumber(regNumber);

    if (!student) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      student: {
        id: student.id,
        register_number: student.register_number,
        name: student.name,
        programme: student.programme,
        year: student.year,
        section: student.section,
        status: student.status,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error looking up student' },
      { status: 500 }
    );
  }
}
