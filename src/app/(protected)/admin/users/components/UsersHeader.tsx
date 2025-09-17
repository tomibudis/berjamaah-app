'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface UsersHeaderProps {
  onCreateUser: () => void;
  totalUsers: number;
  activeUsers: number;
}

export function UsersHeader({
  onCreateUser,
  totalUsers,
  activeUsers,
}: UsersHeaderProps) {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Users Management
          </h1>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={onCreateUser} className='flex items-center gap-2'>
          <Plus className='w-4 h-4' />
          Create User
        </Button>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
              <svg
                className='w-6 h-6 text-blue-600 dark:text-blue-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Total Users
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-green-100 dark:bg-green-900 rounded-lg'>
              <svg
                className='w-6 h-6 text-green-600 dark:text-green-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Active Users
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {activeUsers}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
