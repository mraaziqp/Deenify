import React, { useState } from 'react';

export default function PDFBookUploadForm() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successUrl, setSuccessUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    setSuccessUrl('');
    if (!pdfFile) {
      setError('Please select a PDF file.');
      setUploading(false);
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('description', description);
    formData.append('pdf', pdfFile);
    try {
      const res = await fetch('/api/pdf-upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSuccessUrl(data.pdfUrl);
        setTitle('');
        setAuthor('');
        setDescription('');
        setPdfFile(null);
      } else {
        setError(data.error || 'Upload failed.');
      }
    } catch (err) {
      setError('Upload failed.');
    }
    setUploading(false);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="font-semibold">Book Title</label>
          <input type="text" className="border rounded px-3 py-2 w-full" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Al Mufeedah" required />
        </div>
        <div className="space-y-2">
          <label className="font-semibold">Author</label>
          <input type="text" className="border rounded px-3 py-2 w-full" value={author} onChange={e => setAuthor(e.target.value)} placeholder="e.g. Imam Al-Ghazali" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="font-semibold">Upload PDF</label>
        <input type="file" accept="application/pdf" className="border rounded px-3 py-2 w-full" onChange={e => setPdfFile(e.target.files?.[0] || null)} required />
      </div>
      <div className="space-y-2">
        <label className="font-semibold">Description (optional)</label>
        <textarea className="border rounded px-3 py-2 w-full" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description about the book"></textarea>
      </div>
      <button type="submit" className="bg-primary text-white px-6 py-2 rounded font-semibold hover:bg-primary/90 transition" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Book'}
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {successUrl && (
        <div className="text-green-600 mt-2">
          Upload successful! <a href={successUrl} target="_blank" rel="noopener" className="underline">View PDF</a>
        </div>
      )}
    </form>
  );
}
