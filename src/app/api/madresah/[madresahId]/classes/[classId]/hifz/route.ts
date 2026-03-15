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

// GET /api/madresah/[madresahId]/classes/[classId]/hifz — get hifz progress
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

  const hifz = await prisma.hifzProgress.findMany({
    where: isTeacher ? { classId } : { classId, studentId: userId },
    include: { student: { select: { id: true, email: true, username: true, displayName: true } } },
    orderBy: [{ studentId: 'asc' }, { surahNumber: 'asc' }],
  });

  return NextResponse.json({ hifz });
}

// POST /api/madresah/[madresahId]/classes/[classId]/hifz — record hifz (teacher)
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
  if (!member || !['PRINCIPAL', 'TEACHER'].includes(member.role)) {
    return NextResponse.json({ error: 'Only teachers can record hifz' }, { status: 403 });
  }

  const { studentId, surahNumber, surahName, ayahFrom, ayahTo, memorized, quality, notes } = await req.json();
  if (!studentId || !surahNumber || !surahName) {
    return NextResponse.json({ error: 'studentId, surahNumber, surahName required' }, { status: 400 });
  }

  const entry = await prisma.hifzProgress.create({
    data: {
      studentId,
      classId,
      surahNumber,
      surahName,
      ayahFrom: ayahFrom ?? 1,
      ayahTo: ayahTo ?? 1,
      memorized: memorized ?? false,
      quality: quality ?? null,
      notes: notes ?? null,
    },
    include: { student: { select: { id: true, email: true, username: true, displayName: true } } },
  });

  return NextResponse.json({ entry }, { status: 201 });
}
