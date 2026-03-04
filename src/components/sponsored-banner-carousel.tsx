'use client';

import { useEffect, useRef, useState } from 'react';

type Banner = {
  id: string;
  businessName: string;
  imageUrl: string;
  targetUrl: string | null;
};

export default function SponsoredBannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/banners')
      .then((r) => r.json())
      .then((data) => {
        if (data.banners?.length) {
          setBanners(data.banners);
          // Record a view for each banner (fire-and-forget)
          data.banners.forEach((b: Banner) => {
            fetch(`/api/banners?id=${b.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'view' }),
            }).catch(() => {});
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 4500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [banners.length]);

  if (!banners.length) return null;

  const banner = banners[current];

  const handleClick = () => {
    if (!banner.targetUrl) return;
    fetch(`/api/banners?id=${banner.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'click' }),
    }).catch(() => {});
    window.open(banner.targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-md" style={{ minHeight: '80px' }}>
      {/* Slide */}
      <div
        className={`relative w-full ${banner.targetUrl ? 'cursor-pointer' : ''}`}
        onClick={banner.targetUrl ? handleClick : undefined}
        style={{ aspectRatio: '4/1', minHeight: '68px' }}
      >
        {/* Background image */}
        <img
          src={banner.imageUrl}
          alt={banner.businessName}
          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.45) 0%, transparent 60%)' }} />
        {/* Business name */}
        <div className="absolute bottom-2 left-3 text-white text-sm font-semibold drop-shadow">
          {banner.businessName}
        </div>
        {/* Sponsored badge */}
        <div className="absolute top-2 right-3 bg-black/40 text-white/80 text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">
          Sponsored
        </div>
      </div>

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === current ? 'bg-white scale-125' : 'bg-white/50'
              }`}
              aria-label={`Banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
