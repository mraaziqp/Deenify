'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface Banner {
  id: string;
  businessName: string;
  imageUrl: string;
  targetUrl: string | null;
  description: string | null;
}

interface Props {
  placement?: 'dashboard' | 'sidebar' | 'inline';
  className?: string;
}

export default function SponsoredBannerStrip({ placement = 'dashboard', className = '' }: Props) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/banners')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.banners) && d.banners.length > 0) {
          setBanners(d.banners);
          setLoaded(true);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-rotate banners every 8 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent(c => (c + 1) % banners.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Track view
  useEffect(() => {
    if (!loaded || !banners[current]) return;
    fetch(`/api/banners?id=${banners[current].id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'view' }),
    }).catch(() => {});
  }, [current, loaded, banners]);

  if (!loaded || dismissed || banners.length === 0) return null;

  const banner = banners[current];

  const handleClick = () => {
    fetch(`/api/banners?id=${banner.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'click' }),
    }).catch(() => {});
    if (banner.targetUrl) {
      window.open(banner.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (placement === 'inline') {
    return (
      <div className={`relative rounded-xl overflow-hidden border bg-white shadow-sm ${className}`}>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-1.5 right-1.5 z-10 p-0.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          aria-label="Dismiss ad"
        >
          <X className="h-3 w-3" />
        </button>
        <div
          className="cursor-pointer flex items-center gap-3 p-3"
          onClick={handleClick}
          role={banner.targetUrl ? 'link' : 'presentation'}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.imageUrl}
            alt={`Sponsored by ${banner.businessName}`}
            className="h-12 w-12 rounded-lg object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Sponsored</p>
            <p className="font-semibold text-sm truncate">{banner.businessName}</p>
            {banner.description && (
              <p className="text-xs text-muted-foreground truncate">{banner.description}</p>
            )}
          </div>
          {banner.targetUrl && <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />}
        </div>
        {banners.length > 1 && (
          <div className="flex justify-center gap-1 pb-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'}`}
                aria-label={`Banner ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // dashboard / banner strip variant
  return (
    <div className={`relative w-full rounded-xl overflow-hidden border bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm ${className}`}>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/10 hover:bg-black/20 text-gray-600 transition-colors"
        aria-label="Dismiss ad"
      >
        <X className="h-3 w-3" />
      </button>
      <div
        className={`flex items-center gap-4 p-4 ${banner.targetUrl ? 'cursor-pointer' : ''}`}
        onClick={banner.targetUrl ? handleClick : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner.imageUrl}
          alt={`Sponsored by ${banner.businessName}`}
          className="h-16 w-16 rounded-xl object-cover shrink-0 border border-white shadow"
        />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Sponsored
          </span>
          <p className="font-bold mt-1 truncate">{banner.businessName}</p>
          {banner.description && (
            <p className="text-sm text-muted-foreground truncate">{banner.description}</p>
          )}
        </div>
        {banner.targetUrl && (
          <ExternalLink className="h-5 w-5 text-emerald-600 shrink-0" />
        )}
      </div>
      {banners.length > 1 && (
        <div className="flex justify-center gap-1 pb-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${i === current ? 'w-5 bg-emerald-600' : 'w-1.5 bg-gray-300'}`}
              aria-label={`Banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
