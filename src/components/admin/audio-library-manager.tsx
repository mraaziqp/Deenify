'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  CheckCircle2,
  FileAudio,
  Pencil,
  Play,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

type AudioCategory = 'surah' | 'hadith' | 'dua' | 'lecture' | 'dhikr' | 'nasheed' | 'other';

interface AudioEntry {
  id: string;
  category: AudioCategory;
  title: string;
  reference?: string;      // e.g. "Surah 36 (Yaseen)", "Sahih Bukhari 1:1"
  reciter?: string;        // reciter / speaker name
  audioUrl: string;        // direct URL or streaming URL
  thumbnailUrl?: string;
  durationLabel?: string;  // "03:45"
  notes?: string;
  published: boolean;
  createdAt: string;
}

const CATEGORIES: { value: AudioCategory; label: string; color: string }[] = [
  { value: 'surah', label: 'Quran / Surah', color: 'bg-teal-100 text-teal-800' },
  { value: 'hadith', label: 'Hadith Narration', color: 'bg-blue-100 text-blue-800' },
  { value: 'dua', label: 'Dua / Supplication', color: 'bg-purple-100 text-purple-800' },
  { value: 'lecture', label: 'Lecture / Khutbah', color: 'bg-orange-100 text-orange-800' },
  { value: 'dhikr', label: 'Dhikr / Tasbih', color: 'bg-green-100 text-green-800' },
  { value: 'nasheed', label: 'Nasheed', color: 'bg-pink-100 text-pink-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700' },
];

const SURAH_QUICK_REFS = [
  'Surah 1 (Al-Fatihah)', 'Surah 2 (Al-Baqarah)', 'Surah 3 (Ali Imran)',
  'Surah 18 (Al-Kahf)', 'Surah 36 (Yaseen)', 'Surah 55 (Ar-Rahman)',
  'Surah 56 (Al-Waqi\'ah)', 'Surah 67 (Al-Mulk)', 'Surah 112 (Al-Ikhlas)',
  'Surah 113 (Al-Falaq)', 'Surah 114 (An-Nas)',
];

const POPULAR_RECITERS = [
  'Abdul Rahman Al-Sudais', 'Mishary Rashid Al-Afasy', 'Maher Al-Mueaqly',
  'Saud Al-Shuraim', 'Abdul Basit Abdus-Samad', 'Minshawi',
  'Sheikh Ismail Dockrat', 'Sheikh Ebrahim Bham', 'Custom',
];

const empty = (): Partial<AudioEntry> => ({
  category: 'surah',
  title: '',
  reference: '',
  reciter: '',
  audioUrl: '',
  thumbnailUrl: '',
  durationLabel: '',
  notes: '',
  published: true,
});

