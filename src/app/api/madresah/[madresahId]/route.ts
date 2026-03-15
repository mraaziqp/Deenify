import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function getUserIdAndRole(req: NextRequest): Promise<{ id: string; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, role: true } });
    return user;
  } catch {
    return null;
  }
}

async function getUserId(req: NextRequest): Promise<string | null> {
  const u = await getUserIdAndRole(req);
  return u?.id ?? null;
}

async function assertMember(madresahId: string, userId: string) {
  const m = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId } },
  });
  return m;
}

// GET /api/madresah/[madresahId] — full school detail
export async function GET(req: NextRequest, { params }: { params: Promise<{ madresahId: string }> }) {
  const userAuth = await getUserIdAndRole(req);
  if (!userAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { madresahId } = await params;
  const isAdmin = userAuth.role === 'ADMIN';

  const member = await assertMember(madresahId, userAuth.id);
  if (!member && !isAdmin) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  const madresah = await prisma.madresah.findUnique({
    where: { id: madresahId },
    include: {
      admin: { select: { id: true, email: true, username: true, displayName: true } },
      members: {
        include: { user: { select: { id: true, email: true, username: true, displayName: true } } },
        orderBy: { joinedAt: 'asc' },
      },
      classes: {
        include: {
          teacher: { select: { id: true, email: true, username: true, displayName: true } },
          _count: { select: { students: true, homework: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!madresah) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ madresah, myRole: member?.role ?? 'ADMIN', isAdminOverride: isAdmin && !member });
}

// PATCH /api/madresah/[madresahId] — update school info (principal only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ madresahId: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { madresahId } = await params;
  const member = await assertMember(madresahId, userId);
  if (!member || member.role !== 'PRINCIPAL') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { name, description, address, phone, email } = await req.json();

  const updated = await prisma.madresah.update({
    where: { id: madresahId },
    data: { name, description, address, phone, email },
  });

  return NextResponse.json({ madresah: updated });
}
