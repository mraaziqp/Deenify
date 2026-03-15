import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    if (decoded.role !== 'SCHOLAR' && decoded.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/scholar/:path*'],
};
