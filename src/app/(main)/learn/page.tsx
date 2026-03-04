'use client';

import { useEffect, useState } from 'react';
import LiteYoutubeEmbed from '@/components/lite-youtube-embed';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlayCircle, Search } from 'lucide-react';

type Playlist = {
  id: string;
  title: string;
  instructor: string;
  youtubePlaylistId: string;
  thumbnailUrl: string;
  category: string;
};

function PlaylistSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="w-full aspect-video" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </Card>
  );
}

export default function LearnPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'Video Library | Deenify';
    fetch('/api/video-playlists')
      .then((r) => r.json())
      .then((data) => setPlaylists(data.playlists ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Filter by search
  const q = search.trim().toLowerCase();
  const filtered = q
    ? playlists.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.instructor.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    : playlists;

  // Group filtered playlists by category
  const grouped = filtered.reduce<Record<string, Playlist[]>>((acc, p) => {
    const cat = p.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  return (
    <div className="container mx-auto px-3 py-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
          <PlayCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight">Video Library</h1>
          <p className="text-sm text-muted-foreground">Curated Islamic content — tap to watch</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search playlists, instructors, categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl"
        />
      </div>

      {loading && (
        <>
          <div className="mb-6">
            <Skeleton className="h-5 w-32 mb-3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => <PlaylistSkeleton key={i} />)}
            </div>
          </div>
          <div>
            <Skeleton className="h-5 w-28 mb-3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => <PlaylistSkeleton key={i} />)}
            </div>
          </div>
        </>
      )}

      {!loading && playlists.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📺</div>
          <p className="text-muted-foreground">No playlists available yet — check back soon.</p>
          <p className="text-xs text-muted-foreground mt-2">Admins can add playlists via the Admin panel.</p>
        </div>
      )}

      {!loading && playlists.length > 0 && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-muted-foreground">No playlists match “{search}”</p>
        </div>
      )}

      {!loading && categories.map((category) => (
        <section key={category} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-bold">{category}</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {grouped[category].length} playlist{grouped[category].length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped[category].map((playlist) => (
              <Card key={playlist.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                <LiteYoutubeEmbed
                  playlistId={playlist.youtubePlaylistId}
                  title={playlist.title}
                  thumbnailUrl={playlist.thumbnailUrl}
                />
                <div className="p-3 space-y-0.5">
                  <p className="font-semibold text-sm leading-snug line-clamp-2">{playlist.title}</p>
                  <p className="text-xs text-muted-foreground">{playlist.instructor}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
