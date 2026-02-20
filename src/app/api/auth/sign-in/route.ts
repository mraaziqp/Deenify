
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
  // Create JWT and set cookie
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  const cookieStore = cookies();
  // Dynamically set cookie options for local/dev/prod
  const host = req.headers.get('host') || '';
  const isProd = host.endsWith('deenify.co.za');
  const isSecure = req.nextUrl.protocol === 'https:' || host.startsWith('www.');
  const cookieOptions: any = {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd || isSecure,
  };
  if (isProd) {
    cookieOptions.domain = '.deenify.co.za';
  }
  cookieStore.set('token', token, cookieOptions);
  return NextResponse.json({ id: user.id, email: user.email });
}
