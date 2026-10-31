'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Music,
  ShieldCheck,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  Award,
} from 'lucide-react';

const CLASSICAL_DANCE_IMG =
  'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=80';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'admin' ? 'ADMIN' : 'STUDENT';

  const [role, setRole] = useState<'ADMIN' | 'STUDENT'>(initialRole);

  const [username, setUsername] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        role,
        username: role === 'ADMIN' ? username.trim() : undefined,
        student_id: role === 'STUDENT' ? studentId.trim().toUpperCase() : undefined,
        password: password.trim(),
      };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }

      if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type: 'ADMIN' | 'STUDENT') => {
    setError(null);
    if (type === 'ADMIN') {
      setRole('ADMIN');
      setUsername('admin');
      setPassword('admin123');
    } else {
      setRole('STUDENT');
      setStudentId('DS-2026-001');
      setPassword('dance@2026');
    }
  };

  return (
    <div className="w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
      {/* ---------------- LEFT HERO IMAGE & SHOWCASE COLUMN ---------------- */}
      <div className="relative lg:col-span-5 bg-stone-950 text-white p-6 sm:p-8 flex flex-col justify-between overflow-hidden min-h-[260px] lg:min-h-full">
        {/* Background Image with Dark Vignette Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url(${CLASSICAL_DANCE_IMG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/40" />

        {/* Top Header Pill */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg text-white tracking-tight block leading-tight">
                Natyanjali
              </span>
              <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
                Dance Academy Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Bottom Quote & Badges */}
        <div className="relative z-10 space-y-4 my-auto pt-6 lg:pt-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold border border-orange-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tradition • Rhythm • Grace</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
            Preserving the timeless heritage of Classical Indian Dance.
          </h1>

          <p className="text-xs text-stone-300 leading-relaxed hidden sm:block">
            Seamless digital portal for student tuition fees, costume funds, batch schedules, and instant payment receipts.
          </p>

          <div className="pt-2 space-y-1.5 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant UPI & NetBanking Verification</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Personalized Student Fee Cycle & Receipts</span>
            </div>
          </div>
        </div>

        {/* Footer Hint on Left */}
        <div className="relative z-10 pt-4 border-t border-stone-800/80 text-[11px] text-stone-400 flex items-center justify-between">
          <span>Bharatanatyam • Mohiniyattam</span>
          <span className="text-amber-400 font-mono">Academy 2026</span>
        </div>
      </div>

      {/* ---------------- RIGHT LOGIN FORM COLUMN ---------------- */}
      <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-stone-900 text-stone-100">
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Sign In to Portal
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              {role === 'ADMIN'
                ? 'Authorized access to Natyanjali Administrator Console'
                : 'Access student fee dues, payment history, and academy receipts'}
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="flex p-1.5 bg-stone-950 rounded-2xl mb-6 border border-stone-800">
            <button
              type="button"
              onClick={() => {
                setRole('STUDENT');
                setError(null);
                setUsername('');
                setStudentId('');
                setPassword('');
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                role === 'STUDENT'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" /> Parent / Student
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('ADMIN');
                setError(null);
                setUsername('');
                setStudentId('');
                setPassword('');
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                role === 'ADMIN'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Admin Console
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {role === 'ADMIN' ? (
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Admin Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    className="w-full px-4 py-3 rounded-xl border border-stone-700 bg-stone-950 text-white font-semibold placeholder:text-stone-500 placeholder:font-normal focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm transition"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Student ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. DS-2026-001"
                    className="w-full px-4 py-3 rounded-xl border border-stone-700 bg-stone-950 text-white font-semibold font-mono placeholder:font-sans placeholder:text-stone-500 placeholder:font-normal uppercase focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter login password"
                  className="w-full pl-4 pr-11 py-3 rounded-xl border border-stone-700 bg-stone-950 text-white font-semibold placeholder:text-stone-500 placeholder:font-normal focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-200 p-0.5 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-orange-600/20 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 transition flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  Sign In to {role === 'ADMIN' ? 'Admin Console' : 'Parent Portal'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Fill Assistant */}
          <div className="mt-5 p-3 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-stone-300 font-semibold">
              <Award className="w-3.5 h-3.5 text-orange-400" /> Quick Demo Fill:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fillDemo('ADMIN')}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium transition cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo('STUDENT')}
                className="px-2.5 py-1 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 text-[11px] font-medium border border-orange-500/30 transition cursor-pointer"
              >
                Student (DS-001)
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-6 pt-4 border-t border-stone-800 text-center text-xs text-stone-400">
          <Link href="/" className="hover:text-orange-400 font-medium transition">
            ← Back to Academy Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="text-stone-400 text-sm">Loading login portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
