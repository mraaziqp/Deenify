"use client";
"use client";
"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartHandshake } from 'lucide-react';

interface AwradBook {
  id: string;
  title: string;
  author: string;
  coverImageUrl?: string;
  chapters: { id: string; title: string; order: number }[];
}

export default function AwradBooksPage() {
  const [books, setBooks] = useState<AwradBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/awrad')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load books');
        return res.json();
      })
      .then(setBooks)
      .catch(e => setError(e.message || 'Unable to load books'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <HeartHandshake className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Awrad & Mawlid Library</h1>
          <p className="text-muted-foreground">Browse spiritual texts and litanies</p>
        </div>
      </div>
      {loading && <Card><CardContent className="p-6">Loading…</CardContent></Card>}
      {error && <Card><CardContent className="p-6 text-destructive">{error}</CardContent></Card>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {books.map(book => (
          <Card key={book.id} className="hover:shadow-lg hover:scale-105 transition-all">
            <CardHeader>
              <CardTitle>{book.title}</CardTitle>
              <div className="text-muted-foreground text-sm mb-2">{book.author}</div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {book.chapters.map(chap => (
                  <Link key={chap.id} href={`/awrad/read/${chap.id}`} className="block rounded bg-primary/10 hover:bg-primary/20 px-4 py-2 font-semibold text-primary transition-all">
                    {chap.title}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
