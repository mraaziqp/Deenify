import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// GET /api/pdf-book-list
// Returns books from books.json + any PDF files in public/books/ not already listed
export async function GET() {
  // Load static/uploaded books from JSON
  let books: Record<string, unknown>[] = [];
  try {
    const booksPath = path.join(process.cwd(), 'src', 'data', 'books.json');
    const raw = fs.readFileSync(booksPath, 'utf-8');
    books = JSON.parse(raw);
  } catch {
    books = [];
  }

  // Also scan public/books/ for any PDF files not yet in books.json
  try {
    const booksDir = path.join(process.cwd(), 'public', 'books');
    if (fs.existsSync(booksDir)) {
      const knownUrls = new Set(books.map((b) => b.url as string));
      const files = fs.readdirSync(booksDir).filter((f) => f.endsWith('.pdf'));
      for (const file of files) {
        const url = `/books/${file}`;
        if (!knownUrls.has(url)) {
          books.push({
            id: `scanned-${file}`,
            title: file.replace('.pdf', '').replace(/-/g, ' '),
            author: 'Unknown',
            description: '',
            category: 'Uploaded',
            url,
            type: 'uploaded',
          });
        }
      }
    }
  } catch { /* ignore scanning errors */ }

  return NextResponse.json(books);
}
