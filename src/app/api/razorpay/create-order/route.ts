import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getStudentFees, getStudentByStudentId } from '@/lib/db';
import { getRazorpayClient } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized. Student login required.' }, { status: 401 });
    }

    const { feeId } = await req.json();
    if (!feeId) {
      return NextResponse.json({ error: 'Fee ID is required' }, { status: 400 });
    }

    const student = await getStudentByStudentId(user.identifier);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const fees = await getStudentFees(student.id);
    const targetFee = fees.find((f) => f.id === feeId);

    if (!targetFee) {
      return NextResponse.json({ error: 'Fee record not found' }, { status: 404 });
    }

    if (targetFee.status === 'PAID') {
      return NextResponse.json({ error: 'This fee is already paid' }, { status: 400 });
    }

    const amountInRupees = Number(targetFee.amount);
    const amountInPaise = Math.round(amountInRupees * 100);

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key';
    const isMock = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_mock_key';

    if (isMock) {
      // Demo test order for testing without real keys
      return NextResponse.json({
        success: true,
        orderId: `order_demo_${Date.now()}`,
        amount: amountInPaise,
        currency: 'INR',
        keyId: 'rzp_test_mock_key',
        feeTitle: targetFee.fund_title,
        studentName: student.name,
        studentPhone: student.phone,
        isMock: true,
      });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `fee_${targetFee.id.slice(0, 20)}`,
      notes: {
        feeId: targetFee.id,
        studentId: student.student_id,
        studentName: student.name,
        fundTitle: targetFee.fund_title || '',
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      feeTitle: targetFee.fund_title,
      studentName: student.name,
      studentPhone: student.phone,
      isMock: false,
    });
  } catch (err: any) {
    console.error('Error creating Razorpay order:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
