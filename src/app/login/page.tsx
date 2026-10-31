'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Music, ShieldCheck, User, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'admin' ? 'ADMIN' : 'STUDENT';

  const [role, setRole] = useState<'ADMIN' | 'STUDENT'>(initialRole);
  const [username, setUsername] = useState(initialRole === 'ADMIN' ? 'admin' : '');
  const [studentId, setStudentId] = useState(initialRole === 'STUDENT' ? 'DS-2026-001' : '');
  const [password, setPassword] = useState(initialRole === 'ADMIN' ? 'admin123' : 'dance@2026');
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

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200/80">
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-700 to-orange-600 flex items-center justify-center text-white shadow-sm">
            <Music className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-stone-900 group-hover:text-orange-600 transition">
            Natyanjali
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
          Welcome to Academy Portal
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Sign in to manage students or complete fund payments
        </p>
      </div>

      {/* Role Switcher Tabs */}
      <div className="flex p-1 bg-stone-100 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => {
            setRole('STUDENT');
            setError(null);
            if (!studentId) setStudentId('DS-2026-001');
            if (!password) setPassword('dance@2026');
          }}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
            role === 'STUDENT'
              ? 'bg-white text-orange-600 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <User className="w-4 h-4" /> Parent / Student
        </button>
        <button
          type="button"
          onClick={() => {
            setRole('ADMIN');
            setError(null);
            if (!username) setUsername('admin');
            if (!password) setPassword('admin123');
          }}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
            role === 'ADMIN'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Admin
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {role === 'ADMIN' ? (
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Admin Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-transparent text-sm transition"
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">Default username: <span className="font-mono font-medium">admin</span></p>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Student ID
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. DS-2026-001"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition font-mono uppercase"
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">Auto-assigned ID provided by dance school</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition"
            />
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {role === 'ADMIN' ? 'Default: admin123' : 'Sample: dance@2026'}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 rounded-xl font-semibold text-white shadow-md transition flex items-center justify-center gap-2 text-sm disabled:opacity-60 ${
            role === 'ADMIN'
              ? 'bg-stone-900 hover:bg-stone-800'
              : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
            </>
          ) : (
            <>
              Sign In to {role === 'ADMIN' ? 'Admin Console' : 'Portal'} <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs text-stone-500">
        <Link href="/" className="hover:text-orange-600 font-medium transition">
          ← Back to Academy Home
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-amber-100/60 via-stone-50 to-orange-100/40 flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-stone-500 text-sm">Loading login portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
