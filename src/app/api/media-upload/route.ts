import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

// POST /api/media-upload
// Accepts multipart/form-data: file, type ('pdf'|'audio'), name (optional)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'pdf';
    const name = (formData.get('name') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Build a clean filename
    const ext = file.name.split('.').pop() || (type === 'audio' ? 'mp3' : 'pdf');
    const baseName = name
      ? name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      : file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const filename = `${baseName}.${ext}`;

    // Folder prefix so audio/pdf are organised in Vercel Blob
    const folder = type === 'audio' ? 'audio' : 'books';
    const pathname = `${folder}/${filename}`;

    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: false, // keep predictable URL
    });

    return NextResponse.json({
      success: true,
      filename,
      url: blob.url,
      pathname: blob.pathname,
      message: `Uploaded to Vercel Blob: ${blob.url}`,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err?.message || 'Upload failed.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'POST multipart/form-data with: file, type (pdf|audio), name (optional).' });
}
