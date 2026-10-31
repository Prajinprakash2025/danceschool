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
  Menu,
  X,
  Layers,
  Receipt,
  Eye,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Printer,
  Phone,
} from 'lucide-react';
import { Student, Fund, StudentFee, Batch, DashboardStats } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'batches' | 'funds' | 'payments'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [allFees, setAllFees] = useState<StudentFee[]>([]);

  // Modals
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [showAddFund, setShowAddFund] = useState(false);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<StudentFee | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // New Student Form
  const [studentForm, setStudentForm] = useState({
    name: '',
    parent_name: '',
    phone: '',
    email: '',
    batch: '',
    password: '',
  });
  const [savingStudent, setSavingStudent] = useState(false);

  // New Batch Form
  const [batchForm, setBatchForm] = useState({
    name: '',
    timing: '',
    instructor: '',
    monthly_fee: '1000',
  });
  const [savingBatch, setSavingBatch] = useState(false);

  // New Fund / Fee Form
  const [feeCategoryType, setFeeCategoryType] = useState<'MONTHLY' | 'EVENT'>('MONTHLY');
  const [selectedMonth, setSelectedMonth] = useState('November 2026');
  const [fundForm, setFundForm] = useState({
    title: 'Monthly Dance Fee - November 2026',
    description: '',
    amount: '1000',
    due_date: '',
    batch: 'ALL',
  });
  const [savingFund, setSavingFund] = useState(false);

  // Search & Filter
  const [searchStudent, setSearchStudent] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [batchFilter, setBatchFilter] = useState('ALL');

  useEffect(() => {
    fetchDashboardData();
    const defaultDue = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setFundForm((prev) => ({ ...prev, due_date: defaultDue }));
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      if (!authRes.ok || authData.user?.role !== 'ADMIN') {
        router.push('/login?role=admin');
        return;
      }

      // Fetch stats
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

      // Fetch batches
      const batchRes = await fetch('/api/admin/batches');
      const batchData = await batchRes.json();
      if (batchRes.ok) {
        const batchList = batchData.batches || [];
        setBatches(batchList);
        if (batchList.length > 0 && !studentForm.batch) {
          setStudentForm((prev) => ({ ...prev, batch: batchList[0].name }));
        }
      }

      // Fetch funds
      const fundRes = await fetch('/api/admin/funds');
      const fundData = await fundRes.json();
      if (fundRes.ok) {
        setFunds(fundData.funds || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
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
        alert(data.error || 'Failed to enroll student');
        return;
      }

      setShowAddStudent(false);
      setStudentForm({
        name: '',
        parent_name: '',
        phone: '',
        email: '',
        batch: batches[0]?.name || '',
        password: '',
      });
      await fetchDashboardData();
      alert(`Student enrolled successfully! Auto-generated ID: ${data.student.student_id}`);
    } catch (err: any) {
      alert(err.message || 'Error enrolling student');
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

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBatch(true);

    try {
      const res = await fetch('/api/admin/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchForm),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to create batch');
        return;
      }

      setShowAddBatch(false);
      setBatchForm({
        name: '',
        timing: '',
        instructor: '',
        monthly_fee: '1000',
      });
      await fetchDashboardData();
      alert('Dance Batch created successfully!');
    } catch (err: any) {
      alert(err.message || 'Error creating batch');
    } finally {
      setSavingBatch(false);
    }
  };

  const handleDeleteBatch = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete batch "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/batches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchDashboardData();
      } else {
        alert('Could not delete batch');
      }
    } catch {
      alert('Error deleting batch');
    }
  };

  const handleCreateFund = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFund(true);

    try {
      const res = await fetch('/api/admin/funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fundForm,
          fee_type: feeCategoryType,
          month_name: feeCategoryType === 'MONTHLY' ? selectedMonth : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to create fee');
        return;
      }

      setShowAddFund(false);
      await fetchDashboardData();
      alert('Fee category created and allocated to eligible students!');
    } catch (err: any) {
      alert(err.message || 'Error creating fee');
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

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.batch.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.parent_name.toLowerCase().includes(searchStudent.toLowerCase());
    const matchBatch = batchFilter === 'ALL' || s.batch === batchFilter;
    return matchSearch && matchBatch;
  });

  const filteredFees = allFees.filter((f) => {
    if (statusFilter === 'ALL') return true;
    return f.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col md:flex-row">
      {/* ---------------- MOBILE TOP BAR ---------------- */}
      <div className="md:hidden bg-stone-900 border-b border-stone-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-600 flex items-center justify-center text-white shadow-sm">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white leading-tight">Natyanjali Admin</h1>
            <p className="text-[10px] text-orange-400 font-medium">Academy Management</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ---------------- EMPIRE-STYLE PRO SIDEBAR ---------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-stone-900 border-r border-stone-800 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Academy Brand Header */}
          <div className="p-6 border-b border-stone-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-600/20">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white tracking-tight leading-tight">
                Natyanjali
              </h2>
              <span className="text-[11px] font-semibold text-orange-400 tracking-wider uppercase">
                Admin Console
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => {
                setActiveTab('overview');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'overview'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-stone-400 hover:bg-stone-800/70 hover:text-stone-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('students');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'students'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-stone-400 hover:bg-stone-800/70 hover:text-stone-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Students Directory</span>
              </div>
              <span className="text-xs bg-stone-800 px-2 py-0.5 rounded-full text-stone-300">
                {students.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('batches');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'batches'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-stone-400 hover:bg-stone-800/70 hover:text-stone-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4" />
                <span>Dance Batches</span>
              </div>
              <span className="text-xs bg-stone-800 px-2 py-0.5 rounded-full text-stone-300">
                {batches.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('funds');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'funds'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-stone-400 hover:bg-stone-800/70 hover:text-stone-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4" />
                <span>Monthly Fees & Funds</span>
              </div>
              <span className="text-xs bg-stone-800 px-2 py-0.5 rounded-full text-stone-300">
                {funds.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('payments');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'payments'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-stone-400 hover:bg-stone-800/70 hover:text-stone-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Receipt className="w-4 h-4" />
                <span>Payment Records</span>
              </div>
              <span className="text-xs bg-stone-800 px-2 py-0.5 rounded-full text-stone-300">
                {allFees.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-stone-800/80 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-stone-400 hover:text-white px-3 py-2 rounded-lg hover:bg-stone-800 transition"
          >
            ← Public Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-rose-950/40 text-stone-300 hover:text-rose-300 text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4" /> Logout Session
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN DASHBOARD VIEWPORT ---------------- */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeTab === 'overview' && 'Executive Overview'}
              {activeTab === 'students' && 'Students Management'}
              {activeTab === 'batches' && 'Classical Dance Batches'}
              {activeTab === 'funds' && 'Monthly Fees & Fund Campaigns'}
              {activeTab === 'payments' && 'Payment Records & Collections'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
              {activeTab === 'overview' && 'Live tracking of dance school collections, active students, and batch dues'}
              {activeTab === 'students' && 'Enroll new dance students with auto ID generation and parent credentials'}
              {activeTab === 'batches' && 'Create and manage classical dance classes, timings, and instructor assignments'}
              {activeTab === 'funds' && 'Schedule regular monthly tuition fees or specific costume / festival funds'}
              {activeTab === 'payments' && 'Complete breakdown of Razorpay transactions and paid student receipts'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {activeTab === 'students' && (
              <button
                onClick={() => setShowAddStudent(true)}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Enroll Student
              </button>
            )}
            {activeTab === 'batches' && (
              <button
                onClick={() => setShowAddBatch(true)}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add New Dance Batch
              </button>
            )}
            {(activeTab === 'funds' || activeTab === 'overview') && (
              <button
                onClick={() => setShowAddFund(true)}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Fee Demand
              </button>
            )}
          </div>
        </div>

        {/* ---------------- 1. EXECUTIVE OVERVIEW TAB ---------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-stone-900 border border-stone-800/80 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Enrolled Students
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    {stats?.totalStudents || students.length}
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-1">Active dance learners</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-stone-900 border border-stone-800/80 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Total Funds Collected
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
                    ₹{Number(stats?.totalCollected || 0).toLocaleString('en-IN')}
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-1">Via Razorpay & Direct</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-stone-900 border border-stone-800/80 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                    Total Pending Dues
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-400 mt-1">
                    ₹{Number(stats?.totalPending || 0).toLocaleString('en-IN')}
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-1">Awaiting parent payment</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-stone-900 border border-stone-800/80 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Dance Batches
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">
                    {batches.length}
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-1">Managed dance classes</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Transactions Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Payments Section */}
              <div className="lg:col-span-2 bg-stone-900 rounded-2xl border border-stone-800/80 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-orange-500" /> Recent Payment Activity
                  </h3>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {allFees.filter((f) => f.status === 'PAID').length === 0 ? (
                    <div className="text-center py-8 text-stone-500 text-xs">
                      No payments collected yet.
                    </div>
                  ) : (
                    allFees
                      .filter((f) => f.status === 'PAID')
                      .slice(0, 5)
                      .map((fee) => (
                        <div
                          key={fee.id}
                          className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex items-center justify-between gap-3"
                        >
                          <div>
                            <h4 className="font-semibold text-sm text-white">{fee.student_name}</h4>
                            <p className="text-xs text-stone-400">
                              {fee.fund_title} • <span className="text-stone-500">{fee.batch}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-400 text-sm">
                              +₹{Number(fee.paid_amount || fee.amount).toLocaleString('en-IN')}
                            </span>
                            <button
                              onClick={() => setSelectedPaymentDetail(fee)}
                              className="block text-[11px] text-orange-400 hover:underline mt-0.5"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Batches Overview Card */}
              <div className="bg-stone-900 rounded-2xl border border-stone-800/80 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-500" /> Active Batches
                  </h3>
                  <button
                    onClick={() => setActiveTab('batches')}
                    className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
                  >
                    Manage →
                  </button>
                </div>

                <div className="space-y-3">
                  {batches.map((batch) => {
                    const count = students.filter((s) => s.batch === batch.name).length;
                    return (
                      <div
                        key={batch.id}
                        className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-sm text-stone-200">{batch.name}</div>
                          <div className="text-xs text-stone-500">{batch.timing || 'Custom Schedule'}</div>
                        </div>
                        <span className="text-xs bg-stone-800 px-2.5 py-1 rounded-full text-stone-300 font-medium">
                          {count} Students
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 2. STUDENTS MANAGEMENT TAB ---------------- */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search student name, ID, or phone..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs sm:text-sm text-stone-300 focus:outline-none"
                >
                  <option value="ALL">All Batches</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Students Table / Cards (Mobile-first responsive) */}
            <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider text-[11px] border-b border-stone-800">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Student ID</th>
                      <th className="py-3.5 px-4 font-semibold">Student Name</th>
                      <th className="py-3.5 px-4 font-semibold">Parent & Phone</th>
                      <th className="py-3.5 px-4 font-semibold">Batch</th>
                      <th className="py-3.5 px-4 font-semibold">Login Details</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-500">
                          No students found. Click "+ Enroll Student" above.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((std) => (
                        <tr key={std.id} className="hover:bg-stone-800/40 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                            {std.student_id}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-white block">{std.name}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-stone-300">{std.parent_name}</div>
                            <div className="text-[11px] text-stone-500 font-mono">{std.phone}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              {std.batch}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs bg-stone-950 px-2.5 py-1 rounded border border-stone-800 text-stone-300">
                                {std.password || 'dance@2026'}
                              </span>
                              <button
                                onClick={() => copyCredentials(std)}
                                title="Copy WhatsApp message to send parent"
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition"
                              >
                                {copySuccess === std.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Share2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteStudent(std.id, std.name)}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition"
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
          </div>
        )}

        {/* ---------------- 3. CLASSICAL DANCE BATCHES TAB ---------------- */}
        {activeTab === 'batches' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {batches.map((batch) => {
                const enrolledCount = students.filter((s) => s.batch === batch.name).length;
                return (
                  <div
                    key={batch.id}
                    className="bg-stone-900 rounded-2xl border border-stone-800 p-5 sm:p-6 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {enrolledCount} Enrolled
                        </span>
                        <button
                          onClick={() => handleDeleteBatch(batch.id, batch.name)}
                          className="text-stone-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="font-bold text-lg text-white mt-2">{batch.name}</h3>
                      <p className="text-xs text-stone-400 mt-1">
                        Instructor: <strong className="text-stone-200">{batch.instructor || 'Academy Guru'}</strong>
                      </p>

                      <div className="mt-4 p-3 rounded-xl bg-stone-950 border border-stone-800/80 space-y-1">
                        <div className="text-xs text-stone-500">Schedule & Timings:</div>
                        <div className="text-xs font-semibold text-stone-300">
                          {batch.timing || 'Flexible Batch Timings'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                      <span className="text-xs text-stone-400">Monthly Tuition:</span>
                      <span className="font-extrabold text-base text-emerald-400">
                        ₹{Number(batch.monthly_fee || 1000).toLocaleString('en-IN')}/mo
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------- 4. MONTHLY FEES & FUNDS TAB ---------------- */}
        {activeTab === 'funds' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {funds.map((fund) => {
                const fundFees = allFees.filter((f) => f.fund_id === fund.id);
                const paidFees = fundFees.filter((f) => f.status === 'PAID');
                const totalTarget = fundFees.length * fund.amount;
                const totalCollected = paidFees.length * fund.amount;
                const percentage = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

                return (
                  <div
                    key={fund.id}
                    className="bg-stone-900 rounded-2xl border border-stone-800 p-5 sm:p-6 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase">
                          {fund.fee_type === 'MONTHLY' ? 'Monthly Tuition' : 'Special Fund'}
                        </span>
                        <span className="font-extrabold text-lg text-white">
                          ₹{Number(fund.amount).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-white mt-2">{fund.title}</h3>
                      {fund.description && (
                        <p className="text-xs text-stone-400 line-clamp-2 mt-1">{fund.description}</p>
                      )}

                      <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-400">
                        <Calendar className="w-3.5 h-3.5 text-orange-400" />
                        <span>Due: {new Date(fund.due_date).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-800 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-400">Collection Status:</span>
                        <span className="text-emerald-400 font-bold">
                          ₹{totalCollected.toLocaleString('en-IN')} / ₹{totalTarget.toLocaleString('en-IN')} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-stone-950 rounded-full h-2 overflow-hidden border border-stone-800">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-stone-500 text-right">
                        {paidFees.length} of {fundFees.length} students cleared
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------- 5. PAYMENT RECORDS & TRANSACTIONS TAB ---------------- */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900 p-4 rounded-2xl border border-stone-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'ALL'
                      ? 'bg-orange-600 text-white'
                      : 'bg-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  All ({allFees.length})
                </button>
                <button
                  onClick={() => setStatusFilter('PAID')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'PAID'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  Paid Only ({allFees.filter((f) => f.status === 'PAID').length})
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'PENDING'
                      ? 'bg-rose-600 text-white'
                      : 'bg-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  Pending Only ({allFees.filter((f) => f.status === 'PENDING').length})
                </button>
              </div>
            </div>

            <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider text-[11px] border-b border-stone-800">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Student ID</th>
                      <th className="py-3.5 px-4 font-semibold">Student Name</th>
                      <th className="py-3.5 px-4 font-semibold">Fee Title</th>
                      <th className="py-3.5 px-4 font-semibold">Amount</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">View Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {filteredFees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-500">
                          No transactions found for this status.
                        </td>
                      </tr>
                    ) : (
                      filteredFees.map((fee) => (
                        <tr key={fee.id} className="hover:bg-stone-800/40 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                            {fee.student_code}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-white">{fee.student_name}</span>
                            <span className="block text-[11px] text-stone-500">{fee.batch}</span>
                          </td>
                          <td className="py-3.5 px-4 text-stone-300">{fee.fund_title}</td>
                          <td className="py-3.5 px-4 font-bold text-white">
                            ₹{Number(fee.amount).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4">
                            {fee.status === 'PAID' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" /> PAID
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <Clock className="w-3.5 h-3.5" /> PENDING
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedPaymentDetail(fee)}
                              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-orange-600 text-stone-200 hover:text-white text-xs font-semibold transition inline-flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ---------------- ENROLL STUDENT MODAL ---------------- */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white">Enroll New Dance Student</h3>
              <p className="text-xs text-stone-400 mt-1">
                Student ID sequence generates automatically (e.g., <code className="text-orange-400 font-mono">DS-2026-00X</code>).
              </p>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arundhati Nair"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Parent / Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Nair"
                    value={studentForm.parent_name}
                    onChange={(e) => setStudentForm({ ...studentForm, parent_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Phone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9847123456"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Classical Dance Batch *
                  </label>
                  <select
                    value={studentForm.batch}
                    onChange={(e) => setStudentForm({ ...studentForm, batch: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Login Password (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Auto-generated if left empty"
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-800 text-stone-400 hover:text-white text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStudent}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition flex items-center gap-1.5"
                >
                  {savingStudent ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Generate ID'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- CREATE BATCH MODAL ---------------- */}
      {showAddBatch && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white">Create New Dance Batch</h3>
              <p className="text-xs text-stone-400 mt-1">
                Define the classical style, schedule, and instructor for this class.
              </p>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Batch Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bharatanatyam - Senior Batch A"
                  value={batchForm.name}
                  onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Timings / Schedule
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tue, Thu, Sat (5:00 PM - 6:30 PM)"
                  value={batchForm.timing}
                  onChange={(e) => setBatchForm({ ...batchForm, timing: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Dance Instructor (Guru)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Guru Jayasree"
                    value={batchForm.instructor}
                    onChange={(e) => setBatchForm({ ...batchForm, instructor: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Monthly Tuition Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="100"
                    placeholder="1000"
                    value={batchForm.monthly_fee}
                    onChange={(e) => setBatchForm({ ...batchForm, monthly_fee: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm font-bold focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBatch(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-800 text-stone-400 hover:text-white text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBatch}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition flex items-center gap-1.5"
                >
                  {savingBatch ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- CREATE FEE / FUND DEMAND MODAL ---------------- */}
      {showAddFund && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white">Create Dance Fee Demand</h3>
              <p className="text-xs text-stone-400 mt-1">
                Automatically allocate regular monthly fees or special festival funds to students.
              </p>
            </div>

            {/* Fee Type Selector Tabs */}
            <div className="flex p-1 bg-stone-950 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setFeeCategoryType('MONTHLY');
                  setFundForm((prev) => ({
                    ...prev,
                    title: `Monthly Dance Fee - ${selectedMonth}`,
                  }));
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  feeCategoryType === 'MONTHLY'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                📅 Monthly Tuition Fee
              </button>
              <button
                type="button"
                onClick={() => {
                  setFeeCategoryType('EVENT');
                  setFundForm((prev) => ({
                    ...prev,
                    title: 'Annual Day Stage & Costume Fund',
                  }));
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  feeCategoryType === 'EVENT'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                🎭 Event / Costume Fund
              </button>
            </div>

            <form onSubmit={handleCreateFund} className="space-y-4">
              {feeCategoryType === 'MONTHLY' ? (
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Select Fee Month *
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setFundForm((prev) => ({
                        ...prev,
                        title: `Monthly Dance Fee - ${e.target.value}`,
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                  >
                    <option value="November 2026">November 2026</option>
                    <option value="December 2026">December 2026</option>
                    <option value="January 2027">January 2027</option>
                    <option value="February 2027">February 2027</option>
                    <option value="March 2027">March 2027</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Fund / Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arangettam Stage & Costume Fund"
                    value={fundForm.title}
                    onChange={(e) => setFundForm({ ...fundForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Amount per Student (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1000"
                    value={fundForm.amount}
                    onChange={(e) => setFundForm({ ...fundForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm font-bold focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={fundForm.due_date}
                    onChange={(e) => setFundForm({ ...fundForm, due_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Target Dance Batch
                </label>
                <select
                  value={fundForm.batch}
                  onChange={(e) => setFundForm({ ...fundForm, batch: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="ALL">All Batches (Every enrolled student)</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} only
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFund(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-800 text-stone-400 hover:text-white text-sm font-semibold transition"
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

      {/* ---------------- PAYMENT DETAILS MODAL ---------------- */}
      {selectedPaymentDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Payment Transaction Details</h3>
                  <p className="text-xs text-stone-400">Dance School Official Record</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPaymentDetail(null)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 bg-stone-950 p-4 rounded-2xl border border-stone-800">
                <div>
                  <span className="text-[11px] text-stone-500 uppercase block">Student Name</span>
                  <strong className="text-white text-sm">{selectedPaymentDetail.student_name}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 uppercase block">Student ID</span>
                  <strong className="font-mono text-orange-400 text-sm">
                    {selectedPaymentDetail.student_code}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 uppercase block">Parent Name</span>
                  <span className="text-stone-300">{selectedPaymentDetail.parent_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 uppercase block">Batch</span>
                  <span className="text-amber-300 font-medium">{selectedPaymentDetail.batch}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-stone-800/80">
                  <span className="text-stone-400">Fee Particulars</span>
                  <strong className="text-white">{selectedPaymentDetail.fund_title}</strong>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-stone-400">Amount Paid</span>
                  <span className="text-emerald-400 text-lg">
                    ₹{Number(selectedPaymentDetail.paid_amount || selectedPaymentDetail.amount).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-stone-400 pt-1">
                  <span>Payment Gateway</span>
                  <span className="text-stone-200 font-semibold">Razorpay UPI & Cards</span>
                </div>
                <div className="flex justify-between items-center text-xs text-stone-400">
                  <span>Transaction ID</span>
                  <span className="font-mono text-stone-300">
                    {selectedPaymentDetail.razorpay_payment_id || 'pay_direct_admin'}
                  </span>
                </div>
                {selectedPaymentDetail.paid_at && (
                  <div className="flex justify-between items-center text-xs text-stone-400">
                    <span>Payment Timestamp</span>
                    <span className="text-stone-300">
                      {new Date(selectedPaymentDetail.paid_at).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedPaymentDetail(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-800 text-stone-400 hover:text-white text-xs sm:text-sm font-semibold transition"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Transaction Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
