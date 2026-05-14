import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function getAdminUser(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    if (decoded.role !== 'ADMIN') return null;
    return decoded;
  } catch {
    return null;
  }
}

// GET /api/admin/users?page=1&q=search&role=USER
export async function GET(req: NextRequest) {
  const user = await getAdminUser(req);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = 20;
  const q = searchParams.get('q') ?? '';
  const role = searchParams.get('role') ?? '';

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { email: { contains: q, mode: 'insensitive' } },
      { username: { contains: q, mode: 'insensitive' } },
      { displayName: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (role && ['USER', 'ADMIN', 'SCHOLAR'].includes(role.toUpperCase())) {
    where.role = role.toUpperCase();
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        createdAt: true,
        dhikrCount: true,
        currentStreak: true,
        totalDaysActive: true,
        emailVerified: true,
        _count: {
          select: {
            groupMemberships: true,
            bookmarks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ users, total, page, limit, pages: Math.ceil(total / limit) });
}

// PATCH /api/admin/users?id=xxx — update role
export async function PATCH(req: NextRequest) {
  const admin = await getAdminUser(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const body = await req.json();
  const allowedRoles = ['USER', 'ADMIN', 'SCHOLAR'];
  if (body.role && !allowedRoles.includes(body.role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(body.role && { role: body.role }),
    },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json({ user: updated });
}

// DELETE /api/admin/users?id=xxx — remove a user (soft approach: just demote or hard delete)
export async function DELETE(req: NextRequest) {
  const admin = await getAdminUser(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  // Prevent deleting yourself
  if (id === admin.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
