import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// Helper to get user from session cookie (replace with your actual logic)
async function getUserFromCookie() {
  const cookie = cookies();
  // Example: parse user from a JWT or session cookie
  // Replace this with your actual user extraction logic
  const userId = cookie.get('userId')?.value;
  if (!userId) return null;
  return { id: userId };
}

// GET: /api/bookmark?bookId=xxx
export async function GET(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const bookId = req.nextUrl.searchParams.get('bookId');
  if (!bookId) return NextResponse.json({ error: 'Missing bookId' }, { status: 400 });
  const bookmark = await prisma.bookBookmark.findUnique({
    where: { userId_bookId: { userId: user.id, bookId } },
  });
  return NextResponse.json({ bookmark });
}

// POST: /api/bookmark
export async function POST(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { bookId, page } = await req.json();
  if (!bookId || typeof page !== 'number') return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  const bookmark = await prisma.bookBookmark.upsert({
    where: { userId_bookId: { userId: user.id, bookId } },
    update: { page },
    create: { userId: user.id, bookId, page },
  });
  return NextResponse.json({ bookmark });
}
