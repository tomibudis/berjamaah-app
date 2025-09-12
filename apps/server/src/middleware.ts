import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin':
          process.env.CORS_ORIGIN || 'http://localhost:3001',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const res = NextResponse.next();

  // Add CORS headers to all responses
  res.headers.set(
    'Access-Control-Allow-Origin',
    process.env.CORS_ORIGIN || 'http://localhost:3001'
  );
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );

  return res;
}

export const config = {
  matcher: '/:path*',
};
