-- ===================================================
-- Dance School Management & Fund Collection Schema
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

-- 2. Create Batches Table (Managed by Admin)
CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    timing TEXT,
    instructor TEXT,
    monthly_fee NUMERIC DEFAULT 1000,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    batch TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    password_hint TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Funds / Fee Categories Table
CREATE TABLE IF NOT EXISTS funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    fee_type TEXT DEFAULT 'MONTHLY', -- 'MONTHLY', 'EVENT', 'SPECIAL'
    month_name TEXT, -- e.g. 'November 2026'
    description TEXT,
    amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    batch TEXT DEFAULT 'ALL',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Student Fees Table
CREATE TABLE IF NOT EXISTS student_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    fund_id UUID REFERENCES funds(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'PENDING',
    paid_amount NUMERIC DEFAULT 0,
    paid_at TIMESTAMPTZ,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default Batches
INSERT INTO batches (name, timing, instructor, monthly_fee)
VALUES 
  ('Bharatanatyam - Junior Batch', 'Tue, Thu, Sat (4:30 PM - 6:00 PM)', 'Guru Jayasree', 1000),
  ('Bharatanatyam - Senior Batch', 'Mon, Wed, Fri (5:30 PM - 7:30 PM)', 'Guru Jayasree', 1200),
  ('Kuchipudi - Beginners', 'Sat & Sun (9:30 AM - 11:30 AM)', 'Smt. Kavitha', 1000),
  ('Mohiniyattam - Classical', 'Wed & Sat (3:30 PM - 5:00 PM)', 'Dr. Neethu Nair', 1100)
ON CONFLICT DO NOTHING;

-- Default Admin Account (admin / admin123)
INSERT INTO admins (username, name, email, password_hash)
VALUES (
    'admin',
    'Dance Academy Admin',
    'admin@danceschool.com',
    '$2b$10$WEq4w51ibyDEbh5XVZMe5eSaxCaBBrUQEDdKGLJuZZADZslqHyXAm'
) ON CONFLICT (username) DO NOTHING;
