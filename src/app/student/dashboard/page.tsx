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
  Phone,
  Layers,
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

      if (orderData.isMock) {
        setMockPaymentModal({
          isOpen: true,
          orderId: orderData.orderId,
          fee,
        });
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Could not load Razorpay SDK. Check your internet connection.');
        return;
      }

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
          color: '#ea580c',
        },
        handler: async function (response: any) {
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
            alert('🎉 Payment completed successfully!');
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
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-stone-900/90 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-600 text-white flex items-center justify-center shadow-md">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base block leading-tight text-white">
                Natyanjali Portal
              </span>
              <span className="text-[10px] text-orange-400 uppercase font-semibold">
                Parent & Student Fees
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-800 text-amber-300 font-mono text-xs font-semibold border border-stone-700">
              <User className="w-3.5 h-3.5 text-stone-400" /> {student?.student_id}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 space-y-6">
        {/* Student Profile Card (App-style on mobile) */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-3xl p-5 sm:p-7 border border-stone-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold border border-orange-500/20">
              <Sparkles className="w-3 h-3" /> Enrolled Student
            </span>
            <span className="font-mono text-xs text-amber-400 font-bold bg-stone-950 px-2.5 py-1 rounded-lg border border-stone-800">
              ID: {student?.student_id}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {student?.name}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-stone-400 pt-1">
            <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80">
              <span className="block text-[10px] text-stone-500 uppercase">Parent Name</span>
              <strong className="text-stone-200">{student?.parent_name}</strong>
            </div>
            <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80">
              <span className="block text-[10px] text-stone-500 uppercase">Contact WhatsApp</span>
              <strong className="text-stone-200 font-mono">{student?.phone}</strong>
            </div>
            <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80">
              <span className="block text-[10px] text-stone-500 uppercase">Class Batch</span>
              <strong className="text-amber-300">{student?.batch}</strong>
            </div>
          </div>
        </div>

        {/* Pending Dues Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              Pending Fees ({pendingFees.length})
            </h3>
            {pendingFees.length > 0 && (
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                Due: ₹{pendingFees.reduce((acc, curr) => acc + Number(curr.amount), 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {pendingFees.length === 0 ? (
            <div className="bg-stone-900 rounded-2xl p-6 text-center border border-stone-800 space-y-1.5">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-sm text-white">All Fees Cleared!</h4>
              <p className="text-xs text-stone-400">
                You currently have no outstanding monthly fees or fund dues.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pendingFees.map((fee) => (
                <div
                  key={fee.id}
                  className="bg-stone-900 rounded-2xl p-5 border border-stone-800 flex flex-col justify-between space-y-3 shadow-md"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
                        Pending Due
                      </span>
                      <div className="text-xl font-black text-white">
                        ₹{Number(fee.amount).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white leading-snug">
                      {fee.fund_title}
                    </h4>

                    {fee.fund_description && (
                      <p className="text-xs text-stone-400 line-clamp-2">{fee.fund_description}</p>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-stone-400 pt-1">
                      <Calendar className="w-3.5 h-3.5 text-orange-400" />
                      <span>Due: <strong className="text-stone-300">{new Date(fee.due_date || '').toLocaleDateString('en-IN')}</strong></span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-800">
                    <button
                      onClick={() => initiatePayment(fee)}
                      disabled={payingFeeId === fee.id}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
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
                    <p className="text-[10px] text-stone-500 text-center mt-1.5">
                      Supports GPay, PhonePe, Paytm, Cards & NetBanking
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Paid Fees & Receipts Section */}
        <section className="space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Payment History & Receipts ({paidFees.length})
          </h3>

          <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
            {paidFees.length === 0 ? (
              <div className="py-8 text-center text-stone-500 text-xs">
                No previous payments recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-stone-800">
                {paidFees.map((fee) => (
                  <div
                    key={fee.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-800/30 transition"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-white">{fee.fund_title}</h4>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Paid on {new Date(fee.paid_at || '').toLocaleDateString('en-IN')} • Ref: <span className="font-mono text-stone-500">{fee.razorpay_payment_id || 'Direct'}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="font-black text-emerald-400 text-base">
                        ₹{Number(fee.paid_amount || fee.amount).toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => setSelectedReceiptFee(fee)}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> View Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ---------------- MOCK RAZORPAY TEST MODAL ---------------- */}
      {mockPaymentModal.isOpen && mockPaymentModal.fee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                  RZP
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Razorpay Sandbox</h4>
                  <p className="text-[10px] text-emerald-400 font-semibold">Test Payment Gateway</p>
                </div>
              </div>
              <button
                onClick={() => setMockPaymentModal({ isOpen: false, orderId: '', fee: null })}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-stone-950 p-3.5 rounded-xl space-y-1 border border-stone-800">
              <span className="text-xs text-stone-400">{mockPaymentModal.fee.fund_title}</span>
              <div className="text-2xl font-black text-orange-400">
                ₹{Number(mockPaymentModal.fee.amount).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-400 uppercase">Simulate Payment:</p>
              <button
                onClick={() => handleCompleteMockPayment('UPI_GPAY')}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Pay with UPI (GPay / PhonePe)
              </button>
              <button
                onClick={() => handleCompleteMockPayment('DEBIT_CARD')}
                className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" /> Pay with Debit/Credit Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- PRINTABLE RECEIPT MODAL ---------------- */}
      {selectedReceiptFee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Natyanjali Dance Academy</h3>
                  <p className="text-[11px] text-stone-400">Official Payment Receipt</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceiptFee(null)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5 bg-stone-950 p-3.5 rounded-xl border border-stone-800">
                <div>
                  <span className="text-stone-500 block text-[10px]">STUDENT NAME</span>
                  <strong className="text-white">{student?.name}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">STUDENT ID</span>
                  <strong className="font-mono text-orange-400">{student?.student_id}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">BATCH</span>
                  <span className="text-stone-300">{student?.batch}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">DATE PAID</span>
                  <span className="text-stone-300">
                    {new Date(selectedReceiptFee.paid_at || '').toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="border border-stone-800 bg-stone-950 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center text-[11px] text-stone-400 border-b border-stone-800 pb-1.5">
                  <span>Particulars</span>
                  <span>Amount Paid</span>
                </div>
                <div className="flex justify-between items-center font-bold text-white pt-1">
                  <span>{selectedReceiptFee.fund_title}</span>
                  <span className="text-emerald-400 text-base">
                    ₹{Number(selectedReceiptFee.paid_amount || selectedReceiptFee.amount).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-[10px] text-stone-500 font-mono pt-1">
                  Transaction Ref: {selectedReceiptFee.razorpay_payment_id || 'pay_direct'}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Payment successfully verified & recorded.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSelectedReceiptFee(null)}
                className="px-4 py-2 rounded-xl border border-stone-800 text-stone-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
