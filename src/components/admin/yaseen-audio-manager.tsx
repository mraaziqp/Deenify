"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Music, Trash2, Plus, ExternalLink, Play } from "lucide-react";

interface YaseenAudioTrack {
  id: string;
  label: string;
  reciter: string;
  url: string;
  language?: string;
}

const STORAGE_KEY = "deenify_yaseen_audio_tracks";

function loadTracks(): YaseenAudioTrack[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultTracks;
  } catch {
    return defaultTracks;
  }
}

function saveTracks(tracks: YaseenAudioTrack[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  } catch {}
}

const defaultTracks: YaseenAudioTrack[] = [
  {
    id: "1",
    label: "Surah Yaaseen – Sheikh Mishary Alafasy",
    reciter: "Mishary Alafasy",
    url: "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/036.mp3",
    language: "Arabic",
  },
  {
    id: "2",
    label: "Surah Yaaseen – Sheikh Abdul Rahman Al-Sudais",
    reciter: "Abdul Rahman Al-Sudais",
    url: "https://download.quranicaudio.com/quran/abdurrahmaan_as-sudays/036.mp3",
    language: "Arabic",
  },
];

export function YaseenAudioManager() {
  const [tracks, setTracks] = useState<YaseenAudioTrack[]>([]);
  const [newTrack, setNewTrack] = useState<Omit<YaseenAudioTrack, "id">>({
    label: "",
    reciter: "",
    url: "",
    language: "Arabic",
  });
  const [saving, setSaving] = useState(false);
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);

  useEffect(() => {
    setTracks(loadTracks());
  }, []);

  const handleAdd = () => {
    if (!newTrack.label || !newTrack.url) {
      toast({ title: "Missing fields", description: "Label and URL are required." });
      return;
    }
    const track: YaseenAudioTrack = {
      ...newTrack,
      id: String(Date.now()),
    };
    const updated = [...tracks, track];
    setTracks(updated);
    saveTracks(updated);
    setNewTrack({ label: "", reciter: "", url: "", language: "Arabic" });
    toast({ title: "Track added!", description: track.label });
  };

  const handleDelete = (id: string) => {
    const updated = tracks.filter((t) => t.id !== id);
    setTracks(updated);
    saveTracks(updated);
    toast({ title: "Track removed" });
  };

  const handleUpdate = (id: string, field: keyof YaseenAudioTrack, value: string) => {
    const updated = tracks.map((t) => (t.id === id ? { ...t, [field]: value } : t));
    setTracks(updated);
    saveTracks(updated);
  };

  const handleSaveToServer = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/yaseen-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracks }),
      });
      if (res.ok) {
        toast({ title: "Saved!", description: "Yaaseen audio tracks updated on server." });
      } else {
        // Still saved locally
        toast({ title: "Saved locally", description: "Server sync unavailable – tracks saved in browser." });
      }
    } catch {
      toast({ title: "Saved locally", description: "Server sync unavailable – tracks saved in browser." });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Surah Yaaseen Audio Manager
          </CardTitle>
          <CardDescription>
            Add, edit, or remove audio recitations for Surah Yaaseen. Paste any direct MP3/audio URL (archive.org, CDN, Dropbox, etc.).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing tracks */}
          <div className="space-y-3">
            {tracks.map((track) => (
              <div key={track.id} className="border rounded-lg p-3 space-y-2 bg-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <Input
                      className="font-semibold"
                      value={track.label}
                      onChange={(e) => handleUpdate(track.id, "label", e.target.value)}
                      placeholder="Label (e.g. Surah Yaaseen – Mishary)"
                    />
                    <Input
                      value={track.reciter}
                      onChange={(e) => handleUpdate(track.id, "reciter", e.target.value)}
                      placeholder="Reciter name"
                    />
                    <Input
                      value={track.url}
                      onChange={(e) => handleUpdate(track.id, "url", e.target.value)}
                      placeholder="Direct audio URL (mp3, m4a, etc.)"
                    />
                    <Input
                      value={track.language ?? ""}
                      onChange={(e) => handleUpdate(track.id, "language", e.target.value)}
                      placeholder="Language (e.g. Arabic, English)"
                    />
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewTrackId(previewTrackId === track.id ? null : track.id)}
                    >
                      <Play className="h-3 w-3 mr-1" /> Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(track.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                    <a href={track.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-3 w-3 mr-1" /> Open
                      </Button>
                    </a>
                  </div>
                </div>
                {previewTrackId === track.id && track.url && (
                  <audio controls className="w-full mt-1" src={track.url}>
                    Your browser does not support audio.
                  </audio>
                )}
              </div>
            ))}
          </div>

          {/* Add new track */}
          <Card className="border-dashed border-primary/40 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Audio Track
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                placeholder="Label (e.g. Surah Yaaseen – Sheikh Sudais)"
                value={newTrack.label}
                onChange={(e) => setNewTrack((p) => ({ ...p, label: e.target.value }))}
              />
              <Input
                placeholder="Reciter name"
                value={newTrack.reciter}
                onChange={(e) => setNewTrack((p) => ({ ...p, reciter: e.target.value }))}
              />
              <Input
                placeholder="Direct audio URL (mp3, m4a, archive.org, etc.)"
                value={newTrack.url}
                onChange={(e) => setNewTrack((p) => ({ ...p, url: e.target.value }))}
              />
              <Input
                placeholder="Language (e.g. Arabic)"
                value={newTrack.language}
                onChange={(e) => setNewTrack((p) => ({ ...p, language: e.target.value }))}
              />
              <Button onClick={handleAdd} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Track
              </Button>
            </CardContent>
          </Card>

          <Button onClick={handleSaveToServer} disabled={saving} variant="default" size="lg" className="w-full">
            {saving ? "Saving…" : "Save All Changes"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Tracks are saved in your browser immediately. Click &quot;Save All Changes&quot; to sync with the server.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
