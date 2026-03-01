'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, FileText, CheckCircle2, AlertCircle, Upload } from 'lucide-react';

const CATEGORIES = ['Quran', 'Hadith', 'Seerah', 'Fiqh', 'Tafsir', 'Spirituality', 'Character', 'Dua & Dhikr', 'General'];

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  url: string;
  type: string;
}

export default function PDFBookUploadForm() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);

  useEffect(() => { fetchBooks(); }, []);

  async function fetchBooks() {
    setLoadingBooks(true);
    try {
      const res = await fetch('/api/pdf-book-list');
      const data = await res.json();
      // Only show uploaded books here (not archive.org static books)
      setBooks(Array.isArray(data) ? data.filter((b: Book) => b.type === 'uploaded' || b.type === 'db') : []);
    } catch { setBooks([]); }
    setLoadingBooks(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) { setError('Please select a PDF file.'); return; }
    if (!title.trim()) { setError('Title is required.'); return; }
    setUploading(true);
    setError('');
    setSuccess('');
    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('title', title);
    formData.append('author', author);
    formData.append('description', description);
    formData.append('category', category);
    try {
      const res = await fetch('/api/pdf-upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Uploaded! Available at ${data.url}`);
        setTitle(''); setAuthor(''); setDescription(''); setCategory('General'); setPdfFile(null);
        const inp = document.getElementById('pdf-file-input') as HTMLInputElement;
        if (inp) inp.value = '';
        fetchBooks();
      } else {
        setError(data.error || 'Upload failed.');
      }
    } catch { setError('Upload failed. Check your connection.'); }
    setUploading(false);
  };

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/pdf-upload?id=${id}`, { method: 'DELETE' });
    fetchBooks();
  }

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Book Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Al Mufeedah" required />
          </div>
          <div className="space-y-1">
            <Label>Author</Label>
            <Input value={author} onChange={e => setAuthor(e.target.value)} placeholder="e.g. Imam Al-Ghazali" />
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Description (optional)</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description" />
          </div>
        </div>
        <div className="space-y-1">
          <Label>PDF File *</Label>
          <div className="flex items-center gap-3 p-4 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors">
            <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              id="pdf-file-input"
              type="file"
              accept="application/pdf"
              onChange={e => setPdfFile(e.target.files?.[0] || null)}
              className="flex-1 text-sm"
            />
            {pdfFile && <span className="text-xs text-primary font-medium">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</span>}
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive p-3 bg-destructive/10 rounded">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-sm text-green-700 p-3 bg-green-50 rounded">
            <CheckCircle2 className="h-4 w-4 shrink-0" />{success}
          </div>
        )}
        <Button type="submit" disabled={uploading} className="w-full">
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading…' : 'Upload Book to Library'}
        </Button>
      </form>

      {/* Uploaded books list */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Uploaded Books</h3>
        {loadingBooks && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loadingBooks && books.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">No uploaded books yet.</p>
        )}
        <div className="space-y-2">
          {books.map(book => (
            <div key={book.id} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{book.title}</p>
                <p className="text-xs text-muted-foreground">{book.author} · {book.category}</p>
              </div>
              <a href={book.url} target="_blank" rel="noopener" className="text-xs text-teal-600 underline shrink-0">Open</a>
              {book.id.startsWith('upload-') && (
                <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => handleDelete(book.id, book.title)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
