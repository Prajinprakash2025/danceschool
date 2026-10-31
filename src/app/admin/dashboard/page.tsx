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
  Tag,
  Edit2,
  Gift,
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

  // Modals & Edit States
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingStudentForm, setEditingStudentForm] = useState({
    name: '',
    parent_name: '',
    phone: '',
    email: '',
    batch: '',
    discount_amount: '0',
    joining_date: '',
    fee_due_day: '1',
    password: '',
  });

  const [showAddBatch, setShowAddBatch] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [editingBatchForm, setEditingBatchForm] = useState({
    name: '',
    timing: '',
    instructor: '',
    monthly_fee: '1000',
  });

  const [showAddFund, setShowAddFund] = useState(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [editingFundForm, setEditingFundForm] = useState({
    title: '',
    period_start: '',
    period_end: '',
    description: '',
    amount: '2000',
    due_date: '',
    batch: 'ALL',
  });

  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<StudentFee | null>(null);
  const [editingFee, setEditingFee] = useState<{ id: string; amount: string; due_date: string; studentName: string } | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // New Student Form
  const [studentForm, setStudentForm] = useState({
    name: '',
    parent_name: '',
    phone: '',
    email: '',
    batch: '',
    discount_amount: '0',
    joining_date: '',
    fee_due_day: '',
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

  // New Fund / Period Fee Form (Jan 1 to Mar 31, Apr 1 to Dec, etc.)
  const [feeCategoryType, setFeeCategoryType] = useState<'PERIOD' | 'EVENT'>('PERIOD');
  const [fundForm, setFundForm] = useState({
    title: 'Dance Term 1 Fee (Jan 1 - Mar 31)',
    period_start: '2027-01-01',
    period_end: '2027-03-31',
    description: 'First quarter comprehensive dance training fee.',
    amount: '2000',
    due_date: '2027-01-10',
    batch: 'ALL',
  });
  const [savingFund, setSavingFund] = useState(false);

  // Quick preset helper
  const applyFeePreset = (type: 'JAN_MAR' | 'APR_DEC' | 'MONTHLY_NOV') => {
    if (type === 'JAN_MAR') {
      setFundForm({
        title: 'Dance Term 1 Fee (Jan 1 - Mar 31)',
        period_start: '2027-01-01',
        period_end: '2027-03-31',
        description: 'First quarter comprehensive dance training fee (Jan 1 to Mar 31).',
        amount: '2000',
        due_date: '2027-01-05',
        batch: 'ALL',
      });
    } else if (type === 'APR_DEC') {
      setFundForm({
        title: 'Dance Session 2 Fee (Apr 1 - Dec 31)',
        period_start: '2027-04-01',
        period_end: '2027-12-31',
        description: 'Second session dance classes and festive choreography (Apr 1 to Dec 31).',
        amount: '2500',
        due_date: '2027-04-05',
        batch: 'ALL',
      });
    } else {
      setFundForm({
        title: 'Monthly Dance Tuition - Nov 2026',
        period_start: '2026-11-01',
        period_end: '2026-11-30',
        description: 'Regular monthly fee for November.',
        amount: '1000',
        due_date: '2026-11-05',
        batch: 'ALL',
      });
    }
  };

  // Search & Filter
  const [searchStudent, setSearchStudent] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [batchFilter, setBatchFilter] = useState('ALL');

  useEffect(() => {
    fetchDashboardData();
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

      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setStats(statsData.stats);
        setAllFees(statsData.allFees || []);
      }

      const stdRes = await fetch('/api/admin/students');
      const stdData = await stdRes.json();
      if (stdRes.ok) {
        setStudents(stdData.students || []);
      }

      const batchRes = await fetch('/api/admin/batches');
      const batchData = await batchRes.json();
      if (batchRes.ok) {
        const batchList = batchData.batches || [];
        setBatches(batchList);
        if (batchList.length > 0 && !studentForm.batch) {
          setStudentForm((prev) => ({ ...prev, batch: batchList[0].name }));
        }
      }

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
        discount_amount: '0',
        password: '',
        joining_date: '',
        fee_due_day: '',
      });
      await fetchDashboardData();
      alert(`Student enrolled successfully! Auto-generated ID: ${data.student.student_id}`);
    } catch (err: any) {
      alert(err.message || 'Error enrolling student');
    } finally {
      setSavingStudent(false);
    }
  };

  const openEditStudent = (std: Student) => {
    setEditingStudent(std);
    setEditingStudentForm({
      name: std.name,
      parent_name: std.parent_name,
      phone: std.phone,
      email: std.email || '',
      batch: std.batch,
      discount_amount: String(std.discount_amount || 0),
      joining_date: std.joining_date || std.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      fee_due_day: String(std.fee_due_day || (std.joining_date ? new Date(std.joining_date).getDate() : 1)),
      password: std.password || '',
    });
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setSavingStudent(true);

    try {
      const res = await fetch(`/api/admin/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingStudentForm),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update student profile');
        return;
      }

      setEditingStudent(null);
      await fetchDashboardData();
      alert('Student profile & fee settings updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Error updating student');
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

  const openEditBatch = (batch: Batch) => {
    setEditingBatch(batch);
    setEditingBatchForm({
      name: batch.name,
      timing: batch.timing || '',
      instructor: batch.instructor || '',
      monthly_fee: String(batch.monthly_fee || 1000),
    });
  };

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;
    setSavingBatch(true);

    try {
      const res = await fetch(`/api/admin/batches/${editingBatch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBatchForm),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update batch');
        return;
      }

      setEditingBatch(null);
      await fetchDashboardData();
      alert('Dance batch updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Error updating batch');
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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to create fee');
        return;
      }

      setShowAddFund(false);
      await fetchDashboardData();
      alert('Fee Demand created! Students with enrolled discounts received their automatic deduction.');
    } catch (err: any) {
      alert(err.message || 'Error creating fee');
    } finally {
      setSavingFund(false);
    }
  };

  const openEditFund = (fund: Fund) => {
    setEditingFund(fund);
    setEditingFundForm({
      title: fund.title,
      period_start: fund.period_start || '',
      period_end: fund.period_end || '',
      description: fund.description || '',
      amount: String(fund.amount),
      due_date: fund.due_date || '',
      batch: fund.batch || 'ALL',
    });
  };

  const handleUpdateFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFund) return;
    setSavingFund(true);

    try {
      const res = await fetch(`/api/admin/funds/${editingFund.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFundForm),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update fee campaign');
        return;
      }

      setEditingFund(null);
      await fetchDashboardData();
      alert('Fee demand & prices updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Error updating fee');
    } finally {
      setSavingFund(false);
    }
  };

  const handleDeleteFund = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete fee "${title}"? This will also remove pending dues for this fee.`)) return;
    try {
      const res = await fetch(`/api/admin/funds/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchDashboardData();
        alert('Fee campaign removed successfully');
      } else {
        alert('Could not delete fee');
      }
    } catch {
      alert('Error deleting fee');
    }
  };

  const handleUpdateFeeAmount = async () => {
    if (!editingFee) return;
    try {
      const res = await fetch(`/api/admin/fees/${editingFee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: editingFee.amount,
          due_date: editingFee.due_date,
        }),
      });
      if (res.ok) {
        setEditingFee(null);
        await fetchDashboardData();
        alert('Fee details updated successfully!');
      } else {
        alert('Could not update fee amount');
      }
    } catch {
      alert('Error updating fee');
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
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-white">
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
            <p className="text-[10px] text-orange-400 font-medium">Academy Console</p>
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
                <span>Custom Fees & Funds</span>
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
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeTab === 'overview' && 'Executive Overview'}
              {activeTab === 'students' && 'Students Management'}
              {activeTab === 'batches' && 'Classical Dance Batches'}
              {activeTab === 'funds' && 'Custom Fees & Seasonal Funds'}
              {activeTab === 'payments' && 'Payment Records & Concessions'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
              {activeTab === 'overview' && 'Live tracking of collections, student counts, and active batch metrics'}
              {activeTab === 'students' && 'Enroll students, assign sibling/scholarship discounts, and generate login IDs'}
              {activeTab === 'batches' && 'Create and manage classical dance classes, timings, and instructor assignments'}
              {activeTab === 'funds' && 'Create custom date range fees (e.g. Jan-Mar ₹2000, Apr-Dec ₹2500, or Monthly)'}
              {activeTab === 'payments' && 'View transaction details, student discounts, and adjust individual fee amounts'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {activeTab === 'students' && (
              <button
                onClick={() => setShowAddStudent(true)}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Enroll Student
              </button>
            )}
            {activeTab === 'batches' && (
              <button
                onClick={() => setShowAddBatch(true)}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Dance Batch
              </button>
            )}
            {(activeTab === 'funds' || activeTab === 'overview') && (
              <button
                onClick={() => setShowAddFund(true)}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create Fee Demand
              </button>
            )}
          </div>
        </div>

        {/* ---------------- 1. EXECUTIVE OVERVIEW TAB ---------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
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
                  <p className="text-[11px] text-stone-500 mt-1">Active class batches</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Recent Payments Section */}
            <div className="bg-stone-900 rounded-2xl border border-stone-800/80 p-5 sm:p-6 space-y-4">
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
                    No payments recorded yet.
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
          </div>
        )}

        {/* ---------------- 2. STUDENTS MANAGEMENT TAB ---------------- */}
        {activeTab === 'students' && (
          <div className="space-y-4">
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

            <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider text-[11px] border-b border-stone-800">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Student ID</th>
                      <th className="py-3.5 px-4 font-semibold">Student Name</th>
                      <th className="py-3.5 px-4 font-semibold">Parent & Phone</th>
                      <th className="py-3.5 px-4 font-semibold">Batch</th>
                      <th className="py-3.5 px-4 font-semibold">Concession / Discount</th>
                      <th className="py-3.5 px-4 font-semibold">Login Details</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-stone-500">
                          No students found. Click "+ Enroll Student" above.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((std) => (
                        <tr key={std.id} className="hover:bg-stone-800/40 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                            {std.student_id}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div>{std.name}</div>
                            {std.joining_date ? (
                              <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-orange-400" />
                                <span>Joined: {new Date(std.joining_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                                <span className="text-amber-400 font-medium">• Due on {std.fee_due_day || new Date(std.joining_date).getDate()}th</span>
                              </div>
                            ) : null}
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
                            {Number(std.discount_amount || 0) > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Gift className="w-3 h-3" /> -₹{Number(std.discount_amount).toLocaleString('en-IN')} off
                              </span>
                            ) : (
                              <span className="text-stone-500 text-xs">Standard (No Discount)</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs bg-stone-950 px-2 py-1 rounded border border-stone-800 text-stone-300">
                                {std.password || 'dance@2026'}
                              </span>
                              <button
                                onClick={() => copyCredentials(std)}
                                title="Copy WhatsApp Credentials"
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white"
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
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditStudent(std)}
                                title="Edit Student & Due Dates"
                                className="p-1.5 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-amber-950/40"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(std.id, std.name)}
                                title="Delete Student"
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditBatch(batch)}
                          title="Edit Batch & Price"
                          className="text-stone-400 hover:text-amber-300 p-1 rounded-lg hover:bg-stone-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBatch(batch.id, batch.name)}
                          title="Delete Batch"
                          className="text-stone-500 hover:text-rose-400 p-1 rounded-lg hover:bg-stone-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg text-white mt-2">{batch.name}</h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Instructor: <strong className="text-stone-200">{batch.instructor || 'Academy Guru'}</strong>
                    </p>

                    <div className="mt-4 p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                      <div className="text-xs text-stone-500">Schedule & Timings:</div>
                      <div className="text-xs font-semibold text-stone-300">
                        {batch.timing || 'Flexible Batch Timings'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                    <span className="text-xs text-stone-400">Standard Monthly Tuition:</span>
                    <span className="font-extrabold text-base text-emerald-400">
                      ₹{Number(batch.monthly_fee || 1000).toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ---------------- 4. CUSTOM FEES & FUNDS TAB ---------------- */}
        {activeTab === 'funds' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {funds.map((fund) => {
                const fundFees = allFees.filter((f) => f.fund_id === fund.id);
                const paidFees = fundFees.filter((f) => f.status === 'PAID');
                const totalTarget = fundFees.reduce((acc, curr) => acc + Number(curr.amount), 0);
                const totalCollected = paidFees.reduce((acc, curr) => acc + Number(curr.paid_amount || curr.amount), 0);
                const percentage = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

                return (
                  <div
                    key={fund.id}
                    className="bg-stone-900 rounded-2xl border border-stone-800 p-5 sm:p-6 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase">
                          {fund.period_start ? 'Period / Term Fee' : 'Special Fund'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-lg text-white">
                            ₹{Number(fund.amount).toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => openEditFund(fund)}
                            title="Edit Fee Title & Price"
                            className="text-stone-400 hover:text-amber-300 p-1 rounded-lg hover:bg-stone-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFund(fund.id, fund.title)}
                            title="Delete Fee Campaign"
                            className="text-stone-500 hover:text-rose-400 p-1 rounded-lg hover:bg-stone-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-base text-white mt-2">{fund.title}</h3>
                      {fund.period_start && fund.period_end && (
                        <div className="text-xs text-amber-300 font-medium mt-1">
                          Period: {new Date(fund.period_start).toLocaleDateString('en-IN')} to {new Date(fund.period_end).toLocaleDateString('en-IN')}
                        </div>
                      )}
                      {fund.description && (
                        <p className="text-xs text-stone-400 line-clamp-2 mt-1">{fund.description}</p>
                      )}

                      <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-400">
                        <Calendar className="w-3.5 h-3.5 text-orange-400" />
                        <span>Due Date: {new Date(fund.due_date).toLocaleDateString('en-IN')}</span>
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
                      <th className="py-3.5 px-4 font-semibold">Amount to Pay</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {filteredFees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-500">
                          No transactions found.
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
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">
                              ₹{Number(fee.amount).toLocaleString('en-IN')}
                            </div>
                            {Number(fee.discount_applied || 0) > 0 && (
                              <span className="text-[10px] text-emerald-400 block">
                                (Discount: -₹{fee.discount_applied})
                              </span>
                            )}
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
                            <div className="flex items-center justify-end gap-2">
                              {fee.status === 'PENDING' && (
                                <button
                                  onClick={() =>
                                    setEditingFee({
                                      id: fee.id,
                                      amount: String(fee.amount),
                                      due_date: fee.due_date || '',
                                      studentName: fee.student_name || '',
                                    })
                                  }
                                  title="Adjust or Discount Fee Amount"
                                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedPaymentDetail(fee)}
                                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-orange-600 text-stone-200 hover:text-white text-xs font-semibold transition inline-flex items-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Details
                              </button>
                            </div>
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

      {/* ---------------- ENROLL STUDENT MODAL (With Concession / Discount) ---------------- */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Joining Date (Admission)
                  </label>
                  <input
                    type="date"
                    value={studentForm.joining_date}
                    onChange={(e) => {
                      const jDate = e.target.value;
                      const day = jDate ? new Date(jDate).getDate() : 1;
                      setStudentForm({ ...studentForm, joining_date: jDate, fee_due_day: String(day) });
                    }}
                    style={{ colorScheme: 'dark' }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none cursor-pointer"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    e.g. If student joined on March 5 or March 23
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Monthly Fee Due Day (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="e.g. 23"
                    value={studentForm.fee_due_day}
                    onChange={(e) => setStudentForm({ ...studentForm, fee_due_day: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Fee due notice cycles on this day each month
                  </span>
                </div>
              </div>

              {/* Special Sibling / Concession Discount Field */}
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
                <label className="block text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" /> Sibling / Concession Discount per Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0 (Enter discount e.g. 500 if applicable)"
                  value={studentForm.discount_amount}
                  onChange={(e) => setStudentForm({ ...studentForm, discount_amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-bold text-sm focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-stone-400">
                  Example: If ₹500 is entered here, when a ₹2000 fee is created, this student only pays <strong>₹1500</strong>!
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Login Password (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Auto-generated if left empty (e.g. dance@2026)"
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
                  {savingStudent ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- CREATE CUSTOM DATE-RANGE FEE DEMAND MODAL ---------------- */}
      {showAddFund && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white">Create Dance Fee Demand</h3>
              <p className="text-xs text-stone-400 mt-1">
                Set custom date periods (e.g. Jan 1 - Mar 31 ₹2000, Apr 1 - Dec 31 ₹2500) or event funds.
              </p>
            </div>

            {/* Quick 1-Click Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">
                ⚡ Quick 1-Click Fill:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => applyFeePreset('JAN_MAR')}
                  className="p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-orange-500 text-stone-300 hover:text-white text-left transition"
                >
                  <strong className="block text-orange-400">Jan 1 - Mar 31</strong>
                  <span>₹2,000 (Term 1)</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyFeePreset('APR_DEC')}
                  className="p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-orange-500 text-stone-300 hover:text-white text-left transition"
                >
                  <strong className="block text-orange-400">Apr 1 - Dec 31</strong>
                  <span>₹2,500 (Session 2)</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateFund} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Fee Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dance Term 1 Fee (Jan 1 - Mar 31)"
                  value={fundForm.title}
                  onChange={(e) => setFundForm({ ...fundForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Start Date & End Date Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Period From (Start Date)
                  </label>
                  <input
                    type="date"
                    value={fundForm.period_start}
                    onChange={(e) => setFundForm({ ...fundForm, period_start: e.target.value })}
                    style={{ colorScheme: 'dark' }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Period To (End Date)
                  </label>
                  <input
                    type="date"
                    value={fundForm.period_end}
                    onChange={(e) => setFundForm({ ...fundForm, period_end: e.target.value })}
                    style={{ colorScheme: 'dark' }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Standard Fee Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="2000"
                    value={fundForm.amount}
                    onChange={(e) => setFundForm({ ...fundForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm font-bold focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Payment Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={fundForm.due_date}
                    onChange={(e) => setFundForm({ ...fundForm, due_date: e.target.value })}
                    style={{ colorScheme: 'dark' }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none cursor-pointer"
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

              {/* Discount Notice */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                ✨ <strong>Automatic Discount Protection:</strong> Any student with an assigned discount (concession) will automatically have their discount deducted from this fee!
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
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
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {savingFund ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create & Assign Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- EDIT INDIVIDUAL STUDENT FEE MODAL ---------------- */}
      {editingFee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="font-bold text-base text-white">Adjust Fee Amount</h3>
              <p className="text-xs text-stone-400 mt-1">
                Modifying pending fee for: <strong className="text-white">{editingFee.studentName}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                New Amount to Pay (₹)
              </label>
              <input
                type="number"
                min="0"
                value={editingFee.amount}
                onChange={(e) => setEditingFee({ ...editingFee, amount: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white font-bold text-base focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                Individual Due Date
              </label>
              <input
                type="date"
                value={editingFee.due_date}
                onChange={(e) => setEditingFee({ ...editingFee, due_date: e.target.value })}
                style={{ colorScheme: 'dark' }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-white text-sm focus:border-orange-500 focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditingFee(null)}
                className="px-3 py-2 rounded-xl border border-stone-800 text-stone-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateFeeAmount}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Save Adjustment
              </button>
            </div>
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

      {/* ---------------- CREATE BATCH MODAL ---------------- */}
      {showAddBatch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
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

      {/* ---------------- EDIT STUDENT PROFILE MODAL ---------------- */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <h3 className="text-xl font-bold text-white">Edit Student Profile & Fee Settings</h3>
                <p className="text-xs text-stone-400 mt-1">
                  ID: <span className="text-orange-400 font-mono font-bold">{editingStudent.student_id}</span>
                </p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStudentForm.name}
                    onChange={(e) => setEditingStudentForm({ ...editingStudentForm, name: e.target.value })}
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
                    value={editingStudentForm.parent_name}
                    onChange={(e) => setEditingStudentForm({ ...editingStudentForm, parent_name: e.target.value })}
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
                    value={editingStudentForm.phone}
                    onChange={(e) => setEditingStudentForm({ ...editingStudentForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Classical Dance Batch *
                  </label>
                  <select
                    value={editingStudentForm.batch}
                    onChange={(e) => setEditingStudentForm({ ...editingStudentForm, batch: e.target.value })}
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

              {/* Joining Date & Fee Due Cycle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Joining Date (Admission)
                  </label>
                  <input
                    type="date"
                    value={editingStudentForm.joining_date}
                    onChange={(e) => {
                      const jDate = e.target.value;
                      const day = jDate ? new Date(jDate).getDate() : 1;
                      setEditingStudentForm({ ...editingStudentForm, joining_date: jDate, fee_due_day: String(day) });
                    }}
                    style={{ colorScheme: 'dark' }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none cursor-pointer"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    e.g. Joined on March 5 or March 23
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Monthly Fee Due Day (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editingStudentForm.fee_due_day}
                    onChange={(e) => setEditingStudentForm({ ...editingStudentForm, fee_due_day: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Fee notice cycles on this day each month
                  </span>
                </div>
              </div>

              {/* Concession / Sibling Discount */}
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
                <label className="block text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" /> Sibling / Concession Discount per Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingStudentForm.discount_amount}
                  onChange={(e) => setEditingStudentForm({ ...editingStudentForm, discount_amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white font-bold text-sm focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-stone-400">
                  Changing this updates this student&apos;s pending fee deductions immediately.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Change Login Password
                </label>
                <input
                  type="text"
                  placeholder="Enter new password or leave current"
                  value={editingStudentForm.password}
                  onChange={(e) => setEditingStudentForm({ ...editingStudentForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-mono text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-800 text-stone-400 hover:text-white text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStudent}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition flex items-center gap-1.5"
                >
                  {savingStudent ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- EDIT BATCH MODAL ---------------- */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-xl font-bold text-white">Edit Classical Dance Batch</h3>
              <button
                onClick={() => setEditingBatch(null)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Batch Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingBatchForm.name}
                  onChange={(e) => setEditingBatchForm({ ...editingBatchForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Class Schedule & Timings
                </label>
                <input
                  type="text"
                  value={editingBatchForm.timing}
                  onChange={(e) => setEditingBatchForm({ ...editingBatchForm, timing: e.target.value })}
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
                    value={editingBatchForm.instructor}
                    onChange={(e) => setEditingBatchForm({ ...editingBatchForm, instructor: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Monthly Tuition Fee Price (₹)
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={editingBatchForm.monthly_fee}
                    onChange={(e) => setEditingBatchForm({ ...editingBatchForm, monthly_fee: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm font-bold focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-800 text-stone-400 hover:text-white text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBatch}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition flex items-center gap-1.5"
                >
                  {savingBatch ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- EDIT FUND / FEE CAMPAIGN MODAL ---------------- */}
      {editingFund && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-xl font-bold text-white">Edit Fee Demand & Price</h3>
              <button
                onClick={() => setEditingFund(null)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFund} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Fee Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingFundForm.title}
                  onChange={(e) => setEditingFundForm({ ...editingFundForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Period From (Start Date)
                  </label>
                  <input
                    type="date"
                    value={editingFundForm.period_start}
                    onChange={(e) => setEditingFundForm({ ...editingFundForm, period_start: e.target.value })}
                    style={{ colorScheme: 'dark' }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Period To (End Date)
                  </label>
                  <input
                    type="date"
                    value={editingFundForm.period_end}
                    onChange={(e) => setEditingFundForm({ ...editingFundForm, period_end: e.target.value })}
                    style={{ colorScheme: 'dark' }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Amount / Price per Student (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={editingFundForm.amount}
                    onChange={(e) => setEditingFundForm({ ...editingFundForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm font-bold focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Payment Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingFundForm.due_date}
                    onChange={(e) => setEditingFundForm({ ...editingFundForm, due_date: e.target.value })}
                    style={{ colorScheme: 'dark' }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Description / Remarks
                </label>
                <textarea
                  rows={2}
                  value={editingFundForm.description}
                  onChange={(e) => setEditingFundForm({ ...editingFundForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFund(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-800 text-stone-400 hover:text-white text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFund}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {savingFund ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
