import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const questions = await prisma.question.findMany({
    where: { isAnswered: true },
    orderBy: { createdAt: 'desc' },
    include: {
      answers: {
        include: {
          scholar: true,
        },
      },
    },
  });
  return NextResponse.json({ questions });
}
