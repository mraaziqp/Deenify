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

// GET /api/madresah/[madresahId]/classes/[classId]/attendance
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

  const attendance = await prisma.attendance.findMany({
    where: isTeacher ? { classId } : { classId, studentId: userId },
    include: { student: { select: { id: true, email: true, username: true, displayName: true } } },
    orderBy: { date: 'desc' },
  });

  return NextResponse.json({ attendance });
}

// POST /api/madresah/[madresahId]/classes/[classId]/attendance — mark attendance (teacher)
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
    return NextResponse.json({ error: 'Only teachers can mark attendance' }, { status: 403 });
  }

  // Expects array: [{ studentId, present, notes }] or single record
  const body = await req.json();
  const records = Array.isArray(body) ? body : [body];

  const date = new Date();
  date.setHours(0, 0, 0, 0);

  const created = await Promise.all(
    records.map(({ studentId, present, notes }: { studentId: string; present: boolean; notes?: string }) =>
      prisma.attendance.upsert({
        where: { classId_studentId_date: { classId, studentId, date } },
        update: { present, notes },
        create: { classId, studentId, date, present, notes },
        include: { student: { select: { id: true, email: true, username: true, displayName: true } } },
      })
    )
  );

  return NextResponse.json({ attendance: created }, { status: 201 });
}
