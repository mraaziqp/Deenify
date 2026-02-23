
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('pdf');
  const title = formData.get('title');
  const author = formData.get('author');
  const description = formData.get('description');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No PDF file uploaded.' }, { status: 400 });
  }

  // Save PDF to Neon (Postgres)
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}_${title || 'book'}.pdf`.replace(/\s+/g, '_');
  const book = await prisma.pDFBook.create({
    data: {
      title: title as string,
      author: author as string,
      description: description as string,
      pdfData: buffer,
      filename: fileName,
    },
  });
  return NextResponse.json({ success: true, id: book.id });
}
