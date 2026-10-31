export type Role = 'ADMIN' | 'STUDENT';

export interface Admin {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: 'ADMIN';
  created_at?: string;
}

export interface Student {
  id: string;
  student_id: string; // e.g. DS-2026-001
  name: string;
  parent_name: string;
  phone: string;
  email?: string;
  batch: string; // e.g. "Bharatanatyam (Junior)", "Mohiniyattam", etc.
  password?: string; // plain text hint (admin view only)
  password_hash?: string;
  role: 'STUDENT';
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
}

export interface Fund {
  id: string;
  title: string; // e.g. "Annual Dance Fest 2026", "Costume & Jewellery Fund"
  description?: string;
  amount: number; // in INR
  due_date: string;
  batch: string; // 'ALL' or specific batch name
  created_at?: string;
}

export interface StudentFee {
  id: string;
  student_id: string;
  fund_id: string;
  amount: number;
  status: 'PENDING' | 'PAID';
  paid_amount?: number;
  paid_at?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at?: string;
  // joined fields
  fund_title?: string;
  fund_description?: string;
  due_date?: string;
  student_name?: string;
  student_code?: string;
  batch?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalCollected: number;
  totalPending: number;
  recentTransactions: StudentFee[];
}
