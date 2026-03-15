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

// GET /api/madresah/[madresahId]/classes — list classes
export async function GET(req: NextRequest, { params }: { params: Promise<{ madresahId: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { madresahId } = await params;

  const member = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId } },
  });
  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  const classes = await prisma.madresahClass.findMany({
    where: { madresahId },
    include: {
      teacher: { select: { id: true, email: true, username: true, displayName: true } },
      subjects: true,
      _count: { select: { students: true, homework: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ classes });
}

// POST /api/madresah/[madresahId]/classes — create a class (principal or teacher)
export async function POST(req: NextRequest, { params }: { params: Promise<{ madresahId: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { madresahId } = await params;

  const member = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId } },
  });
  if (!member || !['PRINCIPAL', 'TEACHER'].includes(member.role)) {
    return NextResponse.json({ error: 'Only principals and teachers can create classes' }, { status: 403 });
  }

  const { name, description, teacherId, subjects: subjectNames } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Class name is required' }, { status: 400 });

  const resolvedTeacherId = teacherId || userId;

  const newClass = await prisma.madresahClass.create({
    data: {
      madresahId,
      name,
      description,
      teacherId: resolvedTeacherId,
      subjects: subjectNames?.length
        ? { create: subjectNames.map((s: string) => ({ name: s })) }
        : undefined,
    },
    include: {
      teacher: { select: { id: true, email: true, username: true, displayName: true } },
      subjects: true,
      _count: { select: { students: true, homework: true } },
    },
  });

  return NextResponse.json({ class: newClass }, { status: 201 });
}
