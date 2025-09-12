import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't need authentication
const publicRoutes = [
  '/',
  '/signin',
  '/signup',
  '/forgot-password',
  '/debug-session',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Enhanced logging for debugging session cookies
  const allCookies = req.cookies.getAll();
  const sessionCookies = allCookies.filter(
    cookie =>
      cookie.name.includes('session') ||
      cookie.name.includes('better-auth') ||
      cookie.name.includes('auth')
  );

  // Log session debugging info
  console.log('🔍 Middleware Debug Info:', {
    pathname,
    userAgent: req.headers.get('user-agent'),
    origin: req.headers.get('origin'),
    referer: req.headers.get('referer'),
    host: req.headers.get('host'),
    allCookies: allCookies.map(c => ({
      name: c.name,
      value: c.value.substring(0, 20) + '...',
    })),
    sessionCookies: sessionCookies.map(c => ({
      name: c.name,
      value: c.value.substring(0, 20) + '...',
    })),
    cookieCount: allCookies.length,
    sessionCookieCount: sessionCookies.length,
  });

  // Check for session cookie manually - this is more reliable in Vercel
  // Better Auth uses different cookie names in different versions
  const sessionCookie =
    req.cookies.get('better-auth.session_token') ||
    req.cookies.get('better-auth.session') ||
    req.cookies.get('session');

  console.log('🍪 Session Cookie Check:', {
    'better-auth.session_token': req.cookies.get('better-auth.session_token')
      ?.value
      ? 'EXISTS'
      : 'MISSING',
    'better-auth.session': req.cookies.get('better-auth.session')?.value
      ? 'EXISTS'
      : 'MISSING',
    session: req.cookies.get('session')?.value ? 'EXISTS' : 'MISSING',
    foundSessionCookie: sessionCookie ? 'YES' : 'NO',
  });

  // If no session cookie, redirect to signin
  if (!sessionCookie) {
    console.log('❌ No session cookie found, redirecting to signin');
    const signinUrl = new URL('/signin', req.url);
    signinUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(signinUrl);
  }

  console.log('✅ Session cookie found, proceeding');
  // For now, let the client-side handle role-based redirects
  // This is simpler and more reliable than trying to fetch session data in middleware
  return NextResponse.next();
}

// Only run middleware on routes we care about
export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
