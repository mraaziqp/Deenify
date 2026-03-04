import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Cache Route Handler for 1 hour (force-static enables revalidate on Route Handlers)
export const dynamic = 'force-static';
export const revalidate = 3600;

// Singleton parser — created once at module level, not per request
const parser = new Parser({
  timeout: 8000,
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
      ['enclosure', 'enclosure'],
    ],
  },
});

const FEEDS = [
  { url: 'https://muslimvillage.com/feed', source: 'Muslim Village' },
  { url: 'https://muslimmatters.org/feed', source: 'Muslim Matters' },
];

type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  imageUrl: string | null;
  excerpt: string | null;
};

function extractImage(item: any): string | null {
  const mcUrl = item.mediaContent?.$?.url ?? item.mediaContent?.url;
  if (mcUrl) return mcUrl;
  const mtUrl = item.mediaThumbnail?.$?.url ?? item.mediaThumbnail?.url;
  if (mtUrl) return mtUrl;
  if (item.enclosure?.url && item.enclosure?.type?.startsWith('image/')) return item.enclosure.url;
  const content: string | undefined = item.contentEncoded ?? item['content:encoded'];
  if (content) {
    const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extractExcerpt(item: any): string | null {
  const raw: string | undefined =
    item.summary ?? item.description ?? item.contentEncoded ?? item['content:encoded'];
  if (!raw) return null;
  const text = raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return null;
  return text.length > 160 ? text.slice(0, 157) + '…' : text;
}

export async function GET() {
  const results = await Promise.allSettled(
    FEEDS.map(async ({ url, source }) => {
      const feed = await parser.parseURL(url);
      return feed.items.slice(0, 15).map((item): FeedItem => ({
        title: (item.title ?? 'Untitled').trim(),
        link: item.link ?? '',
        pubDate: item.pubDate ?? item.isoDate ?? new Date().toISOString(),
        source,
        imageUrl: extractImage(item),
        excerpt: extractExcerpt(item),
      }));
    })
  );

  const allItems: FeedItem[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  }

  allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  return NextResponse.json({ articles: allItems.slice(0, 30) });
}
