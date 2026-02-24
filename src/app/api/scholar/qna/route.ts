import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
  const questions = await prisma.question.findMany({
    where: { isAnswered: false },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ questions });
}

export async function POST(req: Request) {
  const { questionId, answer } = await req.json();
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Write answer and mark question as answered
  await prisma.answer.create({
    data: {
      questionId,
      scholarId: session.user.id,
      content: answer,
    },
  });
  await prisma.question.update({
    where: { id: questionId },
    data: { isAnswered: true },
  });
  return NextResponse.json({ success: true });
}
