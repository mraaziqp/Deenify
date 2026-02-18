import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// List of protected routes
const protectedRoutes = ['/dashboard', '/ramadan'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Only protect exact matches or subpaths
  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));
  if (!isProtected) return NextResponse.next();

  // Check for user session (replace with real auth check)
  const userSession = cookies().get('user');
  if (!userSession) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/ramadan/:path*'],
};
