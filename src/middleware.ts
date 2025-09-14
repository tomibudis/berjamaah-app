import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't need authentication
const publicRoutes = ['/', '/signin', '/signup', '/forgot-password', '/status'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Add CORS headers to all responses
  const res = NextResponse.next();
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Skip authentication for public routes and API routes
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/favicon')) {
    return res;
  }

  // Check for session cookie manually - this is more reliable in Vercel
  const sessionCookie =
    req.cookies.get('better-auth.session_token') ||
    req.cookies.get('better-auth.session') ||
    req.cookies.get('session');

  // If no session cookie, redirect to signin
  if (!sessionCookie) {
    const signinUrl = new URL('/signin', req.url);
    signinUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(signinUrl);
  }

  return res;
}

// Only run middleware on routes we care about
export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};