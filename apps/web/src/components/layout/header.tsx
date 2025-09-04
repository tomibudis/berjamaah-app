'use client';

import { Heart } from 'lucide-react';
import UserMenu from './user-menu';

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="mx-auto max-w-sm px-4 py-3 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg">
        <div className="flex items-center justify-between">
          {/* Left side - Logo with heart icon */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Berjamaah.id
            </h1>
          </div>

          {/* Right side - User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
