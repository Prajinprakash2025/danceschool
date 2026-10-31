import Razorpay from 'razorpay';
import crypto from 'crypto';

export function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret';

  return new Razorpay({
    key_id,
    key_secret,
  });
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret';
  
  // If in mock/demo mode without real keys, allow test verification
  if (keySecret === 'rzp_test_mock_secret' && signature.startsWith('mock_sig_')) {
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}
