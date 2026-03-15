'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Square, Volume2, VolumeX } from 'lucide-react';

export interface RadioStation {
  id: string;
  name: string;
  location: string;
  description: string;
  streamUrl: string;
  websiteUrl?: string;
  logoEmoji: string;
  genre: string;
  status?: 'live' | 'pending';
}

interface RadioPlayerProps {
  station: RadioStation;
  isActive: boolean;
  onActivate: () => void;
  onStop: () => void;
}

export default function RadioPlayer({ station, isActive, onActivate, onStop }: RadioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState(false);

  const isPending = station.status === 'pending' || !station.streamUrl;

  // Single persistent audio element — control via src + play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isActive) {
      setError(false);
      setBuffering(true);
      audio.src = station.streamUrl;
      audio.load();
      audio.play().catch(() => {
        setBuffering(false);
        setError(true);
      });
    } else {
      audio.pause();
      audio.src = '';
      setBuffering(false);
    }
  }, [isActive, station.streamUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  const togglePlay = () => {
    if (isPending) return;
    if (isActive) {
      onStop();
    } else {
      onActivate();
    }
  };

  return (
    <div className={`rounded-2xl border transition-all duration-200 p-4 ${isPending ? 'border-dashed border-amber-200 bg-amber-50/60 opacity-80' : isActive ? 'border-emerald-400 bg-emerald-50 shadow-md' : 'border-gray-200 bg-white hover:border-emerald-200 hover:shadow-sm'}`}>
      {/* Single persistent audio element — always mounted so ref is always valid */}
      <audio
        ref={audioRef}
        preload="none"
        onWaiting={() => setBuffering(true)}
        onPlaying={() => { setBuffering(false); setError(false); }}
        onError={() => { setBuffering(false); setError(true); }}
      />

      <div className="flex items-center gap-4">
        {/* Logo / emoji */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isActive ? 'bg-emerald-500' : 'bg-gray-100'}`}>
          {station.logoEmoji}
        </div>

        {/* Station info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 truncate">{station.name}</p>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{station.genre}</span>
            {isPending && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Partnership Pending</span>
            )}
            {!isPending && isActive && !buffering && !error && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            )}
            {buffering && (
              <span className="text-xs text-amber-600 animate-pulse">Buffering…</span>
            )}
            {error && (
              <span className="text-xs text-red-500">Stream unavailable</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{station.location}</p>
          <p className="text-xs text-gray-400 truncate">{station.description}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isActive && (
            <button
              onClick={() => setMuted((m) => !m)}
              className="text-gray-400 hover:text-emerald-600 transition-colors"
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          )}
          {isPending ? (
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 text-amber-500" title="Coming soon">
              <span className="text-sm">🔜</span>
            </div>
          ) : (
            <button
              onClick={togglePlay}
              className={`flex items-center justify-center w-10 h-10 rounded-xl font-medium transition-all ${isActive ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-700'}`}
              title={isActive ? 'Stop' : 'Play'}
            >
              {isActive ? <Square className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
            </button>
          )}
        </div>
      </div>

      {/* Volume slider — only when active */}
      {isActive && !error && (
        <div className="mt-3 flex items-center gap-2">
          <Volume2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={muted ? 0 : volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              setMuted(v === 0);
            }}
            className="w-full accent-emerald-500 h-1.5"
          />
        </div>
      )}

      {station.websiteUrl && (
        <div className="mt-2">
          <a
            href={station.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-600 hover:underline"
          >
            Visit website ↗
          </a>
        </div>
      )}
    </div>
  );
}
