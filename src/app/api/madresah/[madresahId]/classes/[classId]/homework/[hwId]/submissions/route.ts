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

// GET /api/madresah/[madresahId]/classes/[classId]/homework/[hwId]/submissions — teacher views all submissions
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ madresahId: string; classId: string; hwId: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { madresahId, hwId } = await params;

  const member = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId } },
  });
  if (!member || !['PRINCIPAL', 'TEACHER'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const submissions = await prisma.homeworkSubmission.findMany({
    where: { homeworkId: hwId },
    include: { student: { select: { id: true, email: true, username: true, displayName: true } } },
    orderBy: { submittedAt: 'asc' },
  });

  return NextResponse.json({ submissions });
}

// POST /api/madresah/[madresahId]/classes/[classId]/homework/[hwId]/submissions — grade a submission
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
  if (!member || !['PRINCIPAL', 'TEACHER'].includes(member.role)) {
    return NextResponse.json({ error: 'Only teachers can grade submissions' }, { status: 403 });
  }

  const { submissionId, grade, feedback } = await req.json();
  if (!submissionId) return NextResponse.json({ error: 'submissionId required' }, { status: 400 });

  const graded = await prisma.homeworkSubmission.update({
    where: { id: submissionId },
    data: { grade, feedback, status: 'GRADED' },
    include: { student: { select: { id: true, email: true, username: true, displayName: true } } },
  });

  return NextResponse.json({ submission: graded });
}
