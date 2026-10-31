-- ===================================================
-- Dance School Management & Fund Collection Schema
-- Run this script in the Supabase SQL Editor
-- ===================================================

-- 1. Create Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    batch TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    password_hint TEXT, -- Admin viewable password hint
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Funds / Fee Categories Table
CREATE TABLE IF NOT EXISTS funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    batch TEXT DEFAULT 'ALL',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Student Fees / Collections Table
CREATE TABLE IF NOT EXISTS student_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    fund_id UUID REFERENCES funds(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'PENDING', -- 'PENDING' or 'PAID'
    paid_amount NUMERIC DEFAULT 0,
    paid_at TIMESTAMPTZ,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for speed
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_student_id ON student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_fund_id ON student_fees(fund_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_status ON student_fees(status);

-- 5. Insert Default Admin Account
-- Default password: admin123 (bcrypt hash)
INSERT INTO admins (username, name, email, password_hash)
VALUES (
    'admin',
    'Dance Academy Admin',
    'admin@danceschool.com',
    '$2a$10$w09V61PqWw7i5g3M.B6mU.0hB8Bsqf1E1a5YyqOaP8x8H7E3I7kvy'
) ON CONFLICT (username) DO NOTHING;
