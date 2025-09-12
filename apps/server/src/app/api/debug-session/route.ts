import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Get all cookies
    const allCookies = req.cookies.getAll();
    const sessionCookies = allCookies.filter(
      cookie =>
        cookie.name.includes('session') ||
        cookie.name.includes('better-auth') ||
        cookie.name.includes('auth')
    );

    // Try to get session using Better Auth
    let sessionData = null;
    let sessionError = null;

    try {
      // This is a simplified way to check session - in production you'd want to use the proper Better Auth methods
      const session = await auth.api.getSession({
        headers: req.headers,
      });
      sessionData = session;
    } catch (error) {
      sessionError = error instanceof Error ? error.message : 'Unknown error';
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      request: {
        url: req.url,
        method: req.method,
        headers: {
          'user-agent': req.headers.get('user-agent'),
          origin: req.headers.get('origin'),
          referer: req.headers.get('referer'),
          host: req.headers.get('host'),
          'x-forwarded-for': req.headers.get('x-forwarded-for'),
          'x-forwarded-proto': req.headers.get('x-forwarded-proto'),
        },
        cookies: {
          all: allCookies.map(c => ({
            name: c.name,
            value:
              c.value.substring(0, 50) + (c.value.length > 50 ? '...' : ''),
            fullValue: c.value,
          })),
          session: sessionCookies.map(c => ({
            name: c.name,
            value:
              c.value.substring(0, 50) + (c.value.length > 50 ? '...' : ''),
            fullValue: c.value,
          })),
          count: allCookies.length,
          sessionCount: sessionCookies.length,
        },
      },
      session: {
        data: sessionData,
        error: sessionError,
        found: !!sessionData,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        corsOrigin: process.env.CORS_ORIGIN,
        betterAuthUrl: process.env.BETTER_AUTH_URL,
        serverUrl: process.env.NEXT_PUBLIC_SERVER_URL,
      },
    };

    // Log to console for Vercel logs
    console.log(
      '🔍 Server Debug Session Info:',
      JSON.stringify(debugInfo, null, 2)
    );

    return NextResponse.json(debugInfo, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (error) {
    console.error('❌ Debug session error:', error);

    return NextResponse.json(
      {
        error: 'Failed to debug session',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
          'Access-Control-Allow-Credentials': 'true',
        },
      }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}
