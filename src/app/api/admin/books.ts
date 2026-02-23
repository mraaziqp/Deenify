import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { title, author, category, coverImageUrl, pdfFileUrl } = await req.json();
  if (!title || !author || !category || !coverImageUrl || !pdfFileUrl) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const book = await prisma.book.create({
    data: { title, author, category, coverImageUrl, pdfFileUrl },
  });
  return NextResponse.json(book);
}
