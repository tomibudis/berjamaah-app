'use client';

import SignInForm from '@/features/auth/sign-in-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Mobile-first container with max-width for desktop */}
      <div className="mx-auto max-w-sm px-4 py-8 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg">
        <SignInForm />
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-green-600 hover:text-green-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