export function AudioLibraryManager() {
  const [entries, setEntries] = useState<AudioEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<AudioEntry>>(empty());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<AudioCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audio-library');
      if (!res.ok) throw new Error('Failed to load');
      setEntries(await res.json());
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!form.title?.trim() || !form.audioUrl?.trim()) {
      setError('Title and Audio URL are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const res = await fetch(`/api/admin/audio-library?id=${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Update failed');
        setSuccess('Entry updated!');
      } else {
        const res = await fetch('/api/admin/audio-library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Save failed');
        setSuccess('Audio entry added!');
      }
      setForm(empty());
      setEditingId(null);
      fetchEntries();
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this audio entry?')) return;
    await fetch(`/api/admin/audio-library?id=${id}`, { method: 'DELETE' });
    fetchEntries();
  }

  function startEdit(entry: AudioEntry) {
    setForm({ ...entry });
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setForm(empty());
    setEditingId(null);
    setError(null);
  }

  const filtered = entries.filter((e) => {
    const matchCat = filterCat === 'all' || e.category === filterCat;
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.reciter?.toLowerCase().includes(search.toLowerCase()) ||
      e.reference?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getCatStyle = (cat: AudioCategory) =>
    CATEGORIES.find((c) => c.value === cat)?.color ?? 'bg-gray-100 text-gray-700';
  const getCatLabel = (cat: AudioCategory) =>
    CATEGORIES.find((c) => c.value === cat)?.label ?? cat;

  return (
    <div className="space-y-6">
      {/* ── Form ── */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5 text-primary" />
            {editingId ? 'Edit Audio Entry' : 'Add New Audio'}
          </CardTitle>
          <CardDescription>
            Paste any direct audio URL (mp3, m4a, ogg), CDN link, archive.org download, Dropbox
            direct link, or a hosted stream URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-green-700 text-sm p-3 bg-green-50 rounded-md">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Category */}
            <div className="space-y-1">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v as AudioCategory }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input
                placeholder="e.g. Surah Yaseen — Full Recitation"
                value={form.title ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            {/* Reference */}
            <div className="space-y-1">
              <Label>Reference (Surah / Hadith / Topic)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Surah 36 (Yaseen)"
                  value={form.reference ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                />
                {form.category === 'surah' && (
                  <Select onValueChange={(v) => setForm((f) => ({ ...f, reference: v }))}>
                    <SelectTrigger className="w-36 shrink-0">
                      <SelectValue placeholder="Quick pick" />
                    </SelectTrigger>
                    <SelectContent>
                      {SURAH_QUICK_REFS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Reciter */}
            <div className="space-y-1">
              <Label>Reciter / Speaker</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Mishary Rashid Al-Afasy"
                  value={form.reciter ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, reciter: e.target.value }))}
                />
                {(form.category === 'surah' || form.category === 'dua') && (
                  <Select onValueChange={(v) => setForm((f) => ({ ...f, reciter: v }))}>
                    <SelectTrigger className="w-36 shrink-0">
                      <SelectValue placeholder="Quick pick" />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULAR_RECITERS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Audio URL */}
            <div className="space-y-1 md:col-span-2">
              <Label>Audio URL *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://... (mp3, m4a, or any direct audio link)"
                  value={form.audioUrl ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, audioUrl: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => setPreviewUrl(form.audioUrl ?? null)}
                >
                  <Play className="h-4 w-4 mr-1" /> Test
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: archive.org download links, Google Drive direct links, Dropbox
                ?dl=1 links, or any CDN-hosted mp3 all work great.
              </p>
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <Label>Duration (optional)</Label>
              <Input
                placeholder="03:45"
                value={form.durationLabel ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, durationLabel: e.target.value }))}
              />
            </div>

            {/* Thumbnail */}
            <div className="space-y-1">
              <Label>Thumbnail URL (optional)</Label>
              <Input
                placeholder="https://... (image)"
                value={form.thumbnailUrl ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
              />
            </div>

            {/* Notes */}
            <div className="space-y-1 md:col-span-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Any additional notes about this audio..."
                value={form.notes ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Published */}
            <div className="flex items-center gap-3">
              <Switch
                checked={form.published ?? true}
                onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))}
              />
              <Label>Published (visible to users)</Label>
            </div>
          </div>

          {/* Preview player */}
          {previewUrl && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Audio Preview</span>
                <Button variant="ghost" size="sm" onClick={() => setPreviewUrl(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <audio ref={audioRef} controls className="w-full" src={previewUrl} autoPlay />
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              {saving ? 'Saving…' : editingId ? 'Update Entry' : 'Add Audio Entry'}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── List ── */}
      <Card>
        <CardHeader>
          <CardTitle>Audio Library ({entries.length} entries)</CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Input
              placeholder="Search title, reciter, reference…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={filterCat} onValueChange={(v) => setFilterCat(v as AudioCategory | 'all')}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-muted-foreground text-sm">Loading…</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No audio entries yet. Add your first one above.
            </p>
          )}
          <div className="space-y-3">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
              >
                <FileAudio className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium truncate">{entry.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCatStyle(entry.category)}`}>
                      {getCatLabel(entry.category)}
                    </span>
                    {!entry.published && (
                      <Badge variant="secondary" className="text-xs">Draft</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {entry.reference && <span>📖 {entry.reference}</span>}
                    {entry.reciter && <span>🎙 {entry.reciter}</span>}
                    {entry.durationLabel && <span>⏱ {entry.durationLabel}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{entry.audioUrl}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    title="Preview"
                    onClick={() => setPreviewUrl(previewUrl === entry.audioUrl ? null : entry.audioUrl)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" title="Edit" onClick={() => startEdit(entry)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    title="Delete"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
