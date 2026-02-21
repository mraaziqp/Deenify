import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-context';

// GET: /api/bookmark?bookId=xxx
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const bookId = req.nextUrl.searchParams.get('bookId');
  if (!bookId) return NextResponse.json({ error: 'Missing bookId' }, { status: 400 });
  const bookmark = await prisma.bookBookmark.findUnique({
    where: { userId_bookId: { userId: session.user.id, bookId } },
  });
  return NextResponse.json({ bookmark });
}

// POST: /api/bookmark
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { bookId, page } = await req.json();
  if (!bookId || typeof page !== 'number') return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  const bookmark = await prisma.bookBookmark.upsert({
    where: { userId_bookId: { userId: session.user.id, bookId } },
    update: { page },
    create: { userId: session.user.id, bookId, page },
  });
  return NextResponse.json({ bookmark });
}
