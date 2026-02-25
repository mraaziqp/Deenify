import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { chapterId: string } }) {
  const chapter = await prisma.awradChapter.findUnique({
    where: { id: params.chapterId },
    include: { lines: { orderBy: { order: 'asc' } } },
  });
  if (!chapter) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(chapter);
}
