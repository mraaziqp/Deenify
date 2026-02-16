import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type QuranMediaPayload = {
  title: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  reciter?: string;
  surahNumber?: number;
  ayahStart?: number;
  ayahEnd?: number;
  language?: string;
  durationSeconds?: number;
  tags?: string[];
  source?: string;
  license?: string;
  notes?: string;
  published?: boolean;
};

const normalizeTags = (tags: unknown) => {
  if (!Array.isArray(tags)) return [];
  return tags.filter((tag) => typeof tag === 'string' && tag.trim().length > 0);
};

export async function GET() {
  try {
    const items = await prisma.quranMedia.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Failed to load Quran media:', error);
    return NextResponse.json({ error: 'Unable to load media.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuranMediaPayload;
    if (!body.title || !body.url || !body.type) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const item = await prisma.quranMedia.create({
      data: {
        title: body.title,
        type: body.type,
        url: body.url,
        thumbnailUrl: body.thumbnailUrl || null,
        reciter: body.reciter || null,
        surahNumber: body.surahNumber ?? null,
        ayahStart: body.ayahStart ?? null,
        ayahEnd: body.ayahEnd ?? null,
        language: body.language || null,
        durationSeconds: body.durationSeconds ?? null,
        tags: normalizeTags(body.tags),
        source: body.source || null,
        license: body.license || null,
        notes: body.notes || null,
        published: body.published ?? true,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Failed to create Quran media:', error);
    return NextResponse.json({ error: 'Unable to create media.' }, { status: 500 });
  }
}
