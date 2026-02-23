import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('pdf');
  const title = formData.get('title');
  const author = formData.get('author');
  const description = formData.get('description');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No PDF file uploaded.' }, { status: 400 });
  }

  // Save PDF to public/books directory
  const buffer = Buffer.from(await file.arrayBuffer());
  const booksDir = path.join(process.cwd(), 'public', 'books');
  await fs.mkdir(booksDir, { recursive: true });
  const fileName = `${Date.now()}_${title || 'book'}.pdf`.replace(/\s+/g, '_');
  const filePath = path.join(booksDir, fileName);
  await fs.writeFile(filePath, buffer);

  // Optionally, save metadata to a JSON file
  const metaPath = path.join(booksDir, `${fileName}.json`);
  await fs.writeFile(metaPath, JSON.stringify({
    title,
    author,
    description,
    pdfUrl: `/books/${fileName}`,
    uploadedAt: new Date().toISOString(),
  }, null, 2));

  return NextResponse.json({ success: true, pdfUrl: `/books/${fileName}` });
}
