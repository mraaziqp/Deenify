
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ ok: true });
  const host = req.headers.get('host') || '';
  const isProd = host.endsWith('deenify.co.za');

  if (isProd) {
    response.cookies.set('token', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
      sameSite: 'none',
      secure: true,
      domain: '.deenify.co.za',
    });
  } else {
    response.cookies.set('token', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
      secure: false,
    });
  }

  return response;
}
