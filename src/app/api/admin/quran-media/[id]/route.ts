import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type QuranMediaPayload = {
  title?: string;
  type?: string;
  url?: string;
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
  if (!Array.isArray(tags)) return undefined;
  return tags.filter((tag) => typeof tag === 'string' && tag.trim().length > 0);
};

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const body = (await request.json()) as QuranMediaPayload;

    const item = await prisma.quranMedia.update({
      where: { id },
      data: {
        title: body.title,
        type: body.type,
        url: body.url,
        thumbnailUrl: body.thumbnailUrl ?? null,
        reciter: body.reciter ?? null,
        surahNumber: body.surahNumber ?? null,
        ayahStart: body.ayahStart ?? null,
        ayahEnd: body.ayahEnd ?? null,
        language: body.language ?? null,
        durationSeconds: body.durationSeconds ?? null,
        tags: normalizeTags(body.tags),
        source: body.source ?? null,
        license: body.license ?? null,
        notes: body.notes ?? null,
        published: body.published,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Failed to update Quran media:', error);
    return NextResponse.json({ error: 'Unable to update media.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    await prisma.quranMedia.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete Quran media:', error);
    return NextResponse.json({ error: 'Unable to delete media.' }, { status: 500 });
  }
}
