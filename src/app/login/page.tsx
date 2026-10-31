'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Music, ShieldCheck, User, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'admin' ? 'ADMIN' : 'STUDENT';

  const [role, setRole] = useState<'ADMIN' | 'STUDENT'>(initialRole);
  
  // Empty values so fields are completely blank by default!
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

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200">
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Music className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl text-stone-900 group-hover:text-orange-600 transition">
            Natyanjali
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
          Welcome to Academy Portal
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          {role === 'ADMIN' ? 'Sign in to access Admin Management Console' : 'Sign in to view and pay student dance funds'}
        </p>
      </div>

      {/* Role Switcher Tabs */}
      <div className="flex p-1.5 bg-stone-100 rounded-2xl mb-6">
        <button
          type="button"
          onClick={() => {
            setRole('STUDENT');
            setError(null);
            setUsername('');
            setStudentId('');
            setPassword('');
          }}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 ${
            role === 'STUDENT'
              ? 'bg-white text-orange-600 shadow-sm'
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
            setUsername('');
            setStudentId('');
            setPassword('');
          }}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 ${
            role === 'ADMIN'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Admin
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {role === 'ADMIN' ? (
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g. admin)"
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 bg-white text-stone-900 font-semibold placeholder:text-stone-400 placeholder:font-normal focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 text-sm transition"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
              Student ID
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter Student ID (e.g. DS-2026-001)"
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-300 bg-white text-stone-900 font-semibold font-mono placeholder:font-sans placeholder:text-stone-400 placeholder:font-normal uppercase focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/10 text-sm transition"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-4 pr-11 py-3 rounded-xl border-2 border-stone-300 bg-white text-stone-900 font-semibold placeholder:text-stone-400 placeholder:font-normal focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 text-sm transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 p-0.5"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 rounded-xl font-bold text-white shadow-md transition flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer ${
            role === 'ADMIN'
              ? 'bg-stone-900 hover:bg-stone-800'
              : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700'
          }`}
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
    <div className="min-h-screen bg-gradient-to-tr from-amber-50 via-stone-100 to-orange-50 flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-stone-500 text-sm">Loading login portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
