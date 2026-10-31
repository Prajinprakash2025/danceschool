import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllFunds, createFund } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  const funds = await getAllFunds();
  return NextResponse.json({ funds });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, fee_type, month_name, description, amount, due_date, batch } = body;

    if (!title || !amount || !due_date) {
      return NextResponse.json(
        { error: 'Title, amount, and due date are required' },
        { status: 400 }
      );
    }

    const fund = await createFund({
      title,
      fee_type: fee_type || 'MONTHLY',
      month_name: month_name || '',
      description,
      amount: Number(amount),
      due_date,
      batch: batch || 'ALL',
    });

    return NextResponse.json({
      success: true,
      message: 'Fee demand created and assigned to students!',
      fund,
    });
  } catch (err: any) {
    console.error('Error creating fund:', err);
    return NextResponse.json({ error: err.message || 'Failed to create fund' }, { status: 500 });
  }
}
