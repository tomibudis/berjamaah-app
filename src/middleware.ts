import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Add CORS headers to all responses
    const res = NextResponse.next();

    // Check if user is trying to access admin routes
    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/signin', req.url));
    }

    // Check if user has token and trying to access signin page then redirect to home
    if (pathname.startsWith('/signin') && !!token) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return res;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes that don't require authentication
        const publicRoutes = [
          '/signin',
          '/signup',
          '/forgot-password',
          '/status',
          '/complete-registration',
          '/reset-password',
        ];

        if (
          publicRoutes.includes(pathname) ||
          pathname.startsWith('/api/') ||
          pathname.startsWith('/_next/') ||
          pathname.startsWith('/favicon')
        ) {
          return true;
        }

        // All other routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
