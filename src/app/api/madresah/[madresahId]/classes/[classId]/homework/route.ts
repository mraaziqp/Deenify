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

// GET /api/madresah/[madresahId]/classes/[classId]/homework
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

  const homework = await prisma.homework.findMany({
    where: { classId },
    include: {
      subject: true,
      submissions: {
        where: { studentId: userId },
        select: { id: true, status: true, grade: true, feedback: true, submittedAt: true, content: true },
      },
      _count: { select: { submissions: true, comments: true } },
    },
    orderBy: { dueDate: 'asc' },
  });

  return NextResponse.json({ homework });
}

// POST /api/madresah/[madresahId]/classes/[classId]/homework — assign homework (teacher)
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
    return NextResponse.json({ error: 'Only teachers can assign homework' }, { status: 403 });
  }

  const { title, description, dueDate, subjectId, attachmentUrl, attachmentName } = await req.json();
  if (!title?.trim() || !description?.trim() || !dueDate) {
    return NextResponse.json({ error: 'title, description, and dueDate are required' }, { status: 400 });
  }

  const hw = await prisma.homework.create({
    data: {
      classId,
      title,
      description,
      dueDate: new Date(dueDate),
      subjectId: subjectId || null,
      attachmentUrl: attachmentUrl?.trim() || null,
      attachmentName: attachmentName?.trim() || null,
    },
    include: { subject: true, _count: { select: { submissions: true } } },
  });

  return NextResponse.json({ homework: hw }, { status: 201 });
}
