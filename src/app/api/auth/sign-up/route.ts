import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }
  const hashed = await bcrypt.hash(password, 10);
  // Generate verification token
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      emailVerified: false,
      verificationToken: token,
      verificationTokenExpires: expires,
    },
  });
  // Send verification email
  await sendVerificationEmail(email, token);
  return NextResponse.json({ id: user.id, email: user.email, verification: 'sent' });
}
