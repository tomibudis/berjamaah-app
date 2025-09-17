"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/google-icon";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function GoogleSignUpButton() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to sign up with Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-12 text-base font-medium"
      disabled={isGoogleLoading}
      onClick={handleGoogleSignUp}
    >
      {isGoogleLoading ? (
        <>
          <div className="w-5 h-5 mr-2 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          Signing up with Google...
        </>
      ) : (
        <>
          <GoogleIcon />
          Sign up with Google
        </>
      )}
    </Button>
  );
}
