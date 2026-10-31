import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { seedDemoData } from '@/lib/db';

export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const result = await seedDemoData();
    return NextResponse.json({
      success: true,
      message: 'Client showcase demo data successfully generated!',
      result,
    });
  } catch (err: any) {
    console.error('Error seeding demo data:', err);
    return NextResponse.json({ error: err.message || 'Failed to seed demo data' }, { status: 500 });
  }
}
