import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { deleteStudent, updateStudent } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId || '');
  if (!id) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const updated = await updateStudent(id, body);
    if (updated) {
      return NextResponse.json({ success: true, student: updated });
    }
    return NextResponse.json({ error: 'Could not update student. Please check database permissions or retry.' }, { status: 400 });
  } catch (err: any) {
    console.error('API update student error:', err);
    return NextResponse.json({ error: err.message || 'Error updating student' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
  }

  const success = await deleteStudent(id);
  if (success) {
    return NextResponse.json({ success: true, message: 'Student removed' });
  }
  return NextResponse.json({ error: 'Could not delete student' }, { status: 500 });
}
