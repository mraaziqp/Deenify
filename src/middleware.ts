import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes accessible to guests (unauthenticated users)
const PUBLIC_ROUTES = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/verify-email',
  '/login',
];

// Routes that start with these prefixes are always public
const PUBLIC_PREFIXES = [
  '/_next/',
  '/api/auth/',
  '/favicon.ico',
  '/manifest.json',
  '/service-worker.js',
  '/books/',
];

// Admin-only routes
const ADMIN_ROUTES = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public prefixes (static assets, auth API etc.)
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Always allow exact public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Get session token from cookies
  const token = request.cookies.get('token')?.value;

  // If no token and not a public route → redirect to sign-in
  if (!token) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|service-worker.js|books/).*)',
  ],
};
