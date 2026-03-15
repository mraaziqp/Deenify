import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function getUser(req: NextRequest): Promise<{ id: string; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const questions = await prisma.question.findMany({
    where: { isAnswered: false },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ questions });
}

export async function POST(req: NextRequest) {
  const { questionId, answer } = await req.json();
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Write answer and mark question as answered
  await prisma.answer.create({
    data: {
      questionId,
      scholarId: user.id,
      content: answer,
    },
  });
  await prisma.question.update({
    where: { id: questionId },
    data: { isAnswered: true },
  });
  return NextResponse.json({ success: true });
}
