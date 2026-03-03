import { writeFileSync } from 'fs';

const content = `'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface BlobFile {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

interface UploadResult {
  success?: boolean;
  url?: string;
  filename?: string;
  message?: string;
  error?: string;
}

const PRESET_UPLOADS = [
  { label: 'Surah Yaseen PDF',    name: 'surah-yaseen',  type: 'pdf'   as const, description: 'Used in the /yaseen in-app PDF reader', accept: '.pdf',           icon: '📄', color: 'teal' },
  { label: 'Surah Baqarah PDF',   name: 'surah-baqarah', type: 'pdf'   as const, description: 'Surah Al-Baqarah PDF',                  accept: '.pdf',           icon: '📄', color: 'teal' },
  { label: 'Surah Yaseen Audio',  name: 'surah-yaseen',  type: 'audio' as const, description: 'MP3 for the Yaseen page audio player',  accept: '.mp3,.ogg,.m4a', icon: '🎵', color: 'blue' },
  { label: 'Surah Baqarah Audio', name: 'surah-baqarah', type: 'audio' as const, description: 'MP3 for Surah Baqarah playback',        accept: '.mp3,.ogg,.m4a', icon: '🎵', color: 'blue' },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return \`\${bytes} B\`;
  if (bytes < 1048576) return \`\${(bytes / 1024).toFixed(1)} KB\`;
  return \`\${(bytes / 1048576).toFixed(1)} MB\`;
}

function UploadSlot({ preset, onUploaded }: { preset: typeof PRESET_UPLOADS[0]; onUploaded: () => void }) {
  const [result, setResult] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doUpload = async (file: File) => {
    setLoading(true); setResult(null); setProgress(10);
    const fd = new FormData();
    fd.append('file', file); fd.append('type', preset.type); fd.append('name', preset.name);
    try {
      setProgress(40);
      const res = await fetch('/api/media-upload', { method: 'POST', body: fd });
      setProgress(90);
      const data = await res.json();
      setResult(data); setProgress(100);
      if (data.success) onUploaded();
    } catch { setResult({ error: 'Upload failed. Please try again.' }); }
    finally { setLoading(false); setTimeout(() => setProgress(0), 1500); }
  };

  const isTeal = preset.color === 'teal';
  return (
    <div
      className={\`relative bg-white rounded-2xl border-2 overflow-hidden transition-all \${dragOver ? (isTeal ? 'border-teal-400 bg-teal-50' : 'border-blue-400 bg-blue-50') : 'border-gray-200 hover:border-gray-300'}\`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) doUpload(f); }}
    >
      <div className={\`h-1.5 \${isTeal ? 'bg-teal-500' : 'bg-blue-500'}\`} />
      {loading && (
        <div className="absolute top-1.5 left-0 right-0 h-1" style={{background:'rgba(0,0,0,0.05)'}}>
          <div className={\`h-full transition-all duration-500 \${isTeal ? 'bg-teal-400' : 'bg-blue-400'}\`} style={{width:\`\${progress}%\`}} />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={\`w-10 h-10 rounded-xl flex items-center justify-center text-xl \${isTeal ? 'bg-teal-100' : 'bg-blue-100'}\`}>{preset.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-sm">{preset.label}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{preset.description}</p>
          </div>
        </div>
        <input ref={inputRef} type="file" accept={preset.accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) doUpload(f); }} />
        <button
          onClick={() => inputRef.current?.click()} disabled={loading}
          className={\`w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 \${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : isTeal ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'}\`}
        >
          {loading ? <><span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Uploading…</> : <>{dragOver ? '📥 Drop to Upload' : \`⬆️ Choose \${preset.type === 'pdf' ? 'PDF' : 'Audio'} File\`}</>}
        </button>
        {result && (
          <div className={\`mt-3 p-3 rounded-xl text-xs \${result.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-700'}\`}>
            {result.success ? (
              <div>
                <p className="font-semibold">✅ Uploaded!</p>
                <div className="flex items-center gap-1 mt-1">
                  <code className="truncate text-[10px] bg-green-100 px-1.5 py-0.5 rounded flex-1">{result.url}</code>
                  <button onClick={() => { if (result.url) navigator.clipboard.writeText(result.url); }} className="px-2 py-0.5 bg-green-200 hover:bg-green-300 rounded text-green-900 whitespace-nowrap">Copy URL</button>
                </div>
              </div>
            ) : <p>❌ {result.error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function FileBrowser({ refreshKey }: { refreshKey: number }) {
  const [blobs, setBlobs] = useState<BlobFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'audio' | 'books'>('all');

  const fetchFiles = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/media-files');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBlobs(data.blobs || []);
    } catch (e: any) { setError(e.message || 'Failed to load files'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles, refreshKey]);

  const handleDelete = async (url: string) => {
    if (!confirm('Delete this file? This cannot be undone.')) return;
    setDeleting(url);
    await fetch('/api/media-files', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
    setDeleting(null); fetchFiles();
  };

  const handleCopy = (url: string) => { navigator.clipboard.writeText(url); setCopied(url); setTimeout(() => setCopied(null), 2000); };

  const filtered = blobs.filter(b => filter === 'all' || b.pathname.startsWith(filter + '/'));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-700">📁 Uploaded Files ({filtered.length})</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl overflow-hidden border border-gray-200 text-xs font-medium">
            {(['all', 'audio', 'books'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={\`px-3 py-1.5 transition-colors \${filter === f ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}\`}>
                {f === 'all' ? 'All' : f === 'audio' ? '🎵 Audio' : '📄 PDFs'}
              </button>
            ))}
          </div>
          <button onClick={fetchFiles} className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">🔄 Refresh</button>
        </div>
      </div>
      {loading && <div className="text-center py-10 text-gray-400 text-sm">Loading files…</div>}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          ❌ {error}
          {error.toLowerCase().includes('token') && <p className="mt-1 text-xs">Add <code>BLOB_READ_WRITE_TOKEN</code> to Vercel environment variables (Storage → Blob).</p>}
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-2xl border border-gray-200">
          <p className="text-3xl mb-2">📭</p><p>No files yet. Use the upload slots above.</p>
        </div>
      )}
      {filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {filtered.map((blob, i) => {
            const isAudio = blob.pathname.startsWith('audio/');
            const isPDF = blob.pathname.endsWith('.pdf');
            return (
              <div key={blob.url} className={\`flex items-center gap-3 px-4 py-3 \${i < filtered.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors\`}>
                <div className={\`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 \${isAudio ? 'bg-blue-100' : 'bg-teal-100'}\`}>
                  {isAudio ? '🎵' : isPDF ? '📄' : '📁'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{blob.pathname.split('/').pop()}</p>
                  <p className="text-xs text-gray-400">{formatBytes(blob.size)} · {new Date(blob.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  {isAudio && <audio controls src={blob.url} className="h-7 rounded-lg" style={{width:'160px',accentColor:'#0d9488'}} />}
                  {isPDF && <a href={blob.url} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 border border-teal-200">👁 View</a>}
                  <button onClick={() => handleCopy(blob.url)} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-200">{copied === blob.url ? '✓ Copied' : '📋 URL'}</button>
                  <button onClick={() => handleDelete(blob.url)} disabled={deleting === blob.url} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200">{deleting === blob.url ? '…' : '🗑️'}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MediaUploadPage() {
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customType, setCustomType] = useState<'pdf' | 'audio'>('pdf');
  const [customName, setCustomName] = useState('');
  const [customResult, setCustomResult] = useState<UploadResult | null>(null);
  const [customLoading, setCustomLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCustomUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFile) return;
    setCustomLoading(true); setCustomResult(null);
    const fd = new FormData();
    fd.append('file', customFile); fd.append('type', customType);
    if (customName) fd.append('name', customName);
    try {
      const res = await fetch('/api/media-upload', { method: 'POST', body: fd });
      const data = await res.json();
      setCustomResult(data);
      if (data.success) setRefreshKey(k => k + 1);
    } catch { setCustomResult({ error: 'Upload failed. Please try again.' }); }
    finally { setCustomLoading(false); }
  };

  return (
    <div className="min-h-screen" style={{background:'#f8fafc'}}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl mb-8" style={{background:'linear-gradient(135deg,#0a4a36 0%,#065f46 50%,#1e5f74 100%)',minHeight:'110px'}}>
          <div className="absolute select-none" style={{top:'10px',right:'16px',color:'rgba(251,191,36,0.2)',fontSize:'3.5rem',lineHeight:1}}>✦</div>
          <div className="relative z-10 px-8 py-6">
            <Link href="/admin" className="text-xs text-emerald-300 hover:text-white transition-colors block mb-2">← Back to Admin</Link>
            <h1 className="text-white font-bold text-2xl">📁 Media Upload Manager</h1>
            <p className="text-emerald-200 text-sm mt-1">Upload PDFs &amp; audio files — stored on Vercel Blob CDN</p>
          </div>
        </div>

        {/* Token warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
          <p className="font-semibold mb-0.5">⚙️ One-time Setup Required</p>
          <p>In Vercel → Storage → Create Blob Store, then add <code className="bg-amber-100 px-1 rounded font-mono">BLOB_READ_WRITE_TOKEN</code> to your environment variables.</p>
        </div>

        {/* Preset slots */}
        <h2 className="text-base font-bold text-gray-700 mb-3">📌 Quick Upload — Common Files</h2>
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {PRESET_UPLOADS.map(p => (
            <UploadSlot key={\`\${p.type}-\${p.name}\`} preset={p} onUploaded={() => setRefreshKey(k => k + 1)} />
          ))}
        </div>

        {/* Custom upload */}
        <h2 className="text-base font-bold text-gray-700 mb-3">📂 Custom Upload</h2>
        <form onSubmit={handleCustomUpload} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">File Type</label>
              <select value={customType} onChange={(e) => setCustomType(e.target.value as 'pdf' | 'audio')} className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50">
                <option value="pdf">📄 PDF (books/)</option>
                <option value="audio">🎵 Audio (audio/)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Filename (optional)</label>
              <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. surah-al-kahf" className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Select File</label>
              <input type="file" accept={customType === 'audio' ? '.mp3,.ogg,.m4a,.wav' : '.pdf'} onChange={(e) => setCustomFile(e.target.files?.[0] || null)} className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-teal-600 file:text-white file:text-xs file:font-medium hover:file:bg-teal-700 cursor-pointer" />
            </div>
          </div>
          <button type="submit" disabled={!customFile || customLoading} className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
            {customLoading ? '⏳ Uploading…' : '⬆️ Upload File'}
          </button>
          {customResult && (
            <div className={\`mt-4 p-3 rounded-xl text-sm \${customResult.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-700'}\`}>
              {customResult.success ? (
                <div>
                  <p className="font-semibold">✅ {customResult.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-green-100 px-2 py-0.5 rounded flex-1 truncate">{customResult.url}</code>
                    <button onClick={() => { if (customResult.url) navigator.clipboard.writeText(customResult.url); }} className="text-xs px-2 py-0.5 bg-green-200 hover:bg-green-300 rounded shrink-0">Copy</button>
                  </div>
                </div>
              ) : <p>❌ {customResult.error}</p>}
            </div>
          )}
        </form>

        {/* File browser */}
        <FileBrowser refreshKey={refreshKey} />
      </div>
    </div>
  );
}
`;

writeFileSync('src/app/(main)/admin/media/page.tsx', content, 'utf8');
console.log('Written successfully');
