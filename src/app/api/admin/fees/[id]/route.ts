import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateFeeAmount } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const { amount, due_date } = await req.json();

  if (!id || amount === undefined) {
    return NextResponse.json({ error: 'Fee ID and amount required' }, { status: 400 });
  }

  const success = await updateFeeAmount(id, Number(amount), due_date);
  if (success) {
    return NextResponse.json({ success: true, message: 'Fee updated successfully' });
  }
  return NextResponse.json({ error: 'Could not update fee' }, { status: 500 });
}
