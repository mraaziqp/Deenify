import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/pdf-book-list
export async function GET() {
  const books = await prisma.pDFBook.findMany({
    orderBy: { uploadedAt: 'desc' },
    select: {
      id: true,
      title: true,
      author: true,
      description: true,
      filename: true,
      uploadedAt: true,
    },
  });
  return NextResponse.json(books);
}
