import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { hashPassword } from './auth';
import { Admin, Student, Fund, StudentFee, DashboardStats } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseKey.includes('placeholder')
);

let supabase: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl!, supabaseKey!);
}

// Fallback local file storage for seamless local development / demo
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

interface LocalDbSchema {
  admins: Admin[];
  students: Student[];
  funds: Fund[];
  student_fees: StudentFee[];
}

function getInitialData(): LocalDbSchema {
  return {
    admins: [
      {
        id: 'admin-1',
        username: 'admin',
        name: 'Academy Administrator',
        email: 'admin@natyadance.com',
        role: 'ADMIN',
        created_at: new Date().toISOString(),
      },
    ],
    students: [
      {
        id: 'std-1',
        student_id: 'DS-2026-001',
        name: 'Arundhati Menon',
        parent_name: 'Radhika Menon',
        phone: '9847123456',
        email: 'radhika@example.com',
        batch: 'Bharatanatyam - Senior',
        password: 'dance@2026',
        password_hash: hashPassword('dance@2026'),
        role: 'STUDENT',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
      },
      {
        id: 'std-2',
        student_id: 'DS-2026-002',
        name: 'Karthik S',
        parent_name: 'Suresh Kumar',
        phone: '9847234567',
        email: 'suresh@example.com',
        batch: 'Kuchipudi - Junior',
        password: 'dance@2026',
        password_hash: hashPassword('dance@2026'),
        role: 'STUDENT',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
      },
      {
        id: 'std-3',
        student_id: 'DS-2026-003',
        name: 'Devika Nair',
        parent_name: 'Pramod Nair',
        phone: '9847345678',
        email: 'pramod@example.com',
        batch: 'Mohiniyattam - Beginners',
        password: 'dance@2026',
        password_hash: hashPassword('dance@2026'),
        role: 'STUDENT',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
      },
    ],
    funds: [
      {
        id: 'fund-1',
        title: 'Annual Day Stage & Costume Fund',
        description: 'Fund for stage setup, audio system, and traditional dance costumes for the annual festival.',
        amount: 1500,
        due_date: '2026-11-25',
        batch: 'ALL',
        created_at: new Date().toISOString(),
      },
      {
        id: 'fund-2',
        title: 'Monthly Tuition Fee - November 2026',
        description: 'Regular monthly dance training & choreography fee.',
        amount: 800,
        due_date: '2026-11-10',
        batch: 'ALL',
        created_at: new Date().toISOString(),
      },
    ],
    student_fees: [
      {
        id: 'fee-1',
        student_id: 'std-1',
        fund_id: 'fund-1',
        amount: 1500,
        status: 'PAID',
        paid_amount: 1500,
        paid_at: new Date().toISOString(),
        razorpay_order_id: 'order_mock_001',
        razorpay_payment_id: 'pay_mock_001',
        created_at: new Date().toISOString(),
      },
      {
        id: 'fee-2',
        student_id: 'std-1',
        fund_id: 'fund-2',
        amount: 800,
        status: 'PENDING',
        paid_amount: 0,
        created_at: new Date().toISOString(),
      },
      {
        id: 'fee-3',
        student_id: 'std-2',
        fund_id: 'fund-1',
        amount: 1500,
        status: 'PENDING',
        paid_amount: 0,
        created_at: new Date().toISOString(),
      },
      {
        id: 'fee-4',
        student_id: 'std-3',
        fund_id: 'fund-1',
        amount: 1500,
        status: 'PENDING',
        paid_amount: 0,
        created_at: new Date().toISOString(),
      },
    ],
  };
}

function readLocalDb(): LocalDbSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local db:', err);
    return getInitialData();
  }
}

function writeLocalDb(data: LocalDbSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local db:', err);
  }
}

// ----------------- DB OPERATIONS -----------------

export async function getAdminByUsername(username: string): Promise<(Admin & { password_hash?: string }) | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();
    if (error || !data) return null;
    return { ...data, role: 'ADMIN' };
  }

  const db = readLocalDb();
  const admin = db.admins.find((a) => a.username.toLowerCase() === username.toLowerCase());
  if (!admin) return null;
  // default admin password hash for 'admin123'
  return {
    ...admin,
    password_hash: hashPassword('admin123'),
  };
}

