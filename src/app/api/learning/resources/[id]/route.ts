import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type ResourcePayload = {
  title?: string;
  description?: string;
  type?: string;
  url?: string;
  coverImageUrl?: string;
  author?: string;
  language?: string;
  pageCount?: number;
  tags?: string[];
  published?: boolean;
};

const normalizeTags = (tags: unknown) => {
  if (!Array.isArray(tags)) return undefined;
  return tags.filter((tag) => typeof tag === 'string' && tag.trim().length > 0);
};

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const body = (await request.json()) as ResourcePayload;

    const resource = await prisma.learningResource.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description ?? null,
        type: body.type,
        url: body.url,
        coverImageUrl: body.coverImageUrl ?? null,
        author: body.author ?? null,
        language: body.language ?? null,
        pageCount: body.pageCount ?? null,
        tags: normalizeTags(body.tags),
        published: body.published,
      },
    });

    return NextResponse.json({ resource });
  } catch (error) {
    console.error('Failed to update resource:', error);
    return NextResponse.json({ error: 'Unable to update resource.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    await prisma.learningResource.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete resource:', error);
    return NextResponse.json({ error: 'Unable to delete resource.' }, { status: 500 });
  }
}
