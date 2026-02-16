'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, FileAudio, FileImage, FileVideo, Link2, Pencil, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const mediaTypes = [
  { value: 'audio', label: 'Audio', icon: FileAudio },
  { value: 'video', label: 'Video', icon: FileVideo },
  { value: 'image', label: 'Image', icon: FileImage },
] as const;

type MediaType = (typeof mediaTypes)[number]['value'];

type QuranMediaItem = {
  id: string;
  title: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  reciter?: string;
  surahNumber?: number;
  ayahStart?: number;
  ayahEnd?: number;
  language?: string;
  durationSeconds?: number;
  tags?: string[];
  source?: string;
  license?: string;
  notes?: string;
  published: boolean;
  createdAt: string;
};

type UploadResponse = {
  uploadUrl: string;
  publicUrl: string;
  path: string;
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const parseNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export function QuranMediaManager() {
  const [items, setItems] = useState<QuranMediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<MediaType | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<MediaType>('audio');
  const [url, setUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [reciter, setReciter] = useState('');
  const [surahNumber, setSurahNumber] = useState('');
  const [ayahStart, setAyahStart] = useState('');
  const [ayahEnd, setAyahEnd] = useState('');
  const [language, setLanguage] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('');
  const [tags, setTags] = useState('');
  const [source, setSource] = useState('');
  const [license, setLicense] = useState('');
  const [notes, setNotes] = useState('');
  const [published, setPublished] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/quran-media');
        if (!response.ok) return;
        const data = await response.json();
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (error) {
        console.error('Failed to load media:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMedia();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (!query) return true;
      return [
        item.title,
        item.reciter,
        item.language,
        item.source,
        item.tags?.join(' '),
      ]
        .filter(Boolean)
        .some((field) => field?.toLowerCase().includes(query));
    });
  }, [filterType, items, search]);

  const resetForm = () => {
    setTitle('');
    setType('audio');
    setUrl('');
    setThumbnailUrl('');
    setReciter('');
    setSurahNumber('');
    setAyahStart('');
    setAyahEnd('');
    setLanguage('');
    setDurationSeconds('');
    setTags('');
    setSource('');
    setLicense('');
    setNotes('');
    setPublished(true);
    setEditingId(null);
    setUploadFile(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!url.trim()) {
      toast.error('Media URL is required');
      return;
    }

    const payload = {
      title: title.trim(),
      type,
      url: url.trim(),
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      reciter: reciter.trim() || undefined,
      surahNumber: parseNumber(surahNumber),
      ayahStart: parseNumber(ayahStart),
      ayahEnd: parseNumber(ayahEnd),
      language: language.trim() || undefined,
      durationSeconds: parseNumber(durationSeconds),
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      source: source.trim() || undefined,
      license: license.trim() || undefined,
      notes: notes.trim() || undefined,
      published,
    };

    try {
      const response = await fetch(
        editingId ? `/api/admin/quran-media/${editingId}` : '/api/admin/quran-media',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        toast.error('Unable to save media');
        return;
      }

      const data = await response.json();
      const updatedItem = data.item as QuranMediaItem;
      const nextItems = editingId
        ? items.map((item) => (item.id === editingId ? updatedItem : item))
        : [updatedItem, ...items];

      setItems(nextItems);
      resetForm();
      toast.success(editingId ? 'Media updated' : 'Media added');
    } catch (error) {
      console.error('Failed to save media:', error);
      toast.error('Unable to save media');
    }
  };

  const handleEdit = (item: QuranMediaItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setType(item.type);
    setUrl(item.url);
    setThumbnailUrl(item.thumbnailUrl || '');
    setReciter(item.reciter || '');
    setSurahNumber(item.surahNumber?.toString() || '');
    setAyahStart(item.ayahStart?.toString() || '');
    setAyahEnd(item.ayahEnd?.toString() || '');
    setLanguage(item.language || '');
    setDurationSeconds(item.durationSeconds?.toString() || '');
    setTags(item.tags?.join(', ') || '');
    setSource(item.source || '');
    setLicense(item.license || '');
    setNotes(item.notes || '');
    setPublished(item.published);
    setUploadFile(null);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/quran-media/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        toast.error('Unable to delete media');
        return;
      }
      const nextItems = items.filter((item) => item.id !== id);
      setItems(nextItems);
      toast.success('Media removed');
    } catch (error) {
      console.error('Failed to delete media:', error);
      toast.error('Unable to delete media');
    }
  };

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard');
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error('Select a file to upload');
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch('/api/admin/media/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: uploadFile.name,
          contentType: uploadFile.type,
          mediaType: type,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || 'Failed to get upload URL');
      }

      const payload = (await response.json()) as UploadResponse;
      const uploadResult = await fetch(payload.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': uploadFile.type },
        body: uploadFile,
      });

      if (!uploadResult.ok) {
        throw new Error('Upload failed');
      }

      setUrl(payload.publicUrl);
      if (type === 'image') {
        setThumbnailUrl(payload.publicUrl);
      }
      toast.success('Upload complete');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Check your Supabase Storage setup.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
      <Card>
        <CardHeader>
          <CardTitle>Quran Media Uploader</CardTitle>
          <CardDescription>
            Add recitations, videos, and images with metadata. Uploaded files use Supabase Storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Al-Baqarah recitation" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Media type</Label>
              <Select value={type} onValueChange={(value) => setType(value as MediaType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {mediaTypes.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reciter / Creator</Label>
              <Input value={reciter} onChange={(event) => setReciter(event.target.value)} placeholder="Mishary Al-Afasy" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Surah #</Label>
              <Input value={surahNumber} onChange={(event) => setSurahNumber(event.target.value)} placeholder="2" />
            </div>
            <div className="space-y-2">
              <Label>Ayah start</Label>
              <Input value={ayahStart} onChange={(event) => setAyahStart(event.target.value)} placeholder="1" />
            </div>
            <div className="space-y-2">
              <Label>Ayah end</Label>
              <Input value={ayahEnd} onChange={(event) => setAyahEnd(event.target.value)} placeholder="5" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Media URL</Label>
            <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <Label>Thumbnail URL (optional)</Label>
            <Input value={thumbnailUrl} onChange={(event) => setThumbnailUrl(event.target.value)} placeholder="https://..." />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Language</Label>
              <Input value={language} onChange={(event) => setLanguage(event.target.value)} placeholder="Arabic" />
            </div>
            <div className="space-y-2">
              <Label>Duration (seconds)</Label>
              <Input value={durationSeconds} onChange={(event) => setDurationSeconds(event.target.value)} placeholder="420" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags (comma-separated)</Label>
            <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="tajweed, ramadan" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Source</Label>
              <Input value={source} onChange={(event) => setSource(event.target.value)} placeholder="Official channel" />
            </div>
            <div className="space-y-2">
              <Label>License</Label>
              <Input value={license} onChange={(event) => setLicense(event.target.value)} placeholder="Creative Commons" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes for admins..." rows={3} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-semibold">Published</p>
              <p className="text-xs text-muted-foreground">Toggle visibility for users.</p>
            </div>
            <Switch checked={published} onCheckedChange={setPublished} />
          </div>

          <div className="space-y-2">
            <Label>Upload file (Supabase Storage)</Label>
            <Input
              type="file"
              onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
              accept={type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*'}
            />
            <Button onClick={handleUpload} variant="outline" disabled={isUploading}>
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload to Storage'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave}>
              {editingId ? 'Update Media' : 'Add Media'}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media Library</CardTitle>
          <CardDescription>Search, filter, and manage all Quran media assets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title, reciter, tag..." />
            <Select value={filterType} onValueChange={(value) => setFilterType(value as MediaType | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {mediaTypes.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Loading media library...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No media found. Add your first recitation or upload a file.
            </div>
          ) : (
            <ScrollArea className="h-[640px] pr-2">
              <div className="space-y-4">
                {filteredItems.map((item) => {
                  const Icon = mediaTypes.find((option) => option.value === item.type)?.icon || Link2;
                  return (
                    <Card key={item.id} className="border-muted">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-primary" />
                              <p className="font-semibold">{item.title}</p>
                              <Badge variant={item.published ? 'default' : 'secondary'}>
                                {item.published ? 'Published' : 'Draft'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.type.toUpperCase()} • {item.language || 'Unknown'} • {formatDuration(item.durationSeconds)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                          <div>Reciter: {item.reciter || 'N/A'}</div>
                          <div>Surah: {item.surahNumber || 'N/A'}</div>
                          <div>Ayah range: {item.ayahStart || 'N/A'} - {item.ayahEnd || 'N/A'}</div>
                          <div>Source: {item.source || 'N/A'}</div>
                        </div>

                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.tags.map((tag) => (
                              <Badge key={`${item.id}-${tag}`} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => window.open(item.url, '_blank')}>
                            <Link2 className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleCopy(item.url)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy URL
                          </Button>
                          {item.thumbnailUrl && (
                            <Button variant="outline" size="sm" onClick={() => handleCopy(item.thumbnailUrl || '')}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Thumbnail
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
