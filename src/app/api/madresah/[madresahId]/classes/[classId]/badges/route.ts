import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    return payload.id;
  } catch {
    return null;
  }
}

// GET /api/madresah/[madresahId]/classes/[classId]/badges
// Returns all badges for a class. Optionally filter by studentId via ?studentId=...
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ madresahId: string; classId: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { classId } = await params;

  const cls = await prisma.madresahClass.findUnique({ where: { id: classId }, include: { madresah: true } });
  if (!cls) return NextResponse.json({ error: 'Class not found' }, { status: 404 });

  const membership = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId: cls.madresahId } },
  });
  if (!membership && cls.madresah.adminId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const studentIdFilter = req.nextUrl.searchParams.get('studentId');
  const badges = await prisma.studentBadge.findMany({
    where: { classId, ...(studentIdFilter ? { studentId: studentIdFilter } : {}) },
    include: {
      student: { select: { id: true, displayName: true, email: true } },
      awardedBy: { select: { id: true, displayName: true, email: true } },
    },
    orderBy: { awardedAt: 'desc' },
  });

  return NextResponse.json(badges);
}

// POST /api/madresah/[madresahId]/classes/[classId]/badges
// Body: { studentId, type, label, description }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ madresahId: string; classId: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { classId } = await params;

  const cls = await prisma.madresahClass.findUnique({ where: { id: classId }, include: { madresah: true } });
  if (!cls) return NextResponse.json({ error: 'Class not found' }, { status: 404 });

  const membership = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId: cls.madresahId } },
  });
  const canAward =
    cls.madresah.adminId === userId ||
    membership?.role === 'PRINCIPAL' ||
    membership?.role === 'TEACHER' ||
    cls.teacherId === userId;
  if (!canAward) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { studentId, type, label, description } = await req.json();
  if (!studentId || !type || !label) {
    return NextResponse.json({ error: 'studentId, type, and label are required' }, { status: 400 });
  }

  const badge = await prisma.studentBadge.create({
    data: { classId, studentId, awardedById: userId, type, label, description: description || null },
    include: {
      student: { select: { id: true, displayName: true, email: true } },
      awardedBy: { select: { id: true, displayName: true, email: true } },
    },
  });

  return NextResponse.json(badge, { status: 201 });
}
