'use client';

import { useState } from 'react';

type Props = {
  playlistId: string;
  title: string;
  thumbnailUrl: string;
};

export default function LiteYoutubeEmbed({ playlistId, title, thumbnailUrl }: Props) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingTop: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl cursor-pointer group"
      style={{ paddingTop: '56.25%' }}
      onClick={() => setPlaying(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setPlaying(true)}
      aria-label={`Play ${title}`}
    >
      {/* Thumbnail */}
      <img
        src={thumbnailUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/default/mqdefault.jpg`;
        }}
      />
      {/* Dark overlay on hover */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-200 rounded-xl" />
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
          <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-1">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      {/* YouTube logo watermark */}
      <div className="absolute bottom-2 right-2 opacity-70">
        <svg viewBox="0 0 90 20" fill="white" className="w-14 h-4">
          <path d="M27.9 3.6A3.4 3.4 0 0 0 25.5 1C23.3.4 14.5.4 14.5.4S5.8.4 3.5 1A3.4 3.4 0 0 0 1.1 3.6C.5 5.9.5 10.7.5 10.7s0 4.8.6 7.1A3.4 3.4 0 0 0 3.5 20.4c2.3.6 11 .6 11 .6s8.8 0 11-.6a3.4 3.4 0 0 0 2.4-2.6c.6-2.3.6-7.1.6-7.1s0-4.8-.6-7.1zM12 15.2V6.2l7.3 4.5-7.3 4.5z" />
        </svg>
      </div>
    </div>
  );
}
