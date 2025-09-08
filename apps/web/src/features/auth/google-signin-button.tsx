'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GoogleIcon } from '@/components/ui/google-icon';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

export default function GoogleSignInButton() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: 'http://localhost:3001/',
      });
    } catch (error) {
      toast.error('Failed to sign in with Google');
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-12 text-base font-medium"
      disabled={isGoogleLoading}
      onClick={handleGoogleSignIn}
    >
      {isGoogleLoading ? (
        <>
          <div className="w-5 h-5 mr-2 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          Signing in with Google...
        </>
      ) : (
        <>
          <GoogleIcon />
          Continue with Google
        </>
      )}
    </Button>
  );
}
