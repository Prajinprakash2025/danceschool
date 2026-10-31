'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Music,
  User,
  CreditCard,
  CheckCircle2,
  Clock,
  Printer,
  LogOut,
  Calendar,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Student, StudentFee } from '@/types';
import { loadRazorpayScript } from '@/lib/loadRazorpay';

export default function StudentDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [payingFeeId, setPayingFeeId] = useState<string | null>(null);

  // Receipt Modal State
  const [selectedReceiptFee, setSelectedReceiptFee] = useState<StudentFee | null>(null);

  // Mock Payment Modal State (for testing without real Razorpay keys)
  const [mockPaymentModal, setMockPaymentModal] = useState<{
    isOpen: boolean;
    orderId: string;
    fee: StudentFee | null;
  }>({
    isOpen: false,
    orderId: '',
    fee: null,
  });

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/fees');
      const data = await res.json();

      if (!res.ok) {
        router.push('/login?role=student');
        return;
      }

      setStudent(data.student);
      setFees(data.fees || []);
    } catch (err) {
      console.error('Failed to load student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login?role=student');
  };

  const initiatePayment = async (fee: StudentFee) => {
    try {
      setPayingFeeId(fee.id);

      // 1. Create order on server
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeId: fee.id }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        alert(orderData.error || 'Failed to initialize payment');
        return;
      }

      // If running in Mock/Demo mode, show mock Razorpay modal
      if (orderData.isMock) {
        setMockPaymentModal({
          isOpen: true,
          orderId: orderData.orderId,
          fee,
        });
        return;
      }

      // 2. Load standard Razorpay Checkout Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Could not load Razorpay SDK. Check your internet connection.');
        return;
      }

      // 3. Open Razorpay Checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Natyanjali Dance Academy',
        description: orderData.feeTitle || 'Dance Academy Fee',
        order_id: orderData.orderId,
        prefill: {
          name: student?.name,
          contact: student?.phone,
        },
        theme: {
          color: '#ea580c', // Orange-600
        },
        handler: async function (response: any) {
          // 4. Verify payment on server
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              feeId: fee.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              isMock: false,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            alert('Payment completed successfully!');
            await fetchStudentData();
          } else {
            alert(verifyData.error || 'Payment verification failed');
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed');
    } finally {
      setPayingFeeId(null);
    }
  };

  const handleCompleteMockPayment = async (mode: string) => {
    if (!mockPaymentModal.fee) return;
    try {
      const mockPaymentId = `pay_mock_${Date.now()}_${mode}`;
      const verifyRes = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feeId: mockPaymentModal.fee.id,
          razorpay_order_id: mockPaymentModal.orderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: `mock_sig_${Date.now()}`,
          isMock: true,
        }),
      });

      if (verifyRes.ok) {
        setMockPaymentModal({ isOpen: false, orderId: '', fee: null });
        alert(`🎉 Payment of ₹${mockPaymentModal.fee.amount} via ${mode} was successful!`);
        await fetchStudentData();
      } else {
        alert('Could not verify mock payment');
      }
    } catch {
      alert('Mock payment failed');
    }
  };

  const pendingFees = fees.filter((f) => f.status === 'PENDING');
  const paidFees = fees.filter((f) => f.status === 'PAID');

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-stone-50 to-orange-50/20 text-stone-900 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg block leading-tight text-stone-900">
                Natyanjali Portal
              </span>
              <span className="text-[11px] text-orange-700 uppercase font-semibold tracking-wider">
                Student & Parent Fees
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/70 text-amber-900 font-mono text-xs font-semibold">
              <User className="w-3.5 h-3.5" /> {student?.student_id}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
        {/* Student Profile Card */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold border border-orange-500/30">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              Active Dance Student
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {student?.name}
            </h2>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-stone-300">
              <div>Parent: <span className="text-white font-medium">{student?.parent_name}</span></div>
              <div>•</div>
              <div>Phone: <span className="text-white font-mono">{student?.phone}</span></div>
              <div>•</div>
              <div>Batch: <span className="text-amber-300 font-medium">{student?.batch}</span></div>
            </div>
          </div>

          <div className="bg-stone-800/80 border border-stone-700/80 p-4 rounded-2xl flex md:flex-col items-center justify-between gap-2 shrink-0">
            <span className="text-xs text-stone-400 uppercase font-semibold">Student ID</span>
            <span className="font-mono text-lg font-bold text-amber-400">{student?.student_id}</span>
          </div>
        </div>

        {/* Pending Dues Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-lg sm:text-xl font-bold text-stone-900">
                Pending Fees & Funds ({pendingFees.length})
              </h3>
            </div>
            {pendingFees.length > 0 && (
              <span className="text-xs sm:text-sm font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                Total Due: ₹{pendingFees.reduce((acc, curr) => acc + Number(curr.amount), 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {pendingFees.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/90 shadow-xs space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-stone-900">All Fees Cleared!</h4>
              <p className="text-xs sm:text-sm text-stone-500">
                You have no pending dues or fund payments at this time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {pendingFees.map((fee) => (
                <div
                  key={fee.id}
                  className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 uppercase tracking-wider">
                        Pending Due
                      </span>
                      <div className="text-2xl font-extrabold text-stone-900">
                        ₹{Number(fee.amount).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                      {fee.fund_title}
                    </h4>

                    {fee.fund_description && (
                      <p className="text-xs text-stone-500 line-clamp-2">
                        {fee.fund_description}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-stone-500 pt-1">
                      <Calendar className="w-3.5 h-3.5 text-orange-600" />
                      <span>Due by: <strong className="text-stone-700">{new Date(fee.due_date || '').toLocaleDateString('en-IN')}</strong></span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100">
                    <button
                      onClick={() => initiatePayment(fee)}
                      disabled={payingFeeId === fee.id}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold text-sm shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {payingFeeId === fee.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Preparing Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" /> Pay with Razorpay (UPI / Cards)
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-stone-400 text-center mt-2">
                      Secure payment via Razorpay. Supports Google Pay, PhonePe, Cards & NetBanking.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Paid Fees / Receipts Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg sm:text-xl font-bold text-stone-900">
              Payment History & Receipts ({paidFees.length})
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[11px] border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Fee Title</th>
                    <th className="py-3.5 px-4 font-semibold">Amount Paid</th>
                    <th className="py-3.5 px-4 font-semibold">Date Paid</th>
                    <th className="py-3.5 px-4 font-semibold">Razorpay Ref</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {paidFees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-stone-400 text-sm">
                        No previous payment records found.
                      </td>
                    </tr>
                  ) : (
                    paidFees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-amber-50/20 transition">
                        <td className="py-3.5 px-4 font-semibold text-stone-900">
                          {fee.fund_title}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-emerald-700">
                          ₹{Number(fee.paid_amount || fee.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600">
                          {new Date(fee.paid_at || '').toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500">
                          {fee.razorpay_payment_id || 'Direct'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedReceiptFee(fee)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
                          >
                            <Printer className="w-3.5 h-3.5" /> View Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* ---------------- MOCK RAZORPAY TEST PAYMENT MODAL ---------------- */}
      {mockPaymentModal.isOpen && mockPaymentModal.fee && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                  RZP
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Razorpay Test Checkout</h4>
                  <p className="text-[10px] text-emerald-600 font-semibold">Demo Sandbox Mode</p>
                </div>
              </div>
              <button
                onClick={() => setMockPaymentModal({ isOpen: false, orderId: '', fee: null })}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl space-y-1">
              <div className="text-xs text-stone-500">Paying For:</div>
              <div className="font-bold text-sm text-stone-900">{mockPaymentModal.fee.fund_title}</div>
              <div className="text-2xl font-black text-orange-600 mt-2">
                ₹{Number(mockPaymentModal.fee.amount).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-600 uppercase">Simulate Payment Method:</p>
              <button
                onClick={() => handleCompleteMockPayment('UPI_GPAY')}
                className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" /> Pay with UPI (Google Pay / PhonePe)
              </button>
              <button
                onClick={() => handleCompleteMockPayment('DEBIT_CARD')}
                className="w-full py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> Pay with Debit/Credit Card
              </button>
            </div>

            <p className="text-[11px] text-stone-400 text-center">
              (In production, add your Razorpay Live Keys to <code className="font-mono text-stone-600">.env.local</code> to open the real payment gateway).
            </p>
          </div>
        </div>
      )}

      {/* ---------------- PRINTABLE RECEIPT MODAL ---------------- */}
      {selectedReceiptFee && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900">Natyanjali Dance Academy</h3>
                  <p className="text-xs text-stone-500">Official Fee Payment Receipt</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceiptFee(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Details */}
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200/80">
                <div>
                  <span className="text-stone-400 block text-[11px]">STUDENT NAME</span>
                  <span className="font-bold text-stone-900">{student?.name}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">STUDENT ID</span>
                  <span className="font-mono font-bold text-orange-700">{student?.student_id}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">BATCH</span>
                  <span className="font-medium text-stone-800">{student?.batch}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">PAYMENT DATE</span>
                  <span className="font-medium text-stone-800">
                    {new Date(selectedReceiptFee.paid_at || '').toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="border border-stone-200 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-stone-500 pb-2 border-b border-stone-100">
                  <span>Particulars</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between items-center font-bold text-stone-900 pt-1">
                  <span>{selectedReceiptFee.fund_title}</span>
                  <span className="text-emerald-700 text-base">
                    ₹{Number(selectedReceiptFee.paid_amount || selectedReceiptFee.amount).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 font-mono pt-2">
                  Transaction Ref: {selectedReceiptFee.razorpay_payment_id || 'N/A'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Payment successfully verified & recorded. Thank you!</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedReceiptFee(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs sm:text-sm font-semibold transition"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
