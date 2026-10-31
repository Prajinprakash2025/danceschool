import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllStudents, createStudent } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  const students = await getAllStudents();
  return NextResponse.json({ students });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, parent_name, phone, email, batch, password } = body;

    if (!name || !parent_name || !phone || !batch) {
      return NextResponse.json(
        { error: 'Name, Parent Name, Phone, and Batch are required.' },
        { status: 400 }
      );
    }

    const newStudent = await createStudent({
      name,
      parent_name,
      phone,
      email,
      batch,
      password,
    });

    return NextResponse.json({
      success: true,
      message: 'Student enrolled successfully!',
      student: newStudent,
    });
  } catch (err: any) {
    console.error('Error creating student:', err);
    return NextResponse.json({ error: err.message || 'Failed to create student' }, { status: 500 });
  }
}
