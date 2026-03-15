import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
  } catch {
    return null;
  }
}

// GET: /api/bookmark?bookId=xxx
export async function GET(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const bookId = req.nextUrl.searchParams.get('bookId');
  if (!bookId) return NextResponse.json({ error: 'Missing bookId' }, { status: 400 });
  const bookmark = await prisma.bookmark.findFirst({
    where: { userId: user.id, bookId },
  });
  return NextResponse.json({ bookmark });
}

// POST: /api/bookmark
export async function POST(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { bookId, page } = await req.json();
  if (!bookId || typeof page !== 'number') return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  const existing = await prisma.bookmark.findFirst({ where: { userId: user.id, bookId } });
  const bookmark = existing
    ? await prisma.bookmark.update({ where: { id: existing.id }, data: { pageNumber: page } })
    : await prisma.bookmark.create({ data: { userId: user.id, bookId, pageNumber: page } });
  return NextResponse.json({ bookmark });
}
