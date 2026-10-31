import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getStudentFees, getStudentByStudentId } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized. Student login required.' }, { status: 403 });
  }

  const student = await getStudentByStudentId(user.identifier);
  if (!student) {
    return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
  }

  const fees = await getStudentFees(student.id);
  return NextResponse.json({ student, fees });
}
