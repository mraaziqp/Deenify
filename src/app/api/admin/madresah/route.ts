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
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true },
    });
    return user;
  } catch {
    return null;
  }
}

// GET /api/admin/madresah — list all schools (admin only)
export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const search = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;

  const where = search
    ? { name: { contains: search, mode: 'insensitive' as const } }
    : {};

  const [total, madresahs] = await Promise.all([
    prisma.madresah.count({ where }),
    prisma.madresah.findMany({
      where,
      include: {
        admin: { select: { id: true, email: true, username: true, displayName: true } },
        _count: { select: { members: true, classes: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ madresahs, total, page, limit });
}

// DELETE /api/admin/madresah?id=xxx — delete a school (admin only)
export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.madresah.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}

// POST /api/admin/madresah — force-add a member to a school (admin only)
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { madresahId, userEmail, role } = await req.json();
  if (!madresahId || !userEmail) {
    return NextResponse.json({ error: 'madresahId and userEmail required' }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const allowedRoles = ['STUDENT', 'TEACHER', 'PARENT', 'PRINCIPAL'];
  const memberRole = allowedRoles.includes(role) ? role : 'STUDENT';

  const member = await prisma.madresahMember.upsert({
    where: { userId_madresahId: { userId: targetUser.id, madresahId } },
    create: { userId: targetUser.id, madresahId, role: memberRole },
    update: { role: memberRole },
  });

  return NextResponse.json({ member });
}
