import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function verifyToken(email: string, token: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.verificationToken !== token || !user.verificationTokenExpires || user.verificationTokenExpires < new Date()) {
    return { success: false, error: 'Invalid or expired verification link.' };
  }
  await prisma.user.update({
    where: { email },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });
  return { success: true };
}

// GET: link-based auto-verify from email
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';
  if (!email || !token) {
    return NextResponse.redirect(new URL('/auth/verify-email', req.url));
  }
  const result = await verifyToken(email, token);
  if (result.success) {
    return NextResponse.redirect(new URL('/auth/verify-email?verified=1', req.url));
  }
  return NextResponse.redirect(new URL(`/auth/verify-email?error=${encodeURIComponent(result.error || 'failed')}`, req.url));
}

export async function POST(req: NextRequest) {
  const { email, token } = await req.json();
  if (!email || !token) {
    return NextResponse.json({ error: 'Email and token required' }, { status: 400 });
  }
  const result = await verifyToken(email, token);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
