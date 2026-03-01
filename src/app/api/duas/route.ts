import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  // Load duas from static JSON file
  try {
    const duasPath = path.join(process.cwd(), 'src', 'data', 'duas.json');
    const raw = fs.readFileSync(duasPath, 'utf-8');
    const duas = JSON.parse(raw);
    // Ensure every entry has an id
    const withIds = duas.map((d: Record<string, unknown>, i: number) => ({
      id: d.id ?? `dua-${i + 1}`,
      ...d,
    }));
    return NextResponse.json(withIds);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