export async function getStudentByStudentId(studentId: string): Promise<Student | null> {
  const cleanId = studentId.trim().toUpperCase();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', cleanId)
      .single();
    if (error || !data) return null;
    return { ...data, role: 'STUDENT' };
  }

  const db = readLocalDb();
  const student = db.students.find((s) => s.student_id.toUpperCase() === cleanId);
  return student || null;
}

export async function getAllStudents(): Promise<Student[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data.map((s) => ({ ...s, role: 'STUDENT' }));
  }

  const db = readLocalDb();
  return db.students;
}

export async function generateNextStudentId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `DS-${currentYear}-`;

  const students = await getAllStudents();
  const yearStudents = students.filter((s) => s.student_id.startsWith(prefix));

  let maxSeq = 0;
  yearStudents.forEach((s) => {
    const parts = s.student_id.split('-');
    const seq = parseInt(parts[2], 10);
    if (!isNaN(seq) && seq > maxSeq) {
      maxSeq = seq;
    }
  });

  const nextSeq = String(maxSeq + 1).padStart(3, '0');
  return `${prefix}${nextSeq}`;
}

export async function createStudent(payload: {
  name: string;
  parent_name: string;
  phone: string;
  email?: string;
  batch: string;
  password?: string;
}): Promise<Student> {
  const student_id = await generateNextStudentId();
  const password = payload.password && payload.password.trim() !== '' 
    ? payload.password.trim() 
    : 'dance@' + Math.floor(1000 + Math.random() * 9000);
  const password_hash = hashPassword(password);

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('students')
      .insert({
        student_id,
        name: payload.name,
        parent_name: payload.parent_name,
        phone: payload.phone,
        email: payload.email || '',
        batch: payload.batch,
        password_hash,
        password_hint: password,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    const newStudent = { ...data, role: 'STUDENT' as const, password };

    // Also assign existing active funds if applicable
    const funds = await getAllFunds();
    for (const fund of funds) {
      if (fund.batch === 'ALL' || fund.batch === payload.batch) {
        await supabase.from('student_fees').insert({
          student_id: newStudent.id,
          fund_id: fund.id,
          amount: fund.amount,
          status: 'PENDING',
        });
      }
    }

    return newStudent;
  }

  const db = readLocalDb();
  const newStudent: Student = {
    id: 'std-' + Date.now(),
    student_id,
    name: payload.name,
    parent_name: payload.parent_name,
    phone: payload.phone,
    email: payload.email || '',
    batch: payload.batch,
    password,
    password_hash,
    role: 'STUDENT',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  };

  db.students.unshift(newStudent);

  // Automatically assign all existing funds to this new student
  db.funds.forEach((fund) => {
    if (fund.batch === 'ALL' || fund.batch === newStudent.batch) {
      db.student_fees.push({
        id: 'fee-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        student_id: newStudent.id,
        fund_id: fund.id,
        amount: fund.amount,
        status: 'PENDING',
        paid_amount: 0,
        created_at: new Date().toISOString(),
      });
    }
  });

  writeLocalDb(db);
  return newStudent;
}

export async function deleteStudent(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('students').delete().eq('id', id);
    return !error;
  }

  const db = readLocalDb();
  db.students = db.students.filter((s) => s.id !== id);
  db.student_fees = db.student_fees.filter((f) => f.student_id !== id);
  writeLocalDb(db);
  return true;
}

export async function getAllFunds(): Promise<Fund[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('funds')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data;
  }

  const db = readLocalDb();
  return db.funds;
}

