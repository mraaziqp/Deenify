import { NextRequest, NextResponse } from 'next/server';
import { list, del } from '@vercel/blob';

export const runtime = 'nodejs';

// GET /api/media-files?prefix=audio|books
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prefix = searchParams.get('prefix') || '';
  try {
    const { blobs } = await list({ prefix: prefix || undefined });
    return NextResponse.json({ blobs });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to list files.' }, { status: 500 });
  }
}

// DELETE /api/media-files  body: { url: string }
export async function DELETE(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });
    await del(url);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Delete failed.' }, { status: 500 });
  }
}
