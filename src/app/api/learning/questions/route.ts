import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { askAboutIslam } from '@/ai/flows/ask-about-islam';

type QuestionPayload = {
  question: string;
  userId?: string;
  userName?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('all') === 'true';
    const mineOnly = searchParams.get('mine') === 'true';
    const userId = searchParams.get('userId');

    if (mineOnly && !userId) {
      return NextResponse.json({ error: 'userId is required for mine=true.' }, { status: 400 });
    }

    const questions = await prisma.learningQuestion.findMany({
      where: includeAll
        ? undefined
        : mineOnly
          ? { userId }
          : { status: 'approved' },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Failed to load questions:', error);
    return NextResponse.json({ error: 'Unable to load questions.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuestionPayload;
    if (!body.question || !body.question.trim()) {
      return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
    }

    const userId = body.userId?.trim() || 'anonymous';
    const userName = body.userName?.trim() || 'Anonymous';

    let aiAnswer: string | undefined;
    try {
      const result = await askAboutIslam({ question: body.question.trim() });
      aiAnswer = result.answer;
    } catch (error) {
      console.error('AI answer failed:', error);
    }

    const question = await prisma.learningQuestion.create({
      data: {
        question: body.question.trim(),
        userId,
        userName,
        aiAnswer: aiAnswer || null,
        status: aiAnswer ? 'draft' : 'pending',
      },
    });

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Failed to create question:', error);
    return NextResponse.json({ error: 'Unable to create question.' }, { status: 500 });
  }
}