export async function createFund(payload: {
  title: string;
  description?: string;
  amount: number;
  due_date: string;
  batch: string;
}): Promise<Fund> {
  if (isSupabaseConfigured && supabase) {
    const { data: fund, error } = await supabase
      .from('funds')
      .insert({
        title: payload.title,
        description: payload.description || '',
        amount: payload.amount,
        due_date: payload.due_date,
        batch: payload.batch,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Assign to students
    const students = await getAllStudents();
    const eligibleStudents = students.filter(
      (s) => payload.batch === 'ALL' || s.batch === payload.batch
    );

    if (eligibleStudents.length > 0) {
      const feeInserts = eligibleStudents.map((s) => ({
        student_id: s.id,
        fund_id: fund.id,
        amount: payload.amount,
        status: 'PENDING',
      }));
      await supabase.from('student_fees').insert(feeInserts);
    }

    return fund;
  }

  const db = readLocalDb();
  const newFund: Fund = {
    id: 'fund-' + Date.now(),
    title: payload.title,
    description: payload.description || '',
    amount: Number(payload.amount),
    due_date: payload.due_date,
    batch: payload.batch,
    created_at: new Date().toISOString(),
  };

  db.funds.unshift(newFund);

  // Assign fee to eligible students
  db.students.forEach((student) => {
    if (newFund.batch === 'ALL' || student.batch === newFund.batch) {
      db.student_fees.push({
        id: 'fee-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        student_id: student.id,
        fund_id: newFund.id,
        amount: newFund.amount,
        status: 'PENDING',
        paid_amount: 0,
        created_at: new Date().toISOString(),
      });
    }
  });

  writeLocalDb(db);
  return newFund;
}

export async function getStudentFees(studentIdOrUuid: string): Promise<StudentFee[]> {
  const students = await getAllStudents();
  const currentStudent = students.find(
    (s) => s.id === studentIdOrUuid || s.student_id === studentIdOrUuid
  );
  if (!currentStudent) return [];

  const funds = await getAllFunds();
  const fundsMap = new Map(funds.map((f) => [f.id, f]));

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('student_fees')
      .select('*')
      .eq('student_id', currentStudent.id)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((fee) => {
      const fund = fundsMap.get(fee.fund_id);
      return {
        ...fee,
        fund_title: fund?.title || 'Dance Academy Fee',
        fund_description: fund?.description || '',
        due_date: fund?.due_date || '',
        student_name: currentStudent.name,
        student_code: currentStudent.student_id,
        batch: currentStudent.batch,
      };
    });
  }

  const db = readLocalDb();
  const fees = db.student_fees
    .filter((f) => f.student_id === currentStudent.id)
    .map((fee) => {
      const fund = fundsMap.get(fee.fund_id);
      return {
        ...fee,
        fund_title: fund?.title || 'Dance Academy Fee',
        fund_description: fund?.description || '',
        due_date: fund?.due_date || '',
        student_name: currentStudent.name,
        student_code: currentStudent.student_id,
        batch: currentStudent.batch,
      };
    });

  return fees;
}

export async function getAllStudentFees(): Promise<StudentFee[]> {
  const students = await getAllStudents();
  const funds = await getAllFunds();
  const studentMap = new Map(students.map((s) => [s.id, s]));
  const fundMap = new Map(funds.map((f) => [f.id, f]));

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('student_fees')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map((fee) => {
      const student = studentMap.get(fee.student_id);
      const fund = fundMap.get(fee.fund_id);
      return {
        ...fee,
        fund_title: fund?.title || 'Fee',
        due_date: fund?.due_date || '',
        student_name: student?.name || 'Unknown',
        student_code: student?.student_id || '',
        batch: student?.batch || '',
      };
    });
  }

  const db = readLocalDb();
  return db.student_fees.map((fee) => {
    const student = studentMap.get(fee.student_id);
    const fund = fundMap.get(fee.fund_id);
    return {
      ...fee,
      fund_title: fund?.title || 'Fee',
      due_date: fund?.due_date || '',
      student_name: student?.name || 'Unknown',
      student_code: student?.student_id || '',
      batch: student?.batch || '',
    };
  });
}

export async function markFeeAsPaid(
  feeId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string
): Promise<StudentFee | null> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('student_fees')
      .update({
        status: 'PAID',
        paid_amount: supabase.rpc('get_fee_amount', { fee_id: feeId }), // or update directly
        paid_at: now,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
      })
      .eq('id', feeId)
      .select()
      .single();

    if (error) return null;
    return data;
  }

  const db = readLocalDb();
  const fee = db.student_fees.find((f) => f.id === feeId);
  if (!fee) return null;

  fee.status = 'PAID';
  fee.paid_amount = fee.amount;
  fee.paid_at = now;
  fee.razorpay_order_id = razorpayOrderId;
  fee.razorpay_payment_id = razorpayPaymentId;

  writeLocalDb(db);
  return fee;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const students = await getAllStudents();
  const allFees = await getAllStudentFees();

  let totalCollected = 0;
  let totalPending = 0;

  allFees.forEach((f) => {
    if (f.status === 'PAID') {
      totalCollected += Number(f.paid_amount || f.amount);
    } else {
      totalPending += Number(f.amount);
    }
  });

  const recentTransactions = allFees
    .filter((f) => f.status === 'PAID')
    .slice(0, 10);

  return {
    totalStudents: students.length,
    totalCollected,
    totalPending,
    recentTransactions,
  };
}
