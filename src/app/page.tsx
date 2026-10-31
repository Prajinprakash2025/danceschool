'use client';

import Link from 'next/link';
import { Sparkles, ShieldCheck, CreditCard, Users, ArrowRight, Award, Music } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-orange-50/30 text-stone-800">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-amber-100/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-700 via-orange-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Music className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="font-bold text-lg sm:text-xl tracking-tight text-stone-900 block leading-tight">
                Natyanjali
              </span>
              <span className="text-xs text-amber-700 font-medium tracking-wider uppercase">
                Dance Academy Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login?role=student"
              className="text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg text-stone-700 hover:text-orange-600 hover:bg-orange-50 transition"
            >
              Parent Portal
            </Link>
            <Link
              href="/login?role=admin"
              className="text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white shadow-sm transition flex items-center gap-1.5"
            >
              Admin Login <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 text-orange-800 text-xs sm:text-sm font-medium border border-orange-200/60">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>Digital Student Fund & Fee Management</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-tight">
            Simplify Dance School <br />
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
              Fees & Student Funds
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
            A unified digital portal for parents and administrators. Effortlessly track batch funds, 
            annual costume fees, and collect online payments securely via Razorpay UPI & Cards.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
            <Link
              href="/login?role=student"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold shadow-lg shadow-orange-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <CreditCard className="w-4 h-4" />
              Pay Student Fees (Parent Login)
            </Link>
            <Link
              href="/login?role=admin"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border border-stone-200 hover:border-orange-300 hover:bg-orange-50/40 text-stone-800 font-semibold shadow-xs transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              Admin Management Console
            </Link>
          </div>

          {/* Quick Demo Credentials Pill */}
          <div className="mt-8 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs sm:text-sm text-stone-700 max-w-xl mx-auto text-left flex flex-col gap-1.5">
            <div className="font-semibold text-amber-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-700" /> Quick Demo Credentials for Testing:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-white/80 p-2 rounded-md border border-amber-100">
                <span className="font-semibold block text-stone-900">Admin Account:</span>
                Username: <code className="bg-stone-100 px-1 py-0.5 rounded text-orange-700 font-mono">admin</code><br />
                Password: <code className="bg-stone-100 px-1 py-0.5 rounded text-orange-700 font-mono">admin123</code>
              </div>
              <div className="bg-white/80 p-2 rounded-md border border-amber-100">
                <span className="font-semibold block text-stone-900">Sample Student / Parent:</span>
                Student ID: <code className="bg-stone-100 px-1 py-0.5 rounded text-orange-700 font-mono">DS-2026-001</code><br />
                Password: <code className="bg-stone-100 px-1 py-0.5 rounded text-orange-700 font-mono">dance@2026</code>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-5">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2">Instant Razorpay Integration</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Parents can pay monthly dance fees or festival funds directly with UPI (Google Pay, PhonePe, Paytm),
              Credit/Debit cards, or NetBanking. Instant digital receipts with tamper-proof signatures.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2">Automated Student ID Generation</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              When the administrator enrolls a student, unique Student IDs (e.g., <code className="text-amber-800 font-mono text-xs">DS-2026-001</code>) 
              are automatically generated. Login credentials are created and viewable by the admin.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2">Fund Campaign Management</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Create specific fund requests like "Arangettam Costumes", "Annual Day", or "Workshop Fees" 
              and automatically allocate them to all students or specific classical batches.
            </p>
          </div>
        </div>

        {/* Workflow Section */}
        <div className="mt-16 sm:mt-24 bg-gradient-to-r from-stone-900 to-stone-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How the Portal Operates</h2>
            <p className="text-stone-300 text-sm mt-2">
              A smooth 3-step lifecycle designed for dance instructors, administrators, and parents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-stone-800/80 border border-stone-700/60 p-5 rounded-xl space-y-2">
              <span className="w-7 h-7 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center">1</span>
              <h4 className="font-semibold text-base text-amber-200">Admin Enrolls Student</h4>
              <p className="text-xs text-stone-400">
                System auto-creates the Student ID & initial password. The administrator shares these with the student's parents.
              </p>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/60 p-5 rounded-xl space-y-2">
              <span className="w-7 h-7 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h4 className="font-semibold text-base text-amber-200">Parent Logs In</h4>
              <p className="text-xs text-stone-400">
                Parent signs in using the Student ID & Password, checks pending fees, and clicks "Pay with Razorpay".
              </p>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/60 p-5 rounded-xl space-y-2">
              <span className="w-7 h-7 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center">3</span>
              <h4 className="font-semibold text-base text-amber-200">Instant Verification & Receipt</h4>
              <p className="text-xs text-stone-400">
                Upon payment, the dashboard updates immediately to 'PAID', and the parent can download a branded digital receipt.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 text-center text-xs text-stone-500">
        <p>© 2026 Natyanjali Dance Academy Management System. Built with Next.js, Supabase, & Razorpay.</p>
      </footer>
    </div>
  );
}
