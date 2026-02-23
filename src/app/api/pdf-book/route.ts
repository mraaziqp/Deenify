import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/pdf-book?id=BOOK_ID
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url!);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const book = await prisma.pDFBook.findUnique({ where: { id } });
  if (!book) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return new NextResponse(book.pdfData, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${book.filename}"`,
    },
  });
}

// PUT /api/pdf-book?id=BOOK_ID
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url!);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const data = await req.json();
  const updated = await prisma.pDFBook.update({
    where: { id },
    data: {
      title: data.title,
      author: data.author,
      description: data.description,
    },
  });
  return NextResponse.json({ success: true, book: updated });
}

// DELETE /api/pdf-book?id=BOOK_ID
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url!);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  await prisma.pDFBook.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
