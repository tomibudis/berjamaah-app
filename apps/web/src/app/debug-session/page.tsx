'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DebugSessionPage() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [cookies, setCookies] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get session from Better Auth
      const session = await authClient.getSession();
      setSessionData(session);

      // Get cookies from document
      setCookies(document.cookie);

      console.log('🔍 Debug Session Data:', {
        session,
        cookies: document.cookie,
        userAgent: navigator.userAgent,
        location: window.location.href,
        origin: window.location.origin,
      });
    } catch (err) {
      console.error('❌ Error fetching session:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, []);

  const refreshSession = () => {
    fetchSessionData();
  };

  const testSignIn = async () => {
    try {
      // This will trigger a sign-in flow
      window.location.href = '/signin';
    } catch (err) {
      console.error('Error redirecting to signin:', err);
    }
  };

  const clearCookies = () => {
    // Clear all cookies
    document.cookie.split(';').forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Session Debug Tool</h1>
        <div className="space-x-2">
          <Button onClick={refreshSession} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button onClick={testSignIn} variant="outline">
            Test Sign In
          </Button>
          <Button onClick={clearCookies} variant="destructive">
            Clear Cookies
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
            <CardDescription>Current authentication state</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading session data...</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge
                    variant={sessionData?.data ? 'default' : 'destructive'}
                  >
                    {sessionData?.data ? 'Authenticated' : 'Not Authenticated'}
                  </Badge>
                </div>
                {sessionData?.data && (
                  <div className="space-y-1">
                    <div>
                      <strong>User ID:</strong> {sessionData.data.user.id}
                    </div>
                    <div>
                      <strong>Email:</strong> {sessionData.data.user.email}
                    </div>
                    <div>
                      <strong>Name:</strong> {sessionData.data.user.name}
                    </div>
                    <div>
                      <strong>Role:</strong> {sessionData.data.user.role}
                    </div>
                    <div>
                      <strong>Session ID:</strong> {sessionData.data.session.id}
                    </div>
                    <div>
                      <strong>Expires:</strong>{' '}
                      {new Date(
                        sessionData.data.session.expiresAt
                      ).toLocaleString()}
                    </div>
                  </div>
                )}
                {sessionData?.error && (
                  <div className="text-red-600">
                    <strong>Error:</strong> {sessionData.error}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browser Cookies</CardTitle>
            <CardDescription>All cookies in the browser</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                Total cookies: {cookies.split(';').filter(c => c.trim()).length}
              </div>
              <div className="max-h-40 overflow-y-auto">
                {cookies ? (
                  cookies.split(';').map((cookie, index) => {
                    const [name, value] = cookie.trim().split('=');
                    const isSessionCookie =
                      name?.includes('session') || name?.includes('auth');
                    return (
                      <div
                        key={index}
                        className={`text-xs p-2 rounded ${
                          isSessionCookie
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="font-mono">
                          <strong>{name}:</strong> {value?.substring(0, 50)}
                          {value && value.length > 50 && '...'}
                        </div>
                        {isSessionCookie && (
                          <Badge variant="secondary" className="text-xs">
                            Session Cookie
                          </Badge>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500">No cookies found</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Raw Session Data</CardTitle>
          <CardDescription>
            Complete session object for debugging
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-60">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Info</CardTitle>
          <CardDescription>Browser and environment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>User Agent:</strong> {navigator.userAgent}
            </div>
            <div>
              <strong>Current URL:</strong> {window.location.href}
            </div>
            <div>
              <strong>Origin:</strong> {window.location.origin}
            </div>
            <div>
              <strong>Protocol:</strong> {window.location.protocol}
            </div>
            <div>
              <strong>Host:</strong> {window.location.host}
            </div>
            <div>
              <strong>Server URL:</strong> {process.env.NEXT_PUBLIC_SERVER_URL}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
