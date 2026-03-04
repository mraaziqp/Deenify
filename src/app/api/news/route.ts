import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// ISR — revalidate every hour, not on every request
export const revalidate = 3600;

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
};

function extractImage(content: string | undefined): string | null {
  if (!content) return null;
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

export async function GET() {
  const parser = new Parser({
    customFields: {
      item: [['media:content', 'mediaContent'], ['content:encoded', 'contentEncoded']],
    },
  });

  const results = await Promise.allSettled(
    FEEDS.map(async ({ url, source }) => {
      const feed = await parser.parseURL(url);
      return feed.items.slice(0, 15).map((item): FeedItem => ({
        title: item.title ?? 'Untitled',
        link: item.link ?? '',
        pubDate: item.pubDate ?? new Date().toISOString(),
        source,
        imageUrl:
          (item as any).mediaContent?.$.url ??
          extractImage((item as any).contentEncoded) ??
          null,
      }));
    })
  );

  const allItems: FeedItem[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  }

  // Sort by date descending, return top 30
  allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return NextResponse.json({ articles: allItems.slice(0, 30) });
}
