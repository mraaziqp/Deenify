
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const BOOKS_DIR = path.join(process.cwd(), 'public', 'books');
const BOOKS_JSON = path.join(process.cwd(), 'src', 'data', 'books.json');

function readBooks(): Record<string, unknown>[] {
  try { return JSON.parse(readFileSync(BOOKS_JSON, 'utf-8')); }
  catch { return []; }
}
function writeBooks(books: Record<string, unknown>[]) {
  writeFileSync(BOOKS_JSON, JSON.stringify(books, null, 2), 'utf-8');
}
function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60);
}

// POST /api/pdf-upload
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') ?? formData.get('pdf');
    const title = ((formData.get('title') as string) ?? '').trim();
    const author = ((formData.get('author') as string) ?? '').trim();
    const description = ((formData.get('description') as string) ?? '').trim();
    const category = ((formData.get('category') as string) ?? 'General').trim();

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!existsSync(BOOKS_DIR)) await mkdir(BOOKS_DIR, { recursive: true });

    const timestamp = Date.now();
    const filename = `${slugify(title) || 'book'}-${timestamp}.pdf`;
    const buffer = Buffer.from(await (file as File).arrayBuffer());
    await writeFile(path.join(BOOKS_DIR, filename), buffer);

    const publicUrl = `/books/${filename}`;
    const id = `upload-${timestamp}`;

    const books = readBooks();
    books.unshift({ id, title, author: author || 'Unknown', description, category, url: publicUrl, type: 'uploaded' });
    writeBooks(books);

    return NextResponse.json({ success: true, url: publicUrl, id, pdfUrl: publicUrl });
  } catch (err: unknown) {
    console.error('PDF upload error:', err);
    return NextResponse.json({ error: 'Upload failed: ' + (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}

// DELETE /api/pdf-upload?id=<id>
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const books = readBooks();
  const book = books.find((b) => b.id === id) as Record<string, unknown> | undefined;
  if (book?.url && typeof book.url === 'string' && book.url.startsWith('/books/')) {
    const fp = path.join(process.cwd(), 'public', book.url);
    try { if (existsSync(fp)) { const { unlink } = await import('fs/promises'); await unlink(fp); } } catch {}
  }
  writeBooks(books.filter((b) => b.id !== id));
  return NextResponse.json({ success: true });
}
