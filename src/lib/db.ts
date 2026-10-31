import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { hashPassword } from './auth';
import { Admin, Student, Fund, StudentFee, Batch, DashboardStats } from '@/types';

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

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

interface LocalDbSchema {
  admins: Admin[];
  batches: Batch[];
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
    batches: [
      {
        id: 'batch-1',
        name: 'Bharatanatyam - Junior Batch',
        timing: 'Tue, Thu, Sat (4:30 PM - 6:00 PM)',
        instructor: 'Guru Jayasree',
        monthly_fee: 1000,
        created_at: new Date().toISOString(),
      },
      {
        id: 'batch-2',
        name: 'Bharatanatyam - Senior Batch',
        timing: 'Mon, Wed, Fri (5:30 PM - 7:30 PM)',
        instructor: 'Guru Jayasree',
        monthly_fee: 1200,
        created_at: new Date().toISOString(),
      },
      {
        id: 'batch-3',
        name: 'Kuchipudi - Beginners',
        timing: 'Sat & Sun (9:30 AM - 11:30 AM)',
        instructor: 'Smt. Kavitha',
        monthly_fee: 1000,
        created_at: new Date().toISOString(),
      },
      {
        id: 'batch-4',
        name: 'Mohiniyattam - Classical',
        timing: 'Wed & Sat (3:30 PM - 5:00 PM)',
        instructor: 'Dr. Neethu Nair',
        monthly_fee: 1100,
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
        batch: 'Bharatanatyam - Senior Batch',
        discount_amount: 500, // Sibling concession
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
        batch: 'Kuchipudi - Beginners',
        discount_amount: 0,
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
        title: 'Dance Term 1 Fee (Jan 1 - Mar 31)',
        fee_type: 'PERIOD',
        period_start: '2027-01-01',
        period_end: '2027-03-31',
        description: 'First quarter comprehensive dance training fee (Jan 1 to Mar 31).',
        amount: 2000,
        due_date: '2027-01-10',
        batch: 'ALL',
        created_at: new Date().toISOString(),
      },
    ],
    student_fees: [
      {
        id: 'fee-1',
        student_id: 'std-1',
        fund_id: 'fund-1',
        amount: 1500, // 2000 - 500 discount
        original_amount: 2000,
        discount_applied: 500,
        status: 'PENDING',
        paid_amount: 0,
        created_at: new Date().toISOString(),
      },
      {
        id: 'fee-2',
        student_id: 'std-2',
        fund_id: 'fund-1',
        amount: 2000,
        original_amount: 2000,
        discount_applied: 0,
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
    const parsed = JSON.parse(raw);
    if (!parsed.batches) {
      parsed.batches = getInitialData().batches;
      fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
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

// ----------------- ADMIN -----------------

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
  return {
    ...admin,
    password_hash: hashPassword('admin123'),
  };
}

// ----------------- BATCHES -----------------

export async function getAllBatches(): Promise<Batch[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data && data.length > 0) return data;
  }

  const db = readLocalDb();
  return db.batches || [];
}

export async function createBatch(payload: {
  name: string;
  timing?: string;
  instructor?: string;
  monthly_fee?: number;
}): Promise<Batch> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('batches')
      .insert({
        name: payload.name,
        timing: payload.timing || '',
        instructor: payload.instructor || '',
        monthly_fee: Number(payload.monthly_fee || 1000),
      })
      .select()
      .single();
    if (!error && data) return data;
  }

  const db = readLocalDb();
  const newBatch: Batch = {
    id: 'batch-' + Date.now(),
    name: payload.name,
    timing: payload.timing || '',
    instructor: payload.instructor || '',
    monthly_fee: Number(payload.monthly_fee || 1000),
    created_at: new Date().toISOString(),
  };

  if (!db.batches) db.batches = [];
  db.batches.push(newBatch);
  writeLocalDb(db);
  return newBatch;
}

