import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getStudentByStudentId } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  if (user.role === 'STUDENT') {
    const student = await getStudentByStudentId(user.identifier);
    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        parent_name: student?.parent_name,
        phone: student?.phone,
        batch: student?.batch,
      },
    });
  }

  return NextResponse.json({ authenticated: true, user });
}
