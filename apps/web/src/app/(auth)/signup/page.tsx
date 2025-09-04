'use client';

import SignUpForm from '@/features/auth/sign-up-form';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Mobile-first container with max-width for desktop */}
      <div className="mx-auto max-w-sm px-4 py-8 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg">
        <SignUpForm />
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href="/signin"
              className="text-green-600 hover:text-green-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
