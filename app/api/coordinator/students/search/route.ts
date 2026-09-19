import { NextRequest, NextResponse } from 'next/server';
import { verifyCoordinatorSession } from '@/lib/auth/require-coordinator';
import { searchStudents, findStudentByRegisterNumber } from '@/lib/students/student-directory';

export async function GET(request: NextRequest) {
  const authCheck = await verifyCoordinatorSession();
  if (!authCheck.authorized) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status || 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  const reg = searchParams.get('reg')?.trim();

  try {
    // Exact register number lookup if 'reg' is supplied
    if (reg) {
      const student = await findStudentByRegisterNumber(reg, { includeContact: true });
      return NextResponse.json({
        found: Boolean(student),
        student,
      });
    }

    // Search by name or register number query
    if (q) {
      const students = await searchStudents(q, 10, { includeContact: true });
      return NextResponse.json({
        students,
        count: students.length,
      });
    }

    return NextResponse.json({
      students: [],
      count: 0,
    });
  } catch (err: any) {
    console.error('[CoordinatorStudentSearch Error]', err);
    return NextResponse.json(
      { error: err.message || 'Error searching students' },
      { status: 500 }
    );
  }
}
