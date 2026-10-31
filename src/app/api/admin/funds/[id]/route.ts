import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateFund, deleteFund } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Fund ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const updated = await updateFund(id, body);
    if (updated) {
      return NextResponse.json({ success: true, fund: updated });
    }
    return NextResponse.json({ error: 'Fund not found or could not be updated' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating fund' }, { status: 500 });
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
    return NextResponse.json({ error: 'Fund ID is required' }, { status: 400 });
  }

  const success = await deleteFund(id);
  if (success) {
    return NextResponse.json({ success: true, message: 'Fund removed successfully' });
  }
  return NextResponse.json({ error: 'Could not delete fund' }, { status: 500 });
}
