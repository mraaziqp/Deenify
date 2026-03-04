import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(req: NextRequest) {
  const { email, password, role } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }
  const hashed = await bcrypt.hash(password, 10);
  // Generate verification token
  const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      emailVerified: false,
      verificationToken,
      verificationTokenExpires: expires,
      role: role === 'SCHOLAR' ? 'SCHOLAR' : undefined,
    },
  });
  // Send verification email
  await sendVerificationEmail(email, verificationToken);

  // Auto sign-in: generate JWT and set auth cookie so the user is logged in immediately
  const jwtToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
  const host = req.headers.get('host') || '';
  const isProd = host.endsWith('deenify.co.za');
  const response = NextResponse.json({ id: user.id, email: user.email, verification: 'sent' });
  if (isProd) {
    response.cookies.set('token', jwtToken, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'none',
      secure: true,
      domain: '.deenify.co.za',
    });
  } else {
    response.cookies.set('token', jwtToken, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: false,
    });
  }
  return response;
}
