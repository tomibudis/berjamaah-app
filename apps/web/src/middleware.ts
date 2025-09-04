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

  // Check for better-auth session cookie
  const sessionCookie = req.cookies.get('better-auth.session_token');

  // If no session cookie, redirect to signin
  if (!sessionCookie) {
    const signinUrl = new URL('/signin', req.url);
    signinUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

// Only run middleware on routes we care about
export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
