import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const BOOKS_DIR = path.join(process.cwd(), 'public', 'books');
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');

// POST /api/media-upload
// Accepts multipart/form-data with:
//   - file: the file to upload (PDF or audio)
//   - type: 'pdf' | 'audio'
//   - name: desired filename (without extension, optional)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'pdf';
    const name = (formData.get('name') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = type === 'audio' ? AUDIO_DIR : BOOKS_DIR;

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Determine filename
    const ext = file.name.split('.').pop() || (type === 'audio' ? 'mp3' : 'pdf');
    const baseName = name
      ? name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      : file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const filename = `${baseName}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/${type === 'audio' ? 'audio' : 'books'}/${filename}`;
    return NextResponse.json({
      success: true,
      filename,
      url: publicUrl,
      message: `File uploaded successfully to ${publicUrl}`,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err?.message || 'Upload failed.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'POST a file with multipart/form-data. Fields: file, type (pdf|audio), name (optional).' });
}
