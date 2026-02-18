import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  cookieStore.set('token', '', { maxAge: 0, path: '/' });
  return NextResponse.json({ ok: true });
}
