
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  // Create JWT and set cookie (include role)
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const cookieStore = await cookies();
  // Dynamically set cookie options for local/dev/prod
  // Force dev-friendly cookie settings for localhost
  const host = req.headers.get('host') || '';
  const isProd = host.endsWith('deenify.co.za');
  let cookieOptions: any;
  if (isProd) {
    cookieOptions = {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'none',
      secure: true,
      domain: '.deenify.co.za',
    };
  } else {
    cookieOptions = {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: false,
    };
  }
  cookieStore.set('token', token, cookieOptions);
  return NextResponse.json({ id: user.id, email: user.email, role: user.role });
}
