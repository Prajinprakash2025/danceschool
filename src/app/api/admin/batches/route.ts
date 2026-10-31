import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllBatches, createBatch } from '@/lib/db';

export async function GET() {
  const batches = await getAllBatches();
  return NextResponse.json({ batches });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, timing, instructor, monthly_fee } = body;

    if (!name) {
      return NextResponse.json({ error: 'Batch name is required' }, { status: 400 });
    }

    const batch = await createBatch({
      name,
      timing,
      instructor,
      monthly_fee: Number(monthly_fee || 1000),
    });

    return NextResponse.json({
      success: true,
      message: 'Dance batch created successfully!',
      batch,
    });
  } catch (err: any) {
    console.error('Error creating batch:', err);
    return NextResponse.json({ error: err.message || 'Failed to create batch' }, { status: 500 });
  }
}
