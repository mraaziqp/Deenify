import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function getUser(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return prisma.user.findUnique({ where: { id: decoded.id } });
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    createdAt: user.createdAt,
    dhikrCount: user.dhikrCount,
    currentStreak: user.currentStreak,
    totalDaysActive: user.totalDaysActive,
    coursesCompleted: user.coursesCompleted,
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { username, displayName } = body;

  // Validate username format
  if (username !== undefined) {
    if (username !== null && username !== '') {
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
        return NextResponse.json(
          { error: 'Username must be 3-30 characters, letters/numbers/underscore only.' },
          { status: 400 },
        );
      }
      // Check uniqueness
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
      }
    }
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(username !== undefined ? { username: username || null } : {}),
      ...(displayName !== undefined ? { displayName: displayName || null } : {}),
    },
  });

  return NextResponse.json({
    id: updated.id,
    email: updated.email,
    username: updated.username,
    displayName: updated.displayName,
  });
}
