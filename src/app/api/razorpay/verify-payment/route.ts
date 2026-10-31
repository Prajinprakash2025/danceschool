import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { markFeeAsPaid } from '@/lib/db';
import { verifyRazorpaySignature } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { feeId, razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = body;

    if (!feeId || !razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json({ error: 'Missing payment parameters' }, { status: 400 });
    }

    // Verify signature
    if (!isMock) {
      const isValid = verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        return NextResponse.json(
          { error: 'Payment signature verification failed. Contact support.' },
          { status: 400 }
        );
      }
    }

    const updated = await markFeeAsPaid(feeId, razorpay_order_id, razorpay_payment_id);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment completed successfully!',
      fee: updated,
    });
  } catch (err: any) {
    console.error('Error verifying payment:', err);
    return NextResponse.json(
      { error: err.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
