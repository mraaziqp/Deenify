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

// GET /api/madresah/[madresahId]/classes/[classId]/struggles
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ madresahId: string; classId: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { madresahId, classId } = await params;

  const member = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId } },
  });
  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  const isTeacher = ['PRINCIPAL', 'TEACHER'].includes(member.role);

  const struggles = await prisma.struggleReport.findMany({
    where: isTeacher ? { classId } : { classId, studentId: userId },
    include: { student: { select: { id: true, email: true, username: true, displayName: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ struggles });
}

// POST /api/madresah/[madresahId]/classes/[classId]/struggles — student/parent flags a struggle area
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ madresahId: string; classId: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { madresahId, classId } = await params;

  const member = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId } },
  });
  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  const { subjectName, topic, description } = await req.json();
  if (!topic?.trim()) return NextResponse.json({ error: 'Topic is required' }, { status: 400 });

  const report = await prisma.struggleReport.create({
    data: {
      studentId: userId,
      classId,
      subjectName: subjectName || 'General',
      topic,
      description,
    },
    include: { student: { select: { id: true, email: true, username: true, displayName: true } } },
  });

  return NextResponse.json({ report }, { status: 201 });
}

// PATCH /api/madresah/[madresahId]/classes/[classId]/struggles — teacher resolves or responds
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ madresahId: string; classId: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { madresahId } = await params;

  const member = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId } },
  });
  if (!member || !['PRINCIPAL', 'TEACHER'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { reportId, isResolved, teacherNote } = await req.json();
  if (!reportId) return NextResponse.json({ error: 'reportId required' }, { status: 400 });

  const updated = await prisma.struggleReport.update({
    where: { id: reportId },
    data: { isResolved, teacherNote },
    include: { student: { select: { id: true, email: true, username: true, displayName: true } } },
  });

  return NextResponse.json({ report: updated });
}
