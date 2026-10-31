export type Role = 'ADMIN' | 'STUDENT';

export interface Admin {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: 'ADMIN';
  created_at?: string;
}

export interface Batch {
  id: string;
  name: string;
  timing?: string;
  instructor?: string;
  monthly_fee?: number;
  created_at?: string;
}

export interface Student {
  id: string;
  student_id: string; // e.g. DS-2026-001
  name: string;
  parent_name: string;
  phone: string;
  email?: string;
  batch: string;
  discount_amount?: number; // e.g. 500 (sibling / scholarship concession)
  password?: string;
  password_hash?: string;
  role: 'STUDENT';
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
}

export interface Fund {
  id: string;
  title: string;
  fee_type?: 'PERIOD' | 'MONTHLY' | 'EVENT';
  period_start?: string; // e.g. '2027-01-01'
  period_end?: string; // e.g. '2027-03-31'
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
  original_amount?: number;
  discount_applied?: number;
  status: 'PENDING' | 'PAID';
  paid_amount?: number;
  paid_at?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at?: string;
  // joined fields
  fund_title?: string;
  fee_type?: 'PERIOD' | 'MONTHLY' | 'EVENT';
  period_start?: string;
  period_end?: string;
  fund_description?: string;
  due_date?: string;
  student_name?: string;
  student_code?: string;
  batch?: string;
  parent_name?: string;
  phone?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalCollected: number;
  totalPending: number;
  activeBatches: number;
  recentTransactions: StudentFee[];
}
