import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const books = await prisma.awradBook.findMany({
    include: {
      chapters: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { title: 'asc' },
  });
  return NextResponse.json(books);
}
