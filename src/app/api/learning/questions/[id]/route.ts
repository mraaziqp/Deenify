import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type QuestionUpdatePayload = {
  approvedAnswer?: string;
  status?: 'pending' | 'draft' | 'approved';
};

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const body = (await request.json()) as QuestionUpdatePayload;

    const question = await prisma.learningQuestion.update({
      where: { id },
      data: {
        approvedAnswer: body.approvedAnswer ?? null,
        status: body.status,
      },
    });

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Failed to update question:', error);
    return NextResponse.json({ error: 'Unable to update question.' }, { status: 500 });
  }
}
