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

// POST /api/madresah/[madresahId]/classes/[classId]/homework/[hwId]/submit
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ madresahId: string; classId: string; hwId: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { madresahId, hwId } = await params;

  const member = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId } },
  });
  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  const { content } = await req.json();

  const hw = await prisma.homework.findUnique({ where: { id: hwId } });
  if (!hw) return NextResponse.json({ error: 'Homework not found' }, { status: 404 });

  const isLate = new Date() > hw.dueDate;

  const existing = await prisma.homeworkSubmission.findUnique({
    where: { homeworkId_studentId: { homeworkId: hwId, studentId: userId } },
  });

  if (existing) {
    const updated = await prisma.homeworkSubmission.update({
      where: { id: existing.id },
      data: { content, status: isLate ? 'LATE' : 'SUBMITTED', submittedAt: new Date() },
    });
    return NextResponse.json({ submission: updated });
  }

  const submission = await prisma.homeworkSubmission.create({
    data: {
      homeworkId: hwId,
      studentId: userId,
      content,
      status: isLate ? 'LATE' : 'SUBMITTED',
    },
  });

  return NextResponse.json({ submission }, { status: 201 });
}
