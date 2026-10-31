'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  CreditCard,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  LogOut,
  Music,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { Student, Fund, StudentFee, DashboardStats } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'students' | 'funds' | 'collections'>('students');

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [allFees, setAllFees] = useState<StudentFee[]>([]);

  // Modals
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddFund, setShowAddFund] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // New Student Form
  const [studentForm, setStudentForm] = useState({
    name: '',
    parent_name: '',
    phone: '',
    email: '',
    batch: 'Bharatanatyam - Junior',
    password: '',
  });
  const [savingStudent, setSavingStudent] = useState(false);

  // New Fund Form
  const [fundForm, setFundForm] = useState({
    title: '',
    description: '',
    amount: '',
    due_date: '',
    batch: 'ALL',
  });
  const [savingFund, setSavingFund] = useState(false);

  // Filters & Search
  const [searchStudent, setSearchStudent] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');

  useEffect(() => {
    fetchDashboardData();
    const defaultDue = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setFundForm((prev) => ({ ...prev, due_date: defaultDue }));
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Check current session
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      if (!authRes.ok || authData.user?.role !== 'ADMIN') {
        router.push('/login?role=admin');
        return;
      }

      // Fetch stats & fees
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setStats(statsData.stats);
        setAllFees(statsData.allFees || []);
      }

      // Fetch students
      const stdRes = await fetch('/api/admin/students');
      const stdData = await stdRes.json();
      if (stdRes.ok) {
        setStudents(stdData.students || []);
      }

      // Fetch funds
      const fundRes = await fetch('/api/admin/funds');
      const fundData = await fundRes.json();
      if (fundRes.ok) {
        setFunds(fundData.funds || []);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login?role=admin');
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStudent(true);

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to create student');
        return;
      }

      setShowAddStudent(false);
      setStudentForm({
        name: '',
        parent_name: '',
        phone: '',
        email: '',
        batch: 'Bharatanatyam - Junior',
        password: '',
      });
      await fetchDashboardData();
      alert(`Student enrolled successfully! Auto-generated ID: ${data.student.student_id}`);
    } catch (err: any) {
      alert(err.message || 'Error creating student');
    } finally {
      setSavingStudent(false);
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove student "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchDashboardData();
      } else {
        alert('Could not delete student');
      }
    } catch {
      alert('Error deleting student');
    }
  };

  const handleCreateFund = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFund(true);

    try {
      const res = await fetch('/api/admin/funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fundForm),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to create fund');
        return;
      }

      setShowAddFund(false);
      setFundForm({
        title: '',
        description: '',
        amount: '',
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        batch: 'ALL',
      });
      await fetchDashboardData();
      alert('Fund category created and allocated to eligible students!');
    } catch (err: any) {
      alert(err.message || 'Error creating fund');
    } finally {
      setSavingFund(false);
    }
  };

  const copyCredentials = (student: Student) => {
    const text = `Natyanjali Dance Academy Login:\nStudent: ${student.name}\nStudent ID: ${student.student_id}\nPassword: ${student.password || 'dance@2026'}\nPortal: ${window.location.origin}/login?role=student`;
    navigator.clipboard.writeText(text);
    setCopySuccess(student.id);
    setTimeout(() => setCopySuccess(null), 3000);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.batch.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.parent_name.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const filteredFees = allFees.filter((f) => {
    if (statusFilter === 'ALL') return true;
    return f.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/70 text-stone-900 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-xs">
              <Music className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg block leading-tight text-stone-900">
                Natyanjali Admin
              </span>
              <span className="text-[11px] text-stone-500 uppercase font-semibold tracking-wider">
                Dance Academy Fund System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition hidden sm:inline-block"
            >
              View Academy Website
            </Link>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Total Enrolled Students
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                {stats?.totalStudents || students.length}
              </h3>
              <p className="text-xs text-stone-400 mt-1">Across all classical dance batches</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Total Funds Collected
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
                ₹{Number(stats?.totalCollected || 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-stone-400 mt-1">Verified via Razorpay / Direct</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between sm:col-span-2 lg:col-span-1">
            <div>
              <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
                Total Pending Fees
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
                ₹{Number(stats?.totalPending || 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-stone-400 mt-1">Awaiting parent payment</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Controls & Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div className="flex p-1 bg-stone-200/80 rounded-xl max-w-md">
            <button
              onClick={() => setActiveTab('students')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
                activeTab === 'students'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Students ({students.length})
            </button>
            <button
              onClick={() => setActiveTab('funds')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
                activeTab === 'funds'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Funds & Campaigns ({funds.length})
            </button>
            <button
              onClick={() => setActiveTab('collections')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
                activeTab === 'collections'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Collections ({allFees.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'students' && (
              <button
                onClick={() => setShowAddStudent(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Enroll New Student
              </button>
            )}
            {activeTab === 'funds' && (
              <button
                onClick={() => setShowAddFund(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create New Fund / Fee
              </button>
            )}
          </div>
        </div>

        {/* ---------------- STUDENTS TAB ---------------- */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, or batch..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                />
              </div>

              <div className="text-xs text-stone-500 font-medium">
                Auto-Student ID sequence is active (e.g. <span className="font-mono font-semibold text-stone-800">DS-2026-00X</span>)
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[11px] border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Student ID</th>
                    <th className="py-3.5 px-4 font-semibold">Student & Parent</th>
                    <th className="py-3.5 px-4 font-semibold">Phone</th>
                    <th className="py-3.5 px-4 font-semibold">Batch</th>
                    <th className="py-3.5 px-4 font-semibold">Parent Login Password</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400 text-sm">
                        No students enrolled yet. Click "+ Enroll New Student" to add.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((std) => (
                      <tr key={std.id} className="hover:bg-amber-50/30 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-orange-700">
                          {std.student_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-stone-900">{std.name}</div>
                          <div className="text-xs text-stone-500">Parent: {std.parent_name}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-stone-600">{std.phone}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100/70 text-amber-900">
                            {std.batch}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-stone-100 px-2 py-1 rounded text-stone-800">
                              {std.password || 'dance@2026'}
                            </span>
                            <button
                              onClick={() => copyCredentials(std)}
                              title="Copy Login Details to WhatsApp to Parent"
                              className="p-1 rounded-md hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition"
                            >
                              {copySuccess === std.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Share2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteStudent(std.id, std.name)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                            title="Remove student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- FUNDS & CAMPAIGNS TAB ---------------- */}
        {activeTab === 'funds' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funds.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-400 text-sm">
                No fee categories created yet. Click "+ Create New Fund / Fee" above.
              </div>
            ) : (
              funds.map((fund) => {
                const fundFees = allFees.filter((f) => f.fund_id === fund.id);
                const paidFees = fundFees.filter((f) => f.status === 'PAID');
                const totalTarget = fundFees.length * fund.amount;
                const totalCollected = paidFees.length * fund.amount;
                const percentage = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

                return (
                  <div
                    key={fund.id}
                    className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-800 uppercase tracking-wider">
                          {fund.batch === 'ALL' ? 'All Batches' : fund.batch}
                        </span>
                        <div className="text-right font-extrabold text-lg text-stone-900">
                          ₹{Number(fund.amount).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <h4 className="font-bold text-base text-stone-900 mb-1">{fund.title}</h4>
                      <p className="text-xs text-stone-500 line-clamp-2 mb-4">
                        {fund.description || 'General dance academy fund collection.'}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-4">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>Due Date: {new Date(fund.due_date).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-stone-500">Collection Progress:</span>
                        <span className="text-stone-900 font-bold">
                          ₹{totalCollected.toLocaleString('en-IN')} / ₹{totalTarget.toLocaleString('en-IN')} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-stone-400 text-right">
                        {paidFees.length} of {fundFees.length} students paid
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ---------------- COLLECTIONS & TRANSACTIONS TAB ---------------- */}
        {activeTab === 'collections' && (
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'ALL'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All Status ({allFees.length})
                </button>
                <button
                  onClick={() => setStatusFilter('PAID')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'PAID'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Paid Only ({allFees.filter((f) => f.status === 'PAID').length})
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'PENDING'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  Pending Only ({allFees.filter((f) => f.status === 'PENDING').length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[11px] border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Student ID</th>
                    <th className="py-3.5 px-4 font-semibold">Student Name</th>
                    <th className="py-3.5 px-4 font-semibold">Fee Category</th>
                    <th className="py-3.5 px-4 font-semibold">Amount</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Payment Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredFees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400 text-sm">
                        No transactions found for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredFees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-amber-50/20 transition">
                        <td className="py-3.5 px-4 font-mono font-semibold text-stone-700">
                          {fee.student_code}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-stone-900">{fee.student_name}</div>
                          <div className="text-[11px] text-stone-400">{fee.batch}</div>
                        </td>
                        <td className="py-3.5 px-4 text-stone-800 font-medium">
                          {fee.fund_title}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-900">
                          ₹{Number(fee.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          {fee.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" /> PAID
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                              <Clock className="w-3.5 h-3.5" /> PENDING
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-stone-500">
                          {fee.status === 'PAID' ? (
                            <div>
                              <div>Paid: {new Date(fee.paid_at || '').toLocaleDateString('en-IN')}</div>
                              <div className="font-mono text-[10px] text-stone-400">
                                {fee.razorpay_payment_id || 'Direct'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ---------------- ENROLL STUDENT MODAL ---------------- */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-xl font-bold text-stone-900">Enroll New Dance Student</h3>
              <p className="text-xs text-stone-500 mt-1">
                Student ID is generated automatically by sequence (e.g., <code className="font-mono text-orange-700">DS-2026-00X</code>).
              </p>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Nair"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Parent / Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Nair"
                    value={studentForm.parent_name}
                    onChange={(e) => setStudentForm({ ...studentForm, parent_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Phone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9847123456"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="parent@example.com"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Classical Dance Batch *
                </label>
                <select
                  value={studentForm.batch}
                  onChange={(e) => setStudentForm({ ...studentForm, batch: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-stone-900 focus:outline-hidden bg-white"
                >
                  <option value="Bharatanatyam - Junior">Bharatanatyam - Junior</option>
                  <option value="Bharatanatyam - Senior">Bharatanatyam - Senior</option>
                  <option value="Kuchipudi - Junior">Kuchipudi - Junior</option>
                  <option value="Kuchipudi - Senior">Kuchipudi - Senior</option>
                  <option value="Mohiniyattam - Beginners">Mohiniyattam - Beginners</option>
                  <option value="Mohiniyattam - Advanced">Mohiniyattam - Advanced</option>
                  <option value="Kathak - All Batches">Kathak - All Batches</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Login Password (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty to auto-generate (e.g. dance@2026)"
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-stone-900 focus:outline-hidden font-mono"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Parent will use this password + the Auto Student ID to sign in and pay fees.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStudent}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold transition flex items-center gap-1.5"
                >
                  {savingStudent ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Generate ID'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- CREATE FUND CAMPAIGN MODAL ---------------- */}
      {showAddFund && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-xl font-bold text-stone-900">Create New Dance Fund / Fee</h3>
              <p className="text-xs text-stone-500 mt-1">
                This fund will automatically be allocated to all students in the selected batch.
              </p>
            </div>

            <form onSubmit={handleCreateFund} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Fund Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arangettam Stage & Costume Fund"
                  value={fundForm.title}
                  onChange={(e) => setFundForm({ ...fundForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-orange-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Details about costumes, orchestra, jewelry, or purpose..."
                  value={fundForm.description}
                  onChange={(e) => setFundForm({ ...fundForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-orange-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Amount per Student (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1500"
                    value={fundForm.amount}
                    onChange={(e) => setFundForm({ ...fundForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-orange-600 focus:outline-hidden font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={fundForm.due_date}
                    onChange={(e) => setFundForm({ ...fundForm, due_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-orange-600 focus:outline-hidden bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Target Dance Batch
                </label>
                <select
                  value={fundForm.batch}
                  onChange={(e) => setFundForm({ ...fundForm, batch: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-orange-600 focus:outline-hidden bg-white"
                >
                  <option value="ALL">All Batches (Every enrolled student)</option>
                  <option value="Bharatanatyam - Junior">Bharatanatyam - Junior only</option>
                  <option value="Bharatanatyam - Senior">Bharatanatyam - Senior only</option>
                  <option value="Kuchipudi - Junior">Kuchipudi - Junior only</option>
                  <option value="Kuchipudi - Senior">Kuchipudi - Senior only</option>
                  <option value="Mohiniyattam - Beginners">Mohiniyattam - Beginners only</option>
                  <option value="Mohiniyattam - Advanced">Mohiniyattam - Advanced only</option>
                  <option value="Kathak - All Batches">Kathak - All Batches only</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFund(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFund}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition flex items-center gap-1.5"
                >
                  {savingFund ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create & Assign Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
