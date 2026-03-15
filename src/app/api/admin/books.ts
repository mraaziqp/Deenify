import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function getAdminUser(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    return decoded.role === 'ADMIN' ? decoded : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser(req);
  if (!admin) {
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