export async function updateBatch(
  id: string,
  payload: {
    name?: string;
    timing?: string;
    instructor?: string;
    monthly_fee?: number;
  }
): Promise<Batch | null> {
  const updateObj: any = {};
  if (payload.name !== undefined) updateObj.name = payload.name;
  if (payload.timing !== undefined) updateObj.timing = payload.timing;
  if (payload.instructor !== undefined) updateObj.instructor = payload.instructor;
  if (payload.monthly_fee !== undefined) updateObj.monthly_fee = Number(payload.monthly_fee);

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('batches')
      .update(updateObj)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) return data;
  }

  const db = readLocalDb();
  if (db.batches) {
    const batch = db.batches.find((b) => b.id === id);
    if (batch) {
      if (payload.name !== undefined) batch.name = payload.name;
      if (payload.timing !== undefined) batch.timing = payload.timing;
      if (payload.instructor !== undefined) batch.instructor = payload.instructor;
      if (payload.monthly_fee !== undefined) batch.monthly_fee = Number(payload.monthly_fee);
      writeLocalDb(db);
      return batch;
    }
  }
  return null;
}

export async function deleteBatch(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('batches').delete().eq('id', id);
    if (!error) return true;
  }

  const db = readLocalDb();
  if (db.batches) {
    db.batches = db.batches.filter((b) => b.id !== id);
    writeLocalDb(db);
  }
  return true;
}

