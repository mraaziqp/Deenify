import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function getUserId(req: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

// GET /api/groups — list groups the current user belongs to
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          members: { include: { user: { select: { id: true, email: true, username: true, displayName: true } } } },
          campaigns: true,
          admin: { select: { id: true, email: true, username: true, displayName: true } },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });

  const groups = memberships.map((m) => ({ ...m.group, myRole: m.role }));
  return NextResponse.json({ groups });
}

// POST /api/groups — create a new group
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, description, visibility } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const inviteCode = randomBytes(3).toString('hex').toUpperCase();
  const group = await prisma.group.create({
    data: {
      name,
      description,
      visibility: visibility === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC',
      inviteCode,
      adminId: userId,
      members: { create: { userId, role: 'ADMIN' } },
    },
    include: {
      members: { include: { user: { select: { id: true, email: true, username: true, displayName: true } } } },
      admin: { select: { id: true, email: true, username: true, displayName: true } },
      campaigns: true,
    },
  });

  return NextResponse.json({ group }, { status: 201 });
}
