import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const filename = formData.get('filename') as string;
  if (!file || !filename) {
    return NextResponse.json({ error: 'Missing file or filename' }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(process.cwd(), 'public', 'books', filename);
  await writeFile(filePath, buffer);
  return NextResponse.json({ success: true, filename });
}
