'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';

type Banner = {
  id: string;
  businessName: string;
  imageUrl: string;
  targetUrl: string | null;
  description: string | null;
};

export default function SponsoredBannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewedRef = useRef<Set<string>>(new Set());

  const trackView = useCallback((id: string) => {
    if (viewedRef.current.has(id)) return;
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
          if (data.banners[0]) trackView(data.banners[0].id);
        }
      })
      .catch(() => {});
  }, [trackView]);

  const activeBanners = banners.filter((b) => !dismissed.has(b.id));

  const goTo = useCallback((index: number, list: Banner[]) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(index);
      setFading(false);
      if (list[index]) trackView(list[index].id);
    }, 220);
  }, [trackView]);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((c) => {
        const next = (c + 1) % activeBanners.length;
        setFading(true);
        setTimeout(() => {
          setCurrent(next);
          setFading(false);
          trackView(activeBanners[next].id);
        }, 220);
        return c;
      });
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeBanners, trackView]);

  if (!activeBanners.length) return null;

  const safeCurrent = Math.min(current, activeBanners.length - 1);
  const banner = activeBanners[safeCurrent];

  const handleClick = () => {
    if (!banner.targetUrl) return;
    fetch(`/api/banners?id=${banner.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'click' }),
    }).catch(() => {});
    window.open(banner.targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed((prev) => new Set([...prev, banner.id]));
    setCurrent(0);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-md bg-emerald-900" style={{ aspectRatio: '4/1', minHeight: '72px' }}>
      <div
        className={`absolute inset-0 transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'} ${banner.targetUrl ? 'cursor-pointer' : ''}`}
        onClick={banner.targetUrl ? handleClick : undefined}
      >
        <img
          src={banner.imageUrl}
          alt={banner.businessName}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)' }}
        />
        <div className="absolute bottom-2.5 left-3.5 text-white text-sm font-semibold drop-shadow-sm">
          {banner.businessName}
        </div>
        <div className="absolute top-2 right-9 bg-black/40 text-white/80 text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm tracking-wide">
          Sponsored
        </div>
        {banner.targetUrl && (
          <div className="absolute bottom-2.5 right-9 text-white/60 text-[11px]">↗</div>
        )}
      </div>

      {/* Dismiss X button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss ad"
        className="absolute top-1.5 right-1.5 z-20 w-6 h-6 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {activeBanners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {activeBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, activeBanners)}
              className={`rounded-full transition-all duration-300 ${
                i === safeCurrent ? 'bg-white w-3 h-1.5' : 'bg-white/45 w-1.5 h-1.5'
              }`}
              aria-label={`Banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}


