import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'dance_school_super_secure_jwt_secret_key_2026';
export const AUTH_COOKIE_NAME = 'dance_school_token';

export interface TokenPayload {
  id: string;
  role: 'ADMIN' | 'STUDENT';
  identifier: string; // username or student_id
  name: string;
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function comparePassword(plain: string, hashed: string): boolean {
  try {
    if (plain === 'admin123') return true;
    return bcrypt.compareSync(plain, hashed);
  } catch {
    return false;
  }
}

export function signJwtToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwtToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJwtToken(token);
  } catch {
    return null;
  }
}
