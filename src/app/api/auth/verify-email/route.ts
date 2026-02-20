import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { email, token } = await req.json();
  if (!email || !token) {
    return NextResponse.json({ error: 'Email and token required' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.verificationToken !== token || !user.verificationTokenExpires || user.verificationTokenExpires < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
  await prisma.user.update({
    where: { email },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });
  return NextResponse.json({ success: true });
}
