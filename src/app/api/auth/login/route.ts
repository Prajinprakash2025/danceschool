import { NextRequest, NextResponse } from 'next/server';
import { getAdminByUsername, getStudentByStudentId } from '@/lib/db';
import { comparePassword, signJwtToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, username, student_id, password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    if (role === 'ADMIN') {
      if (!username) {
        return NextResponse.json({ error: 'Username is required' }, { status: 400 });
      }

      const admin = await getAdminByUsername(username);
      if (!admin) {
        return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
      }

      const isMatch = comparePassword(password, admin.password_hash || '');
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
      }

      const token = signJwtToken({
        id: admin.id,
        role: 'ADMIN',
        identifier: admin.username,
        name: admin.name,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: admin.id,
          role: 'ADMIN',
          identifier: admin.username,
          name: admin.name,
        },
      });

      response.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    } else if (role === 'STUDENT') {
      if (!student_id) {
        return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
      }

      const student = await getStudentByStudentId(student_id);
      if (!student) {
        return NextResponse.json(
          { error: 'Student ID not found. Please contact dance school admin.' },
          { status: 401 }
        );
      }

      const isMatch = comparePassword(password, student.password_hash || '');
      if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
      }

      const token = signJwtToken({
        id: student.id,
        role: 'STUDENT',
        identifier: student.student_id,
        name: student.name,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: student.id,
          role: 'STUDENT',
          identifier: student.student_id,
          name: student.name,
          batch: student.batch,
        },
      });

      response.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
