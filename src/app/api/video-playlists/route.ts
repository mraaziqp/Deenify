import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function getUser(req: NextRequest): Promise<{ id: string; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
  } catch {
    return null;
  }
}

// GET /api/video-playlists — all active playlists, public
export async function GET() {
  const playlists = await prisma.videoPlaylist.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json({ playlists });
}

// POST /api/video-playlists — admin creates a playlist entry
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, instructor, youtubePlaylistId, thumbnailUrl, category, sortOrder } = await req.json();
  if (!title || !instructor || !youtubePlaylistId || !thumbnailUrl) {
    return NextResponse.json(
      { error: 'title, instructor, youtubePlaylistId, and thumbnailUrl are required' },
      { status: 400 }
    );
  }

  const playlist = await prisma.videoPlaylist.create({
    data: {
      title,
      instructor,
      youtubePlaylistId,
      thumbnailUrl,
      category: category ?? 'General',
      sortOrder: sortOrder ?? 0,
    },
  });

  return NextResponse.json({ playlist }, { status: 201 });
}

// DELETE /api/video-playlists?id=xxx — admin deletes
export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.videoPlaylist.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
