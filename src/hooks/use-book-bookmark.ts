import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export function useBookBookmark(bookId: string) {
  const { user } = useAuth();
  const [page, setPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id || !bookId) return;
    setLoading(true);
    fetch(`/api/bookmark?bookId=${bookId}`)
      .then(res => res.json())
      .then(data => {
        setPage(data.bookmark?.page ?? null);
        setLoading(false);
      });
  }, [user, bookId]);

  const saveBookmark = async (newPage: number) => {
    if (!user?.id) return;
    setLoading(true);
    await fetch('/api/bookmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, page: newPage }),
    });
    setPage(newPage);
    setLoading(false);
  };

  return { page, saveBookmark, loading };
}
