import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-context';

export async function middleware(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== 'SCHOLAR') {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/scholar/:path*'],
};
