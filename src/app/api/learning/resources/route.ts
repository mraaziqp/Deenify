import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type ResourcePayload = {
  title: string;
  description?: string;
  type: string;
  url: string;
  coverImageUrl?: string;
  author?: string;
  language?: string;
  pageCount?: number;
  tags?: string[];
  published?: boolean;
};

const normalizeTags = (tags: unknown) => {
  if (!Array.isArray(tags)) return [];
  return tags.filter((tag) => typeof tag === 'string' && tag.trim().length > 0);
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('all') === 'true';

    const resources = await prisma.learningResource.findMany({
      where: includeAll ? undefined : { published: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Failed to load resources:', error);
    return NextResponse.json({ error: 'Unable to load resources.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ResourcePayload;
    if (!body.title || !body.url || !body.type) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const resource = await prisma.learningResource.create({
      data: {
        title: body.title,
        description: body.description || null,
        type: body.type,
        url: body.url,
        coverImageUrl: body.coverImageUrl || null,
        author: body.author || null,
        language: body.language || null,
        pageCount: body.pageCount ?? null,
        tags: normalizeTags(body.tags),
        published: body.published ?? true,
      },
    });

    return NextResponse.json({ resource });
  } catch (error) {
    console.error('Failed to create resource:', error);
    return NextResponse.json({ error: 'Unable to create resource.' }, { status: 500 });
  }
}
