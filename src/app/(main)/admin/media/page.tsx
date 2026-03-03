'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';

type UploadResult = {
  success?: boolean;
  url?: string;
  filename?: string;
  message?: string;
  error?: string;
};

const PRESET_UPLOADS = [
  {
    label: 'Surah Yaaseen PDF',
    name: 'surah-yaseen',
    type: 'pdf',
    description: 'Used in the /yaseen in-app reader',
    accept: '.pdf',
    hint: 'Saves to: /public/books/surah-yaseen.pdf',
  },
  {
    label: 'Surah Baqarah PDF',
    name: 'surah-baqarah',
    type: 'pdf',
    description: 'PDF version of Surah Baqarah',
    accept: '.pdf',
    hint: 'Saves to: /public/books/surah-baqarah.pdf',
  },
  {
    label: 'Surah Yaaseen Audio',
    name: 'surah-yaseen',
    type: 'audio',
    description: 'MP3 audio for Surah Yaaseen (in-app player)',
    accept: '.mp3,.ogg,.m4a',
    hint: 'Saves to: /public/audio/surah-yaseen.mp3',
  },
  {
    label: 'Surah Baqarah Audio',
    name: 'surah-baqarah',
    type: 'audio',
    description: 'MP3 audio for Surah Baqarah (in-app player)',
    accept: '.mp3,.ogg,.m4a',
    hint: 'Saves to: /public/audio/surah-baqarah.mp3',
  },
];

function UploadSlot({ preset }: { preset: typeof PRESET_UPLOADS[0] }) {
  const [result, setResult] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doUpload = async (file: File) => {
    setLoading(true);
    setResult(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', preset.type);
    fd.append('name', preset.name);
    try {
      const res = await fetch('/api/media-upload', { method: 'POST', body: fd });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: 'Upload failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    void doUpload(file);
  };

  const typeIcon = preset.type === 'audio' ? '🎵' : '📄';
  const typeColor = preset.type === 'audio' ? 'blue' : 'teal';

  return (
    <div
      className={`relative bg-white rounded-2xl border-2 transition-all overflow-hidden ${
        dragOver
          ? `border-${typeColor}-400 bg-${typeColor}-50`
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
      }}
    >
      <div className={`h-1.5 ${preset.type === 'audio' ? 'bg-blue-400' : 'bg-teal-500'}`} />
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
            preset.type === 'audio' ? 'bg-blue-100' : 'bg-teal-100'
          }`}>
            {typeIcon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{preset.label}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{preset.description}</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-3 font-mono bg-gray-50 rounded px-2 py-1">
          {preset.hint}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={preset.accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            loading
              ? 'bg-gray-100 text-gray-400'
              : preset.type === 'audio'
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
          }`}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              ⬆️ {dragOver ? 'Drop to Upload' : 'Click or Drag & Drop'}
            </>
          )}
        </button>

        {result && (
          <div className={`mt-3 p-3 rounded-xl text-xs ${
            result.success
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {result.success ? (
              <>
                <p className="font-semibold">✅ Uploaded successfully!</p>
                <p className="mt-0.5">Available at: <code className="font-mono">{result.url}</code></p>
              </>
            ) : (
              <p>❌ {result.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MediaUploadPage() {
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customType, setCustomType] = useState<'pdf' | 'audio'>('pdf');
  const [customName, setCustomName] = useState('');
  const [customResult, setCustomResult] = useState<UploadResult | null>(null);
  const [customLoading, setCustomLoading] = useState(false);

  const handleCustomUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFile) return;
    setCustomLoading(true);
    setCustomResult(null);
    const fd = new FormData();
    fd.append('file', customFile);
    fd.append('type', customType);
    if (customName) fd.append('name', customName);
    try {
      const res = await fetch('/api/media-upload', { method: 'POST', body: fd });
      const data = await res.json();
      setCustomResult(data);
    } catch {
      setCustomResult({ error: 'Upload failed. Please try again.' });
    } finally {
      setCustomLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard" className="text-sm text-teal-600 hover:underline">← Dashboard</Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">📁 Media Upload Manager</h1>
          <p className="text-gray-500 mt-1">
            Upload PDFs and audio files for Surah Yaaseen, Surah Baqarah, and other content.
            Files are saved to the <code className="bg-gray-100 px-1 rounded">public/</code> folder and become immediately accessible.
          </p>
        </div>

        {/* Quick Setup Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-sm text-amber-800">
          <p className="font-semibold mb-1">🚀 Getting Started</p>
          <ol className="list-decimal ml-4 space-y-0.5 text-amber-700">
            <li>Upload your Surah Yaaseen PDF → the in-app reader at <code>/yaseen</code> will use it automatically</li>
            <li>Upload Surah Baqarah PDF → accessible at <code>/books/surah-baqarah.pdf</code></li>
            <li>Upload audio files → play them in the app using the audio player</li>
            <li>Files are served directly from the Next.js <code>public/</code> folder — no database needed</li>
          </ol>
        </div>

        {/* Preset upload slots */}
        <h2 className="text-lg font-bold text-gray-700 mb-4">📌 Preset Upload Slots</h2>
        <div className="grid gap-4 md:grid-cols-2 mb-10">
          {PRESET_UPLOADS.map((preset) => (
            <UploadSlot key={`${preset.type}-${preset.name}`} preset={preset} />
          ))}
        </div>

        {/* Custom upload */}
        <h2 className="text-lg font-bold text-gray-700 mb-4">📂 Custom Upload</h2>
        <form onSubmit={handleCustomUpload} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as 'pdf' | 'audio')}
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="pdf">PDF (saves to /books/)</option>
                <option value="audio">Audio MP3 (saves to /audio/)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filename (optional)</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. surah-al-kahf"
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
            <input
              type="file"
              accept={customType === 'audio' ? '.mp3,.ogg,.m4a,.wav' : '.pdf'}
              onChange={(e) => setCustomFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-teal-600 file:text-white file:text-sm file:font-medium hover:file:bg-teal-700"
            />
          </div>
          <button
            type="submit"
            disabled={!customFile || customLoading}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {customLoading ? 'Uploading...' : '⬆️ Upload File'}
          </button>
          {customResult && (
            <div className={`p-3 rounded-xl text-sm ${
              customResult.success
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {customResult.success ? (
                <p>✅ {customResult.message} → <code>{customResult.url}</code></p>
              ) : (
                <p>❌ {customResult.error}</p>
              )}
            </div>
          )}
        </form>

        {/* Usage guide */}
        <div className="mt-10 bg-teal-50 border border-teal-200 rounded-2xl p-5">
          <h3 className="font-semibold text-teal-800 mb-2">📖 How to Use Uploaded Files</h3>
          <div className="text-sm text-teal-700 space-y-1">
            <p><strong>Surah Yaaseen PDF:</strong> Uploading &quot;surah-yaseen.pdf&quot; makes it immediately available at the <Link href="/yaseen" className="underline">/yaseen</Link> reader page.</p>
            <p><strong>Audio files:</strong> After uploading, use the URL <code className="bg-teal-100 px-1 rounded">/audio/filename.mp3</code> in any audio player component.</p>
            <p><strong>Custom PDFs:</strong> After uploading, use the URL <code className="bg-teal-100 px-1 rounded">/books/filename.pdf</code> in the PDF reader component.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
