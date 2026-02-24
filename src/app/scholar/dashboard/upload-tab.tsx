"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
export default function ScholarUploadTab() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [desc, setDesc] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setError('');
    setSuccess('');
    // TODO: Replace with actual upload logic (API endpoint)
    setTimeout(() => {
      setUploading(false);
      setSuccess('Upload successful!');
    }, 1200);
  }

  return (
    <form onSubmit={handleUpload} className="bg-white rounded-lg shadow-lg p-6 flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-emerald-600 mb-2">Upload PDF Book or Coursework</h2>
      <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <Input placeholder="Author (Your Name)" value={author} onChange={e => setAuthor(e.target.value)} required />
      <Textarea placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} />
      <Input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} required />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload PDF'}
      </Button>
    </form>
  );
}
