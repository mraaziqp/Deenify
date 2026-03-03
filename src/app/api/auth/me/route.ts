import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ user: null });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role?: string };
    // Fetch user from DB
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return NextResponse.json({ user: null });
    // Ensure role is present and normalise to lowercase for client-side hasRole() checks
    const rawRole = user.role || decoded.role || 'USER';
    const userWithRole = { ...user, role: rawRole.toLowerCase() };
    return NextResponse.json({ user: userWithRole });
  } catch (err) {
    console.error('JWT verify or user fetch failed:', err);
    return NextResponse.json({ user: null });
  }
}