// ----------------- STUDENTS -----------------

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
  discount_amount?: number;
  joining_date?: string;
  fee_due_day?: number;
  password?: string;
}): Promise<Student> {
  const student_id = await generateNextStudentId();
  const password = payload.password && payload.password.trim() !== '' 
    ? payload.password.trim() 
    : 'dance@' + Math.floor(1000 + Math.random() * 9000);
  const password_hash = hashPassword(password);
  const discount_amount = Number(payload.discount_amount || 0);

  const joining_date = payload.joining_date || new Date().toISOString().split('T')[0];
  const fee_due_day = payload.fee_due_day !== undefined && payload.fee_due_day > 0
    ? Number(payload.fee_due_day)
    : new Date(joining_date).getDate();

  if (isSupabaseConfigured && supabase) {
    const insertObj: any = {
      student_id,
      name: payload.name,
      parent_name: payload.parent_name,
      phone: payload.phone,
      email: payload.email || '',
      batch: payload.batch,
      password_hash,
      password_hint: password,
      status: 'ACTIVE',
    };
    if (discount_amount > 0) insertObj.discount_amount = discount_amount;
    if (joining_date) insertObj.joining_date = joining_date;
    if (fee_due_day) insertObj.fee_due_day = fee_due_day;

    let { data, error } = await supabase
      .from('students')
      .insert(insertObj)
      .select()
      .single();

    if (error) {
      delete insertObj.discount_amount;
      delete insertObj.joining_date;
      delete insertObj.fee_due_day;
      const retry = await supabase.from('students').insert(insertObj).select().single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw new Error(error.message);
    const newStudent = { 
      ...data, 
      role: 'STUDENT' as const, 
      password, 
      discount_amount,
      joining_date,
      fee_due_day 
    };

    // Also assign existing active funds if applicable
    const funds = await getAllFunds();
    for (const fund of funds) {
      if (fund.batch === 'ALL' || fund.batch === payload.batch) {
        const netAmount = Math.max(0, Number(fund.amount) - discount_amount);
        await supabase.from('student_fees').insert({
          student_id: newStudent.id,
          fund_id: fund.id,
          amount: netAmount,
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
    discount_amount,
    joining_date,
    fee_due_day,
    password,
    password_hash,
    role: 'STUDENT',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  };

  db.students.unshift(newStudent);

  db.funds.forEach((fund) => {
    if (fund.batch === 'ALL' || fund.batch === newStudent.batch) {
      const netAmount = Math.max(0, Number(fund.amount) - discount_amount);
      db.student_fees.push({
        id: 'fee-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        student_id: newStudent.id,
        fund_id: fund.id,
        amount: netAmount,
        original_amount: fund.amount,
        discount_applied: discount_amount,
        status: 'PENDING',
        paid_amount: 0,
        created_at: new Date().toISOString(),
      });
    }
  });

  writeLocalDb(db);
  return newStudent;
}

export async function updateStudent(
  id: string,
  payload: {
    name?: string;
    parent_name?: string;
    phone?: string;
    email?: string;
    batch?: string;
    discount_amount?: number;
    joining_date?: string;
    fee_due_day?: number;
    password?: string;
  }
): Promise<Student | null> {
  const updateObj: any = {};
  if (payload.name !== undefined) updateObj.name = payload.name;
  if (payload.parent_name !== undefined) updateObj.parent_name = payload.parent_name;
  if (payload.phone !== undefined) updateObj.phone = payload.phone;
  if (payload.email !== undefined) updateObj.email = payload.email;
  if (payload.batch !== undefined) updateObj.batch = payload.batch;
  if (payload.discount_amount !== undefined) updateObj.discount_amount = Number(payload.discount_amount);
  if (payload.joining_date !== undefined) updateObj.joining_date = payload.joining_date;
  if (payload.fee_due_day !== undefined) updateObj.fee_due_day = Number(payload.fee_due_day);
  if (payload.password && payload.password.trim() !== '') {
    updateObj.password = payload.password.trim();
    updateObj.password_hint = payload.password.trim();
    updateObj.password_hash = hashPassword(payload.password.trim());
  }

  if (isSupabaseConfigured && supabase) {
    let { data, error } = await supabase
      .from('students')
      .update(updateObj)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      delete updateObj.discount_amount;
      delete updateObj.joining_date;
      delete updateObj.fee_due_day;
      const retry = await supabase
        .from('students')
        .update(updateObj)
        .eq('id', id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) return null;
    return {
      ...data,
      password: payload.password || data.password || data.password_hint || 'dance@2026',
      role: 'STUDENT',
    };
  }

  const db = readLocalDb();
  const student = db.students.find((s) => s.id === id);
  if (!student) return null;

  if (payload.name !== undefined) student.name = payload.name;
  if (payload.parent_name !== undefined) student.parent_name = payload.parent_name;
  if (payload.phone !== undefined) student.phone = payload.phone;
  if (payload.email !== undefined) student.email = payload.email;
  if (payload.batch !== undefined) student.batch = payload.batch;
  if (payload.discount_amount !== undefined) student.discount_amount = Number(payload.discount_amount);
  if (payload.joining_date !== undefined) student.joining_date = payload.joining_date;
  if (payload.fee_due_day !== undefined) student.fee_due_day = Number(payload.fee_due_day);
  if (payload.password && payload.password.trim() !== '') {
    student.password = payload.password.trim();
    student.password_hash = hashPassword(payload.password.trim());
  }

  // Also update pending student fees if discount was changed
  if (payload.discount_amount !== undefined) {
    const funds = await getAllFunds();
    const fundsMap = new Map(funds.map((f) => [f.id, f]));
    db.student_fees.forEach((f) => {
      if (f.student_id === id && f.status === 'PENDING') {
        const fund = fundsMap.get(f.fund_id);
        const original = fund ? Number(fund.amount) : Number(f.amount);
        f.discount_applied = Number(payload.discount_amount);
        f.amount = Math.max(0, original - Number(payload.discount_amount));
      }
    });
  }

  writeLocalDb(db);
  return student;
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

// ----------------- FUNDS & FEES -----------------

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
  fee_type?: 'PERIOD' | 'MONTHLY' | 'EVENT';
  period_start?: string;
  period_end?: string;
  description?: string;
  amount: number;
  due_date: string;
  batch: string;
}): Promise<Fund> {
  if (isSupabaseConfigured && supabase) {
    const insertObj: any = {
      title: payload.title,
      description: payload.description || '',
      amount: payload.amount,
      due_date: payload.due_date,
      batch: payload.batch,
    };
    if (payload.fee_type) insertObj.fee_type = payload.fee_type;
    if (payload.period_start) insertObj.period_start = payload.period_start;
    if (payload.period_end) insertObj.period_end = payload.period_end;

    let { data: fund, error } = await supabase
      .from('funds')
      .insert(insertObj)
      .select()
      .single();

    if (error) {
      // Fallback: If custom columns are not yet created in Supabase schema, insert standard guaranteed columns
      delete insertObj.fee_type;
      delete insertObj.period_start;
      delete insertObj.period_end;
      delete insertObj.month_name;
      const retry = await supabase.from('funds').insert(insertObj).select().single();
      fund = retry.data;
      error = retry.error;
    }

    if (error) throw new Error(error.message);

    const students = await getAllStudents();
    const eligibleStudents = students.filter(
      (s) => payload.batch === 'ALL' || s.batch === payload.batch
    );

    if (eligibleStudents.length > 0 && fund) {
      const feeInserts = eligibleStudents.map((s) => {
        const discount = Number(s.discount_amount || 0);
        const finalAmount = Math.max(0, payload.amount - discount);

        // Customize due date according to student's joining day (e.g. 23rd of the month)
        let studentDueDate = payload.due_date;
        if (s.fee_due_day && payload.due_date) {
          try {
            const parts = payload.due_date.split('-');
            if (parts.length === 3) {
              const year = parts[0];
              const month = parts[1];
              const day = String(Math.min(28, Math.max(1, s.fee_due_day))).padStart(2, '0');
              studentDueDate = `${year}-${month}-${day}`;
            }
          } catch {
            studentDueDate = payload.due_date;
          }
        }

        return {
          student_id: s.id,
          fund_id: fund.id,
          amount: finalAmount,
          due_date: studentDueDate,
          status: 'PENDING',
        };
      });

      let { error: insertErr } = await supabase.from('student_fees').insert(feeInserts);
      if (insertErr && insertErr.message.includes('due_date')) {
        // Fallback if student_fees table doesn't have custom due_date column yet
        const cleanInserts = feeInserts.map(({ due_date, ...rest }) => rest);
        await supabase.from('student_fees').insert(cleanInserts);
      }
    }

    return fund;
  }

  const db = readLocalDb();
  const newFund: Fund = {
    id: 'fund-' + Date.now(),
    title: payload.title,
    fee_type: payload.fee_type || 'PERIOD',
    period_start: payload.period_start,
    period_end: payload.period_end,
    description: payload.description || '',
    amount: Number(payload.amount),
    due_date: payload.due_date,
    batch: payload.batch,
    created_at: new Date().toISOString(),
  };

  db.funds.unshift(newFund);

  db.students.forEach((student) => {
    if (newFund.batch === 'ALL' || student.batch === newFund.batch) {
      const discount = Number(student.discount_amount || 0);
      const finalAmount = Math.max(0, newFund.amount - discount);

      let studentDueDate = newFund.due_date;
      if (student.fee_due_day && newFund.due_date) {
        try {
          const parts = newFund.due_date.split('-');
          if (parts.length === 3) {
            const year = parts[0];
            const month = parts[1];
            const day = String(Math.min(28, Math.max(1, student.fee_due_day))).padStart(2, '0');
            studentDueDate = `${year}-${month}-${day}`;
          }
        } catch {
          studentDueDate = newFund.due_date;
        }
      }

      db.student_fees.push({
        id: 'fee-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        student_id: student.id,
        fund_id: newFund.id,
        amount: finalAmount,
        original_amount: newFund.amount,
        discount_applied: discount,
        due_date: studentDueDate,
        status: 'PENDING',
        paid_amount: 0,
        created_at: new Date().toISOString(),
      });
    }
  });

  writeLocalDb(db);
  return newFund;
}

export async function updateFund(
  id: string,
  payload: {
    title?: string;
    amount?: number;
    due_date?: string;
    period_start?: string;
    period_end?: string;
    description?: string;
    batch?: string;
  }
): Promise<Fund | null> {
  const updateObj: any = {};
  if (payload.title !== undefined) updateObj.title = payload.title;
  if (payload.amount !== undefined) updateObj.amount = Number(payload.amount);
  if (payload.due_date !== undefined) updateObj.due_date = payload.due_date;
  if (payload.period_start !== undefined) updateObj.period_start = payload.period_start;
  if (payload.period_end !== undefined) updateObj.period_end = payload.period_end;
  if (payload.description !== undefined) updateObj.description = payload.description;
  if (payload.batch !== undefined) updateObj.batch = payload.batch;

  if (isSupabaseConfigured && supabase) {
    let { data, error } = await supabase
      .from('funds')
      .update(updateObj)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      delete updateObj.period_start;
      delete updateObj.period_end;
      const retry = await supabase
        .from('funds')
        .update(updateObj)
        .eq('id', id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (!error && data) {
      if (payload.amount !== undefined) {
        const students = await getAllStudents();
        const studentMap = new Map(students.map((s) => [s.id, s]));
        const { data: fees } = await supabase
          .from('student_fees')
          .select('*')
          .eq('fund_id', id)
          .eq('status', 'PENDING');

        if (fees && fees.length > 0) {
          for (const fee of fees) {
            const student = studentMap.get(fee.student_id);
            const discount = Number(student?.discount_amount || 0);
            const newFeeAmount = Math.max(0, Number(payload.amount) - discount);
            await supabase
              .from('student_fees')
              .update({ amount: newFeeAmount })
              .eq('id', fee.id);
          }
        }
      }
      return data;
    }
  }

  const db = readLocalDb();
  const fund = db.funds.find((f) => f.id === id);
  if (!fund) return null;

  if (payload.title !== undefined) fund.title = payload.title;
  if (payload.amount !== undefined) fund.amount = Number(payload.amount);
  if (payload.due_date !== undefined) fund.due_date = payload.due_date;
  if (payload.period_start !== undefined) fund.period_start = payload.period_start;
  if (payload.period_end !== undefined) fund.period_end = payload.period_end;
  if (payload.description !== undefined) fund.description = payload.description;
  if (payload.batch !== undefined) fund.batch = payload.batch;

  if (payload.amount !== undefined) {
    db.student_fees.forEach((fee) => {
      if (fee.fund_id === id && fee.status === 'PENDING') {
        const student = db.students.find((s) => s.id === fee.student_id);
        const discount = Number(student?.discount_amount || 0);
        fee.amount = Math.max(0, Number(payload.amount) - discount);
        fee.original_amount = Number(payload.amount);
      }
    });
  }

  writeLocalDb(db);
  return fund;
}

export async function deleteFund(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('student_fees').delete().eq('fund_id', id);
    const { error } = await supabase.from('funds').delete().eq('id', id);
    return !error;
  }

  const db = readLocalDb();
  db.funds = db.funds.filter((f) => f.id !== id);
  db.student_fees = db.student_fees.filter((f) => f.fund_id !== id);
  writeLocalDb(db);
  return true;
}

export async function updateFeeAmount(
  feeId: string, 
  newAmount: number,
  newDueDate?: string
): Promise<boolean> {
  const updateObj: any = { amount: Number(newAmount) };
  if (newDueDate) updateObj.due_date = newDueDate;

  if (isSupabaseConfigured && supabase) {
    let { error } = await supabase
      .from('student_fees')
      .update(updateObj)
      .eq('id', feeId);

    if (error && error.message.includes('due_date')) {
      delete updateObj.due_date;
      const retry = await supabase.from('student_fees').update(updateObj).eq('id', feeId);
      error = retry.error;
    }
    return !error;
  }

  const db = readLocalDb();
  const fee = db.student_fees.find((f) => f.id === feeId);
  if (fee) {
    fee.amount = Number(newAmount);
    if (newDueDate) fee.due_date = newDueDate;
    writeLocalDb(db);
    return true;
  }
  return false;
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
      const original = fund ? Number(fund.amount) : Number(fee.amount);
      const discount = Math.max(0, original - Number(fee.amount));
      return {
        ...fee,
        original_amount: fee.original_amount ?? original,
        discount_applied: fee.discount_applied ?? discount,
        fund_title: fund?.title || 'Dance Academy Fee',
        fee_type: fund?.fee_type || 'PERIOD',
        period_start: fund?.period_start,
        period_end: fund?.period_end,
        fund_description: fund?.description || '',
        due_date: fund?.due_date || '',
        student_name: currentStudent.name,
        student_code: currentStudent.student_id,
        batch: currentStudent.batch,
        parent_name: currentStudent.parent_name,
        phone: currentStudent.phone,
      };
    });
  }

  const db = readLocalDb();
  const fees = db.student_fees
    .filter((f) => f.student_id === currentStudent.id)
    .map((fee) => {
      const fund = fundsMap.get(fee.fund_id);
      const original = fund ? Number(fund.amount) : Number(fee.amount);
      const discount = Math.max(0, original - Number(fee.amount));
      return {
        ...fee,
        original_amount: fee.original_amount ?? original,
        discount_applied: fee.discount_applied ?? discount,
        fund_title: fund?.title || 'Dance Academy Fee',
        fee_type: fund?.fee_type || 'PERIOD',
        period_start: fund?.period_start,
        period_end: fund?.period_end,
        fund_description: fund?.description || '',
        due_date: fund?.due_date || '',
        student_name: currentStudent.name,
        student_code: currentStudent.student_id,
        batch: currentStudent.batch,
        parent_name: currentStudent.parent_name,
        phone: currentStudent.phone,
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
      const original = fund ? Number(fund.amount) : Number(fee.amount);
      const discount = Math.max(0, original - Number(fee.amount));
      return {
        ...fee,
        original_amount: fee.original_amount ?? original,
        discount_applied: fee.discount_applied ?? discount,
        fund_title: fund?.title || 'Fee',
        fee_type: fund?.fee_type || 'PERIOD',
        period_start: fund?.period_start,
        period_end: fund?.period_end,
        due_date: fund?.due_date || '',
        student_name: student?.name || 'Unknown',
        student_code: student?.student_id || '',
        batch: student?.batch || '',
        parent_name: student?.parent_name || '',
        phone: student?.phone || '',
      };
    });
  }

  const db = readLocalDb();
  return db.student_fees.map((fee) => {
    const student = studentMap.get(fee.student_id);
    const fund = fundMap.get(fee.fund_id);
    const original = fund ? Number(fund.amount) : Number(fee.amount);
    const discount = Math.max(0, original - Number(fee.amount));
    return {
      ...fee,
      original_amount: fee.original_amount ?? original,
      discount_applied: fee.discount_applied ?? discount,
      fund_title: fund?.title || 'Fee',
      fee_type: fund?.fee_type || 'PERIOD',
      period_start: fund?.period_start,
      period_end: fund?.period_end,
      due_date: fund?.due_date || '',
      student_name: student?.name || 'Unknown',
      student_code: student?.student_id || '',
      batch: student?.batch || '',
      parent_name: student?.parent_name || '',
      phone: student?.phone || '',
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
        paid_amount: supabase.rpc('get_fee_amount', { fee_id: feeId }),
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
  const batches = await getAllBatches();

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
    activeBatches: batches.length,
    recentTransactions,
  };
}
