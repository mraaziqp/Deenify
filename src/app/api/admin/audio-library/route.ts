import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'audio-library.json');

function readData(): unknown[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeData(data: unknown[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/admin/audio-library
export async function GET() {
  return NextResponse.json(readData());
}

// POST /api/admin/audio-library  — add a new entry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = readData() as Record<string, unknown>[];
    const entry = {
      ...body,
      id: `audio-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    data.push(entry);
    writeData(data);
    return NextResponse.json({ success: true, entry });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

// DELETE /api/admin/audio-library?id=<id>
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const data = (readData() as Record<string, unknown>[]).filter((e) => e.id !== id);
  writeData(data);
  return NextResponse.json({ success: true });
}

// PATCH /api/admin/audio-library?id=<id>  — update an entry
export async function PATCH(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const updates = await req.json();
  const data = readData() as Record<string, unknown>[];
  const idx = data.findIndex((e) => e.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  data[idx] = { ...data[idx], ...updates };
  writeData(data);
  return NextResponse.json({ success: true, entry: data[idx] });
}
