import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't need authentication
const publicRoutes = ['/', '/signin', '/signup', '/forgot-password'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for session cookie manually - this is more reliable in Vercel
  // Better Auth uses different cookie names in different versions
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

  // For now, let the client-side handle role-based redirects
  // This is simpler and more reliable than trying to fetch session data in middleware
  return NextResponse.next();
}

// Only run middleware on routes we care about
export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
