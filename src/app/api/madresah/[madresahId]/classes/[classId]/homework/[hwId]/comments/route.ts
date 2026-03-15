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

// GET /api/madresah/[madresahId]/classes/[classId]/homework/[hwId]/comments
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
  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  const comments = await prisma.homeworkComment.findMany({
    where: { homeworkId: hwId },
    include: {
      user: { select: { id: true, email: true, username: true, displayName: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ comments });
}

// POST /api/madresah/[madresahId]/classes/[classId]/homework/[hwId]/comments
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
  if (!content?.trim()) return NextResponse.json({ error: 'content is required' }, { status: 400 });

  const isTeacher = ['PRINCIPAL', 'TEACHER'].includes(member.role);

  const comment = await prisma.homeworkComment.create({
    data: {
      homeworkId: hwId,
      userId,
      content: content.trim(),
      isTeacher,
    },
    include: {
      user: { select: { id: true, email: true, username: true, displayName: true } },
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
