
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('token', '', { maxAge: 0, path: '/' });
  return response;
}
