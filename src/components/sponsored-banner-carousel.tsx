'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type Banner = {
  id: string;
  businessName: string;
  imageUrl: string;
  targetUrl: string | null;
};

export default function SponsoredBannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewedRef = useRef<Set<string>>(new Set());

  const trackView = useCallback((id: string) => {
    if (viewedRef.current.has(id)) return; // only once per session per banner
    viewedRef.current.add(id);
    fetch(`/api/banners?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'view' }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/banners')
      .then((r) => r.json())
      .then((data) => {
        if (data.banners?.length) {
          setBanners(data.banners);
          // Track view for the first visible banner only
          if (data.banners[0]) trackView(data.banners[0].id);
        }
      })
      .catch(() => {});
  }, [trackView]);

  const goTo = useCallback((index: number, list: Banner[]) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(index);
      setFading(false);
      if (list[index]) trackView(list[index].id);
    }, 220);
  }, [trackView]);

  useEffect(() => {
    if (banners.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((c) => {
        const next = (c + 1) % banners.length;
        setFading(true);
        setTimeout(() => {
          setCurrent(next);
          setFading(false);
          trackView(banners[next].id);
        }, 220);
        return c; // actual update happens in the timeout
      });
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [banners, trackView]);

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
    <div className="relative w-full overflow-hidden rounded-2xl shadow-md bg-emerald-900" style={{ aspectRatio: '4/1', minHeight: '72px' }}>
      {/* Slide with fade transition */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'} ${banner.targetUrl ? 'cursor-pointer' : ''}`}
        onClick={banner.targetUrl ? handleClick : undefined}
      >
        {/* Background image */}
        <img
          src={banner.imageUrl}
          alt={banner.businessName}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            // On image error, show a graceful branded gradient instead of broken img
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Always-present gradient overlay — visible even on image error */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)' }}
        />
        {/* Business name */}
        <div className="absolute bottom-2.5 left-3.5 text-white text-sm font-semibold drop-shadow-sm">
          {banner.businessName}
        </div>
        {/* "Sponsored" pill — top right */}
        <div className="absolute top-2 right-3 bg-black/40 text-white/80 text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm tracking-wide">
          Sponsored
        </div>
        {/* Arrow hint if clickable */}
        {banner.targetUrl && (
          <div className="absolute bottom-2.5 right-3.5 text-white/60 text-[11px]">↗</div>
        )}
      </div>

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, banners)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'bg-white w-3 h-1.5' : 'bg-white/45 w-1.5 h-1.5'
              }`}
              aria-label={`Banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
