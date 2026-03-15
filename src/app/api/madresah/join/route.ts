import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

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

// GET /api/madresah/join?code=XXXXXXXX — look up school by invite code (no auth required)
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.toString().trim().toUpperCase();
  if (!code) return NextResponse.json({ error: 'code is required' }, { status: 400 });

  const madresah = await prisma.madresah.findUnique({
    where: { inviteCode: code },
    select: {
      id: true,
      name: true,
      description: true,
      address: true,
      _count: { select: { members: true, classes: true } },
    },
  });

  if (!madresah) return NextResponse.json({ error: 'School not found' }, { status: 404 });

  return NextResponse.json({ madresah });
}

// POST /api/madresah/join — join a madresah by invite code
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { inviteCode, role } = await req.json();
  if (!inviteCode?.trim()) return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });

  const madresah = await prisma.madresah.findUnique({ where: { inviteCode: inviteCode.trim().toUpperCase() } });
  if (!madresah) return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });

  const existing = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId: madresah.id } },
  });
  if (existing) return NextResponse.json({ madresah, alreadyMember: true });

  const allowedRoles = ['TEACHER', 'STUDENT', 'PARENT'];
  const memberRole = allowedRoles.includes(role) ? role : 'STUDENT';

  await prisma.madresahMember.create({
    data: { userId, madresahId: madresah.id, role: memberRole },
  });

  return NextResponse.json({ madresah, joined: true }, { status: 201 });
}
