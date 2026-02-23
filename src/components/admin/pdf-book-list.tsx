import React, { useEffect, useState } from 'react';

export default function PDFBookList() {
  const [books, setBooks] = useState<any[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [error, setError] = useState('');
  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch('/api/pdf-book-list');
        const data = await res.json();
        setBooks(data);
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
      const id = books[idx].id;
      const res = await fetch(`/api/pdf-book?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error('Failed to save');
      const data = await res.json();
      setEditingIdx(null);
      setBooks((prev) => prev.map((b, i) => (i === idx ? data.book : b)));
    } catch {
      setError('Failed to save changes.');
    }
  };
  const handleDelete = async (idx: number) => {
    try {
      const id = books[idx].id;
      const res = await fetch(`/api/pdf-book?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setBooks((prev) => prev.filter((_, i) => i !== idx));
    } catch {
      setError('Failed to delete book.');
    }
  };
  // Editing and deleting not implemented for Neon storage
  // You can add edit/delete endpoints if needed
  if (books.length === 0) {
    return <div className="text-muted-foreground text-sm">No uploaded books found.</div>;
  }
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg mb-2">Uploaded Books</h3>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {books.map((book, idx) => (
        <div key={book.id} className="mb-4 p-4 border rounded-lg">
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
              <div className="font-semibold">{book.title}</div>
              <div className="text-xs text-muted-foreground mb-2">{book.author}</div>
              <div className="mb-2 text-sm text-muted-foreground">{book.description}</div>
              <a href={`/api/pdf-book?id=${book.id}`} target="_blank" rel="noopener" className="underline text-primary font-semibold">View PDF</a>
              <div className="text-xs text-muted-foreground mt-1">Uploaded: {new Date(book.uploadedAt).toLocaleString()}</div>
              <button className="bg-primary text-white px-3 py-1 rounded font-semibold mt-2 mr-2" onClick={() => handleEdit(idx)}>Edit</button>
              <button className="bg-red-600 text-white px-3 py-1 rounded font-semibold mt-2" onClick={() => handleDelete(idx)}>Delete</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
