import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDashboardStats, getAllStudentFees } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const stats = await getDashboardStats();
  const allFees = await getAllStudentFees();

  return NextResponse.json({ stats, allFees });
}
