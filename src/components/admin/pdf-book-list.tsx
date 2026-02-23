import React, { useEffect, useState } from 'react';

export default function PDFBookList() {
  const [books, setBooks] = useState<any[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [error, setError] = useState('');
  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch('/books');
        const html = await res.text();
        const matches = Array.from(html.matchAll(/href="([^"]+\.pdf)"/g));
        const pdfFiles = matches.map(m => m[1]);
        const bookData = await Promise.all(pdfFiles.map(async (pdfUrl) => {
          const metaUrl = pdfUrl + '.json';
          try {
            const metaRes = await fetch(metaUrl);
            if (!metaRes.ok) return null;
            const meta = await metaRes.json();
            meta._pdfUrl = pdfUrl;
            meta._metaUrl = metaUrl;
            return meta;
          } catch {
            return null;
          }
        }));
        setBooks(bookData.filter(Boolean));
      } catch {
        setBooks([]);
      }
    }
    fetchBooks();
  }, []);
  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditData({ ...books[idx] });
    setError('');
  };
  const handleEditChange = (field: string, value: string) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleSave = async (idx: number) => {
    try {
      const res = await fetch(books[idx]._metaUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error('Failed to save');
      setEditingIdx(null);
      setBooks((prev) => prev.map((b, i) => (i === idx ? { ...editData, _pdfUrl: b._pdfUrl, _metaUrl: b._metaUrl } : b)));
    } catch {
      setError('Failed to save changes.');
    }
  };
  const handleDelete = async (idx: number) => {
    try {
      await fetch(books[idx]._pdfUrl, { method: 'DELETE' });
      await fetch(books[idx]._metaUrl, { method: 'DELETE' });
      setBooks((prev) => prev.filter((_, i) => i !== idx));
    } catch {
      setError('Failed to delete book.');
    }
  };
  if (books.length === 0) {
    return <div className="text-muted-foreground text-sm">No uploaded books found.</div>;
  }
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg mb-2">Uploaded Books</h3>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {books.map((book, idx) => (
        <div key={idx} className="border rounded-lg p-4 mb-2 bg-muted/10">
          {editingIdx === idx ? (
            <div className="space-y-2">
              <input className="border rounded px-2 py-1 w-full mb-1" value={editData.title} onChange={e => handleEditChange('title', e.target.value)} />
              <input className="border rounded px-2 py-1 w-full mb-1" value={editData.author} onChange={e => handleEditChange('author', e.target.value)} />
              <textarea className="border rounded px-2 py-1 w-full mb-1" rows={2} value={editData.description} onChange={e => handleEditChange('description', e.target.value)} />
              <div className="flex gap-2">
                <button className="bg-primary text-white px-4 py-1 rounded font-semibold" onClick={() => handleSave(idx)}>Save</button>
                <button className="bg-muted px-4 py-1 rounded font-semibold" onClick={() => setEditingIdx(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-base">{book.title}</span>
                {book.author && <span className="text-xs text-muted-foreground">by {book.author}</span>}
              </div>
              <div className="mb-2 text-sm text-muted-foreground">{book.description}</div>
              <a href={book.pdfUrl} target="_blank" rel="noopener" className="underline text-primary font-semibold">View PDF</a>
              <div className="text-xs text-muted-foreground mt-1">Uploaded: {new Date(book.uploadedAt).toLocaleString()}</div>
              <div className="flex gap-2 mt-2">
                <button className="bg-primary text-white px-3 py-1 rounded font-semibold" onClick={() => handleEdit(idx)}>Edit</button>
                <button className="bg-red-600 text-white px-3 py-1 rounded font-semibold" onClick={() => handleDelete(idx)}>Delete</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
