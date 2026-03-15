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

// GET /api/madresah — list madresahs the current user belongs to
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const memberships = await prisma.madresahMember.findMany({
    where: { userId },
    include: {
      madresah: {
        include: {
          admin: { select: { id: true, email: true, username: true, displayName: true } },
          _count: { select: { members: true, classes: true } },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });

  const madresahs = memberships.map((m) => ({ ...m.madresah, myRole: m.role }));
  return NextResponse.json({ madresahs });
}

// POST /api/madresah — create a new madresah (school)
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, description, address, phone, email: schoolEmail } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'School name is required' }, { status: 400 });

  const inviteCode = randomBytes(4).toString('hex').toUpperCase();

  const madresah = await prisma.madresah.create({
    data: {
      name,
      description,
      address,
      phone,
      email: schoolEmail,
      inviteCode,
      adminId: userId,
      members: { create: { userId, role: 'PRINCIPAL' } },
    },
    include: {
      admin: { select: { id: true, email: true, username: true, displayName: true } },
      _count: { select: { members: true, classes: true } },
    },
  });

  return NextResponse.json({ madresah }, { status: 201 });
}
