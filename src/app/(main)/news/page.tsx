'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { ExternalLink, Newspaper, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Article = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  imageUrl: string | null;
};

function ArticleSkeleton() {
  return (
    <Card className="flex gap-3 p-3 overflow-hidden">
      <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-24" />
      </div>
    </Card>
  );
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      setArticles(data.articles ?? []);
      setLastUpdated(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Community News | Deenify';
    fetchNews();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="container mx-auto px-3 py-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Community News</h1>
            <p className="text-xs text-muted-foreground">
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}`
                : 'Updates hourly'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchNews} disabled={loading} className="rounded-xl">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Source badges */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Badge variant="secondary" className="rounded-full">Muslim Village</Badge>
        <Badge variant="secondary" className="rounded-full">Muslim Matters</Badge>
      </div>

      {/* Content */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <ArticleSkeleton key={i} />)}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm mb-3">News unavailable — check back soon.</p>
          <Button variant="outline" onClick={fetchNews} className="rounded-xl">Try again</Button>
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No articles found — check back soon.
        </div>
      )}

      {!loading && !error && articles.length > 0 && (
        <div className="space-y-3">
          {articles.map((article, i) => (
            <a
              key={`${article.link}-${i}`}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="flex gap-3 p-3 hover:shadow-md transition-shadow duration-200 overflow-hidden group">
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                  {article.imageUrl ? (
                    <img
                      src={article.imageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).parentElement!.style.background = '#e5e7eb';
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📰</div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-full">
                      {article.source}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">{formatDate(article.pubDate)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 text-[11px] font-medium">
                    <ExternalLink className="w-3 h-3" />
                    Read more
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
